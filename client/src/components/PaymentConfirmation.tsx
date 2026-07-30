/**
 * Payment Confirmation Dialog
 * Enterprise Launch Requirement: Phase 2 - Payment Flow Optimization
 * Provides order review before payment submission
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Calendar, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  planPrice: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  isLoading?: boolean;
}

export function PaymentConfirmation({
  isOpen,
  onClose,
  onConfirm,
  planName,
  planPrice,
  billingPeriod,
  features,
  isLoading = false,
}: PaymentConfirmationProps) {
  const displayPrice = billingPeriod === 'yearly' ? planPrice * 12 : planPrice;
  const savings = billingPeriod === 'yearly' ? Math.round(planPrice * 12 * 0.17) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Confirm Your Subscription
          </DialogTitle>
          <DialogDescription>
            Review your order details before proceeding to payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Plan Details */}
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{planName} Plan</h3>
                <p className="text-sm text-gray-600 capitalize">{billingPeriod} billing</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">
                  ${displayPrice}
                  <span className="text-sm font-normal text-gray-600">
                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {savings > 0 && (
                  <p className="text-xs text-emerald-700 font-medium">
                    Save ${savings}/year
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">Included Features:</h4>
            <ul className="space-y-2">
              {features.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
              {features.length > 5 && (
                <li className="text-sm text-gray-600 pl-6">
                  + {features.length - 5} more features
                </li>
              )}
            </ul>
          </div>

          <Separator />

          {/* Billing Information */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Billing Cycle
              </span>
              <span className="font-medium capitalize">{billingPeriod}</span>
            </div>
            <div className="flex items-center justify-between text-gray-700">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Due Today
              </span>
              <span className="font-medium">${displayPrice}</span>
            </div>
          </div>

          {/* Refund Policy */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Refund Policy:</strong> You can cancel anytime. Unused time will be refunded on a pro-rata basis within 30 days of cancellation.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
