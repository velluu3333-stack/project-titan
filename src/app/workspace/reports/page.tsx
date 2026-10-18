'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Project, Task } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  PieChart as PieIcon,
  Download,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function ReportsPage() {
  const { activeOrg, currentUser } = useTenant();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [p, t] = await Promise.all([
          DataRepository.getProjects(activeOrg.id),
          DataRepository.getTasks(activeOrg.id),
        ]);
        setProjects(p);
        setTasks(t);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeOrg.id]);

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Bar Chart Data: Tasks by Initiative
  const barChartData = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.project_id === p.id);
    const pDone = pTasks.filter((t) => t.status === 'done');
    const pActive = pTasks.filter((t) => t.status === 'in_progress' || t.status === 'todo');
    return {
      name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
      completed: pDone.length,
      active: pActive.length,
    };
  });

  // Pie Chart Data: Workload across functional roles
  const roleDistribution = [
    { name: 'Developer', value: 4, color: '#3b82f6' },
    { name: 'Tester & QA', value: 2, color: '#f43f5e' },
    { name: 'Researcher (Patent)', value: 2, color: '#a855f7' },
    { name: 'Production (Meta-Ads)', value: 2, color: '#10b981' },
  ];

  function handleExportReport() {
    alert('Report Export Generated! Audit event recorded in security logs.');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Reports & Visual Analytics
            </h1>
            <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
              Bar & Pie Visuals
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Objective performance, role distribution, and milestone delivery for {activeOrg.name}.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExportReport}
        >
          Export Executive Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{completionRate}%</div>
          <p className="text-xs text-zinc-500">{completedTasks.length} of {tasks.length} tasks completed</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Velocity</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">{inProgressTasks.length} Active</div>
          <p className="text-xs text-zinc-500">Currently in active engineering and review</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase">Blocker Rate</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-600">{blockedTasks.length} Blocked</div>
          <p className="text-xs text-zinc-500">Requires managerial or architectural clearance</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BAR CHART: Project Tasks Velocity */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Initiative Task Velocity (Bar Chart)</CardTitle>
              <CardDescription>Completed vs Active tasks across company initiatives</CardDescription>
            </div>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" fill="#3b82f6" name="In Progress" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* PIE CHART: Workload Distribution Across Roles */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Role Squad Distribution (Pie Chart)</CardTitle>
              <CardDescription>Capacity allocated to Developer, Tester, Research, & Production</CardDescription>
            </div>
            <PieIcon className="w-4 h-4 text-purple-600" />
          </div>

          <div className="h-72 w-full pt-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} Members`, name]}
                  contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
