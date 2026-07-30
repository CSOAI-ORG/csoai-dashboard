import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface NotificationPreference {
  id: string;
  eventType: string;
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "compliance_score_changed",
      eventType: "Compliance Score Changed",
      description: "Notified when your system's compliance score changes",
      enabled: true,
      channels: { email: true, sms: false, push: true, inApp: true }
    },
    {
      id: "audit_due",
      eventType: "Audit Due",
      description: "Reminder when an audit is due soon",
      enabled: true,
      channels: { email: true, sms: true, push: true, inApp: true }
    },
    {
      id: "enforcement_action_issued",
      eventType: "Enforcement Action Issued",
      description: "Alert when an enforcement action is issued",
      enabled: true,
      channels: { email: true, sms: true, push: true, inApp: true }
    },
    {
      id: "requirement_updated",
      eventType: "Compliance Requirement Updated",
      description: "Notification when compliance requirements change",
      enabled: true,
      channels: { email: true, sms: false, push: true, inApp: true }
    },
    {
      id: "system_flagged",
      eventType: "System Flagged",
      description: "Alert when your system is flagged for review",
      enabled: true,
      channels: { email: true, sms: true, push: true, inApp: true }
    },
    {
      id: "audit_completed",
      eventType: "Audit Completed",
      description: "Notification when an audit is completed",
      enabled: true,
      channels: { email: true, sms: false, push: true, inApp: true }
    }
  ]);

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "UTC"
  });

  const [minPriority, setMinPriority] = useState<"critical" | "high" | "medium" | "low">("medium");

  const [contactInfo, setContactInfo] = useState({
    email: "user@example.com",
    phone: "+1 (555) 123-4567",
    pushEnabled: true
  });

  const [saved, setSaved] = useState(false);

  const handlePreferenceChange = (
    id: string,
    field: "enabled" | "channels",
    value: any
  ) => {
    setPreferences(
      preferences.map(pref =>
        pref.id === id
          ? field === "enabled"
            ? { ...pref, enabled: value }
            : { ...pref, channels: { ...pref.channels, ...value } }
          : pref
      )
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-12 bg-white border-b-2 border-emerald-200">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl font-bold text-gray-900">Notification Preferences</h1>
            </div>
            <p className="text-lg text-gray-700">
              Customize how and when you receive notifications about compliance events.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>

            <Card className="p-6 border-2 border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={e => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Smartphone className="h-4 w-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={e => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={contactInfo.pushEnabled}
                    onChange={e => setContactInfo({ ...contactInfo, pushEnabled: e.target.checked })}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600"
                  />
                  <span className="text-gray-700">Enable push notifications on this device</span>
                </label>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Quiet Hours */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiet Hours</h2>

            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-start gap-4 mb-6">
                <input
                  type="checkbox"
                  checked={quietHours.enabled}
                  onChange={e => setQuietHours({ ...quietHours, enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600 mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Clock className="h-5 w-5 inline mr-2" />
                    Enable Quiet Hours
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Disable non-critical notifications during specified hours. Critical alerts will still be delivered.
                  </p>
                </div>
              </div>

              {quietHours.enabled && (
                <div className="grid md:grid-cols-3 gap-4 pl-9">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={quietHours.startTime}
                      onChange={e => setQuietHours({ ...quietHours, startTime: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={quietHours.endTime}
                      onChange={e => setQuietHours({ ...quietHours, endTime: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                    <select
                      value={quietHours.timezone}
                      onChange={e => setQuietHours({ ...quietHours, timezone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-600 focus:outline-none"
                    >
                      <option>UTC</option>
                      <option>EST</option>
                      <option>CST</option>
                      <option>MST</option>
                      <option>PST</option>
                      <option>CET</option>
                      <option>IST</option>
                      <option>JST</option>
                    </select>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Minimum Priority */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Priority Filter</h2>

            <Card className="p-6 border-2 border-gray-200">
              <p className="text-gray-600 mb-4">
                Only receive notifications with priority level equal to or higher than:
              </p>

              <div className="grid md:grid-cols-4 gap-4">
                {["critical", "high", "medium", "low"].map(priority => (
                  <button
                    key={priority}
                    onClick={() => setMinPriority(priority as any)}
                    className={`p-4 rounded-lg border-2 transition ${
                      minPriority === priority
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <p className="font-semibold text-gray-900 capitalize">{priority}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {priority === "critical"
                        ? "All notifications"
                        : priority === "high"
                        ? "High & Critical"
                        : priority === "medium"
                        ? "Medium & Above"
                        : "Low & Above"}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Event Preferences */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Notifications</h2>

            <div className="space-y-4">
              {preferences.map(pref => (
                <Card key={pref.id} className="p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={pref.enabled}
                          onChange={e => handlePreferenceChange(pref.id, "enabled", e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-600"
                        />
                        <h3 className="text-lg font-bold text-gray-900">{pref.eventType}</h3>
                      </div>
                      <p className="text-gray-600 text-sm ml-7">{pref.description}</p>
                    </div>
                  </div>

                  {pref.enabled && (
                    <div className="ml-7 pt-4 border-t-2 border-gray-200">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Notify via:</p>
                      <div className="grid md:grid-cols-4 gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.channels.email}
                            onChange={e =>
                              handlePreferenceChange(pref.id, "channels", { email: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-2 border-gray-300 text-emerald-600"
                          />
                          <Mail className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Email</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.channels.sms}
                            onChange={e =>
                              handlePreferenceChange(pref.id, "channels", { sms: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-2 border-gray-300 text-emerald-600"
                          />
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">SMS</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.channels.push}
                            onChange={e =>
                              handlePreferenceChange(pref.id, "channels", { push: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-2 border-gray-300 text-emerald-600"
                          />
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Push</span>
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={pref.channels.inApp}
                            onChange={e =>
                              handlePreferenceChange(pref.id, "channels", { inApp: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-2 border-gray-300 text-emerald-600"
                          />
                          <Bell className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">In-App</span>
                        </label>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12 bg-white border-t-2 border-gray-200">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto flex gap-4">
            <Button
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Preferences
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Defaults
            </Button>

            {saved && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Preferences saved successfully</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
