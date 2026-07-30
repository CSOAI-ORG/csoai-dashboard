import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Plus, Eye, EyeOff, Shield, TrendingUp } from "lucide-react";

interface APIKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  permissions: string[];
  rateLimit: number;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  isActive: boolean;
  usage: {
    requestsThisMonth: number;
    requestsLastMonth: number;
    averageLatency: number;
  };
}

export default function APIKeyManagement() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "key_001",
      name: "Production Government Portal",
      key: "gov_prod_abc123def456ghi789jkl012mno345pqr",
      maskedKey: "gov_prod_abc123...pqr",
      permissions: ["compliance.read", "compliance.write", "enforcement.write"],
      rateLimit: 1000,
      createdAt: new Date("2025-01-15"),
      lastUsedAt: new Date(),
      expiresAt: new Date("2026-01-15"),
      isActive: true,
      usage: {
        requestsThisMonth: 45230,
        requestsLastMonth: 38920,
        averageLatency: 125
      }
    },
    {
      id: "key_002",
      name: "Development Enterprise API",
      key: "ent_dev_xyz789abc123def456ghi789jkl012mno",
      maskedKey: "ent_dev_xyz789...mno",
      permissions: ["compliance.read", "audits.read", "webhooks.write"],
      rateLimit: 100,
      createdAt: new Date("2025-01-10"),
      lastUsedAt: new Date("2025-01-20"),
      expiresAt: new Date("2025-04-10"),
      isActive: true,
      usage: {
        requestsThisMonth: 2150,
        requestsLastMonth: 1890,
        averageLatency: 95
      }
    }
  ]);

  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [rateLimit, setRateLimit] = useState(100);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("API key copied to clipboard");
  };

  const generateNewKey = () => {
    if (!newKeyName || selectedPermissions.length === 0) {
      alert("Please enter a key name and select at least one permission");
      return;
    }

    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name: newKeyName,
      key: `csoai_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      maskedKey: `csoai_${Math.random().toString(36).substring(2, 15)}...`,
      permissions: selectedPermissions,
      rateLimit,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      usage: {
        requestsThisMonth: 0,
        requestsLastMonth: 0,
        averageLatency: 0
      }
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    setSelectedPermissions([]);
    setRateLimit(100);
    setShowNewKeyForm(false);
  };

  const deleteKey = (keyId: string) => {
    if (confirm("Are you sure you want to delete this API key? This cannot be undone.")) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const allPermissions = [
    "compliance.read",
    "compliance.write",
    "audits.read",
    "audits.write",
    "enforcement.read",
    "enforcement.write",
    "webhooks.read",
    "webhooks.write",
    "analytics.read"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-12 bg-white border-b-2 border-emerald-200">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-emerald-600" />
                <h1 className="text-4xl font-bold text-gray-900">API Key Management</h1>
              </div>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                onClick={() => setShowNewKeyForm(!showNewKeyForm)}
              >
                <Plus className="h-5 w-5" />
                Generate New Key
              </Button>
            </div>
            <p className="text-lg text-gray-700">
              Manage API keys for government portal and enterprise integration APIs. Control permissions, rate limits, and monitor usage.
            </p>
          </div>
        </div>
      </section>

      {/* New Key Form */}
      {showNewKeyForm && (
        <section className="py-8 bg-white border-b-2 border-emerald-200">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <Card className="p-8 border-2 border-emerald-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate New API Key</h2>

                <div className="space-y-6">
                  {/* Key Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Key Name
                    </label>
                    <Input
                      placeholder="e.g., Production Government Portal"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-1">Descriptive name for this API key</p>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Permissions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {allPermissions.map(permission => (
                        <label key={permission} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{permission}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rate Limit */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Rate Limit (requests/minute)
                    </label>
                    <Input
                      type="number"
                      min="10"
                      max="10000"
                      value={rateLimit}
                      onChange={(e) => setRateLimit(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-600 mt-1">Maximum requests per minute</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={generateNewKey}
                    >
                      Generate Key
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setShowNewKeyForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* API Keys List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your API Keys</h2>

            <div className="space-y-4">
              {apiKeys.map(key => (
                <Card key={key.id} className="p-6 border-2 border-gray-200 hover:border-emerald-200 transition">
                  <div className="space-y-4">
                    {/* Key Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{key.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Created {key.createdAt.toLocaleDateString()} • Expires {key.expiresAt?.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {key.isActive && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key Display */}
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                      <code className="text-sm font-mono text-gray-700">
                        {visibleKeys.has(key.id) ? key.key : key.maskedKey}
                      </code>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="flex items-center gap-2"
                        >
                          {visibleKeys.has(key.id) ? (
                            <>
                              <EyeOff className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Show
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(key.key)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {key.permissions.map(perm => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <p className="text-xs font-semibold text-gray-600">This Month</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {key.usage.requestsThisMonth.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {key.usage.requestsThisMonth > key.usage.requestsLastMonth ? "↑" : "↓"}{" "}
                          {Math.abs(
                            ((key.usage.requestsThisMonth - key.usage.requestsLastMonth) /
                              key.usage.requestsLastMonth) *
                              100
                          ).toFixed(1)}
                          % vs last month
                        </p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Avg Latency</p>
                        <p className="text-2xl font-bold text-green-600">{key.usage.averageLatency}ms</p>
                        <p className="text-xs text-gray-600 mt-1">Response time</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Rate Limit</p>
                        <p className="text-2xl font-bold text-purple-600">{key.rateLimit}</p>
                        <p className="text-xs text-gray-600 mt-1">requests/minute</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Key Best Practices</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">✓ Do</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Rotate keys regularly (every 90 days)</li>
                  <li>• Use different keys for different environments</li>
                  <li>• Store keys securely (use environment variables)</li>
                  <li>• Set appropriate rate limits per key</li>
                  <li>• Monitor key usage and revoke unused keys</li>
                  <li>• Use minimal required permissions</li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-red-200 bg-red-50">
                <h3 className="text-lg font-bold text-red-900 mb-3">✗ Don't</h3>
                <ul className="space-y-2 text-red-800">
                  <li>• Commit keys to version control</li>
                  <li>• Share keys between team members</li>
                  <li>• Use the same key for multiple environments</li>
                  <li>• Grant unnecessary permissions</li>
                  <li>• Ignore usage anomalies</li>
                  <li>• Forget to revoke old keys</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
