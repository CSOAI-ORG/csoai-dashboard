import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { coupons, couponUsage, users, courseEnrollments } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const promoCodeManagementRouter = router({
  // Get all promo codes with analytics
  getAllPromoCodes: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view promo codes",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allCoupons = await db
        .select()
        .from(coupons)
        .orderBy(desc(coupons.createdAt));

      return allCoupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        remainingUses: coupon.maxUses - coupon.usedCount,
        percentageUsed: ((coupon.usedCount / coupon.maxUses) * 100).toFixed(2),
        expiresAt: coupon.expiresAt,
        active: coupon.active === 1,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));
    }),

  // Get detailed analytics for a specific promo code
  getPromoCodeAnalytics: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }: { ctx: any; input: { code: string } }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view promo code analytics",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get coupon details
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.code.toUpperCase()));

      if (!coupon) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Promo code not found",
        });
      }

      // Get usage details with user information
      const usageDetails = await db
        .select({
          id: couponUsage.id,
          userId: couponUsage.userId,
          userName: users.name,
          userEmail: users.email,
          orderId: couponUsage.orderId,
          usedAt: couponUsage.usedAt,
        })
        .from(couponUsage)
        .leftJoin(users, eq(couponUsage.userId, users.id))
        .where(eq(couponUsage.couponId, coupon.id))
        .orderBy(desc(couponUsage.usedAt));

      // Get revenue impact (total discount given)
      const enrollmentsWithCoupon = await db
        .select({
          amountPaid: courseEnrollments.amountPaid,
        })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.couponId, coupon.id));

      const totalRevenue = enrollmentsWithCoupon.reduce((sum, e) => sum + parseFloat((e.amountPaid || '0').toString()), 0);
      
      // Calculate estimated discount value
      let estimatedDiscount = 0;
      if (coupon.discountType === 'percentage') {
        // For percentage discounts, estimate based on average course price
        estimatedDiscount = (parseFloat(coupon.discountValue) / 100) * totalRevenue * (coupon.usedCount / (coupon.usedCount || 1));
      } else {
        // For fixed discounts
        estimatedDiscount = parseFloat(coupon.discountValue) * coupon.usedCount;
      }

      return {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue),
          maxUses: coupon.maxUses,
          usedCount: coupon.usedCount,
          remainingUses: coupon.maxUses - coupon.usedCount,
          percentageUsed: ((coupon.usedCount / coupon.maxUses) * 100).toFixed(2),
          expiresAt: coupon.expiresAt,
          active: coupon.active === 1,
          createdAt: coupon.createdAt,
          updatedAt: coupon.updatedAt,
        },
        analytics: {
          totalUsage: coupon.usedCount,
          uniqueUsers: usageDetails.length,
          totalRevenue: totalRevenue.toFixed(2),
          estimatedDiscount: estimatedDiscount.toFixed(2),
          usageDetails,
        },
      };
    }),

  // Create new promo code
  createPromoCode: protectedProcedure
    .input(z.object({
      code: z.string().min(3).max(50),
      description: z.string().optional(),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.number().positive(),
      maxUses: z.number().int().positive(),
      expiresAt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can create promo codes",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if code already exists
      const [existing] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.code.toUpperCase()));

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Promo code already exists",
        });
      }

      // Create new coupon
      await db.insert(coupons).values({
        code: input.code.toUpperCase(),
        description: input.description || null,
        discountType: input.discountType,
        discountValue: input.discountValue.toString(),
        maxUses: input.maxUses,
        usedCount: 0,
        expiresAt: input.expiresAt || null,
        active: 1,
      });

      return {
        success: true,
        message: `Promo code ${input.code.toUpperCase()} created successfully`,
      };
    }),

  // Update promo code
  updatePromoCode: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      maxUses: z.number().int().positive().optional(),
      expiresAt: z.string().optional().nullable(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update promo codes",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.description !== undefined) updateData.description = input.description;
      if (input.maxUses !== undefined) updateData.maxUses = input.maxUses;
      if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
      if (input.active !== undefined) updateData.active = input.active ? 1 : 0;

      await db
        .update(coupons)
        .set(updateData)
        .where(eq(coupons.id, input.id));

      return {
        success: true,
        message: "Promo code updated successfully",
      };
    }),

  // Deactivate promo code
  deactivatePromoCode: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: { id: number } }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can deactivate promo codes",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(coupons)
        .set({ active: 0 })
        .where(eq(coupons.id, input.id));

      return {
        success: true,
        message: "Promo code deactivated successfully",
      };
    }),

  // Get promo code usage summary
  getUsageSummary: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view usage summary",
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allCoupons = await db.select().from(coupons);
      
      const totalCoupons = allCoupons.length;
      const activeCoupons = allCoupons.filter(c => c.active === 1).length;
      const totalUsage = allCoupons.reduce((sum, c) => sum + c.usedCount, 0);
      const totalCapacity = allCoupons.reduce((sum, c) => sum + c.maxUses, 0);

      return {
        totalCoupons,
        activeCoupons,
        inactiveCoupons: totalCoupons - activeCoupons,
        totalUsage,
        totalCapacity,
        utilizationRate: totalCapacity > 0 ? ((totalUsage / totalCapacity) * 100).toFixed(2) : '0',
      };
    }),
});
