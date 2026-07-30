import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareBadgeButton } from './ShareableBadgeCard';
import Confetti from 'react-confetti';

interface Badge {
  id: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
}

interface BadgeNotificationProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  streakCount?: number;
  totalBadges?: number;
}

export function BadgeNotification({ 
  badge, 
  isOpen, 
  onClose,
  userName,
  streakCount,
  totalBadges
}: BadgeNotificationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const getColorClasses = (color: string | null) => {
    const colorMap: Record<string, { bg: string; ring: string }> = {
      blue: { bg: 'from-blue-500 to-blue-600', ring: 'ring-blue-400/50' },
      gold: { bg: 'from-amber-400 to-amber-600', ring: 'ring-amber-400/50' },
      purple: { bg: 'from-purple-500 to-purple-600', ring: 'ring-purple-400/50' },
      orange: { bg: 'from-orange-400 to-orange-600', ring: 'ring-orange-400/50' },
      yellow: { bg: 'from-yellow-400 to-yellow-500', ring: 'ring-yellow-400/50' },
      cyan: { bg: 'from-cyan-400 to-cyan-600', ring: 'ring-cyan-400/50' },
      emerald: { bg: 'from-emerald-400 to-emerald-600', ring: 'ring-emerald-400/50' },
      violet: { bg: 'from-violet-500 to-violet-600', ring: 'ring-violet-400/50' },
      rose: { bg: 'from-rose-400 to-rose-600', ring: 'ring-rose-400/50' },
      amber: { bg: 'from-amber-400 to-amber-500', ring: 'ring-amber-400/50' },
      indigo: { bg: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-400/50' },
      red: { bg: 'from-red-500 to-red-600', ring: 'ring-red-400/50' },
      green: { bg: 'from-green-500 to-green-600', ring: 'ring-green-400/50' },
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };

  if (!badge) return null;

  const colors = getColorClasses(badge.color);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={200}
              gravity={0.3}
              colors={['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1', '#32CD32']}
            />
          )}

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with gradient */}
              <div className={`bg-gradient-to-br ${colors.bg} p-8 text-white text-center relative overflow-hidden`}>
                {/* Sparkle effects */}
                <div className="absolute inset-0">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${20 + (i % 3) * 25}%`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  {badge.icon}
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-1"
                >
                  Badge Unlocked!
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-sm"
                >
                  Congratulations on your achievement!
                </motion.p>
              </div>

              {/* Badge Details */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
                <p className="text-muted-foreground mb-4">{badge.description}</p>
                
                {badge.points && badge.points > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-semibold mb-6"
                  >
                    <span className="text-lg">+{badge.points}</span>
                    <span className="text-sm">points earned</span>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={onClose}
                  >
                    Continue Learning
                  </Button>
                  {badge && (
                    <ShareBadgeButton
                      badge={{ ...badge, earnedAt: new Date().toISOString() }}
                      userName={userName}
                      streakCount={streakCount}
                      totalBadges={totalBadges}
                      variant="default"
                      size="default"
                    />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for managing badge notifications
export function useBadgeNotification() {
  const [badge, setBadge] = useState<Badge | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showBadge = useCallback((newBadge: Badge) => {
    setBadge(newBadge);
    setIsOpen(true);
  }, []);

  const closeBadge = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setBadge(null), 300);
  }, []);

  return {
    badge,
    isOpen,
    showBadge,
    closeBadge,
  };
}
