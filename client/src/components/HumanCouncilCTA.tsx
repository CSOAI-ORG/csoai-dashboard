/**
 * Human Council Registration CTA Component
 * Prominent call-to-action for joining the Watchdog Analyst program
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Users, 
  ArrowRight, 
  Shield, 
  Award, 
  TrendingUp,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface HumanCouncilCTAProps {
  variant?: "default" | "compact" | "banner";
  className?: string;
}

export function HumanCouncilCTA({ variant = "default", className }: HumanCouncilCTAProps) {
  const { data: countData } = trpc.applications.getCount.useQuery();
  const analystCount = countData?.count || 312;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("", className)}
      >
        <Link href="/watchdog-signup">
          <Button 
            size="lg" 
            className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/25"
          >
            <Users className="h-4 w-4" />
            Join the {analystCount}+ Watchdog Analysts
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    );
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white",
          className
        )}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Join the Human Council</h3>
              <p className="text-emerald-100">
                {analystCount}+ analysts protecting AI safety worldwide
              </p>
            </div>
          </div>
          
          <Link href="/watchdog-signup">
            <Button 
              size="lg" 
              variant="secondary"
              className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg"
            >
              Become an Analyst
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Default variant - full featured card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("", className)}
    >
      <Card className="relative overflow-hidden border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="relative p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1">
                <Sparkles className="h-3 w-3" />
                Human-AI Collaboration
              </Badge>
              <h3 className="text-2xl font-bold text-foreground">
                Join the Human Council
              </h3>
              <p className="text-muted-foreground max-w-md">
                When our 33-agent AI council can't reach consensus, human analysts step in. 
                Be part of the safety net protecting AI systems worldwide.
              </p>
            </div>
            
            <div className="hidden md:flex flex-col items-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <Users className="h-8 w-8 text-emerald-600 mb-2" />
              <span className="text-3xl font-bold text-emerald-600">{analystCount}+</span>
              <span className="text-xs text-muted-foreground">Analysts</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: Award,
                title: "Free Certification",
                description: "Complete training at no cost",
              },
              {
                icon: Shield,
                title: "Make an Impact",
                description: "Protect AI safety globally",
              },
              {
                icon: TrendingUp,
                title: "Earn Rewards",
                description: "Get paid for your expertise",
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* What you'll do */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">What you'll do:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "Review escalated AI safety cases",
                "Vote on complex compliance decisions",
                "Provide human oversight for AI systems",
                "Contribute to safety standards",
              ].map((task) => (
                <Badge key={task} variant="outline" className="gap-1 font-normal">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {task}
                </Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/watchdog-signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/25"
              >
                <Users className="h-4 w-4" />
                Join the {analystCount}+ Watchdog Analysts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              100% free training • Work from anywhere • Flexible hours
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default HumanCouncilCTA;
