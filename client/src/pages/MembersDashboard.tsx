/**
 * Members Dashboard - Unified authenticated dashboard
 * Consolidates Watchdog, Training, Certification, and Regulatory features
 * All features accessible from one place with tab-based navigation
 */

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import {
  Eye,
  GraduationCap,
  Award,
  Building2,
  LayoutGrid,
  FileText,
  AlertTriangle,
  History,
  Trophy,
  Plus,
  Star,
  GripVertical,
  RotateCcw,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Custom tabs implementation - Radix UI Tabs has issues with state updates
// Using plain React state and conditional rendering instead
import DashboardLayout from '@/components/DashboardLayout';
import WatchdogIncidentsPanel from '@/components/WatchdogIncidentsPanel';
import { OnboardingTour } from '@/components/OnboardingTour';
import { TabBreadcrumbs, type BreadcrumbItem } from '@/components/TabBreadcrumbs';
import { RecentlyViewedWidget } from '@/components/RecentlyViewedWidget';
import { useTabNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { usePinnedTabs } from '@/hooks/usePinnedTabs';
import { useTabOrdering } from '@/hooks/useTabOrdering';
import { KeyboardShortcutsIndicator } from '@/components/KeyboardShortcutsIndicator';
import { PinnedFavoritesWidget } from '@/components/PinnedFavoritesWidget';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TabErrorBoundary from '@/components/TabErrorBoundary';

// Import feature components
import Dashboard from './Dashboard';
import Watchdog from './Watchdog';
import WatchdogLeaderboard from './WatchdogLeaderboard';
import Training from './Training-v2';
import Certification from './Certification-v2';
import CertificationExam from './CertificationExam';
import RegulatoryAuthority from './RegulatoryAuthority';
import Reports from './Reports';
import AISystems from './AISystems';
import Compliance from './Compliance';

// Loading fallback component for tab content
function TabLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    </div>
  );
}

const defaultTabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutGrid,
    description: 'Dashboard overview and quick actions',
  },
  {
    id: 'watchdog',
    label: 'Watchdog',
    icon: Eye,
    description: 'AI incident reporting and analysis',
  },
  {
    id: 'training',
    label: 'Training',
    icon: GraduationCap,
    description: 'AI safety training courses',
  },
  {
    id: 'certification',
    label: 'Certification',
    icon: Award,
    description: 'AI safety certification exams',
  },
  {
    id: 'regulatory',
    label: 'Regulatory',
    icon: Building2,
    description: 'Government and regulatory compliance',
  },
];

