/**
 * Bundle Checkout Page
 * Allows users to purchase bundles with duration selection
 */

import { useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Package,
  Clock,
  BookOpen,
  Check,
  Tag,
  Loader2,
  Shield,
  Award,
  ArrowLeft,
  Sparkles,
  Calendar,
  CreditCard,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type Duration = "one_time" | "3_month" | "6_month" | "12_month";

interface DurationOption {
  value: Duration;
  label: string;
  description: string;
  priceKey: "oneTime" | "threeMonth" | "sixMonth" | "twelveMonth";
  badge?: string;
  savings?: string;
}

const durationOptions: DurationOption[] = [
  {
    value: "one_time",
    label: "Lifetime Access",
    description: "Pay once, access forever",
    priceKey: "oneTime",
    badge: "Best Value",
  },
  {
    value: "3_month",
    label: "3 Months",
    description: "Quarterly access plan",
    priceKey: "threeMonth",
  },
  {
    value: "6_month",
    label: "6 Months",
    description: "Semi-annual access plan",
    priceKey: "sixMonth",
    savings: "Save 10%",
  },
  {
    value: "12_month",
    label: "12 Months",
    description: "Annual access plan",
    priceKey: "twelveMonth",
    savings: "Save 20%",
  },
];

export default function BundleCheckout() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/bundle-checkout/:bundleId");
  const bundleId = params?.bundleId ? parseInt(params.bundleId) : null;

  const [selectedDuration, setSelectedDuration] = useState<Duration>("one_time");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch bundle details
  const { data: bundle, isLoading: bundleLoading } = trpc.bundleEnrollment.getBundleDetails.useQuery(
    { bundleId: bundleId! },
    { enabled: !!bundleId }
  );

  // Check existing enrollment
  const { data: enrollmentStatus } = trpc.bundleEnrollment.checkEnrollment.useQuery(
    { bundleId: bundleId! },
    { enabled: !!bundleId }
  );

  // Enroll mutation
  const enrollMutation = trpc.bundleEnrollment.enrollInBundle.useMutation({
    onSuccess: (data) => {
      if (data.paymentRequired && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Free enrollment successful
        toast.success("Successfully enrolled in bundle!");
        setLocation("/my-courses");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process enrollment");
    },
  });

  // Coupon validation
  const validateCouponMutation = trpc.courses.validateCoupon.useMutation();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const result = await validateCouponMutation.mutateAsync({
        code: couponCode.trim(),
        courseId: bundleId!, // Using bundleId for validation
      });
      
      if (result.valid) {
        setAppliedCoupon(result);
        toast.success(`Coupon applied! ${result.discountPercent}% off`);
      } else {
        toast.error(result.message || "Invalid coupon code");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (!bundleId) return;
    
    enrollMutation.mutate({
      bundleId,
      duration: selectedDuration,
      couponCode: appliedCoupon ? couponCode : undefined,
    });
  };

  // Get price for selected duration
  const getPrice = () => {
    if (!bundle?.pricing) return 0;
    const option = durationOptions.find(o => o.value === selectedDuration);
    if (!option) return bundle.pricing.oneTime || 0;
    return bundle.pricing[option.priceKey] || bundle.pricing.oneTime || 0;
  };

  // Calculate final price with coupon
  const getFinalPrice = () => {
    const basePrice = getPrice();
    if (appliedCoupon?.discountPercent) {
      return basePrice * (1 - appliedCoupon.discountPercent / 100);
    }
    return basePrice;
  };

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  if (bundleLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bundle) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bundle Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The bundle you're looking for doesn't exist or is no longer available.
            </p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (enrollmentStatus?.isEnrolled) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl py-8">
          <Card className="p-8 text-center">
            <Check className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Already Enrolled!</h2>
            <p className="text-muted-foreground mb-6">
              You already have access to this bundle.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/my-courses">
                <Button>Go to My Courses</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Browse More Courses</Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        {/* Back button */}
        <Link href="/courses">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bundle header */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Package className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2">Course Bundle</Badge>
                  <h1 className="text-2xl font-bold mb-2">{bundle.name}</h1>
                  <p className="text-muted-foreground">{bundle.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <span>{bundle.courseCount} courses included</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span>Certificate on completion</span>
                    </div>
                    {bundle.pricing.savings && (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Sparkles className="h-4 w-4" />
                        <span>Save {formatPrice(bundle.pricing.savings)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Courses included */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Courses Included
              </h2>
              <div className="space-y-4">
                {bundle.courses?.map((course: any) => (
                  <div key={course.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.durationHours}h
                        </span>
                        <Badge variant="outline" className="text-xs">{course.framework}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Duration selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Select Access Duration
              </h2>
              <RadioGroup
                value={selectedDuration}
                onValueChange={(value) => setSelectedDuration(value as Duration)}
                className="grid sm:grid-cols-2 gap-4"
              >
                {durationOptions.map((option) => {
                  const price = bundle.pricing[option.priceKey];
                  const isAvailable = price !== null && price !== undefined;
                  
                  return (
                    <div key={option.value} className="relative">
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        disabled={!isAvailable}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                          ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                          ${selectedDuration === option.value 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-border hover:border-emerald-300'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{option.label}</span>
                          {option.badge && (
                            <Badge className="bg-emerald-500">{option.badge}</Badge>
                          )}
                          {option.savings && (
                            <Badge variant="secondary">{option.savings}</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                        <div className="mt-2 text-lg font-bold">
                          {isAvailable ? formatPrice(price) : 'N/A'}
                          {option.value !== 'one_time' && isAvailable && (
                            <span className="text-sm font-normal text-muted-foreground">
                              /{option.value === '3_month' ? 'quarter' : option.value === '6_month' ? '6 months' : 'year'}
                            </span>
                          )}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </Card>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bundle</span>
                  <span className="font-medium">{bundle.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {durationOptions.find(o => o.value === selectedDuration)?.label}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getPrice())}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon.discountPercent}%)</span>
                    <span>-{formatPrice(getPrice() - getFinalPrice())}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-emerald-600">{formatPrice(getFinalPrice())}</span>
                </div>
              </div>

              {/* Coupon input */}
              <div className="mt-6">
                <Label className="text-sm flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4" />
                  Have a coupon?
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !!appliedCoupon}
                  >
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              </div>

              {/* Checkout button */}
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleCheckout}
                disabled={enrollMutation.isPending}
              >
                {enrollMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {formatPrice(getFinalPrice())}
                  </>
                )}
              </Button>

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secure Payment
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Instant Access
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
