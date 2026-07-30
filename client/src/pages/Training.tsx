/*
 * CSOAI Training Page
 * Training modules for Watchdog Analyst certification
 * Connected to real backend API
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Lock,
  Award,
  ArrowRight,
  GraduationCap,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Breadcrumb } from "@/components/Breadcrumb";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Streamdown } from "streamdown";

export default function Training() {
  const [, setLocation] = useLocation();
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  
  // Fetch modules from API
  const { data: modules, isLoading: modulesLoading } = trpc.training.getModules.useQuery();
  const { data: progress, refetch: refetchProgress } = trpc.training.getProgress.useQuery();
  const { data: moduleDetail, isLoading: moduleLoading } = trpc.training.getModule.useQuery(
    { id: selectedModule! },
    { enabled: !!selectedModule }
  );
  
  const startModuleMutation = trpc.training.startModule.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
  });
  
  const completeModuleMutation = trpc.training.completeModule.useMutation({
    onSuccess: () => {
      refetchProgress();
      toast.success("Module completed!", {
        description: "Great job! You can now move to the next module.",
      });
      setSelectedModule(null);
    },
  });
  
  // Calculate overall progress
  const completedModules = progress?.filter(p => p.status === "completed").length || 0;
  const totalModules = modules?.length || 5;
  const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
  const allCompleted = completedModules === totalModules && totalModules > 0;

  const getModuleStatus = (moduleId: number) => {
    const moduleProgress = progress?.find(p => p.moduleId === moduleId);
    return moduleProgress?.status || "not_started";
  };

  const handleStartModule = (moduleId: number) => {
    startModuleMutation.mutate({ moduleId });
    setSelectedModule(moduleId);
  };

  const handleCompleteModule = () => {
    if (selectedModule) {
      completeModuleMutation.mutate({ moduleId: selectedModule });
    }
  };

  if (modulesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container">
        <Breadcrumb items={[{ label: "Training", href: "/training" }]} />
      </div>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Watchdog Analyst Training</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete all modules to unlock the certification test
            </p>
          </div>
          <Button 
            onClick={() => setLocation("/certification/exam")}
            disabled={!allCompleted}
            className="gap-2"
          >
            <Award className="h-4 w-4" />
            Take Certification Test
            {!allCompleted && <Lock className="h-3 w-3 ml-1" />}
          </Button>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-green-50 to-gray-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Your Progress</h3>
                    <span className="text-sm text-muted-foreground">
                      {completedModules} of {totalModules} modules completed
                    </span>
                  </div>
                  <Progress value={overallProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {allCompleted 
                      ? "🎉 Congratulations! You're ready to take the certification test."
                      : `Complete ${totalModules - completedModules} more module${totalModules - completedModules > 1 ? 's' : ''} to unlock certification.`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Training Modules */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold">Training Modules</h2>
          
          <div className="grid gap-4">
            {modules?.map((module, idx) => {
              const status = getModuleStatus(module.id);
              const isCompleted = status === "completed";
              const isInProgress = status === "in_progress";
              const prevModule = modules[idx - 1];
              const isLocked = idx > 0 && prevModule && getModuleStatus(prevModule.id) !== "completed";

              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Card className={`card-elevated transition-smooth ${
                    isCompleted 
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" 
                      : isLocked 
                        ? "opacity-60" 
                        : "hover:shadow-md"
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Module Number */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? "bg-green-500 text-white" 
                            : isInProgress
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : isLocked ? (
                            <Lock className="h-5 w-5" />
                          ) : (
                            <span className="font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Module Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {module.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {module.description}
                              </p>
                            </div>
                            
                            <Button
                              variant={isCompleted ? "outline" : "default"}
                              size="sm"
                              disabled={isLocked}
                              onClick={() => handleStartModule(module.id)}
                              className="flex-shrink-0"
                            >
                              {isCompleted ? (
                                <>Review</>
                              ) : isInProgress ? (
                                <>Continue <ArrowRight className="ml-1 h-4 w-4" /></>
                              ) : (
                                <>Start <Play className="ml-1 h-4 w-4" /></>
                              )}
                            </Button>
                          </div>

                          {/* Module Meta */}
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.durationMinutes} min
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {module.code}
                            </span>
                            {isCompleted && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Certification CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        >
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                CSOAI Watchdog Analyst Certification
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                After completing all training modules, you'll take a 50-question certification test.
                Score 70% or higher to earn your certificate and start reviewing cases.
              </p>
              <Button 
                onClick={() => setLocation("/certification")}
                disabled={!allCompleted}
                variant={allCompleted ? "default" : "outline"}
              >
                {allCompleted ? "Take Certification Test" : "Complete Training First"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Module Content Dialog */}
      <Dialog open={!!selectedModule} onOpenChange={(open) => !open && setSelectedModule(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {moduleLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : moduleDetail ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span>{moduleDetail.code}</span>
                  <ChevronRight className="h-4 w-4" />
                  <span>{moduleDetail.durationMinutes} min</span>
                </div>
                <DialogTitle className="text-xl">{moduleDetail.title}</DialogTitle>
                <DialogDescription>{moduleDetail.description}</DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                <Streamdown>{moduleDetail.content || "Content is being prepared..."}</Streamdown>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedModule(null)}>
                  Close
                </Button>
                {getModuleStatus(selectedModule!) !== "completed" && (
                  <Button 
                    onClick={handleCompleteModule}
                    disabled={completeModuleMutation.isPending}
                  >
                    {completeModuleMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Module not found
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
