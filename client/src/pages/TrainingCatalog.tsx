/**
 * Training Catalog Page
 * 
 * Displays all 6 compliance frameworks with pricing tiers
 * and AI-powered training options. Shows "Coming Q2" for frameworks
 * without modules yet, demonstrating regulatory movement.
 */

import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, Zap, Award, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TrainingCatalogPage() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  // Fetch frameworks
  const frameworks = trpc.stripeProducts.getFrameworks.useQuery();
  const pricing = trpc.stripeProducts.getPricing.useQuery();

  // Create checkout session
  const createCheckout = trpc.stripeProducts.createCheckoutSession.useMutation();

  const handlePurchase = async (frameworkId: string, tierId: string) => {
    try {
      const result = await createCheckout.mutateAsync({
        frameworkId,
        tierId,
        successUrl: `${window.location.origin}/training/success`,
        cancelUrl: `${window.location.origin}/training/catalog`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  if (frameworks.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading training catalog...</p>
        </div>
      </div>
    );
  }

  const data = frameworks.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">AI Compliance Training</h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            Master the 6 global AI governance frameworks with AI-powered adaptive training.
            Learn while practicing with real-time AI tutoring.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold mb-1">AI-Powered Tutoring</h3>
              <p className="text-sm text-muted-foreground">Real-time explanations as you practice</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Award className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold mb-1">Certifications</h3>
              <p className="text-sm text-muted-foreground">Earn recognized credentials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold mb-1">Adaptive Learning</h3>
              <p className="text-sm text-muted-foreground">Focuses on your weak areas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Clock className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold mb-1">Self-Paced</h3>
              <p className="text-sm text-muted-foreground">Learn on your schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Frameworks Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Choose Your Framework</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((framework) => (
              <Card
                key={framework.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedFramework(framework.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{framework.name}</CardTitle>
                      <CardDescription>{framework.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{framework.region}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Deadline */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      Enforcement deadline: {new Date(framework.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Tiers */}
                  <div className="space-y-2">
                    {framework.tiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFramework(framework.id);
                          setSelectedTier(tier.id);
                        }}
                      >
                        <div>
                          <p className="font-semibold text-sm">{tier.name}</p>
                          <p className="text-xs text-muted-foreground">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${(tier.price / 100).toFixed(2)}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePurchase(framework.id, tier.id);
                            }}
                            disabled={createCheckout.isPending}
                          >
                            {createCheckout.isPending ? "Processing..." : "Enroll"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coming Soon Badge */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900 text-sm">
                      Full training modules launching Q2 2026. Early access available now.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Comparison */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Pricing Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Framework</th>
                  <th className="text-center py-3 px-4 font-semibold">Fundamentals</th>
                  <th className="text-center py-3 px-4 font-semibold">Professional</th>
                  <th className="text-center py-3 px-4 font-semibold">Expert</th>
                </tr>
              </thead>
              <tbody>
                {data.map((framework) => (
                  <tr key={framework.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{framework.name}</td>
                    {framework.tiers.map((tier) => (
                      <td key={tier.id} className="text-center py-3 px-4">
                        <span className="font-bold">${(tier.price / 100).toFixed(2)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How does AI tutoring work?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Our AI tutor provides real-time explanations as you answer practice questions. It identifies
                your weak areas and recommends focused review, helping you learn faster and pass exams with
                higher confidence.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Can I get a refund?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! We offer a 14-day money-back guarantee. If you're not satisfied with the training, we'll
                refund your purchase in full.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What's included in each tier?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>• Access to all training modules</li>
                  <li>• AI-powered practice questions</li>
                  <li>• Certification exam</li>
                  <li>• Professional certificate (Expert tier)</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">When are full modules available?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Full training modules for all frameworks launch in Q2 2026. Early access is available now with
                practice questions and AI tutoring.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to master AI compliance?</h2>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
            Start with practice questions and AI tutoring today. Full training modules launching Q2 2026.
          </p>
          <Button size="lg" variant="secondary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            View Frameworks
          </Button>
        </div>
      </div>
    </div>
  );
}
