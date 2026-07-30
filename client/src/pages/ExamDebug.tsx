/**
 * Debug page to test exam data loading
 */

import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function ExamDebug() {
  const { data: testData, isLoading, error } = trpc.certification.getTestQuestions.useQuery(
    { testId: 1 }
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Exam Data Debug</h1>
        
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        
        {testData && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded">
              <h2 className="font-bold mb-2">Test Data Structure:</h2>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(testData, null, 2)}
              </pre>
            </div>
            
            <div className="bg-muted p-4 rounded">
              <h2 className="font-bold mb-2">Test Info:</h2>
              <p>Test ID: {testData?.test?.id}</p>
              <p>Test Title: {testData?.test?.title}</p>
              <p>Questions Count: {testData?.questions?.length || 0}</p>
            </div>
            
            {testData?.questions && testData.questions.length > 0 && (
              <div className="bg-muted p-4 rounded">
                <h2 className="font-bold mb-2">First Question:</h2>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(testData.questions[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
