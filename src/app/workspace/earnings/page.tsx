'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { MonetizationMetrics, Project } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Coins,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export default function EarningsPage() {
  const { activeOrg, currentUser, can } = useTenant();
  const [metrics, setMetrics] = useState<MonetizationMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  // Form state for AdSense entry
  const [month, setMonth] = useState('');
  const [pageviews, setPageviews] = useState(50000);
  const [rpm, setRpm] = useState(12.5);

  async function loadData() {
    setIsLoading(true);
    try {
      const [m, p] = await Promise.all([
        DataRepository.getMonetizationMetrics(),
        DataRepository.getProjects(activeOrg.id),
      ]);
      setMetrics(m);
      setProjects(p);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeOrg.id]);

  async function handleAddAdSenseData(e: React.FormEvent) {
    e.preventDefault();
    if (!month.trim()) return;
    const earnings = (pageviews / 1000) * rpm;
    await DataRepository.addAdSenseMonth({
      month,
      pageviews,
      rpm,
      earnings: parseFloat(earnings.toFixed(2)),
    });
    setIsAddEntryOpen(false);
    await loadData();
  }

  if (isLoading || !metrics) {
    return <div className="py-20 text-center text-xs text-zinc-500">Loading monetization matrix...</div>;
  }

  // Calculations
  const totalAdSenseEarnings = metrics.adSenseTraffic.reduce((acc, curr) => acc + curr.earnings, 0);
  const totalPageviews = metrics.adSenseTraffic.reduce((acc, curr) => acc + curr.pageviews, 0);
  const latestMonthEarnings = metrics.adSenseTraffic[metrics.adSenseTraffic.length - 1]?.earnings || 0;

  const totalMemberMRR = metrics.paidMemberships
    .filter((m) => m.status === 'active')
    .reduce((acc, curr) => acc + (curr.tier === 'enterprise_annual' ? curr.amount / 12 : curr.amount), 0);

  // Patent royalty calculation: 50% of the AdSense and Member pool generated from the patent tool
  const patentProjects = projects.filter((p) => p.is_patent);
  const totalPatentGross = totalAdSenseEarnings + totalMemberMRR * 2;
  const inventorRoyaltyShare = totalPatentGross * 0.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Earning & Monetization Command
            </h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              Dual-Model Revenue
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Google AdSense traffic earnings, Paid membership run-rates, and 50% 6-Month Patent Royalty Pools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can('monetization:manage') && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddEntryOpen(true)}
            >
              Log Traffic Metric
            </Button>
          )}
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2 border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
              Model 1: Google AdSense Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ${totalAdSenseEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500">
            Across {totalPageviews.toLocaleString()} pageviews • Latest: ${latestMonthEarnings}/mo
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-blue-200 bg-blue-50/20 dark:bg-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-blue-800 dark:text-blue-300">
              Model 2: Paid Memberships (MRR)
            </span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ${totalMemberMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
          </div>
          <p className="text-xs text-zinc-500">
            {metrics.paidMemberships.length} active corporate subscribers
          </p>
        </Card>

        <Card className="p-5 space-y-2 border-purple-200 bg-purple-50/20 dark:bg-purple-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-purple-800 dark:text-purple-300">
              Patent Pool: 50% Inventor Royalty
            </span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-900 dark:text-purple-300">
            ${inventorRoyaltyShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500">
            6-Month lock-in royalty reserved for Tariq Al-Mansoor (Researcher)
          </p>
        </Card>
      </div>

      {/* 50% Patent 6-Month Lock-In Card */}
      <Card className="p-5 border-purple-300 dark:border-purple-800 bg-gradient-to-r from-purple-50/60 via-white dark:via-zinc-900 to-indigo-50/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Intellectual Property & 50% Royalty Assignment Protocol
                </h3>
                <Badge variant="warning" className="text-[10px]">
                  Active 6-Month Lock-In
                </Badge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                As per company policy, any team member (Research, Dev, or Growth) who originates a patentable initiative receives a <strong className="text-purple-700 dark:text-purple-300">50% gross royalty share</strong> during the first 6-month operational lock-in window.
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-purple-200 dark:border-purple-900">
            <p className="text-[10px] font-bold uppercase text-zinc-400">Patent Beneficiary</p>
            <p className="text-xs font-extrabold text-purple-900 dark:text-purple-300">Tariq Al-Mansoor</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
              <Clock className="w-3 h-3" /> 4 Months Remaining in Lock-in
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Section: Google AdSense Traffic Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google AdSense Traffic & Revenue Trajectory</CardTitle>
              <CardDescription>Monthly pageview velocity vs gross advertising earnings</CardDescription>
            </div>
            <Badge variant="default" className="text-[10px]">
              Micro-Tool SEO Engine
            </Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.adSenseTraffic}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(val: unknown) => [`$${val}`, 'AdSense Earnings']}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#earningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Paid Members Overview */}
        <Card className="p-5 space-y-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle>Paid Subscribers ({metrics.paidMemberships.length})</CardTitle>
            <CardDescription>Active members billed via Stripe/Razorpay</CardDescription>
          </CardHeader>

          <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800">
            {metrics.paidMemberships.map((sub) => (
              <div key={sub.id} className="pt-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{sub.member_name}</p>
                  <p className="text-[10px] text-zinc-400 capitalize">{sub.tier.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">${sub.amount}</p>
                  <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded">
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal to log Traffic Metric */}
      <Modal
        isOpen={isAddEntryOpen}
        onClose={() => setIsAddEntryOpen(false)}
        title="Log AdSense Traffic Data"
        description="Add a monthly record for programmatic SEO tool pageviews and RPM."
      >
        <form onSubmit={handleAddAdSenseData} className="space-y-4">
          <Input
            label="Month & Year *"
            placeholder="e.g. Apr 2026"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />

          <Input
            type="number"
            label="Total Monthly Pageviews *"
            value={pageviews}
            onChange={(e) => setPageviews(parseInt(e.target.value) || 0)}
            required
          />

          <Input
            type="number"
            step="0.1"
            label="Average RPM ($ per 1,000 views) *"
            value={rpm}
            onChange={(e) => setRpm(parseFloat(e.target.value) || 0)}
            required
          />

          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
            Estimated Earnings: <strong className="text-emerald-600">${((pageviews / 1000) * rpm).toFixed(2)}</strong>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddEntryOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
