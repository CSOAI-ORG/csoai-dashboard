import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, MessageSquare, Github, Slack, Mail, ExternalLink, CheckCircle } from 'lucide-react';

export default function Community() {
  useEffect(() => {
    document.title = 'Community - CSOAI';
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const communityChannels = [
    {
      name: 'GitHub Discussions',
      description: 'Join our open-source community discussions, share ideas, and contribute to the project.',
      icon: Github,
      link: 'https://github.com/csoai/csoai/discussions',
      color: 'bg-gray-900',
    },
    {
      name: 'Slack Community',
      description: 'Connect with other AI safety professionals, share insights, and get real-time support.',
      icon: Slack,
      link: 'https://csoai.slack.com',
      color: 'bg-purple-600',
    },
    {
      name: 'Forum & Discussions',
      description: 'Participate in threaded discussions about AI safety, compliance frameworks, and best practices.',
      icon: MessageSquare,
      link: '/forum',
      color: 'bg-blue-600',
    },
    {
      name: 'Email Newsletter',
      description: 'Subscribe to our weekly newsletter for updates on AI safety, certification news, and events.',
      icon: Mail,
      link: '/newsletter',
      color: 'bg-green-600',
    },
  ];

  const communityBenefits = [
    'Connect with AI safety professionals worldwide',
    'Share knowledge and best practices',
    'Get feedback on your AI safety initiatives',
    'Participate in community-driven research',
    'Access exclusive resources and training materials',
    'Network with industry leaders and regulators',
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Join Our Community
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with thousands of AI safety professionals, researchers, and practitioners worldwide. 
              Share knowledge, collaborate on solutions, and shape the future of AI safety together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                <a href="https://csoai.slack.com" target="_blank" rel="noopener noreferrer">Join Slack</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/csoai/csoai/discussions" target="_blank" rel="noopener noreferrer">GitHub Discussions</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold mb-12 text-center text-gray-900">
            Community Channels
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityChannels.map((channel, index) => (
              <motion.div
                key={channel.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className={`${channel.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <channel.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{channel.name}</h3>
                    <p className="text-gray-600 mb-6">{channel.description}</p>
                    <a
                      href={channel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold"
                    >
                      Join Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Benefits */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold mb-12 text-center text-gray-900">
            Why Join Our Community?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communityBenefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeInUp} className="text-3xl font-bold mb-8 text-gray-900">
            Community Guidelines
          </motion.h2>
          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Be Respectful</h3>
                <p className="text-gray-600">
                  Treat all community members with respect and professionalism. We welcome diverse perspectives and backgrounds.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Stay On Topic</h3>
                <p className="text-gray-600">
                  Keep discussions focused on AI safety, compliance, and related topics. Off-topic discussions should be moved to appropriate channels.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">No Spam or Self-Promotion</h3>
                <p className="text-gray-600">
                  Avoid excessive self-promotion or spam. Share resources that genuinely benefit the community.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Respect Confidentiality</h3>
                <p className="text-gray-600">
                  Do not share confidential information or proprietary data. Respect the privacy of others in the community.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Join?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Start connecting with the global AI safety community today.
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100" asChild>
              <a href="https://csoai.slack.com" target="_blank" rel="noopener noreferrer">Join Our Community</a>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
