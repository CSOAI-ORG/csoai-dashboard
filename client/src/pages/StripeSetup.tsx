/**
 * Stripe Setup Page - Admin Only
 * One-time setup to create Stripe products and prices for all courses
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function StripeSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const createProductsMutation = trpc.stripeSetup.createAllProducts.useMutation();
  const updateNameMutation = trpc.stripeSetup.updateAccountName.useMutation();

  const handleCreateProducts = async () => {
    setIsCreating(true);
    setResults(null);

    try {
      const result = await createProductsMutation.mutateAsync();
      setResults(result);
      toast.success(`Successfully created ${result.successCount} products!`);
    } catch (error: any) {
      toast.error(`Failed to create products: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateAccountName = async () => {
    try {
      await updateNameMutation.mutateAsync({ displayName: "CSOAI.org" });
      toast.success("Stripe account name updated to CSOAI.org");
    } catch (error: any) {
      toast.error(`Failed to update account name: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Stripe Setup</h1>
          <p className="text-muted-foreground">
            One-time setup to create Stripe products and prices for all courses
          </p>
        </div>

        {/* Step 1: Create Products */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Step 1: Create Products & Prices</h2>
              <p className="text-sm text-muted-foreground">
                This will create Stripe products and 4 price points (one-time, 3-month, 6-month, 12-month) for all 24 courses.
                <br />
                <strong>Total:</strong> 24 products + 96 prices
              </p>
            </div>
            <Button
              onClick={handleCreateProducts}
              disabled={isCreating || !!results}
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : results ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                "Create All Products"
              )}
            </Button>
          </div>

          {isCreating && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Creating Stripe products... This may take 2-3 minutes.</span>
              </div>
            </div>
          )}

          {results && (
            <div className="mt-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {results.successCount}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
                </Card>
                <Card className="p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {results.errorCount}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                </Card>
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {results.totalCourses}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Total Courses</div>
                </Card>
              </div>

              {/* Detailed Results */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.results.map((result: any) => (
                  <div
                    key={result.courseId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {result.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{result.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Course ID: {result.courseId}
                        </div>
                      </div>
                    </div>
                    {result.status === 'success' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        4 prices created
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {result.error}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Step 2: Update Account Name */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Step 2: Update Account Display Name</h2>
              <p className="text-sm text-muted-foreground">
                Change Stripe account name from "Loot Factory AI Ltd" to "CSOAI.org" for customer trust.
              </p>
            </div>
            <Button
              onClick={handleUpdateAccountName}
              disabled={updateNameMutation.isPending}
              variant="outline"
            >
              {updateNameMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update to CSOAI.org"
              )}
            </Button>
          </div>
        </Card>

        {/* Warning */}
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> This is a one-time setup operation. Once completed, you don't need to run it again.
              The Stripe products and prices will be permanently created and linked to your courses.
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
