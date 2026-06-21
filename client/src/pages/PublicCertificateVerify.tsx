/**
 * Public Certificate Verification Page
 * Enterprise Launch Requirement: Phase 3 - Certification Issuance and Verification
 * Allows anyone to verify the authenticity of a certificate
 */

import { useState } from 'react';
import { Search, CheckCircle2, XCircle, Shield, Calendar, User, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { LoadingState } from '@/components/LoadingState';

export default function PublicCertificateVerify() {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const verifyMutation = trpc.certificates.verifyCertificate.useMutation();
  const certificate = verifyMutation.data?.valid ? verifyMutation.data.certificate : null;
  const isLoading = verifyMutation.isPending;
  const error = verifyMutation.error;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (certificateNumber.trim()) {
      setSearchTriggered(true);
      try {
        await verifyMutation.mutateAsync({ certificateNumber });
      } catch {
        // Error state is handled by the mutation
      }
    }
  };

  const handleReset = () => {
    setCertificateNumber('');
    setSearchTriggered(false);
    verifyMutation.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of CSOAI AI Safety Analyst certifications
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Enter Certificate Number</CardTitle>
            <CardDescription>
              Certificate numbers are in the format: CERT-XXXXXX-YYYY
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                type="text"
                placeholder="e.g., CERT-123456-2024"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                className="flex-1 text-lg"
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!certificateNumber.trim() || isLoading}
                className="gap-2"
              >
                <Search className="h-5 w-5" />
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <LoadingState message="Verifying certificate..." />
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {searchTriggered && !isLoading && (error || (verifyMutation.data && !verifyMutation.data.valid)) && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-900 mb-2">
                    Certificate Not Found
                  </h3>
                  <p className="text-red-700 mb-4">
                    The certificate number "{certificateNumber}" could not be verified.
                  </p>
                  <p className="text-sm text-red-600">
                    Please check the certificate number and try again. If you believe this is an error, contact support.
                  </p>
                </div>
                <Button variant="outline" onClick={handleReset}>
                  Try Another Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {searchTriggered && !isLoading && verifyMutation.data?.valid && certificate && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center text-center gap-6">
                {/* Verification Badge */}
                <div className="p-4 bg-emerald-100 rounded-full">
                  <CheckCircle2 className="h-16 w-16 text-emerald-600" />
                </div>

                <div>
                  <Badge className="mb-3 bg-emerald-600 text-white text-sm px-3 py-1">
                    ✓ Verified Certificate
                  </Badge>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                    Valid Certification
                  </h3>
                  <p className="text-emerald-700">
                    This certificate has been verified as authentic and is currently valid.
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="w-full bg-white rounded-lg border border-emerald-200 p-6 text-left space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Certificate Holder</div>
                      <div className="font-semibold text-gray-900">
                        {certificate.userName || 'Name Not Available'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Certification</div>
                      <div className="font-semibold text-gray-900">
                        AI Safety Analyst
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Issue Date</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Valid Until</div>
                      <div className="font-semibold text-gray-900">
                        {(() => {
                          const expiry = new Date(certificate.issuedAt);
                          expiry.setFullYear(expiry.getFullYear() + 1);
                          return expiry.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        })()}
                        <span className="ml-2 text-sm text-gray-600">
                          (1 year validity)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Certificate Number</div>
                      <div className="font-mono font-semibold text-gray-900">
                        {certificate.certificateNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleReset}>
                    Verify Another Certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/about-ceasai', '_blank')}
                    className="gap-2"
                  >
                    About CEASAI
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        {!searchTriggered && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Certificate Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-700">
              <p>
                All CSOAI AI Safety Analyst certifications can be publicly verified using this tool. 
                Each certificate has a unique number that can be used to confirm its authenticity.
              </p>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">What gets verified:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Certificate authenticity and validity</li>
                  <li>Certificate holder information</li>
                  <li>Issue and expiry dates</li>
                  <li>Certification type and level</li>
                </ul>
              </div>
              <p className="text-xs text-gray-600 pt-4 border-t">
                <strong>Note:</strong> Certificates are valid for 1 year from the issue date. 
                Recertification is required to maintain active status.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
