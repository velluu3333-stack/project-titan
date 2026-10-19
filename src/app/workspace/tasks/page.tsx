'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Task, Project, OrganizationMembership, TaskStatus, Priority, PipelineStage } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import {
  CheckSquare,
  Plus,
  Calendar,
  User,
  Download,
  FileCode,
  ShieldCheck,
  Tag,
  Code2,
  Cpu,
  FlaskConical,
  Bug,
  Palette,
  Send,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function TasksPage() {
  const { activeOrg, currentUser, can, allProfiles } = useTenant();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [squadFilter, setSquadFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [targetSquad, setTargetSquad] = useState<PipelineStage>('dev_squad');
  const [priority, setPriority] = useState<Priority>('high');
  const [dueDate, setDueDate] = useState('');
  const [dispatchToPipeline, setDispatchToPipeline] = useState(true);
  const [deliverableAttachment, setDeliverableAttachment] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    setIsLoading(true);
    try {
      const [tData, pData, mData] = await Promise.all([
        DataRepository.getTasks(activeOrg.id),
        DataRepository.getProjects(activeOrg.id),
        DataRepository.getMembershipsForOrg(activeOrg.id),
      ]);
      setTasks(tData);
      setProjects(pData);
      setMembers(mData);
      if (pData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pData[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeOrg.id]);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }
    if (!selectedProjectId) {
      setFormError('A project must be selected');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const created = await DataRepository.createTask({
        orgId: activeOrg.id,
        projectId: selectedProjectId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        ownerId: currentUser.id,
        assigneeId: selectedAssigneeId || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        deliverableAttachment: deliverableAttachment.trim() || undefined,
      });

      // If Admin checked "Dispatch directly to Pipeline Orbit"
      if (dispatchToPipeline) {
        const targetProj = projects.find((p) => p.id === selectedProjectId);
        await DataRepository.transitionPipelineStage({
          projectId: selectedProjectId,
          projectName: targetProj?.name || 'Initiative',
          toStage: targetSquad,
          actorName: currentUser.full_name,
          actorRole: currentUser.is_platform_admin ? 'Supreme Admin' : 'Admin',
          actionNote: `Task created and dispatched: "${title.trim()}". Assigned to ${targetSquad.replace('_', ' ').toUpperCase()}.`,
          changesSummary: `Task ID assigned: ${created.id}. Priority: ${priority}.`,
        });
      }

      setTitle('');
      setDescription('');
      setDueDate('');
      setDeliverableAttachment('');
      setIsCreateOpen(false);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateTaskStatus(taskId: string, newStatus: TaskStatus) {
    await DataRepository.updateTaskStatus(activeOrg.id, taskId, newStatus, currentUser.id);
    await loadData();
  }

  const availableStatuses: TaskStatus[] = [
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'blocked',
  ];

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (projectFilter !== 'all' && t.project_id !== projectFilter) return false;
    if (squadFilter !== 'all') {
      const assignee = t.assignee;
      const role = assignee?.requested_role;
      if (squadFilter === 'dev' && role !== 'developer') return false;
      if (squadFilter === 'qa' && role !== 'tester') return false;
      if (squadFilter === 'research' && role !== 'researcher') return false;
      if (squadFilter === 'production' && role !== 'production') return false;
    }
    return true;
  });

  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewCount = tasks.filter((t) => t.status === 'in_review').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              Task Delegation Engine & Squad Deliverables
            </h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              Admin Dispatch Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Direct Admin task delegation to Developer, White Coder, QA, Research, and Production squads with live pipeline synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateOpen(true)}
          >
            Assign New Task
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Deliverables</p>
          <p className="text-2xl font-black text-zinc-950 dark:text-zinc-50">{tasks.length}</p>
          <span className="text-[10px] text-zinc-500 font-medium">Across all squads</span>
        </div>
        <div className="p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">In-Flight Execution</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{inProgressCount}</p>
          <span className="text-[10px] text-zinc-500 font-medium">Active work</span>
        </div>
        <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">In QA / Review</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{inReviewCount}</p>
          <span className="text-[10px] text-zinc-500 font-medium">Under testing</span>
        </div>
        <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Delivered</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{doneCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% verified</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">Squad:</span>
          {[
            { id: 'all', label: 'All Squads' },
            { id: 'dev', label: 'Developers' },
            { id: 'qa', label: 'User Testing QA' },
            { id: 'research', label: 'Research & Patents' },
            { id: 'production', label: 'Production (Ads)' },
          ].map((sq) => (
            <button
              key={sq.id}
              onClick={() => setSquadFilter(sq.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                squadFilter === sq.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              {sq.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Initiatives</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-zinc-400">Loading tasks and pipeline assignments...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No deliverables found"
          description="Assign a task to any squad node to trigger pipeline workflow."
          actionLabel="Assign Task"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all glow-card"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold border ${getPriorityBadgeVariant(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                    {task.project?.name || 'Titan Initiative'}
                  </span>
                  <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 truncate">{task.title}</h3>
                </div>

                {task.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                  {task.assignee ? (
                    <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Assigned to: <strong>{task.assignee.full_name}</strong>
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Unassigned squad member</span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      Target: {formatDate(task.due_date)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Switcher Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold uppercase text-zinc-400">Status:</span>
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className={`text-xs font-bold border rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none transition-colors ${getStatusBadgeVariant(
                    task.status
                  )}`}
                >
                  {availableStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Task Assignment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Admin Task Delegation & Pipeline Dispatch"
        description="Assign a specific deliverable to a squad node or individual team member."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Deliverable Title *"
            placeholder="e.g. Implement Multi-Tenant RLS Proxy with hardware acceleration"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Initiative *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_patent ? '(50% Patent)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Target Squad Node Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Target Squad Node *
            </label>
            <select
              value={targetSquad}
              onChange={(e) => setTargetSquad(e.target.value as PipelineStage)}
              className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="dev_squad">Developer Squad (Frontend & API)</option>
              <option value="white_coder">White Coder Squad (Core Algorithms & Rust/WASM)</option>
              <option value="research_lab">Research & Patent Lab (50% Royalty Ideas)</option>
              <option value="qa_testing">User Testing & QA Squad (Pen-testing & RLS)</option>
              <option value="production_ads">Production Studio (Meta-Ads & AdSense Growth)</option>
            </select>
          </div>

          {/* Specific Assignee Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Direct Assignee (Optional)
            </label>
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(e.target.value)}
              className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Auto-Assign to Squad Lead</option>
              {allProfiles.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.full_name} ({prof.requested_role?.replace('_', ' ') || 'Member'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <Input
              type="date"
              label="Target Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Technical Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed acceptance criteria and architectural constraints..."
              rows={3}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Sync with Pipeline Checkbox */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
            <input
              type="checkbox"
              id="syncPipeline"
              checked={dispatchToPipeline}
              onChange={(e) => setDispatchToPipeline(e.target.checked)}
              className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="syncPipeline" className="text-zinc-800 dark:text-zinc-200 font-medium cursor-pointer">
              <strong>Synchronize to Live Pipeline Orbit:</strong> Move this project&apos;s active custody to the selected squad node.
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Delegate & Dispatch
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
