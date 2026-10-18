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
    default: 'border-zinc-200/80',
    alert: 'border-rose-200 bg-rose-50/20',
    highlight: 'border-blue-200 bg-blue-50/20',
  };

  return (
    <Card className={cn('relative overflow-hidden', borderVariants[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
          <div className="text-2xl font-bold tracking-tight text-zinc-900">{value}</div>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-semibold',
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            )}
          >
            {trend.value}
          </span>
          <span className="text-zinc-400">vs last period</span>
        </div>
      )}
    </Card>
  );
}
