import React, { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import Confetti from 'react-confetti';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Sparkles, 
  TrendingUp,
  Gift,
  ChevronRight,
  X,
  Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

interface TrialStatus {
  isOnTrial: boolean;
  trialEndsAt: string;
  daysRemaining: number;
  subscription?: {
    tier: string;
    status: string;
  };
}

const TrialBanner: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState<string | null>(
    localStorage.getItem('trialBannerDismissedUntil')
  );

  // Fetch trial status
  const { data: trialStatus, isLoading } = useQuery({
    queryKey: ['/api/payments/trial-status'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Check if banner was dismissed
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (dismissedDate > new Date()) {
        setShowBanner(false);
      } else {
        localStorage.removeItem('trialBannerDismissedUntil');
        setDismissedUntil(null);
      }
    }
  }, [dismissedUntil]);

  const handleDismiss = () => {
    // Dismiss for 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dismissUntil = tomorrow.toISOString();
    
    localStorage.setItem('trialBannerDismissedUntil', dismissUntil);
    setDismissedUntil(dismissUntil);
    setShowBanner(false);
  };

  const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return (
        <div className="text-red-600 font-semibold">
          Trial Expired - <Link href="/subscribe" className="underline">Subscribe Now</Link>
        </div>
      );
    } else {
      const totalHours = days * 24 + hours;
      const urgency = days <= 1 ? 'text-red-600' : days <= 3 ? 'text-orange-600' : 'text-green-600';
      
      return (
        <div className={`font-mono text-lg ${urgency}`}>
          {days > 0 && <span>{days}d </span>}
          {totalHours}h {minutes}m {seconds}s
        </div>
      );
    }
  };

  // Don't show if not authenticated, loading, or no trial
  const status = trialStatus as TrialStatus;
  if (!isAuthenticated || isLoading || !status?.isOnTrial || !showBanner) {
    return null;
  }

  // Don't show if already subscribed
  if (status.subscription?.status === 'active') {
    return null;
  }

  const daysRemaining = status.daysRemaining;
  const progress = Math.max(0, Math.min(100, ((7 - daysRemaining) / 7) * 100));
  const isUrgent = daysRemaining <= 3;
  const isLastDay = daysRemaining <= 1;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
          colors={['#14b8a6', '#06b6d4', '#0891b2', '#0e7490']}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <div className={`fixed top-0 left-0 right-0 z-50 p-4 ${isLastDay ? 'animate-pulse' : ''}`}>
        <Card className={`glassmorphic-card border ${
          isLastDay ? 'border-red-500 bg-red-50/80' : 
          isUrgent ? 'border-orange-500 bg-orange-50/80' : 
          'border-turquoise-500 bg-turquoise-50/80'
        } backdrop-blur-xl shadow-lg`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-full ${
                  isLastDay ? 'bg-red-100' : 
                  isUrgent ? 'bg-orange-100' : 
                  'bg-turquoise-100'
                }`}>
                  {isLastDay ? (
                    <Zap className="w-6 h-6 text-red-600" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-turquoise-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {isLastDay ? '⚡ Last Day of Your Trial!' : 
                       isUrgent ? '⏰ Trial Ending Soon!' : 
                       '✨ You\'re on a Free Trial'}
                    </h3>
                    <Badge variant={isLastDay ? "destructive" : isUrgent ? "secondary" : "default"}>
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Countdown */}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <Countdown 
                        date={new Date(status.trialEndsAt)} 
                        renderer={renderer}
                      />
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <span className="text-sm text-gray-600">Trial Progress:</span>
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>

                    {/* Special Offer */}
                    {isUrgent && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                        <Gift className="w-4 h-4 text-yellow-700" />
                        <span className="text-sm font-medium text-yellow-800">
                          20% OFF if you subscribe today!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-3">
                  <Link href="/subscribe">
                    <Button 
                      className={`${
                        isLastDay ? 'bg-red-600 hover:bg-red-700' : 
                        'bg-gradient-to-r from-turquoise-500 to-cyan-500 hover:from-turquoise-600 hover:to-cyan-600'
                      } text-white`}
                      onClick={() => {
                        if (!isLastDay) setShowConfetti(true);
                      }}
                    >
                      {isLastDay ? 'Subscribe Now' : 'Upgrade to Pro'}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDismiss}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Benefits reminder */}
            {isUrgent && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-8 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Unlimited Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Premium Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span>Priority Support</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default TrialBanner;