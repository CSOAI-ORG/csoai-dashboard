import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Award,
  Calendar,
  BookOpen,
  Shield,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function VerifyCertificate() {
  const params = useParams<{ id?: string; certificateNumber?: string }>();
  // Support both /verify-certificate/:id and /verify/:certificateNumber routes
  const certificateId = params.id || params.certificateNumber || '';
  const [searchInput, setSearchInput] = useState(certificateId);
  const [hasSearched, setHasSearched] = useState(!!certificateId);

  // Verify certificate mutation for search functionality
  const verifyMutation = trpc.certificates.verifyCertificate.useMutation();
  
  // Auto-verify on mount if certificateId is provided
  useEffect(() => {
    if (certificateId) {
      setSearchInput(certificateId);
      setHasSearched(true);
      verifyMutation.mutate({ certificateNumber: certificateId });
    }
  }, [certificateId]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setHasSearched(true);
    verifyMutation.mutate({ certificateNumber: searchInput.trim() });
  };
  
  const data = verifyMutation.data;
  const isLoading = verifyMutation.isPending;
  const error = verifyMutation.error;

  // Show search form if no certificate ID provided
  if (!certificateId && !hasSearched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-green-600 dark:text-green-400" />
              <h1 className="text-4xl font-bold">Certificate Verification</h1>
            </div>
            <p className="text-muted-foreground">
              Verify CEASAI certificates for employers and organizations
            </p>
          </div>
          
          <Card className="max-w-xl mx-auto p-8">
            <h2 className="text-xl font-semibold mb-4">Enter Certificate Number</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., COAI-EUAI-1234567890-ABCD1234"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button type="submit" disabled={!searchInput.trim()}>
                  Verify
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the certificate number found on the credential to verify its authenticity.
              </p>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold">Verifying Certificate...</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we verify the certificate
          </p>
        </Card>
      </div>
    );
  }

  if (error || !data?.valid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Certificate Not Found</h1>
          <p className="text-muted-foreground mb-2">
            {data?.message || error?.message || 'This certificate could not be verified.'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            The certificate ID may be invalid or the certificate may have been revoked.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Valid certificate
  const { certificate } = data;
  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Certificate Data Missing</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load certificate details.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }
  const issuedDate = new Date(certificate.issuedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-green-600 dark:text-green-400" />
            <h1 className="text-4xl font-bold">Certificate Verification</h1>
          </div>
          <p className="text-muted-foreground">
            Official CSOAI Training Certificate
          </p>
        </div>

        {/* Verification Status Card */}
        <Card className="max-w-3xl mx-auto mb-8 border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
                  Certificate Verified
                </h2>
                <p className="text-sm text-muted-foreground">
                  This is an authentic CSOAI certificate
                </p>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Certificate ID */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  Certificate ID
                </div>
                <div className="font-mono text-sm bg-background/50 p-3 rounded border">
                  {certificate.certificateNumber}
                </div>
              </div>

              {/* Issued Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Issue Date
                </div>
                <div className="text-lg font-semibold">
                  {issuedDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              {/* Course Name */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  Course
                </div>
                <div className="text-lg font-semibold">
                  {certificate.courseName}
                </div>
              </div>

              {/* Framework */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Award className="w-4 h-4" />
                  Framework
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {certificate.level}
                </Badge>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Verification Confirmed:</strong> This certificate has been issued by CSOAI 
                and represents successful completion of the training course. The certificate holder has 
                demonstrated proficiency in AI safety and governance frameworks.
              </p>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">About CSOAI Certification</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                CSOAI provides comprehensive training in AI safety, governance, and compliance 
                frameworks including EU AI Act, NIST AI RMF, and ISO/IEC 42001.
              </p>
              <p>
                Our certification program ensures that graduates have the knowledge and skills necessary 
                to work as AI Safety Analysts, protecting humanity from AI risks while advancing 
                responsible AI development.
              </p>
              <p className="text-xs pt-2 border-t">
                To verify this certificate, visit: <span className="font-mono">coai.manus.space/verify-certificate/{certificateId}</span>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
