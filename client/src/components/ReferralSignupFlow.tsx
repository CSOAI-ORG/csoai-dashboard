/**
 * Referral Signup Flow Integration
 * Validates referral codes and tracks conversions
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ReferralSignupFlowProps {
  referralCode?: string;
  onReferralApplied?: (code: string) => void;
}

export function ReferralSignupFlow({ referralCode, onReferralApplied }: ReferralSignupFlowProps) {
  const [code, setCode] = useState(referralCode || '');
  const [validating, setValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [referrerName, setReferrerName] = useState('');

  useEffect(() => {
    if (referralCode) {
      validateCode(referralCode);
    }
  }, [referralCode]);

  const validateCode = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) {
      setIsValid(false);
      return;
    }

    setValidating(true);

    try {
      // In production, call tRPC endpoint
      // const result = await trpc.referral.validateCode.query({
      //   code: codeToValidate,
      // });

      // For demo, validate format
      if (codeToValidate.startsWith('CSOAI-') && codeToValidate.length > 10) {
        setIsValid(true);
        setDiscount(20); // 20% discount
        setReferrerName('Referral Partner');
        toast.success('Valid referral code applied!');

        if (onReferralApplied) {
          onReferralApplied(codeToValidate);
        }
      } else {
        setIsValid(false);
        toast.error('Invalid referral code');
      }
    } catch (error) {
      console.error('Validation error:', error);
      setIsValid(false);
      toast.error('Failed to validate referral code');
    } finally {
      setValidating(false);
    }
  };

  const handleApplyCode = () => {
    validateCode(code);
  };

  const handleClearCode = () => {
    setCode('');
    setIsValid(false);
    setDiscount(0);
    setReferrerName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-emerald-600/20 bg-gradient-to-br from-emerald-50 to-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600" />
            Have a Referral Code?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isValid ? (
            <>
              <p className="text-sm text-gray-600">
                If someone referred you to CSOAI, enter their referral code to get 20% off your
                certification.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g., CSOAI-A1B2C3D4"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  disabled={validating}
                />
                <Button
                  onClick={handleApplyCode}
                  disabled={validating || !code.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {validating ? 'Validating...' : 'Apply'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert className="border-emerald-600/50 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-900">
                  Referral code applied! You'll receive {discount}% off your certification.
                </AlertDescription>
              </Alert>

              <div className="bg-white p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Referral Code</p>
                    <p className="font-mono font-semibold text-emerald-600">{code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Discount</p>
                    <p className="text-2xl font-bold text-emerald-600">{discount}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-900">
                  <strong>Bonus:</strong> When you complete your certification, both you and{' '}
                  {referrerName} will benefit from the referral program!
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleClearCode}
                className="w-full text-emerald-600 hover:text-emerald-700"
              >
                Use Different Code
              </Button>
            </>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-900">
              💡 <strong>Tip:</strong> Referral codes are valid for 90 days from creation. Share
              your code with colleagues to earn commissions!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
