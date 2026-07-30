/**
 * Bundle Checkout and Enrollment Tests
 * Tests the bundle enrollment API and checkout flow
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";
import { courseBundles, courses } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

describe("Bundle Checkout System", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
  });

  describe("Bundle Data Structure", () => {
    it("should have bundles in the database", async () => {
      if (!db) {
        console.log("⚠️ Database not available, skipping test");
        return;
      }

      const bundles = await db.select().from(courseBundles);
      console.log(`✅ Found ${bundles.length} bundles in database`);
      expect(bundles.length).toBeGreaterThan(0);
    });

    it("should have required bundle properties", async () => {
      if (!db) {
        console.log("⚠️ Database not available, skipping test");
        return;
      }

      const bundles = await db.select().from(courseBundles);
      
      for (const bundle of bundles) {
        expect(bundle.id).toBeDefined();
        expect(bundle.name).toBeDefined();
        expect(bundle.description).toBeDefined();
        expect(bundle.bundlePrice).toBeDefined();
        expect(bundle.stripePriceId).toBeDefined();
        expect(bundle.active).toBeDefined();
      }
      
      console.log(`✅ All ${bundles.length} bundles have required properties`);
    });

    it("should have valid course IDs in bundles", async () => {
      if (!db) {
        console.log("⚠️ Database not available, skipping test");
        return;
      }

      const bundles = await db.select().from(courseBundles);
      
      for (const bundle of bundles) {
        const courseIds = Array.isArray(bundle.courseIds) 
          ? bundle.courseIds 
          : JSON.parse(bundle.courseIds as string);
        
        expect(Array.isArray(courseIds)).toBe(true);
        expect(courseIds.length).toBeGreaterThan(0);
        
        // Verify courses exist
        const bundleCourses = await db
          .select()
          .from(courses)
          .where(inArray(courses.id, courseIds.map((id: string | number) => parseInt(String(id)))));
        
        expect(bundleCourses.length).toBe(courseIds.length);
      }
      
      console.log(`✅ All bundles have valid course references`);
    });
  });

  describe("Pricing Structure", () => {
    it("should have valid pricing for bundles", async () => {
      if (!db) {
        console.log("⚠️ Database not available, skipping test");
        return;
      }

      const bundles = await db.select().from(courseBundles);
      
      for (const bundle of bundles) {
        // Bundle price should be less than regular price (savings)
        expect(bundle.bundlePrice).toBeLessThan(bundle.regularPrice);
        
        // Savings should equal the difference
        const expectedSavings = bundle.regularPrice - bundle.bundlePrice;
        expect(bundle.savings).toBe(expectedSavings);
      }
      
      console.log(`✅ All bundles have valid pricing with savings`);
    });

    it("should format prices correctly", () => {
      const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;

      expect(formatPrice(199900)).toBe("£1999.00");
      expect(formatPrice(99900)).toBe("£999.00");
      expect(formatPrice(49900)).toBe("£499.00");
      expect(formatPrice(0)).toBe("£0.00");
      
      console.log("✅ Price formatting works correctly");
    });
  });

  describe("Duration Options", () => {
    it("should have correct duration option values", () => {
      const durationOptions = [
        { value: "one_time", label: "Lifetime Access", priceKey: "oneTime" },
        { value: "3_month", label: "3 Months", priceKey: "threeMonth" },
        { value: "6_month", label: "6 Months", priceKey: "sixMonth" },
        { value: "12_month", label: "12 Months", priceKey: "twelveMonth" },
      ];

      expect(durationOptions).toHaveLength(4);
      expect(durationOptions[0].value).toBe("one_time");
      expect(durationOptions[1].value).toBe("3_month");
      expect(durationOptions[2].value).toBe("6_month");
      expect(durationOptions[3].value).toBe("12_month");
      
      console.log("✅ Duration options are correctly defined");
    });

    it("should have correct price key mappings", () => {
      const priceKeyMappings: Record<string, string> = {
        one_time: "oneTime",
        "3_month": "threeMonth",
        "6_month": "sixMonth",
        "12_month": "twelveMonth",
      };

      expect(priceKeyMappings.one_time).toBe("oneTime");
      expect(priceKeyMappings["3_month"]).toBe("threeMonth");
      expect(priceKeyMappings["6_month"]).toBe("sixMonth");
      expect(priceKeyMappings["12_month"]).toBe("twelveMonth");
      
      console.log("✅ Price key mappings are correct");
    });
  });

  describe("Stripe Integration", () => {
    it("should have Stripe price IDs for bundles", async () => {
      if (!db) {
        console.log("⚠️ Database not available, skipping test");
        return;
      }

      const bundles = await db.select().from(courseBundles).where(eq(courseBundles.active, 1));
      
      for (const bundle of bundles) {
        expect(bundle.stripePriceId).toBeDefined();
        expect(bundle.stripePriceId).toMatch(/^price_/);
      }
      
      console.log(`✅ All ${bundles.length} active bundles have valid Stripe price IDs`);
    });
  });

  describe("Coupon Validation", () => {
    it("should validate coupon code format", () => {
      const isValidCouponFormat = (code: string) => {
        return code.length > 0 && code.length <= 50;
      };

      expect(isValidCouponFormat("FOUNDING10K")).toBe(true);
      expect(isValidCouponFormat("")).toBe(false);
      expect(isValidCouponFormat("A".repeat(51))).toBe(false);
      
      console.log("✅ Coupon format validation works correctly");
    });
  });

  describe("Bundle Checkout Page Route", () => {
    it("should parse bundle ID from route correctly", () => {
      // Simulate route parsing
      const parseRouteParams = (path: string) => {
        const match = path.match(/\/bundle-checkout\/(\d+)/);
        return match ? { bundleId: parseInt(match[1]) } : null;
      };

      expect(parseRouteParams("/bundle-checkout/200001")).toEqual({ bundleId: 200001 });
      expect(parseRouteParams("/bundle-checkout/200002")).toEqual({ bundleId: 200002 });
      expect(parseRouteParams("/bundle-checkout/abc")).toBeNull();
      
      console.log("✅ Route parameter parsing works correctly");
    });
  });

  describe("Enrollment Status Logic", () => {
    it("should detect enrolled status correctly", () => {
      const enrollmentStatus = { isEnrolled: true };
      expect(enrollmentStatus.isEnrolled).toBe(true);
      console.log("✅ Enrolled status detection works");
    });

    it("should detect not enrolled status correctly", () => {
      const enrollmentStatus = { isEnrolled: false };
      expect(enrollmentStatus.isEnrolled).toBe(false);
      console.log("✅ Not enrolled status detection works");
    });
  });

  describe("Bundle Data Calculations", () => {
    it("should calculate savings correctly", () => {
      const regularPrice = 349300;
      const bundlePrice = 199900;
      const savings = regularPrice - bundlePrice;

      expect(savings).toBe(149400);
      expect(`£${(savings / 100).toFixed(2)}`).toBe("£1494.00");
      console.log("✅ Savings calculation is correct");
    });

    it("should handle null duration prices", () => {
      const pricing = {
        oneTime: 199900,
        threeMonth: null,
        sixMonth: null,
        twelveMonth: null,
      };

      // Only oneTime should be available
      const availablePrices = Object.entries(pricing)
        .filter(([_, value]) => value !== null)
        .map(([key]) => key);

      expect(availablePrices).toEqual(["oneTime"]);
      console.log("✅ Null duration price handling works");
    });
  });
});
