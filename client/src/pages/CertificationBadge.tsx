import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Download, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function CertificationBadge() {
  const { badgeToken } = useParams<{ badgeToken: string }>();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch badge details
  const { data: badgeData, isLoading } = trpc.certificationBadges.getBadgeByToken.useQuery(
    { badgeToken: badgeToken || "" },
    { enabled: !!badgeToken }
  );

  // Fetch badge stats
  const { data: stats } = trpc.certificationBadges.getBadgeStats.useQuery(
    { badgeToken: badgeToken || "" },
    { enabled: !!badgeToken }
  );

  useEffect(() => {
    setLoading(isLoading);
    if (badgeData) {
      setError(null);
    }
  }, [isLoading, badgeData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading certification badge...</p>
        </div>
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Badge Not Found</h1>
          <p className="text-gray-600 mb-6">
            This certification badge could not be found. Please check the URL and try again.
          </p>
          <Button onClick={() => (window.location.href = "/")} className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  const { badge, user } = badgeData;
  const badgeConfig: Record<string, { name: string; color: string; icon: string }> = {
    level_1: { name: "Level 1 Analyst", color: "emerald", icon: "🏅" },
    level_2: { name: "Level 2 Analyst", color: "blue", icon: "🥈" },
    level_3: { name: "Level 3 Analyst", color: "amber", icon: "🥇" },
    expert: { name: "Expert Analyst", color: "purple", icon: "⭐" },
  };

  const config = badgeConfig[badge.certificationLevel] || badgeConfig.level_1;
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500 to-emerald-700",
    blue: "from-blue-500 to-blue-700",
    amber: "from-amber-500 to-amber-700",
    purple: "from-purple-500 to-purple-700",
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(badge.badgeEmbedCode || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBadge = async () => {
    try {
      const response = await fetch(`/api/badge/image/${badgeToken}.png`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `csoai-badge-${user?.name?.replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading badge:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CSOAI Certification Badge</h1>
          <p className="text-lg text-gray-600">Verified AI Safety Analyst</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Badge Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <Card className="w-full p-8 text-center bg-white shadow-xl">
              <div className={`inline-block bg-gradient-to-br ${colorMap[config.color]} rounded-full p-8 mb-6`}>
                <div className="text-6xl">{config.icon}</div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h2>
              <p className="text-xl font-semibold text-gray-700 mb-4">{user?.name}</p>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">Issued: {badge.issuedAt && new Date(badge.issuedAt).toLocaleDateString()}</p>
                {(badge as any).expiresAt && (
                  <p className="text-sm text-gray-600 mb-2">
                    Expires: {new Date((badge as any).expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-center text-emerald-600 font-semibold">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verified at csoai.org
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="w-full mt-6 space-y-3">
              <Button
                onClick={handleDownloadBadge}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Badge (PNG)
              </Button>

              <Button
                onClick={handleCopyEmbed}
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy Embed Code"}
              </Button>
            </div>
          </motion.div>

          {/* Badge Info & Sharing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Analyst Profile */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Analyst Profile</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Certification Level</p>
                  <p className="text-lg font-semibold text-gray-900">{config.name}</p>
                </div>
              </div>
            </Card>

            {/* Badge Statistics */}
            {stats && (
              <Card className="p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Badge Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shares</span>
                    <span className="font-semibold text-gray-900">{stats.totalShares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profile Views</span>
                    <span className="font-semibold text-gray-900">{stats.totalClicks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LinkedIn Shares</span>
                    <span className="font-semibold text-gray-900">{stats.linkedInShares}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Share Options */}
            <Card className="p-6 bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Share Your Badge
              </h3>
              <div className="space-y-3">
                <a
                  href={`https://www.linkedin.com/feed/?shareActive=true&text=I%20just%20earned%20my%20${config.name}%20from%20CSOAI!%20%F0%9F%8E%89%20${badge.verificationUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-semibold transition"
                >
                  Share on LinkedIn
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=I%27m%20now%20${config.name}%20from%20@CSOAI!%20%F0%9F%8E%93%20${badge.verificationUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-center font-semibold transition"
                >
                  Share on Twitter
                </a>
                <a
                  href={`mailto:?subject=${user?.name}%20is%20now%20${config.name}&body=Check%20out%20my%20new%20CSOAI%20certification!%20${badge.verificationUrl}`}
                  className="block w-full p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-center font-semibold transition"
                >
                  Share via Email
                </a>
              </div>
            </Card>

            {/* Verification Info */}
            <Card className="p-6 bg-emerald-50 border border-emerald-200">
              <h3 className="text-lg font-bold text-emerald-900 mb-2">Verification</h3>
              <p className="text-sm text-emerald-800 mb-3">
                This badge is verified and publicly accessible. Anyone can view this profile using the badge link.
              </p>
              <p className="text-xs text-emerald-700 font-mono break-all">
                Badge ID: {badgeToken}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Want to earn your own CSOAI certification badge?
          </p>
          <Button
            onClick={() => (window.location.href = "/training")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Start Training
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
