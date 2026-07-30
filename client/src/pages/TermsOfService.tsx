import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TermsOfService() {
  useEffect(() => {
    document.title = 'Terms of Service - CSOAI';
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: December 28, 2024
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <motion.div {...fadeInUp} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using CSOAI's website and services, you accept and agree to be bound by the terms and provisions of this agreement. This platform is operated by CEASAI Limited, a UK-registered company providing AI safety training, certification, and compliance services. CSOAI standards and frameworks are maintained as an independent Standards Body. If you do not agree to abide by these terms, please do not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. About CSOAI</h2>
              <p className="text-gray-600 mb-4">
                CSOAI (Community Standards Organization for AI) standards and frameworks are maintained as an independent Standards Body. This platform and its services are operated by CEASAI Limited (Company Number: [PENDING]), a UK-registered company. We are committed to serving the public interest by developing, maintaining, and promoting best practices in AI safety, compliance, and governance through training, certification, and transparency initiatives. CSOAI maintains strict independence from all commercial AI vendors and technology companies. Our mission is to ensure that AI systems are developed and deployed safely, ethically, and in compliance with applicable regulations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on CSOAI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Modifying or copying the materials without explicit written permission</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
                <li>Using automated tools or bots to access or scrape our services</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Training and Certification Services</h2>
              <p className="text-gray-600 mb-4">
                CSOAI provides training courses, certification examinations, and professional development programs. By enrolling in our programs, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Comply with all examination rules and academic integrity standards</li>
                <li>Not share examination content or answers with unauthorized parties</li>
                <li>Accept that certificates are non-transferable and represent your individual achievement</li>
                <li>Understand that CSOAI may revoke certificates for fraudulent enrollment or examination misconduct</li>
                <li>Acknowledge that certification does not guarantee employment or specific job outcomes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Watchdog Incident Reporting</h2>
              <p className="text-gray-600 mb-4">
                CSOAI's Watchdog program enables users to report AI safety concerns and incidents. By submitting reports, you agree that:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Reports may be made public to promote transparency in AI safety (unless marked confidential)</li>
                <li>You provide accurate and truthful information to the best of your knowledge</li>
                <li>You are responsible for any legal consequences of false or defamatory reports</li>
                <li>CSOAI may investigate reports and share findings with relevant authorities</li>
                <li>CSOAI does not guarantee confidentiality unless explicitly requested and approved</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer</h2>
              <p className="text-gray-600 mb-4">
                The materials on CSOAI's website are provided on an 'as is' basis. CSOAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. CSOAI does not warrant that services will be uninterrupted, error-free, or secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitations of Liability</h2>
              <p className="text-gray-600 mb-4">
                In no event shall CSOAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CSOAI's website, even if CSOAI or a CSOAI authorized representative has been notified orally or in writing of the possibility of such damage. This limitation applies to all claims, whether based on warranty, contract, tort, or any other legal theory.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Accuracy of Materials</h2>
              <p className="text-gray-600 mb-4">
                The materials appearing on CSOAI's website could include technical, typographical, or photographic errors. CSOAI does not warrant that any of the materials on its website are accurate, complete, or current. CSOAI may make changes to the materials contained on its website at any time without notice. While we strive for accuracy in our training materials and standards documentation, we recommend independent verification of critical information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Links and Third-Party Content</h2>
              <p className="text-gray-600 mb-4">
                CSOAI has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by CSOAI of the site. Use of any such linked website is at the user's own risk. CSOAI is not responsible for third-party content, services, or products referenced on our platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-600 mb-4">
                CSOAI may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service. We will notify users of material changes via email or prominent notice on our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law and Jurisdiction</h2>
              <p className="text-gray-600 mb-4">
                These terms and conditions are governed by and construed in accordance with the laws of the United Kingdom (as this platform is operated by CEASAI Limited, a UK-registered company), and you irrevocably submit to the exclusive jurisdiction of the courts in that location. However, we comply with all applicable international regulations including GDPR, CCPA, and other data protection laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. User Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                By using CSOAI's services, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the services only for lawful purposes and in compliance with all applicable laws</li>
                <li>Not engage in any conduct that restricts or inhibits anyone's use or enjoyment of the services</li>
                <li>Not submit false or misleading information</li>
                <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Comply with all CSOAI policies and procedures</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Intellectual Property Rights</h2>
              <p className="text-gray-600 mb-4">
                All content on CSOAI's website, including text, graphics, logos, images, and software, is the property of CSOAI or its content suppliers and is protected by international copyright laws. CSOAI standards, frameworks (including SOAI-PDCA), and training materials are owned by CSOAI and licensed under appropriate open-source or proprietary licenses. You may not reproduce, distribute, or transmit any content without express written permission from CSOAI.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. CEASAI Certification Standards</h2>
              <p className="text-gray-600 mb-4">
                CEASAI (Certified Expert in AI Safety) certification is administered by CSOAI and represents demonstrated competency in AI safety principles, compliance frameworks, and incident analysis. CEASAI certificates are valid for three years from the date of issuance. CSOAI reserves the right to update certification requirements and may require recertification or continuing education to maintain active status.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Dispute Resolution</h2>
              <p className="text-gray-600 mb-4">
                Any disputes arising from these terms or your use of CSOAI's services shall first be subject to good-faith negotiation between the parties. If negotiation fails, disputes may be escalated to mediation or arbitration as permitted by applicable law. Users agree to attempt resolution through these methods before pursuing litigation.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Severability</h2>
              <p className="text-gray-600 mb-4">
                If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. CSOAI will make a good-faith effort to replace any invalid provision with a valid one that achieves the original intent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Contact Information</h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong> legal@csoai.org<br />
                <strong>Address:</strong> CSOAI, United Kingdom<br />
                <strong>Website:</strong> www.csoai.org
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Entire Agreement</h2>
              <p className="text-gray-600 mb-4">
                These Terms of Service, together with our Privacy Policy, Cookie Policy, and any other policies referenced herein, constitute the entire agreement between you and CSOAI regarding your use of our services and supersede all prior agreements and understandings.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
