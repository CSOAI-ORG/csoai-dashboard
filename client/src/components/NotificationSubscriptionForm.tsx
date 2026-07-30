import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Mail, CheckCircle2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function NotificationSubscriptionForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribeMutation = trpc.notificationSubscriptions.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsSubscribed(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to subscribe');
    },
  });

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (category === 'all') {
      setCategories(checked ? ['all'] : []);
    } else {
      if (checked) {
        setCategories(prev => [...prev.filter(c => c !== 'all'), category]);
      } else {
        setCategories(prev => prev.filter(c => c !== category));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (categories.length === 0) {
      toast.error('Please select at least one notification category');
      return;
    }

    subscribeMutation.mutate({
      email,
      name: name || undefined,
      categories: categories as any,
    });
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Successfully Subscribed!
              </h3>
              <p className="text-gray-600">
                You'll receive email notifications about AI safety incidents based on your preferences.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSubscribed(false)}
              className="mt-4"
            >
              Subscribe Another Email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Bell className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <CardTitle>Get Incident Alerts</CardTitle>
            <CardDescription>
              Subscribe to receive email notifications when new AI safety incidents are reported or resolved
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-3 block">Notification Preferences</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={categories.includes('all')}
                    onCheckedChange={(checked) => handleCategoryChange('all', checked as boolean)}
                  />
                  <label
                    htmlFor="all"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    All incidents
                  </label>
                </div>

                <div className="pl-6 space-y-2 border-l-2 border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="critical"
                      checked={categories.includes('critical')}
                      onCheckedChange={(checked) => handleCategoryChange('critical', checked as boolean)}
                      disabled={categories.includes('all')}
                    />
                    <label
                      htmlFor="critical"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        Critical severity only
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high"
                      checked={categories.includes('high')}
                      onCheckedChange={(checked) => handleCategoryChange('high', checked as boolean)}
                      disabled={categories.includes('all')}
                    />
                    <label
                      htmlFor="high"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                        High severity only
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="medium"
                      checked={categories.includes('medium')}
                      onCheckedChange={(checked) => handleCategoryChange('medium', checked as boolean)}
                      disabled={categories.includes('all')}
                    />
                    <label
                      htmlFor="medium"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                        Medium severity only
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="low"
                      checked={categories.includes('low')}
                      onCheckedChange={(checked) => handleCategoryChange('low', checked as boolean)}
                      disabled={categories.includes('all')}
                    />
                    <label
                      htmlFor="low"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        Low severity only
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe to Alerts'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You can unsubscribe at any time by clicking the unsubscribe link in any email.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
