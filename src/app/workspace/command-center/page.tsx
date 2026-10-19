'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Project, Task, OrganizationMembership } from '@/types/database';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import {
  FolderKanban,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  Layers,
  Award,
  Crown,
  Activity,
  User,
  Box,
} from 'lucide-react';
import Link from 'next/link';
import { LivePipelineOrbit } from '@/components/workspace/LivePipelineOrbit';

export default function CommandCenterPage() {
  const { activeOrg, can, currentUser, allProfiles } = useTenant();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedSimulationProject, setSelectedSimulationProject] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [projData, taskData, memData] = await Promise.all([
          DataRepository.getProjects(activeOrg.id),
          DataRepository.getTasks(activeOrg.id),
          DataRepository.getMembershipsForOrg(activeOrg.id),
        ]);
        if (isMounted) {
          setProjects(projData);
          setTasks(taskData);
          setMembers(memData);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeOrg.id]);

  // Real metric calculations from live data
  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'planning');
  const blockedTasks = tasks.filter((t) => t.status === 'blocked');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const patentProjects = projects.filter((p) => p.is_patent);

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'all') return true;
    return t.priority === filterPriority;
  });

  // Simulation Member Work-Blocks
  const simulationMembers = [
    { name: 'Vikramaditya Sharma', role: 'Supreme Admin', tasksDone: 14, efficiency: '98%', status: 'Leading', color: 'from-amber-500 to-amber-700' },
    { name: 'Marcus Wright', role: 'Dept Lead', tasksDone: 9, efficiency: '94%', status: 'Coordinating', color: 'from-blue-500 to-blue-700' },
    { name: 'Dr. Elena Rostova', role: 'Research Lead', tasksDone: 11, efficiency: '96%', status: 'Reviewing', color: 'from-purple-500 to-purple-700' },
    { name: 'John Reese', role: 'Dev Lead', tasksDone: 12, efficiency: '95%', status: 'Architecting', color: 'from-indigo-500 to-indigo-700' },
    { name: 'Alex Rivera', role: 'Core Dev', tasksDone: 8, efficiency: '91%', status: 'Coding Tool', color: 'from-cyan-500 to-cyan-700' },
    { name: 'Priya Patel', role: 'QA & Tester', tasksDone: 7, efficiency: '97%', status: 'Pen-testing', color: 'from-rose-500 to-rose-700' },
    { name: 'Tariq Al-Mansoor', role: 'Researcher (Inventor)', tasksDone: 6, efficiency: '99%', status: '50% Royalty Pool', color: 'from-violet-500 to-violet-700' },
    { name: 'Sarah Connor', role: 'Production (Meta-Ads)', tasksDone: 10, efficiency: '93%', status: 'Ad Campaigns', color: 'from-emerald-500 to-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Executive Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              Command Center
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live Operations
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Real-time telemetry, squad execution matrices, and patent workloads for <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{activeOrg.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can('projects:create') && (
            <Link href="/workspace/projects">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Initiative
              </Button>
            </Link>
          )}
          {can('tasks:create') && (
            <Link href="/workspace/tasks">
              <Button size="sm" variant="outline" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Task
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Initiatives"
          value={activeProjects.length}
          subtitle={`${patentProjects.length} patent initiatives`}
          icon={<FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          trend={{ value: `${projects.length > 0 ? '100%' : '0%'}`, isPositive: true }}
        />
        <StatCard
          title="In-Flight Tasks"
          value={inProgressTasks.length}
          subtitle={`${doneTasks.length} delivered`}
          icon={<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
        />
        <StatCard
          title="Blocked Work"
          value={blockedTasks.length}
          subtitle={blockedTasks.length > 0 ? 'Clearance required' : 'Zero blockers'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
          variant={blockedTasks.length > 0 ? 'alert' : 'default'}
        />
        <StatCard
          title="Squad Strength"
          value={allProfiles.length}
          subtitle="Supreme Admin + Leads + Squad"
          icon={<Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        />
      </div>

      {/* 🚀 INTERACTIVE LIVE PIPELINE ORBIT ARCHITECTURE (Admin Core + 5 Squad Nodes) */}
      <LivePipelineOrbit />

      {/* MEMBER WORK-BLOCK SIMULATION MATRIX */}
      <Card className="p-5 space-y-4 border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold tracking-tight">
                Squad Work-Block Simulation & Output Velocity
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time contributor workload distribution, task completion units, and sprint velocity
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Filter:
            </span>
            <select
              value={selectedSimulationProject}
              onChange={(e) => setSelectedSimulationProject(e.target.value)}
              className="text-xs font-semibold border rounded-xl px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700/80 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="all">All Initiatives Overview</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Member Blocks Simulation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {simulationMembers.map((sm, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3 group glow-card"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300/60 dark:border-zinc-700/60">
                  {sm.role}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  ● {sm.efficiency}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`h-7 w-7 rounded-lg bg-gradient-to-br ${sm.color} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-2xs`}
                >
                  {sm.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {sm.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
                    Mode: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{sm.status}</strong>
                  </p>
                </div>
              </div>

              {/* Work Volume Progress Block */}
              <div className="space-y-1.5 pt-1 border-t border-zinc-200/50 dark:border-zinc-800/60">
                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                  <span>Delivered: <strong className="text-zinc-800 dark:text-zinc-200">{sm.tasksDone} Units</strong></span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{sm.efficiency}</span>
                </div>
                <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${sm.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${sm.efficiency}` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Grid: Projects & Upcoming Work */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-zinc-200/90 dark:border-zinc-800/90 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">Active Initiatives & Roadmap</CardTitle>
                <CardDescription className="text-xs">Live milestone tracking, progress bars, and patent royalty status</CardDescription>
              </div>
              <Link
                href="/workspace/projects"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-zinc-400">Loading initiatives...</div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="w-6 h-6" />}
                title="No initiatives yet"
                description="Create your company's first initiative to coordinate tasks and track progress."
                actionLabel="Create Project"
              />
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {projects.map((proj) => {
                  const progressPct =
                    proj.tasks_count && proj.tasks_count > 0
                      ? Math.round(((proj.completed_tasks_count || 0) / proj.tasks_count) * 100)
                      : 0;

                  return (
                    <div
                      key={proj.id}
                      className="py-4 px-3 flex items-center justify-between gap-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 rounded-xl transition-all"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/workspace/projects/${proj.id}`}
                            className="text-xs font-bold text-zinc-950 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                          >
                            {proj.name}
                          </Link>
                          {proj.is_patent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                              <Award className="w-2.5 h-2.5" /> 50% Patent
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadgeVariant(
                              proj.status
                            )}`}
                          >
                            {proj.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-md font-medium">
                          {proj.objective || proj.description || 'No objective specified'}
                        </p>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 text-right">
                        <div>
                          <p className="text-xs font-black text-zinc-950 dark:text-zinc-50">{progressPct}%</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                            {proj.completed_tasks_count || 0}/{proj.tasks_count || 0} tasks
                          </p>
                        </div>
                        <div className="w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-zinc-950 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Priority Work & Security Panel Column */}
        <div className="space-y-4">
          <Card className="border-zinc-200/90 dark:border-zinc-800/90 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
              <div>
                <CardTitle className="text-sm font-bold tracking-tight">Priority Work Items</CardTitle>
                <CardDescription className="text-xs">Requiring active squad coordination</CardDescription>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-[11px] font-bold border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </CardHeader>

            {filteredTasks.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8 font-medium">No tasks match selected filter.</p>
            ) : (
              <div className="space-y-2.5 pt-1">
                {filteredTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-zinc-950 dark:text-zinc-100 leading-snug line-clamp-1">
                        {task.title}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] uppercase font-bold border shrink-0 ${getPriorityBadgeVariant(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${getStatusBadgeVariant(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-medium">{task.due_date ? formatDate(task.due_date) : 'No deadline'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Security & Access Posture Card */}
          <Card className="border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-zinc-50/80 to-white dark:from-zinc-900/80 dark:to-zinc-950/90 p-4.5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-zinc-100">
                  Security & Isolation Status
                </h4>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Tenant boundary active</p>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              PostgreSQL Row Level Security active for <strong className="text-zinc-950 dark:text-zinc-200">{activeOrg.name}</strong>. Access is restricted to authorized cryptographic role clearances.
            </p>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                ● Audit Logging: Active
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Gate: Enforced
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
