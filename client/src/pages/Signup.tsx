/**
 * Signup Page
 * Email/password registration with CSOAI branding
 * Mobile-first responsive design
 */

import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, Star, Gift } from 'lucide-react';
import { EmailPasswordSignupForm } from '@/components/EmailPasswordSignupForm';
import { useAuth } from '@/contexts/AuthContext';

export default function Signup() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [signupSource, setSignupSource] = useState<string | null>(null);

  // Extract referral code from URL and redirect if already logged in
  useEffect(() => {
    if (user) {
      // Auto-redirect to dashboard after successful signup
      setLocation('/dashboard');
    }

    // Extract referral code and signup source from query parameters
    const params = new URLSearchParams(search);
    const ref = params.get('ref');
    const referrer = params.get('referrer');
    const source = params.get('source');
    
    if (ref) {
      setReferralCode(ref);
      setReferrerName(referrer || 'A CSOAI Member');
    }
    
    if (source) {
      setSignupSource(source);
    }
  }, [user, setLocation, search]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-start md:justify-center py-6 sm:py-8 md:py-12 px-4">
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden w-full max-w-md text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/csoai-icon.svg.png" alt="CSOAI" className="h-8 w-8" />
          <span className="text-xl font-bold text-gray-900">CSOAI</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Start Your AI Safety Career
        </h1>
        <p className="text-sm text-gray-600">
          Get certified and join the global movement
        </p>
      </div>

      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-6 md:gap-12 items-center">
        {/* Left Side - Branding - Hidden on mobile */}
        <div className="hidden md:block text-left">
          <div className="flex items-center gap-3 mb-8">
            <img src="/csoai-icon.svg.png" alt="CSOAI" className="h-12 w-12" />
            <span className="text-2xl md:text-3xl font-bold text-gray-900">CSOAI</span>
          </div>
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Start Your AI Safety Career Today
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Join the global movement of AI Safety Analysts. Get certified, earn credentials, and
            protect humanity from AI risks.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-5 w-5 text-green-600 fill-green-600" />
              <Star className="h-5 w-5 text-green-600 fill-green-600" />
              <Star className="h-5 w-5 text-green-600 fill-green-600" />
              <Star className="h-5 w-5 text-green-600 fill-green-600" />
              <Star className="h-5 w-5 text-green-600 fill-green-600" />
            </div>
            <p className="text-sm text-green-900 font-medium mb-2">
              "CSOAI certification opened doors I didn't know existed. Within 3 months, I landed a
              $120K AI Safety Analyst role."
            </p>
            <p className="text-xs text-green-700">— Sarah Chen, Certified AI Safety Analyst</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">15+ Professional Courses</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive training on EU AI Act, NIST, TC260, and more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">Globally Recognized Certificates</h3>
                <p className="text-sm text-gray-600">
                  University-grade credentials trusted by employers worldwide
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900">100% Independent</h3>
                <p className="text-sm text-gray-600">
                  No ties to OpenAI, Google, Microsoft, or any AI vendor
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Card */}
        <Card className="shadow-xl w-full max-w-md mx-auto md:max-w-none">
          <CardHeader className="text-center pb-4 md:pb-6">
            <div className="mx-auto mb-3 md:mb-4 h-12 w-12 md:h-16 md:w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
            <CardTitle className="text-lg md:text-xl lg:text-2xl">Create Your Free Account</CardTitle>
            <CardDescription className="text-sm">
              Start learning in under 60 seconds
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 md:space-y-6 px-4 sm:px-6 max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-200px)] overflow-y-auto">
            {signupSource && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h3 className="font-semibold text-blue-900 mb-1 md:mb-2 text-sm md:text-base">
                  {signupSource === 'analyst' && '🎓 AI Safety Analyst Program'}
                  {signupSource === 'enterprise' && '🏢 Enterprise Compliance Solution'}
                  {signupSource === 'government' && '🏛️ Government Portal'}
                  {signupSource === 'watchdog' && '👁️ Watchdog Program'}
                </h3>
                <p className="text-xs md:text-sm text-blue-800">
                  {signupSource === 'analyst' && 'Get certified as an AI Safety Analyst and review AI systems for compliance.'}
                  {signupSource === 'enterprise' && 'Access multi-framework compliance tools for EU AI Act, NIST, TC260, and ISO 42001.'}
                  {signupSource === 'government' && 'Deploy real-time AI monitoring and compliance tracking infrastructure.'}
                  {signupSource === 'watchdog' && 'Report AI incidents publicly and join our analyst network.'}
                </p>
              </div>
            )}
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-emerald-900 mb-1 md:mb-2 text-sm md:text-base">What's Included (Free):</h3>
              <ul className="space-y-0.5 md:space-y-1 text-xs md:text-sm text-emerald-800">
                <li>✓ Access to 3 foundation courses</li>
                <li>✓ Progress tracking dashboard</li>
                <li>✓ Community forum access</li>
                <li>✓ Certificate upon completion</li>
              </ul>
            </div>

            {referralCode && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Gift className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                  <span className="font-semibold text-amber-900 text-sm md:text-base">Referral Bonus!</span>
                </div>
                <p className="text-xs md:text-sm text-amber-800">
                  {referrerName} referred you. Complete your certification and earn rewards together!
                </p>
              </div>
            )}

            <EmailPasswordSignupForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-11 text-base touch-manipulation"
              onClick={() => setLocation('/login')}
            >
              Sign In Instead
            </Button>

            {referralCode && (
              <p className="text-xs text-center text-amber-600 font-medium">
                Referral Code: <code className="bg-amber-100 px-2 py-1 rounded">{referralCode}</code>
              </p>
            )}

            <p className="text-xs text-center text-gray-500 pb-2">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline touch-manipulation">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-600 hover:underline touch-manipulation">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
