import { useLocation } from "wouter";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-20"></div>
            <XCircle className="w-24 h-24 text-orange-600 dark:text-orange-400 relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Payment Cancelled
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Your payment was cancelled. No charges have been made.
        </p>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 text-left">
            <HelpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                If you encountered any issues during checkout or have questions about our plans, we're here to help.
              </p>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Contact our support team at support@csoai.com</li>
                <li>• Check our FAQ for common questions</li>
                <li>• Schedule a demo to learn more about our features</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/payment")}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={() => setLocation("/pricing")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            View Pricing Details
          </Button>

          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Return to Home
          </Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Your account remains active with the free tier. You can upgrade anytime.
        </p>
      </Card>
    </div>
  );
}
