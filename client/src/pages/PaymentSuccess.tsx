import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Confetti effect could be added here
    console.log("Payment successful!");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <CheckCircle className="w-24 h-24 text-green-600 dark:text-green-400 relative" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Payment Successful!
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Welcome to CSOAI! Your subscription is now active.
        </p>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 text-left">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Access your dashboard to register AI systems</li>
                <li>• Run compliance assessments across multiple frameworks</li>
                <li>• Set up API keys for enterprise integration</li>
                <li>• Explore training modules and certification</li>
                <li>• Submit Watchdog reports for AI safety incidents</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/dashboard")}
            size="lg"
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={() => setLocation("/settings/billing")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            View Billing Details
          </Button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          A confirmation email has been sent to your registered email address.
        </p>
      </Card>
    </div>
  );
}
