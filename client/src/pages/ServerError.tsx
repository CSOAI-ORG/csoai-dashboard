/**
 * 500 Server Error Page
 * Enterprise Launch Requirement: Phase 2 - Error Handling and User Feedback
 * Provides helpful guidance when users encounter server errors
 */

import { Link } from 'wouter';
import { Home, RefreshCw, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ServerError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
              <HelpCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">500</h1>

          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Server Error
          </h2>

          <p className="text-slate-600 mb-8 leading-relaxed">
            Something went wrong on our end. We're working to fix it.
            <br />
            Please try again in a few moments.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={handleRefresh}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="px-6 py-2.5"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <div className="border-t pt-6 text-sm text-slate-600">
            <p>
              If the problem persists,{' '}
              <Link href="/help-center">
                <a className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                  contact support
                </a>
              </Link>
              {' '}for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
