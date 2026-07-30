import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { generateBadgePackage, generateBadgeSVG, convertSVGToPNG } from "../services/badge-generator";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";

// In-memory badge storage (certificationBadges table not yet in schema)
interface StoredBadge {
  id: number;
  userId: number;
  certificationLevel: string;
  badgeToken: string;
  badgeImageUrl: string;
  badgeEmbedCode: string;
  verificationUrl: string;
  issuedAt: string;
  shareCount: number;
  clickCount: number;
  linkedInShares: number;
}

const badgesStore: StoredBadge[] = [];
let badgeIdCounter = 1;

export const certificationBadgesRouter = router({
  /**
   * Generate a new certification badge for a user
   */
  generateBadge: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        certificationLevel: z.enum(["level_1", "level_2", "level_3", "expert"]),
      })
    )
    .mutation(async ({ input }: { input: { userId: number; certificationLevel: string } }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        let userName = `User ${input.userId}`;
        
        if (db) {
          const userResult = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
          if (userResult[0]?.name) {
            userName = userResult[0].name;
          }
        }

        // Generate badge package
        const badgePackage = generateBadgePackage({
          userId: input.userId,
          userName,
          certificationLevel: input.certificationLevel as "level_1" | "level_2" | "level_3" | "expert",
          issueDate: new Date(),
        });

        // Store in memory
        const badge: StoredBadge = {
          id: badgeIdCounter++,
          userId: input.userId,
          certificationLevel: input.certificationLevel,
          badgeToken: badgePackage.badgeToken,
          badgeImageUrl: badgePackage.badgeImageUrl,
          badgeEmbedCode: badgePackage.badgeEmbedCode,
          verificationUrl: badgePackage.verificationUrl,
          issuedAt: new Date().toISOString(),
          shareCount: 0,
          clickCount: 0,
          linkedInShares: 0,
        };
        badgesStore.push(badge);

        return {
          success: true,
          badge: badgePackage,
          databaseId: badge.id,
        };
      } catch (error) {
        console.error("Error generating badge:", error);
        throw new Error("Failed to generate certification badge");
      }
    }),

  /**
   * Get badge details by token
   */
  getBadgeByToken: publicProcedure
    .input(z.object({ badgeToken: z.string() }))
    .query(async ({ input }: { input: { badgeToken: string } }) => {
      try {
        const badge = badgesStore.find(b => b.badgeToken === input.badgeToken);

        if (!badge) {
          throw new Error("Badge not found");
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');
        let user: any = null;
        
        if (db) {
          const userResult = await db.select().from(users).where(eq(users.id, badge.userId)).limit(1);
          user = userResult[0];
        }

        // Increment click count
        badge.clickCount = (badge.clickCount || 0) + 1;

        return {
          badge,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
          } : null,
        };
      } catch (error) {
        console.error("Error fetching badge:", error);
        throw new Error("Badge not found");
      }
    }),

  /**
   * Get all badges for a user
   */
  getUserBadges: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }: { input: { userId: number } }) => {
      try {
        const badges = badgesStore.filter(b => b.userId === input.userId);
        return badges;
      } catch (error) {
        console.error("Error fetching user badges:", error);
        throw new Error("Failed to fetch badges");
      }
    }),

  /**
   * Track badge share
   */
  trackShare: publicProcedure
    .input(
      z.object({
        badgeToken: z.string(),
        platform: z.enum(["linkedin", "twitter", "email"]),
      })
    )
    .mutation(async ({ input }: { input: { badgeToken: string; platform: string } }) => {
      try {
        const badge = badgesStore.find(b => b.badgeToken === input.badgeToken);

        if (!badge) {
          throw new Error("Badge not found");
        }

        // Update share counts
        badge.shareCount = (badge.shareCount || 0) + 1;
        if (input.platform === "linkedin") {
          badge.linkedInShares = (badge.linkedInShares || 0) + 1;
        }

        return { success: true };
      } catch (error) {
        console.error("Error tracking share:", error);
        throw new Error("Failed to track share");
      }
    }),

  /**
   * Get badge statistics
   */
  getBadgeStats: publicProcedure
    .input(z.object({ badgeToken: z.string() }))
    .query(async ({ input }: { input: { badgeToken: string } }) => {
      try {
        const badge = badgesStore.find(b => b.badgeToken === input.badgeToken);

        if (!badge) {
          throw new Error("Badge not found");
        }

        return {
          totalShares: badge.shareCount || 0,
          totalClicks: badge.clickCount || 0,
          linkedInShares: badge.linkedInShares || 0,
          issuedAt: badge.issuedAt,
          certificationLevel: badge.certificationLevel,
        };
      } catch (error) {
        console.error("Error fetching badge stats:", error);
        throw new Error("Failed to fetch badge statistics");
      }
    }),

  /**
   * Get badge image as PNG
   */
  getBadgeImage: publicProcedure
    .input(z.object({ badgeToken: z.string() }))
    .query(async ({ input }: { input: { badgeToken: string } }) => {
      try {
        const badge = badgesStore.find(b => b.badgeToken === input.badgeToken);

        if (!badge) {
          throw new Error("Badge not found");
        }

        const db = await getDb();
        if (!db) throw new Error('Database not available');
        let userName = `User ${badge.userId}`;
        
        if (db) {
          const userResult = await db.select().from(users).where(eq(users.id, badge.userId)).limit(1);
          if (userResult[0]?.name) {
            userName = userResult[0].name;
          }
        }

        const svgString = generateBadgeSVG(userName, badge.certificationLevel);

        return {
          svg: svgString,
          contentType: "image/svg+xml",
        };
      } catch (error) {
        console.error("Error generating badge image:", error);
        throw new Error("Failed to generate badge image");
      }
    }),
});
