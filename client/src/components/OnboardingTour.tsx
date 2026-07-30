import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";

interface OnboardingTourProps {
  tourId: string;
  steps: Array<{
    element: string;
    popover: {
      title: string;
      description: string;
      side?: "top" | "right" | "bottom" | "left";
      align?: "start" | "center" | "end";
    };
  }>;
  onComplete?: () => void;
}

export function OnboardingTour({ tourId, steps, onComplete }: OnboardingTourProps) {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if user has already seen this tour
    const hasSeenTour = localStorage.getItem(`tour-completed-${tourId}`);
    
    if (!hasSeenTour) {
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [tourId]);

  const startTour = () => {
    setShowPrompt(false);
    
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: steps.map((step, index) => ({
        element: step.element,
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side || "bottom",
          align: step.popover.align || "start",
          onNextClick: () => {
            if (index === steps.length - 1) {
              // Last step
              localStorage.setItem(`tour-completed-${tourId}`, 'true');
              onComplete?.();
              driverObj.destroy();
            } else {
              driverObj.moveNext();
            }
          },
          onPrevClick: () => {
            driverObj.movePrevious();
          },
          onCloseClick: () => {
            localStorage.setItem(`tour-completed-${tourId}`, 'true');
            driverObj.destroy();
          }
        }
      })),
      onDestroyStarted: () => {
        localStorage.setItem(`tour-completed-${tourId}`, 'true');
        driverObj.destroy();
      }
    });

    driverObj.drive();
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem(`tour-completed-${tourId}`, 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border-2 border-primary/20 rounded-lg shadow-2xl p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Welcome to CSOAI Dashboard!</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Take a quick tour to discover key features and get started with AI safety governance.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={startTour} className="text-xs h-8">
                Start Tour
              </Button>
              <Button size="sm" variant="ghost" onClick={dismissPrompt} className="text-xs h-8">
                Skip
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 flex-shrink-0"
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook to manually trigger tour
export function useOnboardingTour(tourId: string) {
  const resetTour = () => {
    localStorage.removeItem(`tour-completed-${tourId}`);
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(`tour-completed-${tourId}`) === 'true';
  };

  return { resetTour, hasCompletedTour };
}
