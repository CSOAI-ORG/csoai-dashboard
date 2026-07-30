/**
 * Newsletter Signup Component
 * Reusable newsletter signup form with database integration
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterSignupProps {
  source?: string;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function NewsletterSignup({ 
  source = 'footer', 
  variant = 'default',
  className = '' 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message);
      setEmail('');
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Something went wrong. Please try again.');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setStatus('loading');
    subscribeMutation.mutate({ email: email.trim(), source });
  };

  if (variant === 'compact') {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 bg-white dark:bg-gray-800"
          />
          <Button 
            type="submit" 
            disabled={status === 'loading' || status === 'success' || !email.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              'Subscribe'
            )}
          </Button>
        </form>
        {message && (
          <p className={`text-sm mt-2 ${status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="pl-10 bg-white dark:bg-gray-800"
            />
          </div>
          <Button 
            type="submit" 
            disabled={status === 'loading' || status === 'success' || !email.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Subscribed!
              </>
            ) : (
              'Subscribe to Newsletter'
            )}
          </Button>
        </form>
        {message && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message}
          </p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
          <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stay Updated
        </h3>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        Get the latest AI safety insights, compliance updates, and training opportunities delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          className="bg-white dark:bg-gray-800"
        />
        <Button 
          type="submit" 
          disabled={status === 'loading' || status === 'success' || !email.trim()}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Subscribing...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Subscribed!
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Subscribe to Newsletter
            </>
          )}
        </Button>
        {message && (
          <p className={`text-sm flex items-center gap-1 ${status === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {status === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            {message}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-500">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
