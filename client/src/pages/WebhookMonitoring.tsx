import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";

interface WebhookDelivery {
  id: string;
  eventType: string;
  subscriptionUrl: string;
  status: "delivered" | "failed" | "retrying" | "pending";
  attemptCount: number;
  httpStatus?: number;
  timestamp: Date;
  nextRetryAt?: Date;
}

interface WebhookStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  retryingDeliveries: number;
  successRate: number;
  averageLatency: number;
  totalSubscriptions: number;
}

export default function WebhookMonitoring() {
  const [stats] = useState<WebhookStats>({
    totalDeliveries: 12847,
    successfulDeliveries: 12654,
    failedDeliveries: 89,
    retryingDeliveries: 104,
    successRate: 98.5,
    averageLatency: 245,
    totalSubscriptions: 342
  });

  const [deliveries] = useState<WebhookDelivery[]>([
    {
      id: "whd_001",
      eventType: "compliance.requirement.updated",
      subscriptionUrl: "https://api.enterprise1.com/webhooks/compliance",
      status: "delivered",
      attemptCount: 1,
      httpStatus: 200,
      timestamp: new Date(Date.now() - 5 * 60000)
    },
    {
      id: "whd_002",
      eventType: "enforcement.action.issued",
      subscriptionUrl: "https://api.enterprise2.com/webhooks/enforcement",
      status: "retrying",
      attemptCount: 2,
      httpStatus: 503,
      timestamp: new Date(Date.now() - 15 * 60000),
      nextRetryAt: new Date(Date.now() + 30 * 1000)
    },
    {
      id: "whd_003",
      eventType: "compliance.score.changed",
      subscriptionUrl: "https://api.enterprise3.com/webhooks/compliance",
      status: "delivered",
      attemptCount: 1,
      httpStatus: 200,
      timestamp: new Date(Date.now() - 2 * 60000)
    },
    {
      id: "whd_004",
      eventType: "audit.required",
      subscriptionUrl: "https://api.enterprise4.com/webhooks/audit",
      status: "failed",
      attemptCount: 5,
      httpStatus: 500,
      timestamp: new Date(Date.now() - 45 * 60000)
    },
    {
      id: "whd_005",
      eventType: "system.flagged",
      subscriptionUrl: "https://api.enterprise5.com/webhooks/system",
      status: "delivered",
      attemptCount: 1,
      httpStatus: 200,
      timestamp: new Date(Date.now() - 1 * 60000)
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "retrying":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "failed":
        return <AlertCircle className="h-5 w-5" />;
      case "retrying":
        return <Clock className="h-5 w-5" />;
      case "pending":
        return <Zap className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-12 bg-white border-b-2 border-emerald-200">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl font-bold text-gray-900">Webhook Monitoring</h1>
            </div>
            <p className="text-lg text-gray-700">
              Real-time monitoring of webhook deliveries, retry status, and delivery analytics.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Statistics</h2>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Success Rate */}
              <Card className="p-6 border-2 border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Success Rate</p>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.successRate}%</p>
                <p className="text-xs text-gray-600 mt-2">
                  {stats.successfulDeliveries} of {stats.totalDeliveries} delivered
                </p>
              </Card>

              {/* Average Latency */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Avg Latency</p>
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.averageLatency}ms</p>
                <p className="text-xs text-gray-600 mt-2">Average response time</p>
              </Card>

              {/* Retrying */}
              <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Retrying</p>
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{stats.retryingDeliveries}</p>
                <p className="text-xs text-gray-600 mt-2">Scheduled for retry</p>
              </Card>

              {/* Failed */}
              <Card className="p-6 border-2 border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Failed</p>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{stats.failedDeliveries}</p>
                <p className="text-xs text-gray-600 mt-2">Permanent failures</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Deliveries */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Deliveries</h2>

            <div className="space-y-3">
              {deliveries.map(delivery => (
                <Card key={delivery.id} className="p-4 border-2 border-gray-200 hover:border-emerald-200 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{delivery.eventType}</p>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(delivery.status)}`}>
                            {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{delivery.subscriptionUrl}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Attempt {delivery.attemptCount}</span>
                          {delivery.httpStatus && <span>HTTP {delivery.httpStatus}</span>}
                          <span>{formatTime(delivery.timestamp)}</span>
                          {delivery.nextRetryAt && (
                            <span className="text-yellow-600 font-semibold">
                              Retry in {Math.ceil((delivery.nextRetryAt.getTime() - Date.now()) / 1000)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Retry Logic Explanation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Retry Logic & Exponential Backoff</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Retry Strategy</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Max Retries:</strong> 5 attempts per delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Initial Delay:</strong> 1 second</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Max Delay:</strong> 1 hour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Jitter:</strong> ±10% random variance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Timeout:</strong> 30 seconds per attempt</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Backoff Schedule</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Attempt 1:</span>
                    <span className="font-mono font-bold">1s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempt 2:</span>
                    <span className="font-mono font-bold">2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempt 3:</span>
                    <span className="font-mono font-bold">4s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempt 4:</span>
                    <span className="font-mono font-bold">8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Attempt 5:</span>
                    <span className="font-mono font-bold">16s</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Webhook Signature Verification */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Webhook Security</h2>

            <Card className="p-6 border-2 border-emerald-200 bg-emerald-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">HMAC Signature Verification</h3>
              <p className="text-gray-700 mb-4">
                All webhooks are signed with HMAC-SHA256 using your subscription secret. Verify the signature to ensure the webhook came from CSOAI.
              </p>

              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <p className="text-sm font-mono text-gray-600 mb-2">Example verification (Node.js):</p>
                <pre className="text-xs overflow-x-auto">
{`const crypto = require('crypto');

const signature = req.headers['x-csoai-signature'];
const body = req.rawBody; // Raw request body
const secret = process.env.WEBHOOK_SECRET;

const hash = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (hash === signature) {
  // Webhook is authentic
} else {
  // Webhook is invalid
}`}
                </pre>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Headers included:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">X-CSOAI-Event-ID</code> - Unique event identifier</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">X-CSOAI-Event-Type</code> - Type of event</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">X-CSOAI-Signature</code> - HMAC-SHA256 signature</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">X-CSOAI-Timestamp</code> - ISO 8601 timestamp</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
