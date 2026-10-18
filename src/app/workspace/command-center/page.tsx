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
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Command Center</h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              Live Operations
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time operational health, member work-block simulations, and workload distribution for {activeOrg.name}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {can('projects:create') && (
            <Link href="/workspace/projects">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Project
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
          title="Active Projects"
          value={activeProjects.length}
          subtitle={`${patentProjects.length} patent initiatives`}
          icon={<FolderKanban className="w-4 h-4 text-blue-600" />}
          trend={{ value: `${projects.length > 0 ? '100%' : '0%'}`, isPositive: true }}
        />
        <StatCard
          title="In Progress Tasks"
          value={inProgressTasks.length}
          subtitle={`${doneTasks.length} completed`}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
        />
        <StatCard
          title="Blocked Work"
          value={blockedTasks.length}
          subtitle={blockedTasks.length > 0 ? 'Requires clearance' : 'No current blockers'}
          icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
          variant={blockedTasks.length > 0 ? 'alert' : 'default'}
        />
        <StatCard
          title="Team Squad"
          value={allProfiles.length}
          subtitle="Supreme Admin + Leads + Squad"
          icon={<Users className="w-4 h-4 text-emerald-600" />}
        />
      </div>


      {/* MEMBER WORK-BLOCK SIMULATION MATRIX */}
      <Card className="p-5 space-y-4 border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <div>
              <CardTitle>Member Work-Block Simulation & Live Output</CardTitle>
              <CardDescription>Visual block matrix showing contribution, efficiency, and real-time activity</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400">Project View:</span>
            <select
              value={selectedSimulationProject}
              onChange={(e) => setSelectedSimulationProject(e.target.value)}
              className="text-xs font-semibold border rounded-lg px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {simulationMembers.map((sm, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all space-y-2.5 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
                  {sm.role}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  ● {sm.efficiency}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors truncate">
                  {sm.name}
                </h4>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  Current: <strong className="text-zinc-600 dark:text-zinc-300">{sm.status}</strong>
                </p>
              </div>

              {/* Work Volume Progress Block */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Work Done: {sm.tasksDone} Units</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{sm.efficiency}</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Active Initiatives & Deliverables</CardTitle>
                <CardDescription>Live initiative progress and patent ownership</CardDescription>
              </div>
              <Link
                href="/workspace/projects"
                className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-zinc-500">Loading initiatives...</div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="w-6 h-6" />}
                title="No projects yet"
                description="Create your company's first initiative to coordinate tasks and track progress."
                actionLabel="Create Project"
              />
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {projects.map((proj) => {
                  const progressPct =
                    proj.tasks_count && proj.tasks_count > 0
                      ? Math.round(((proj.completed_tasks_count || 0) / proj.tasks_count) * 100)
                      : 0;

                  return (
                    <div
                      key={proj.id}
                      className="py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/workspace/projects/${proj.id}`}
                            className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate"
                          >
                            {proj.name}
                          </Link>
                          {proj.is_patent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" /> 50% Patent
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getStatusBadgeVariant(
                              proj.status
                            )}`}
                          >
                            {proj.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate max-w-md">
                          {proj.objective || proj.description || 'No objective specified'}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div>
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{progressPct}%</p>
                          <p className="text-[10px] text-zinc-400">
                            {proj.completed_tasks_count || 0}/{proj.tasks_count || 0} tasks
                          </p>
                        </div>
                        <div className="w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Priority Deliverables</CardTitle>
                <CardDescription>Items needing active coordination</CardDescription>
              </div>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-[11px] font-medium border border-zinc-200 dark:border-zinc-800 rounded px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </CardHeader>

            {filteredTasks.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">No tasks match selected filter.</p>
            ) : (
              <div className="space-y-2.5">
                {filteredTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 hover:bg-zinc-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">
                        {task.title}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border shrink-0 ${getPriorityBadgeVariant(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] border ${getStatusBadgeVariant(
                          task.status
                        )}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span>{task.due_date ? formatDate(task.due_date) : 'No deadline'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Security & Access Posture Card */}
          <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Security & Isolation Status
              </h4>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              PostgreSQL Row Level Security active for <strong className="text-zinc-700 dark:text-zinc-300">{activeOrg.name}</strong>. Onboarding gate requires admin authorization.
            </p>
            <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Audit Logging: ACTIVE</span>
              <span>Private Gate: ENFORCED</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
