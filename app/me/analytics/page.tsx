'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStatus } from '@/hooks/use-auth';
import { GetMeResponse } from '@/lib/api/types';
import { Activity } from '@/types/user';
import { AnalyticsBentoGrid } from '@/components/analytics/AnalyticsBentoGrid';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { AuthGuard } from '@/components/auth';
import LoadingSpinner from '@/components/LoadingSpinner';
import ActivityHeatmap from '@/components/profile/ActivityHeatMap';
import ActivityFeed from '@/components/profile/ActivityFeed';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const FILTER_OPTIONS = [
  'All Time',
  'This Year',
  'This Month',
  'This Week',
  'Today',
];

function AnalyticsContent() {
  const { user, isLoading } = useAuthStatus();
  const [activityFilter, setActivityFilter] = useState('All Time');

  const meData = useMemo(
    () => (user?.profile as GetMeResponse | undefined) ?? null,
    [user?.profile]
  );

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <LoadingSpinner size='xl' color='white' />
      </div>
    );
  }

  if (!meData?.stats || !meData?.chart) {
    return (
      <div className='text-muted-foreground flex h-64 items-center justify-center text-sm'>
        Analytics data unavailable.
      </div>
    );
  }

  const activities = (meData.user?.activities ?? []) as Activity[];

  return (
    <div className='container mx-auto space-y-8 px-6 py-8'>
      {/* Page header — matches earnings page pattern */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col gap-2'
      >
        <h1 className='text-3xl font-bold tracking-tight'>Analytics</h1>
        <p className='text-muted-foreground text-lg'>
          Your personal growth dashboard across the platform.
        </p>
      </motion.div>

      {/* Bento stats grid */}
      <AnalyticsBentoGrid stats={meData.stats} chart={meData.chart} />

      {/* Activity chart */}
      <AnalyticsChart chart={meData.chart} />

      {/* Activity heatmap — uses recentActivities as activity array */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Graph</CardTitle>
          <CardDescription>Your activity over the last year</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityHeatmap activities={activities} />
        </CardContent>
      </Card>

      {/* Recent activity feed */}
      <Card>
        <CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              What you have been up to on the platform
            </CardDescription>
          </div>

          {/* Filter toggle — matches the pattern ActivityFeed expects */}
          <div
            role='group'
            aria-label='Activity time filter'
            className='border-border bg-muted flex flex-wrap gap-1 rounded-xl border p-1'
          >
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setActivityFilter(f)}
                aria-pressed={activityFilter === f}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                  activityFilter === f
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ActivityFeed filter={activityFilter} user={meData} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard
      redirectTo='/auth?mode=signin'
      fallback={<div className='p-8 text-center'>Authenticating...</div>}
    >
      <AnalyticsContent />
    </AuthGuard>
  );
}
