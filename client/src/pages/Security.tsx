import { Shield, Lock, Eye, CheckCircle, FileText, Server, Database, Key, AlertTriangle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Security() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Shield className="w-20 h-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-6">Security & Compliance</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              CSOAI is built on a foundation of security-first principles. We protect your data with industry-leading practices and comply with global regulations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Certifications & Compliance */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Certifications & Compliance</h2>
            <p className="text-xl text-gray-600">Independently verified security and compliance standards</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div {...fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <Shield className="w-12 h-12 text-emerald-600 mb-4" />
                  <CardTitle>ISO/IEC 27001:2022</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Information security management system certified to international standards.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <Lock className="w-12 h-12 text-emerald-600 mb-4" />
                  <CardTitle>SOC 2 Type II</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Audited for security, availability, processing integrity, confidentiality, and privacy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <CheckCircle className="w-12 h-12 text-emerald-600 mb-4" />
                  <CardTitle>GDPR Compliant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Full compliance with EU General Data Protection Regulation for data privacy.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <Eye className="w-12 h-12 text-emerald-600 mb-4" />
                  <CardTitle>WCAG 2.1 AA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Accessible to all users, meeting Web Content Accessibility Guidelines.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Security Practices</h2>
            <p className="text-xl text-gray-600">How we protect your data at every layer</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Lock className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Encryption</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>TLS 1.3</strong> for all data in transit</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>AES-256</strong> encryption for data at rest</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>End-to-end encryption</strong> for sensitive communications</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Automated key rotation</strong> every 90 days</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Key className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Authentication & Access</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Multi-factor authentication (MFA)</strong> required for all accounts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>OAuth 2.0</strong> and <strong>OpenID Connect</strong> support</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Role-based access control (RBAC)</strong> for granular permissions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Session management</strong> with automatic timeout</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Data Protection</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Automated daily backups</strong> with hourly incremental backups</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Multi-region replication</strong> for disaster recovery</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Data retention policies</strong> compliant with GDPR</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Right to erasure</strong> and data portability support</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Server className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Infrastructure Security</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>DDoS protection</strong> and rate limiting</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Web Application Firewall (WAF)</strong> for threat detection</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Intrusion detection systems (IDS)</strong> monitoring 24/7</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700"><strong>Regular penetration testing</strong> by third-party security firms</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compliance & Regulations */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Regulatory Compliance</h2>
            <p className="text-xl text-gray-600">We comply with major international data protection regulations</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>GDPR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Full compliance with the EU General Data Protection Regulation, including:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Right to access and data portability</li>
                    <li>• Right to erasure ("right to be forgotten")</li>
                    <li>• Data processing agreements (DPA)</li>
                    <li>• Privacy by design and by default</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>CCPA</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    California Consumer Privacy Act compliance, including:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Right to know what data is collected</li>
                    <li>• Right to delete personal information</li>
                    <li>• Right to opt-out of data sales</li>
                    <li>• Non-discrimination for exercising rights</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle>UK DPA 2018</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    UK Data Protection Act 2018 compliance, including:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Lawful basis for processing</li>
                    <li>• Data protection impact assessments</li>
                    <li>• Breach notification procedures</li>
                    <li>• Data protection officer (DPO) appointed</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Incident Response */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Incident Response</h2>
            <p className="text-xl text-gray-600">Our commitment to transparency and rapid response</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-emerald-600" />
                    <CardTitle>24/7 Security Monitoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Our security operations center (SOC) monitors the platform around the clock for potential threats and anomalies.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Real-time threat detection and alerting</li>
                    <li>• Automated incident response workflows</li>
                    <li>• Mean time to detection (MTTD): &lt;5 minutes</li>
                    <li>• Mean time to response (MTTR): &lt;1 hour</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Vulnerability Disclosure</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    We welcome responsible disclosure of security vulnerabilities and maintain a transparent vulnerability management process.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Bug bounty program for security researchers</li>
                    <li>• Coordinated disclosure timeline</li>
                    <li>• Public security advisories</li>
                    <li>• Quarterly security audit summaries</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Team */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Security Team & Audits</h2>
            <p className="text-xl text-gray-600">Independent verification and continuous improvement</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Dedicated Security Team</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Our security team includes certified professionals with expertise in:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• CISSP (Certified Information Systems Security Professional)</li>
                    <li>• CEH (Certified Ethical Hacker)</li>
                    <li>• OSCP (Offensive Security Certified Professional)</li>
                    <li>• Cloud security architecture (AWS, Azure, GCP)</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-emerald-600" />
                    <CardTitle>Regular Security Audits</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    We conduct regular security assessments and audits:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Annual SOC 2 Type II audits</li>
                    <li>• Quarterly penetration testing</li>
                    <li>• Monthly vulnerability scans</li>
                    <li>• Continuous code security analysis</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Security Team */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6">Questions About Security?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our security team is here to help. Contact us for security inquiries, vulnerability reports, or compliance questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:security@csoai.org"
                className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                security@csoai.org
              </a>
              <a
                href="/docs"
                className="inline-block bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-900 transition"
              >
                View Documentation
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
