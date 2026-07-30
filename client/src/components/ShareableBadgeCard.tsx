import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Share2, 
  Linkedin, 
  Twitter, 
  Download,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Badge {
  id: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
  earnedAt: string | null;
}

interface ShareableBadgeCardProps {
  badge: Badge;
  userName?: string;
  streakCount?: number;
  totalBadges?: number;
}

export function ShareableBadgeCard({ 
  badge, 
  userName = 'Student',
  streakCount = 0,
  totalBadges = 1
}: ShareableBadgeCardProps) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = `🎉 I just earned the "${badge.name}" badge on CSOAI! ${badge.description} 🏆\n\n${streakCount > 0 ? `🔥 Current streak: ${streakCount} days\n` : ''}📚 Total badges: ${totalBadges}\n\nJoin me in learning AI safety and governance!\n\n#CSOAI #AIGovernance #AISafety #Learning`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://csoai.org';

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
    toast.success('Opening LinkedIn to share your achievement!');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    toast.success('Opening Twitter to share your achievement!');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      setCopied(true);
      toast.success('Achievement copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getColorClasses = (color: string | null) => {
    const colorMap: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      gold: 'from-amber-400 to-amber-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-400 to-orange-600',
      yellow: 'from-yellow-400 to-yellow-500',
      cyan: 'from-cyan-400 to-cyan-600',
      emerald: 'from-emerald-400 to-emerald-600',
      violet: 'from-violet-500 to-violet-600',
      rose: 'from-rose-400 to-rose-600',
      amber: 'from-amber-400 to-amber-500',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600',
      green: 'from-green-500 to-green-600',
    };
    return colorMap[color || 'blue'] || colorMap.blue;
  };

  return (
    <div className="space-y-4">
      {/* Shareable Card Preview */}
      <div 
        ref={cardRef}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-sm">
              CS
            </div>
            <span className="font-semibold text-sm">CSOAI</span>
          </div>
          <div className="text-xs text-slate-400">
            {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Achievement Unlocked'}
          </div>
        </div>

        {/* Badge Display */}
        <div className="relative flex flex-col items-center py-6">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getColorClasses(badge.color)} flex items-center justify-center text-5xl shadow-lg ring-4 ring-white/20`}>
            {badge.icon}
          </div>
          <h3 className="mt-4 text-xl font-bold text-center">{badge.name}</h3>
          <p className="mt-2 text-sm text-slate-300 text-center max-w-xs">
            {badge.description}
          </p>
          {badge.points && badge.points > 0 && (
            <div className="mt-3 px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
              +{badge.points} points
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="relative mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{streakCount}</div>
            <div className="text-xs text-slate-400">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{userName}</div>
            <div className="text-xs text-slate-400">Learner</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{totalBadges}</div>
            <div className="text-xs text-slate-400">Badges</div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleLinkedInShare}
          className="flex-1 bg-[#0077B5] hover:bg-[#006097]"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          LinkedIn
        </Button>
        <Button 
          onClick={handleTwitterShare}
          className="flex-1 bg-black hover:bg-gray-800"
        >
          <Twitter className="w-4 h-4 mr-2" />
          Twitter/X
        </Button>
        <Button 
          variant="outline"
          onClick={handleCopyLink}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

// Compact share button for inline use
export function ShareBadgeButton({ 
  badge, 
  userName,
  streakCount,
  totalBadges,
  variant = 'ghost',
  size = 'sm'
}: ShareableBadgeCardProps & { variant?: 'ghost' | 'outline' | 'default'; size?: 'sm' | 'default' }) {
  const shareText = `🎉 I just earned the "${badge.name}" badge on CSOAI! ${badge.description} 🏆\n\n#CSOAI #AIGovernance #AISafety`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://csoai.org';

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Share2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLinkedInShare}>
          <Linkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy to clipboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
