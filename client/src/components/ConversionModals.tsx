import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Phone, Building2, User, CheckCircle } from 'lucide-react';

interface ConversionModalsProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'loi' | 'course' | 'enterprise' | 'government' | 'watchdog' | null;
}

export function ConversionModals({ isOpen, onClose, type }: ConversionModalsProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would send to your backend
      console.log('Form submitted:', { type, ...formData });

      setSubmitted(true);
      toast.success(`Successfully submitted! We'll be in touch soon.`);

      // Reset after 2 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', company: '', role: '', message: '' });
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'loi':
        return {
          title: 'Get Free Course + Early Access',
          description: 'Join 10,000+ early adopters. First 10,000 get free £499 CEASAI course.',
          fields: ['name', 'email', 'phone'],
          buttonText: 'Claim Free Course',
        };
      case 'course':
        return {
          title: 'Enroll in CEASAI Training',
          description: '8-week professional certification in AI Safety. £499-£1,999.',
          fields: ['name', 'email', 'phone', 'role'],
          buttonText: 'Start Training',
        };
      case 'enterprise':
        return {
          title: 'Enterprise Compliance Solution',
          description: 'EU AI Act compliance, automatic legislation tracking, SOAI-PDCA implementation.',
          fields: ['name', 'email', 'company', 'phone'],
          buttonText: 'Schedule Demo',
        };
      case 'government':
        return {
          title: 'Government Integration Portal',
          description: 'Real-time AI monitoring, compliance tracking, automatic legislation updates.',
          fields: ['name', 'email', 'company', 'phone'],
          buttonText: 'Request Integration',
        };
      case 'watchdog':
        return {
          title: 'Report AI Problem',
          description: 'Help protect humanity. Report AI incidents publicly to our Watchdog Hub.',
          fields: ['name', 'email', 'message'],
          buttonText: 'Submit Report',
        };
      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{content.title}</DialogTitle>
          <DialogDescription className="text-base">{content.description}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <CheckCircle className="w-16 h-16 text-emerald-600" />
            <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
            <p className="text-center text-gray-600">
              We've received your submission. Check your email for next steps.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {content.fields.includes('name') && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {content.fields.includes('email') && (
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {content.fields.includes('phone') && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            )}

            {content.fields.includes('company') && (
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company Name
                </Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Your Company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
            )}

            {content.fields.includes('role') && (
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select your role</option>
                  <option value="individual">Individual / Job Seeker</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {content.fields.includes('message') && (
              <div className="space-y-2">
                <Label htmlFor="message">Describe the AI Problem</Label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about the AI incident or problem you encountered..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2"
            >
              {loading ? 'Submitting...' : content.buttonText}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              We respect your privacy. Your information will never be shared.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
