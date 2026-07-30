/**
 * Courses Page - Monetized Training Catalog
 * Browse regional AI compliance courses with flexible payment plans
 */

import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Award, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function Courses() {
  const searchString = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const filterParam = urlParams.get('filter');
  
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>();
  const [selectedLevel, setSelectedLevel] = useState<"fundamentals" | "advanced" | "specialist" | undefined>();
  const [selectedFramework, setSelectedFramework] = useState<string | undefined>();
  const [priceFilter, setPriceFilter] = useState<"all" | "paid">(filterParam === "paid" ? "paid" : "all");
  const [activeTab, setActiveTab] = useState<"courses" | "bundles">("courses");
  
  
  // Update filter when URL changes
  useEffect(() => {
    if (filterParam === "paid") setPriceFilter("paid");
    else setPriceFilter("all");
  }, [filterParam]);

  // Fetch regions
  const { data: regions = [] } = trpc.courses.getRegions.useQuery();

  // Fetch courses with filters
  const { data: courses = [], isLoading: coursesLoading } = trpc.courses.getCatalog.useQuery({
    regionId: selectedRegion,
    level: selectedLevel,
    framework: selectedFramework,
  });

  // Fetch bundles
  const { data: bundles = [], isLoading: bundlesLoading } = trpc.courses.getCourseBundles.useQuery({
    regionId: selectedRegion,
  });

  // Debug log
  useEffect(() => {
    console.log('[Courses] bundles data:', bundles);
    console.log('[Courses] bundles length:', bundles.length);
  }, [bundles]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-2xl p-8 shadow-xl">
          <div className="max-w-3xl">
            <Badge className="mb-3 bg-white/20 text-white border-white/30">
              <Award className="w-4 h-4 mr-2" />
              Professional Certification
            </Badge>
            <h1 className="text-4xl font-bold mb-4">
              AI Safety & Compliance Training
            </h1>
            <p className="text-lg text-emerald-100 mb-6">
              Master AI regulations worldwide. Get certified. Earn from home.
              <br />
              <strong>Flexible payment plans available</strong> - Pay monthly or save with one-time payment.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>33 Regional Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>3, 6, or 12-Month Plans</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-300" />
                <span>Official Certificates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Filter Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select
                value={selectedRegion?.toString()}
                onValueChange={(value) => setSelectedRegion(value === "all" ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region: any) => (
                    <SelectItem key={region.id} value={region.id.toString()}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select
                value={selectedLevel || "all"}
                onValueChange={(value: any) => setSelectedLevel(value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="fundamentals">Fundamentals</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Framework</label>
              <Select
                value={selectedFramework || "all"}
                onValueChange={(value) => setSelectedFramework(value === "all" ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Frameworks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frameworks</SelectItem>
                  <SelectItem value="EU AI Act">EU AI Act</SelectItem>
                  <SelectItem value="NIST AI RMF">NIST AI RMF</SelectItem>
                  <SelectItem value="ISO/IEC 42001">ISO/IEC 42001</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price</label>
              <Select
                value={priceFilter}
                onValueChange={(value: "all" | "paid") => setPriceFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="paid">Paid Courses (£499-£1,999)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Course Tabs - Custom Implementation */}
        <div className="w-full">
          <div className="inline-flex h-9 w-fit max-w-md items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground">
            <button
              onClick={() => setActiveTab("courses")}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === "courses"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Individual Courses
            </button>
            <button
              onClick={() => setActiveTab("bundles")}
              className={`inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-4 py-1 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === "bundles"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Course Bundles ({bundles.length})
            </button>
          </div>

          {/* Individual Courses */}
          {activeTab === "courses" && (
            <div className="mt-6">
              {coursesLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block h-8 w-8 animate-spin text-emerald-600" />
                  <p className="mt-4 text-gray-600">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <Card className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {courses
                    .filter((course: any) => {
                      if (priceFilter === "paid") return !course.isFree && course.price > 0;
                      return true;
                    })
                    .sort((a: any, b: any) => {
                      // Show lower priced courses first (fundamentals before advanced)
                      return (a.price || 0) - (b.price || 0);
                    })
                    .map((course: any) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Course Bundles */}
          {activeTab === "bundles" && (
            <div className="mt-6">
              {bundlesLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block h-8 w-8 animate-spin text-emerald-600" />
                  <p className="mt-4 text-gray-600">Loading bundles...</p>
                </div>
              ) : bundles.length === 0 ? (
                <Card className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No bundles available</h3>
                  <p className="text-gray-600">Check back soon for bundle offers</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bundles.map((bundle: any) => (
                    <BundleCard key={bundle.id} bundle={bundle} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function CourseCard({ course }: { course: any }) {
  const [selectedPlan, setSelectedPlan] = useState<"oneTime" | "threeMonth" | "sixMonth" | "twelveMonth">("oneTime");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const enrollMutation = trpc.courses.enrollInCourse.useMutation();

  // Check which payment plans are available based on Stripe price IDs
  const availablePlans = useMemo(() => {
    const plans: ("oneTime" | "threeMonth" | "sixMonth" | "twelveMonth")[] = [];
    if (course.stripePriceIds?.oneTime || course.stripePriceId) plans.push("oneTime");
    if (course.stripePriceIds?.threeMonth || course.stripePriceId3Month) plans.push("threeMonth");
    if (course.stripePriceIds?.sixMonth || course.stripePriceId6Month) plans.push("sixMonth");
    if (course.stripePriceIds?.twelveMonth || course.stripePriceId12Month) plans.push("twelveMonth");
    // If no Stripe prices configured, default to oneTime (for free courses)
    if (plans.length === 0) plans.push("oneTime");
    return plans;
  }, [course]);

  // Set default plan to first available
  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.includes(selectedPlan)) {
      setSelectedPlan(availablePlans[0]);
    }
  }, [availablePlans, selectedPlan]);

  const handleEnroll = async () => {
    // Check if user is logged in first
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    // Check if selected plan is available
    if (!availablePlans.includes(selectedPlan)) {
      toast.error("This payment plan is not available for this course. Please select another plan.");
      return;
    }

    try {
      console.log('[Frontend] handleEnroll started', { courseId: course.id, selectedPlan });
      
      const paymentTypeMap = {
        oneTime: "one_time",
        threeMonth: "3_month",
        sixMonth: "6_month",
        twelveMonth: "12_month",
      };

      console.log('[Frontend] Calling enrollInCourse mutation...');
      const result = await enrollMutation.mutateAsync({
        courseId: course.id,
        paymentType: paymentTypeMap[selectedPlan] as any,
      });

      console.log('[Frontend] Enrollment result:', result);

      // Handle free course enrollment
      if (result.isFree) {
        toast.success("Successfully enrolled in free course!");
        setLocation("/my-courses");
        return;
      }

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        console.log('[Frontend] Redirecting to Stripe:', result.checkoutUrl);
        window.location.href = result.checkoutUrl;
      } else {
        console.warn('[Frontend] No checkoutUrl in result');
        toast.success("Enrollment successful!");
      }
    } catch (error: any) {
      console.error('[Frontend] Enrollment error:', error);
      // Don't show login errors to Sentry - they're expected for unauthenticated users
      if (error.message?.includes('login') || error.message?.includes('10001')) {
        setShowLoginDialog(true);
      } else if (error.message?.includes('Payment plan not available')) {
        toast.error("This payment plan is not currently available. Please select a different plan or contact support.");
      } else {
        toast.error(error.message || "Failed to enroll in course");
      }
    }
  };

  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return "N/A";
    return `£${(cents / 100).toFixed(2)}`;
  };

  // Calculate monthly payment - the total should equal the one-time price
  const calculateMonthlyPayment = (oneTimeCents: number, months: number) => {
    return `£${((oneTimeCents / months) / 100).toFixed(2)}/mo`;
  };
  
  const oneTimePrice = course.pricing?.oneTime || course.price || 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{course.name}</h3>
          <div className="flex gap-2 mb-2">
            <Badge variant="secondary">{course.level}</Badge>
            <Badge variant="outline">{course.framework}</Badge>
          </div>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{course.duration || 10}h</span>
        </div>
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{course.moduleCount || 0} modules</span>
        </div>
      </div>

      {/* Payment Plan Selector */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-lg p-4 mb-4">
        <label className="text-sm font-semibold mb-3 block">Choose Payment Plan</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedPlan("oneTime");
            }}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlan === "oneTime"
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1">One-Time</div>
            <div className="font-bold text-lg">{formatPrice(oneTimePrice)}</div>
            <div className="text-xs text-emerald-600 font-medium">Best Value</div>
          </button>

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("threeMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "threeMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">3 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 3)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("sixMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "sixMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">6 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("twelveMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "twelveMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">12 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 12)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}
        </div>
      </div>

      <Button
        onClick={handleEnroll}
        disabled={enrollMutation.isPending}
        className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
      >
        {enrollMutation.isPending ? "Processing..." : "Enroll Now"}
      </Button>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to enroll in this course. If you don't have an account, you can create one for free.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setShowLoginDialog(false);
                setLocation("/login?redirect=/courses");
              }}
            >
              Log In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function BundleCard({ bundle }: { bundle: any }) {
  const [selectedPlan, setSelectedPlan] = useState<"oneTime" | "threeMonth" | "sixMonth" | "twelveMonth">("oneTime");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const enrollMutation = trpc.bundleEnrollment.enrollInBundle.useMutation();

  // Check which payment plans are available based on Stripe price IDs
  const availablePlans = useMemo(() => {
    const plans: ("oneTime" | "threeMonth" | "sixMonth" | "twelveMonth")[] = [];
    if (bundle.stripePriceIds?.oneTime || bundle.stripePriceId) plans.push("oneTime");
    if (bundle.stripePriceIds?.threeMonth || bundle.stripePriceId3Month) plans.push("threeMonth");
    if (bundle.stripePriceIds?.sixMonth || bundle.stripePriceId6Month) plans.push("sixMonth");
    if (bundle.stripePriceIds?.twelveMonth || bundle.stripePriceId12Month) plans.push("twelveMonth");
    // If no Stripe prices configured, default to oneTime
    if (plans.length === 0) plans.push("oneTime");
    return plans;
  }, [bundle]);

  // Set default plan to first available
  useEffect(() => {
    if (availablePlans.length > 0 && !availablePlans.includes(selectedPlan)) {
      setSelectedPlan(availablePlans[0]);
    }
  }, [availablePlans, selectedPlan]);

  const handleEnroll = async () => {
    // Check if user is logged in first
    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    // Check if selected plan is available
    if (!availablePlans.includes(selectedPlan)) {
      toast.error("This payment plan is not available for this bundle. Please select another plan.");
      return;
    }

    try {
      console.log('[Frontend] handleEnroll (bundle) started', { bundleId: bundle.id, selectedPlan });
      
      const durationMap = {
        oneTime: "one_time",
        threeMonth: "3_month",
        sixMonth: "6_month",
        twelveMonth: "12_month",
      };

      console.log('[Frontend] Calling enrollInBundle mutation...');
      const result = await enrollMutation.mutateAsync({
        bundleId: bundle.id,
        duration: durationMap[selectedPlan] as any,
      });

      console.log('[Frontend] Bundle enrollment result:', result);

      // Handle free bundle enrollment
      if (!result.paymentRequired) {
        toast.success("Successfully enrolled in bundle!");
        setLocation("/my-courses");
        return;
      }

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        console.log('[Frontend] Redirecting to Stripe:', result.checkoutUrl);
        window.location.href = result.checkoutUrl;
      } else {
        console.warn('[Frontend] No checkoutUrl in result');
        toast.success("Enrollment successful!");
      }
    } catch (error: any) {
      console.error('[Frontend] Bundle enrollment error:', error);
      // Don't show login errors to Sentry - they're expected for unauthenticated users
      if (error.message?.includes('login') || error.message?.includes('10001')) {
        setShowLoginDialog(true);
      } else if (error.message?.includes('Payment plan not available')) {
        toast.error("This payment plan is not currently available. Please select a different plan or contact support.");
      } else {
        toast.error(error.message || "Failed to enroll in bundle");
      }
    }
  };

  const formatPrice = (cents: number | null | undefined) => {
    if (!cents) return "N/A";
    return `£${(cents / 100).toFixed(2)}`;
  };

  // Calculate monthly payment - the total should equal the one-time price
  const calculateMonthlyPayment = (oneTimeCents: number, months: number) => {
    return `£${((oneTimeCents / months) / 100).toFixed(2)}/mo`;
  };
  
  const oneTimePrice = bundle.pricing?.oneTime || 0;

  return (
    <Card className="p-6 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 hover:shadow-xl transition-shadow">
      <Badge className="mb-4 bg-emerald-600 text-white">Bundle Deal - Save {formatPrice(bundle.savings)}</Badge>
      <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
      <p className="text-muted-foreground mb-4">{bundle.description}</p>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-muted-foreground">Regular Price:</span>
          <span className="text-muted-foreground line-through">{formatPrice(bundle.regularPrice)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">Bundle Price:</span>
          <span className="text-2xl font-bold text-emerald-600">{formatPrice(bundle.pricing.oneTime)}</span>
        </div>
      </div>

      {/* Payment Plan Selector */}
      <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 rounded-lg p-4 mb-4">
        <label className="text-sm font-semibold mb-3 block">Choose Payment Plan</label>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedPlan("oneTime");
            }}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPlan === "oneTime"
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1">One-Time</div>
            <div className="font-bold text-lg">{formatPrice(bundle.pricing.oneTime)}</div>
            <div className="text-xs text-emerald-600 font-medium">Best Value</div>
          </button>

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("threeMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "threeMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">3 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 3)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("sixMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "sixMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">6 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 6)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}

          {oneTimePrice > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedPlan("twelveMonth");
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedPlan === "twelveMonth"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900 shadow-md"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1">12 Months</div>
              <div className="font-bold text-lg">
                {calculateMonthlyPayment(oneTimePrice, 12)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatPrice(oneTimePrice)} total
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
        >
          {enrollMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Enroll Now"
          )}
        </Button>
        <Link href={`/bundle-checkout/${bundle.id}`}>
          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            Buy Bundle
          </Button>
        </Link>
      </div>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to enroll in this bundle. If you don't have an account, you can create one for free.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                setShowLoginDialog(false);
                setLocation("/login?redirect=/courses");
              }}
            >
              Log In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
