import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Clock,
  Gift,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FoundingMembers() {
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const couponCode = 'FOUNDING10K';

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    toast.success('Coupon code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnrollNow = () => {
    setLocation('/paid-courses');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="container max-w-6xl">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Limited Time Offer
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Become a <span className="text-primary">Founding Member</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join the first 10,000 AI safety professionals to shape the future of AI governance. 
              Get <span className="font-bold text-foreground">£1,999 worth</span> of premium training courses 
              absolutely <span className="font-bold text-primary">FREE</span>.
            </p>
            
            {/* Coupon Code Display */}
            <Card className="max-w-md mx-auto p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Your Exclusive Coupon Code</p>
                <div className="flex items-center justify-between gap-3 p-4 bg-background rounded-lg border">
                  <code className="text-2xl font-bold tracking-wider">{couponCode}</code>
                  <Button
                    onClick={handleCopyCoupon}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this code at checkout to claim your free access
                </p>
              </div>
            </Card>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleEnrollNow} className="text-lg">
                Browse Courses & Enroll
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">10,000</div>
              <div className="text-sm text-muted-foreground">Founding Member Spots</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">£1,999</div>
              <div className="text-sm text-muted-foreground">Course Value (FREE)</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-primary">7 Modules</div>
              <div className="text-sm text-muted-foreground">Premium Training Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Included</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive training across all major AI governance frameworks
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">7 Premium Training Modules</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>EU AI Act Compliance (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>NIST AI Risk Management Framework (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>China TC260 AI Standards (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>UK AI Bill & Governance (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Canada AI Act Implementation (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Australia AI Governance Framework (£299 value)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>AI Ethics & Responsible AI (£205 value)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Exclusive Benefits</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Lifetime access to all course materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Free updates as regulations evolve</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Certificate of completion for each module</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Priority access to new courses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Founding Member badge on profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Community forum access</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Enroll</h2>
            <p className="text-lg text-muted-foreground">
              Get started in 3 simple steps
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Browse Available Courses</h3>
                  <p className="text-muted-foreground">
                    Visit the <a href="/paid-courses" className="text-primary hover:underline">Paid Courses</a> page 
                    to see all 7 training modules and 2 course bundles available.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Apply Your Coupon Code</h3>
                  <p className="text-muted-foreground mb-3">
                    Click "Enroll Now" on any course, then enter the coupon code <code className="px-2 py-1 bg-muted rounded font-mono text-sm">{couponCode}</code> at 
                    checkout. The £1,999 price will be reduced to £0.
                  </p>
                  <Button size="sm" variant="outline" onClick={handleCopyCoupon}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Start Learning Immediately</h3>
                  <p className="text-muted-foreground">
                    After enrollment, access your courses from <a href="/my-courses" className="text-primary hover:underline">My Courses</a>. 
                    Start learning at your own pace with lifetime access.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about the Founding Members program
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Is this really completely free?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! The FOUNDING10K coupon gives you 100% off all courses. There are no hidden fees, 
                no credit card required, and no automatic charges. This is our way of building a strong 
                founding community of AI safety professionals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Why are you offering this for free?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We're building the world's largest community of AI safety professionals. By offering 
                free training to our first 10,000 members, we're creating a network effect that will 
                help establish global standards for AI governance. Your participation helps validate 
                our mission and attracts enterprise clients and regulatory partnerships.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">How long is the offer valid?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The FOUNDING10K coupon is valid until we reach 10,000 founding members. Once we hit 
                that milestone, the coupon will be deactivated and courses will return to their regular 
                £1,999 price. We recommend enrolling as soon as possible to secure your spot.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Do I need to complete all courses at once?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No! Once you enroll, you have lifetime access to all course materials. Learn at your 
                own pace, on your own schedule. You can start, pause, and resume courses whenever you like.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Will I receive certificates?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! Upon completing each module, you'll receive a certificate of completion that you 
                can add to your LinkedIn profile or resume. Founding members also receive a special 
                "Founding Member" badge on their profile.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Can I enroll in multiple courses?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! The FOUNDING10K coupon can be used for all 7 individual courses and both 
                course bundles. We encourage you to enroll in all courses that interest you to maximize 
                your learning and career opportunities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">What if I have technical issues during enrollment?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                If you encounter any issues applying the coupon or enrolling in courses, please contact 
                our support team at support@ceasai.org. We're here to help ensure you can take advantage 
                of this founding member offer.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <span className="font-semibold text-left">Will courses be updated as regulations change?</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! As a founding member, you'll receive free updates to all course content as AI 
                regulations and standards evolve. We're committed to keeping our training materials 
                current and relevant to the rapidly changing AI governance landscape.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container max-w-4xl text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Clock className="h-4 w-4" />
              Limited to First 10,000 Members
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Join the Movement?
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't miss this opportunity to become a founding member of the world's premier 
              AI safety and governance community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button size="lg" onClick={handleEnrollNow} className="text-lg">
                <Gift className="mr-2 h-5 w-5" />
                Claim Your Free Access
              </Button>
              <Button size="lg" variant="outline" onClick={handleCopyCoupon}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Code Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy Coupon Code
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
              Questions? Email us at <a href="mailto:support@ceasai.org" className="text-primary hover:underline">support@ceasai.org</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
