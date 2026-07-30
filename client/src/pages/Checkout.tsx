import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check, Tag, LogIn } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrlWithReturn } from '@/const';

export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // Use real authentication
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const itemType = searchParams.get('type'); // 'course' or 'bundle'
  const itemId = searchParams.get('id');
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const endpoint = itemType === 'bundle' 
          ? `/api/course-bundles/${itemId}`
          : `/api/courses/${itemId}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch item');
        
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details');
      } finally {
        setLoading(false);
      }
    };
    
    if (itemId && itemType) {
      fetchItem();
    } else {
      toast.error('Invalid checkout parameters');
      setLocation('/paid-courses');
    }
  }, [itemId, itemType]);
  
  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    setCouponLoading(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.toUpperCase() }),
      });
      
      const data = await response.json();
      
      if (data.valid) {
        setAppliedCoupon(data.coupon);
        
        // Calculate discount amount
        const originalPrice = (itemType === 'bundle' ? item.bundlePrice : item.price) / 100;
        let discountAmount = 0;
        
        if (data.coupon.discountType === 'percentage') {
          discountAmount = (originalPrice * data.coupon.discountValue) / 100;
        } else {
          discountAmount = data.coupon.discountValue;
        }
        
        // Show success message with discount details
        if (discountAmount >= originalPrice) {
          toast.success(
            `🎉 Coupon "${data.coupon.code}" applied! You save £${originalPrice.toFixed(2)} - This course is now FREE!`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `✅ Coupon "${data.coupon.code}" applied! You save £${discountAmount.toFixed(2)} (${data.coupon.discountValue}% off)`,
            { duration: 4000 }
          );
        }
      } else {
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };
  
  // Calculate final price
  const calculateFinalPrice = () => {
    if (!item) return 0;
    
    const originalPrice = itemType === 'bundle' ? item.bundlePrice : item.price;
    
    if (!appliedCoupon) return originalPrice / 100; // Convert from pence to pounds
    
    if (appliedCoupon.discountType === 'percentage') {
      const discount = (originalPrice * appliedCoupon.discountValue) / 100;
      return Math.max(0, (originalPrice - discount) / 100);
    }
    
    return Math.max(0, (originalPrice - appliedCoupon.discountValue * 100) / 100);
  };
  
  // Handle login redirect - uses return_to parameter to redirect back after login
  const handleLoginRedirect = () => {
    window.location.href = getLoginUrlWithReturn();
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please sign in to complete your purchase');
      handleLoginRedirect();
      return;
    }
    
    setProcessing(true);
    
    try {
      const finalPrice = calculateFinalPrice();
      
      // Use the actual authenticated user ID
      const userId = user.id;
      
      // Call enrollment API
      const response = await fetch('/api/enrollment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: itemType,
          itemId: parseInt(itemId!),
          userId,
          couponId: appliedCoupon?.id,
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        toast.error(data.error || 'Failed to process enrollment');
        return;
      }
      
      // If no payment required (free with coupon)
      if (!data.paymentRequired) {
        toast.success('Enrolled successfully! Redirecting...');
        setTimeout(() => setLocation('/my-courses'), 1500);
        return;
      }
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('Failed to create checkout session');
      }
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast.error('Failed to process checkout');
    } finally {
      setProcessing(false);
    }
  };
  
  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Item not found</h1>
          <Button onClick={() => setLocation('/paid-courses')}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }
  
  const originalPrice = (itemType === 'bundle' ? item.bundlePrice : item.price) / 100;
  const finalPrice = calculateFinalPrice();
  const savings = originalPrice - finalPrice;
  
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase to start learning</p>
        </div>
        
        {/* Authentication Warning */}
        {!isAuthenticated && (
          <Card className="p-6 mb-6 border-amber-500 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex items-center gap-4">
              <LogIn className="h-8 w-8 text-amber-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200">Sign in required</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Please sign in to complete your purchase and access your courses.
                </p>
              </div>
              <Button onClick={handleLoginRedirect} variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100">
                Sign In
              </Button>
            </div>
          </Card>
        )}
        
        {/* Logged in user info */}
        {isAuthenticated && user && (
          <Card className="p-4 mb-6 border-green-500 bg-green-50 dark:bg-green-950/20">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">
                Signed in as <strong>{user.email}</strong>
              </span>
            </div>
          </Card>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.description}</div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>£{originalPrice.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span>-£{savings.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>£{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Payment Form */}
          <div className="space-y-6">
            {/* Coupon Code */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Have a coupon?</h2>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!appliedCoupon}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !!appliedCoupon}
                >
                  {couponLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : appliedCoupon ? (
                    'Applied'
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              
              {appliedCoupon && (
                <div className="mt-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                        Coupon Applied Successfully!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {appliedCoupon.description}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        💰 You're saving £{savings.toFixed(2)} with code "{appliedCoupon.code}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            
            {/* Payment Button */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>
              
              {finalPrice === 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                      🎉 This course is FREE with your coupon!
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={processing || !isAuthenticated}
                    size="lg"
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : !isAuthenticated ? (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In to Enroll
                      </>
                    ) : (
                      'Enroll Now - FREE'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      You will be redirected to Stripe to complete your payment securely.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleCheckout}
                    disabled={processing || !isAuthenticated}
                    size="lg"
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : !isAuthenticated ? (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In to Pay
                      </>
                    ) : (
                      `Pay £${finalPrice.toFixed(2)}`
                    )}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
