import { useState } from "react";
import { useLocation } from "wouter";
import { Check, Loader2, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const tiers = [
  {
    id: "pro" as const,
    name: "Professional",
    price: "£999",
    period: "/month",
    description: "Advanced features for growing organizations",
    icon: Rocket,
    features: [
      "Up to 25 AI systems",
      "Advanced compliance assessments",
      "PDCA cycle management",
      "Priority support",
      "API access (10,000 calls/month)",
      "Custom webhooks",
      "PDF report generation",
      "Multi-framework support",
      "33-Agent Council voting",
    ],
    highlighted: true,
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "£1,999",
    period: "/month",
    description: "Complete solution for large-scale AI governance",
    icon: Building2,
    features: [
      "Unlimited AI systems",
      "Full compliance suite",
      "Dedicated account manager",
      "24/7 premium support",
      "Unlimited API calls",
      "Custom integrations",
      "White-label options",
      "Advanced analytics",
      "Custom training modules",
      "SLA guarantees",
      "On-premise deployment option",
    ],
    highlighted: false,
  },
];

export default function Payment() {
  const [, setLocation] = useLocation();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const createCheckoutSession = trpc.stripe.createCheckoutSession.useMutation();

  const handleSubscribe = async (tierId: "pro" | "enterprise") => {
    setLoadingTier(tierId);
    try {
      const result = await createCheckoutSession.mutateAsync({
        tier: tierId,
        billingPeriod: "monthly",
      });

      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout", {
        description: "Please try again or contact support.",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your AI compliance needs. All plans include a 14-day free trial.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`relative p-8 ${
                  tier.highlighted
                    ? "border-2 border-blue-500 shadow-2xl scale-105"
                    : "border border-gray-200 dark:border-gray-700"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      tier.highlighted 
                        ? "bg-blue-100 dark:bg-blue-900" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        tier.highlighted 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-600 dark:text-gray-400"
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{tier.period}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loadingTier === tier.id}
                  className={`w-full mb-6 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      : ""
                  }`}
                  size="lg"
                >
                  {loadingTier === tier.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the charges.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards (Visa, Mastercard, American Express) and bank transfers for Enterprise plans.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is there a long-term contract?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No, all plans are month-to-month. You can cancel anytime with no penalties or hidden fees.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer annual billing?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! Annual billing is available with a 20% discount. Contact our sales team for details.
              </p>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => setLocation("/pricing")}
          >
            Back to Pricing Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