// Sortable Tab Button Component
function SortableTabButton({
  tab,
  index,
  isActive,
  isPinned,
  onTabClick,
  onTogglePin,
}: {
  tab: typeof defaultTabs[0];
  index: number;
  isActive: boolean;
  isPinned: boolean;
  onTabClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = tab.icon;
  const shortcutKey = `Ctrl+${index + 1}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className="relative group"
        >
          <button
            onClick={onTabClick}
            role="tab"
            aria-selected={isActive}
            className={`flex items-center gap-2 rounded-none border-b-2 transition-all px-4 py-3 text-sm font-medium ${
              isActive
                ? 'border-primary bg-transparent text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
            </div>
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {isPinned && (
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            )}
          </button>
          <button
            onClick={onTogglePin}
            className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border rounded-full p-1 hover:bg-accent"
            title={isPinned ? 'Unpin tab' : 'Pin tab'}
          >
            <Star className={`h-3 w-3 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p>{tab.label}</p>
        <p className="text-muted-foreground mt-0.5">{shortcutKey}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function MembersDashboard() {
  const [location, setLocation] = useLocation();
  
  // Tab ordering with drag-and-drop
  const { orderedTabs, reorderTabs, resetOrder } = useTabOrdering(defaultTabs);
  
  // Get initial tab from URL parameter
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const validTabs = orderedTabs.map(t => t.id);
    return tabParam && validTabs.includes(tabParam) ? tabParam : 'overview';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [watchdogSubTab, setWatchdogSubTab] = useState('incidents');
  const [trainingSubTab, setTrainingSubTab] = useState('courses');
  const [isTabLoading, setIsTabLoading] = useState(false);
  
  // Handle tab change with loading state
  const handleTabChange = (tabId: string) => {
    setIsTabLoading(true);
    setActiveTab(tabId);
    // Simulate loading delay for smooth transition
    setTimeout(() => setIsTabLoading(false), 150);
  };
  
  // Get current tab label and breadcrumb items
  const currentTabLabel = orderedTabs.find(t => t.id === activeTab)?.label || 'Overview';
  
  // Build breadcrumb items based on active tab and sub-navigation
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: currentTabLabel }];
    
    // Add sub-navigation for Watchdog tab
    if (activeTab === 'watchdog') {
      const subNavLabel = watchdogSubTab === 'incidents' ? 'Incidents' : 'Leaderboard';
      items.push({ label: subNavLabel });
    }
    
    // Add sub-navigation for Training tab
    if (activeTab === 'training') {
      const subNavLabel = trainingSubTab === 'courses' ? 'Courses' : 'My Progress';
      items.push({ label: subNavLabel });
    }
    
    return items;
  };
  
  // Track recently viewed tabs
  const recentlyViewed = useRecentlyViewed(activeTab, currentTabLabel);
  
  // Manage pinned tabs
  const { pinnedTabs, isPinned, togglePin, unpinTab } = usePinnedTabs();
  
  // Setup keyboard shortcuts for tab navigation
  const keyboardShortcuts = useTabNavigationShortcuts(orderedTabs, activeTab, handleTabChange);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = orderedTabs.findIndex(tab => tab.id === active.id);
      const newIndex = orderedTabs.findIndex(tab => tab.id === over.id);
      
      const newOrder = arrayMove(orderedTabs, oldIndex, newIndex);
      reorderTabs(newOrder);
    }
  };
  
  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', activeTab);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab]);

  // Onboarding tour steps
  const tourSteps = [
    {
      element: '.px-6',
      popover: {
        title: 'Welcome to CSOAI Dashboard!',
        description: 'This is your central hub for AI safety governance. Let\'s take a quick tour of the key features.',
        side: 'bottom' as const,
      },
    },
    {
      element: '[role="tablist"]',
      popover: {
        title: 'Navigation Tabs',
        description: 'Switch between Overview, Watchdog reports, Training courses, Certifications, and Regulatory tools. Each section provides specialized AI safety features.',
        side: 'bottom' as const,
      },
    },
    {
      element: '[href="/ai-systems"]',
      popover: {
        title: 'Register AI Systems',
        description: 'Start by registering your AI systems. Click here to add new systems, specify their type (ML, NLP, Computer Vision, etc.), and assign risk levels according to regulatory frameworks.',
        side: 'right' as const,
      },
    },
    {
      element: '[href="/compliance"]',
      popover: {
        title: 'Run Compliance Assessments',
        description: 'Evaluate your AI systems against multiple frameworks (EU AI Act, NIST RMF, TC260). Run assessments to identify gaps and track your compliance progress over time.',
        side: 'right' as const,
      },
    },
    {
      element: '[href="/watchdog"]',
      popover: {
        title: 'Submit Watchdog Reports',
        description: 'Report AI safety incidents to the public Watchdog database. Your submissions help build transparency and improve AI safety across the industry. Reports are reviewed by the 33-Agent Council.',
        side: 'right' as const,
      },
    },
    {
      element: '[href="/pdca-cycles"]',
      popover: {
        title: 'PDCA Cycle Management',
        description: 'Implement continuous improvement with Plan-Do-Check-Act cycles. Track your AI governance workflows from planning through execution and review.',
        side: 'right' as const,
      },
    },
    {
      element: '[href="/agent-council"]',
      popover: {
        title: '33-Agent Council',
        description: 'View real-time voting sessions where 33 AI agents evaluate Watchdog reports and provide safety recommendations. This democratic system ensures balanced AI governance.',
        side: 'right' as const,
      },
    },
  ];

  const handleViewIncident = (id: number) => {
    // Navigate to incident detail page
    setLocation(`/watchdog-hub?incident=${id}`);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Members Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your AI safety training, certification, watchdog reports, and regulatory compliance
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetOrder}
                  className="text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset Tab Order
                </Button>
                <KeyboardShortcutsIndicator
                  shortcuts={keyboardShortcuts.map((s, i) => ({
                    key: String(i + 1),
                    description: s.description,
                  }))}
                />
              </div>
            </div>
            {/* Tab Breadcrumbs */}
            <div className="mt-4">
              <TabBreadcrumbs
                items={getBreadcrumbItems()}
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation and Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-border bg-background/50 flex-shrink-0">
            <div className="px-6">
              <TooltipProvider>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={orderedTabs.map(tab => tab.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    <div className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid gap-2 bg-transparent border-b border-border rounded-none p-0 h-auto" role="tablist">
                      {orderedTabs.map((tab, index) => (
                        <SortableTabButton
                          key={tab.id}
                          tab={tab}
                          index={index}
                          isActive={activeTab === tab.id}
                          isPinned={isPinned(tab.id)}
                          onTabClick={() => handleTabChange(tab.id)}
                          onTogglePin={(e) => {
                            e.stopPropagation();
                            togglePin(tab.id, tab.label);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </TooltipProvider>
            </div>
          </div>

          {/* Tab Content with Loading State */}
          <div className="overflow-y-auto flex-1 relative">
            {isTabLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Pinned Favorites Widget */}
                  <PinnedFavoritesWidget
                    pinnedTabs={pinnedTabs}
                    onNavigate={handleTabChange}
                    onUnpin={unpinTab}
                  />
                  
                  {/* Recently Viewed Widget */}
                  <RecentlyViewedWidget
                    items={recentlyViewed}
                    onTabClick={handleTabChange}
                    currentTab={activeTab}
                  />
                  
                  <TabErrorBoundary><Suspense fallback={<TabLoadingFallback />}>
                    <Dashboard />
                  </Suspense></TabErrorBoundary>
                </motion.div>
              </div>
            )}
          </div>

          {/* Watchdog Tab - Enhanced with sub-tabs */}
          {activeTab === 'watchdog' && (
            <div className="overflow-y-auto flex-1 relative">
              {isTabLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}


              <div className="p-8 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Watchdog Header with Quick Actions */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-emerald-600" />
                        The Watchdog - AI Incident Reporting
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4">
                        <Link href="/watchdog-hub">
                          <Button
                            variant="outline"
                            className="h-auto flex-col items-start p-4 w-full hover:border-emerald-500 hover:bg-emerald-50"
                          >
                            <Plus className="h-5 w-5 mb-2 text-emerald-600" />
                            <span className="font-semibold">Submit Report</span>
                            <span className="text-xs text-muted-foreground">Report AI incidents</span>
                          </Button>
                        </Link>
                        <Button
                          variant={watchdogSubTab === 'incidents' ? 'default' : 'outline'}
                          className="h-auto flex-col items-start p-4"
                          onClick={() => setWatchdogSubTab('incidents')}
                        >
                          <History className="h-5 w-5 mb-2" />
                          <span className="font-semibold">Previous Incidents</span>
                          <span className="text-xs text-muted-foreground">Browse all reports</span>
                        </Button>
                        <Button
                          variant={watchdogSubTab === 'leaderboard' ? 'default' : 'outline'}
                          className="h-auto flex-col items-start p-4"
                          onClick={() => setWatchdogSubTab('leaderboard')}
                        >
                          <Trophy className="h-5 w-5 mb-2" />
                          <span className="font-semibold">Analyst Leaderboard</span>
                          <span className="text-xs text-muted-foreground">Top contributors</span>
                        </Button>
                        <Link href="/watchdog-signup">
                          <Button
                            variant="outline"
                            className="h-auto flex-col items-start p-4 w-full hover:border-purple-500 hover:bg-purple-50"
                          >
                            <AlertTriangle className="h-5 w-5 mb-2 text-purple-600" />
                            <span className="font-semibold">Become Analyst</span>
                            <span className="text-xs text-muted-foreground">Join our team</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sub-tab Content */}
                  <TabErrorBoundary><Suspense fallback={<TabLoadingFallback />}>
                    {watchdogSubTab === 'incidents' && <Watchdog />}
                    {watchdogSubTab === 'leaderboard' && <WatchdogLeaderboard />}
                  </Suspense></TabErrorBoundary>
                </motion.div>
              </div>
            </div>
          )}

          {/* Training Tab - Enhanced with sub-tabs */}
          {activeTab === 'training' && (
            <div className="overflow-y-auto flex-1 relative">
              {isTabLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}

              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabErrorBoundary><Suspense fallback={<TabLoadingFallback />}>
                    <Training />
                  </Suspense></TabErrorBoundary>
                </motion.div>
              </div>
            </div>
          )}

          {/* Certification Tab */}
          {activeTab === 'certification' && (
            <div className="overflow-y-auto flex-1 relative">
              {isTabLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}

              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabErrorBoundary><Suspense fallback={<TabLoadingFallback />}>
                    <Certification />
                  </Suspense></TabErrorBoundary>
                </motion.div>
              </div>
            </div>
          )}

          {/* Regulatory Tab */}
          {activeTab === 'regulatory' && (
            <div className="overflow-y-auto flex-1 relative">
              {isTabLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}

              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabErrorBoundary><Suspense fallback={<TabLoadingFallback />}>
                    <RegulatoryAuthority />
                  </Suspense></TabErrorBoundary>
                </motion.div>
              </div>
            </div>
          )}
        </div>

        {/* Onboarding Tour */}
        <OnboardingTour
          tourId="members-dashboard-tour"
          steps={tourSteps}
        />
      </div>
    </DashboardLayout>
  );
}
