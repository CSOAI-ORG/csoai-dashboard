import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EnrollmentTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const enrollMutation = trpc.courses.enrollInCourse.useMutation();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEnrollment = async () => {
    setLogs([]);
    setResult(null);
    
    try {
      addLog("🚀 Starting enrollment test...");
      addLog(`Course ID: 1`);
      addLog(`Payment Type: one_time`);
      
      addLog("📡 Calling enrollInCourse mutation...");
      
      const enrollmentResult = await enrollMutation.mutateAsync({
        courseId: 1,
        paymentType: "one_time",
      });
      
      addLog("✅ Mutation completed!");
      addLog(`Result: ${JSON.stringify(enrollmentResult, null, 2)}`);
      setResult(enrollmentResult);
      
      if (enrollmentResult.checkoutUrl) {
        addLog(`🔗 Checkout URL: ${enrollmentResult.checkoutUrl}`);
        addLog("✅ SUCCESS! Stripe checkout URL received!");
      } else {
        addLog("⚠️ WARNING: No checkoutUrl in response");
      }
      
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
      setResult({ error: error.message });
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Enrollment Test Page</h1>
        
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            This page tests the enrollment flow directly without the UI complexity.
          </p>
          
          <Button 
            onClick={testEnrollment}
            disabled={enrollMutation.isPending}
            size="lg"
            className="w-full"
          >
            {enrollMutation.isPending ? "Testing..." : "Test Enrollment (Course ID: 1)"}
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-6">
            <h3 className="text-white font-bold mb-2">Console Logs:</h3>
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}

        {result && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </Card>
    </div>
  );
}
