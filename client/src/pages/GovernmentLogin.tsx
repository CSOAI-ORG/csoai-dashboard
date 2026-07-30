/**
 * Government Portal OAuth Login
 * Secure login for EU Commission, EDPB, and national authorities
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const JURISDICTIONS = [
  {
    id: 'EU',
    name: 'EU Commission',
    description: 'European Commission - Directorate General for Justice',
    icon: '🇪🇺',
  },
  {
    id: 'EDPB',
    name: 'EDPB',
    description: 'European Data Protection Board',
    icon: '📋',
  },
  {
    id: 'US',
    name: 'US Government',
    description: 'United States Federal Authority',
    icon: '🇺🇸',
  },
  {
    id: 'UK',
    name: 'UK Authority',
    description: 'United Kingdom Regulatory Body',
    icon: '🇬🇧',
  },
  {
    id: 'CA',
    name: 'Canada',
    description: 'Canadian Federal Authority',
    icon: '🇨🇦',
  },
  {
    id: 'AU',
    name: 'Australia',
    description: 'Australian Federal Authority',
    icon: '🇦🇺',
  },
];

export function GovernmentLogin() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (jurisdiction: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production, call tRPC endpoint to get authorization URL
      // const response = await trpc.governmentAuth.getAuthorizationUrl.query({
      //   jurisdiction: jurisdiction as any,
      //   redirectUri: `${window.location.origin}/government/callback`,
      // });

      // For demo, show success message
      const redirectUrl = `https://ec.europa.eu/oauth/authorize?client_id=csoai&redirect_uri=${encodeURIComponent(window.location.origin)}/government/callback&response_type=code&scope=profile%20email`;

      // In production:
      // window.location.href = response.authorizationUrl;

      // For demo, show confirmation
      alert(`OAuth flow would redirect to:\n${redirectUrl}`);
    } catch (err) {
      setError('Failed to initiate login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white">Government Portal</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Secure access for regulatory authorities and compliance officers
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Login Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* OAuth Login */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-emerald-600/20 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  Secure OAuth Login
                </CardTitle>
                <CardDescription>
                  Sign in with your government agency credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Select Your Jurisdiction
                  </label>
                  <Select value={selectedJurisdiction || ''} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-white">
                      <SelectValue placeholder="Choose jurisdiction..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                      {JURISDICTIONS.map((j) => (
                        <SelectItem key={j.id} value={j.id} className="text-white">
                          {j.icon} {j.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={() => selectedJurisdiction && handleLogin(selectedJurisdiction)}
                  disabled={!selectedJurisdiction || loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      Login with OAuth
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">
                  Your credentials are securely transmitted via OAuth 2.0
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Jurisdiction Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-blue-600/20 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Supported Jurisdictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {JURISDICTIONS.map((j) => (
                    <motion.div
                      key={j.id}
                      whileHover={{ x: 4 }}
                      className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-emerald-600/50 transition-colors"
                      onClick={() => {
                        setSelectedJurisdiction(j.id);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{j.icon}</span>
                        <div>
                          <p className="font-semibold text-white">{j.name}</p>
                          <p className="text-xs text-gray-400">{j.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-slate-600/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="text-lg">Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-600">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">OAuth 2.0</p>
                    <p className="text-sm text-gray-400">Industry-standard authentication</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-600">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Audit Logging</p>
                    <p className="text-sm text-gray-400">All actions tracked for compliance</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-6 w-6 rounded-md bg-emerald-600">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Role-Based Access</p>
                    <p className="text-sm text-gray-400">Fine-grained permissions control</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-12 text-center text-gray-400 text-sm"
        >
          <p>
            Protected by GDPR, NIST, and EU AI Act compliance standards.{' '}
            <a href="/privacy" className="text-emerald-400 hover:text-emerald-300">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
