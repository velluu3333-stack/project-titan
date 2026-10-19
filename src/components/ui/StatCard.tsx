import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'alert' | 'highlight';
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
}: StatCardProps) {
  const borderVariants = {
    default: 'border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/80',
    alert: 'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20',
    highlight: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20',
  };

  return (
    <Card
      className={cn(
        'glow-card relative overflow-hidden backdrop-blur-md p-5 border shadow-xs',
        borderVariants[variant]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
            {title}
          </p>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 shadow-2xs">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold border',
              trend.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60'
            )}
          >
            {trend.value}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">vs last cycle</span>
        </div>
      )}
    </Card>
  );
}
