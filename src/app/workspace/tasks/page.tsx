'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Task, Project, OrganizationMembership, TaskStatus, Priority } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
} from 'lucide-react';

export default function TasksPage() {
  const { activeOrg, currentUser, can, allProfiles } = useTenant();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
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
      await DataRepository.createTask({
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
    'blocked',
    'in_review',
    'done',
  ];

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (projectFilter !== 'all' && t.project_id !== projectFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Tasks & Deliverables</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Role-based assignments, code specifications download, and execution tracking for {activeOrg.name}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Projects</option>
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
            className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>
                {st.replace('_', ' ')}
              </option>
            ))}
          </select>

          {can('tasks:create') && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-8 h-8" />}
          title="No tasks found"
          description={
            statusFilter !== 'all' || projectFilter !== 'all'
              ? 'No tasks match the active filters.'
              : 'Add your first task to start organizing operational work.'
          }
          actionLabel={can('tasks:create') ? 'Create Task' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${getPriorityBadgeVariant(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                    {task.project?.name || 'Unassigned Project'}
                  </span>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{task.title}</h3>
                </div>

                {task.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400 pt-1">
                  {task.assignee ? (
                    <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-300 font-medium">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      Assigned to: <strong>{task.assignee.full_name}</strong> ({task.assignee.requested_role?.replace('_', ' ') || 'Member'})
                    </span>
                  ) : (
                    <span className="text-zinc-400 italic">Unassigned</span>
                  )}
                  {task.due_date && (
                    <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <Calendar className="w-3 h-3 text-zinc-400" />
                      Due {formatDate(task.due_date)}
                    </span>
                  )}

                  {/* Task Deliverable Attachment */}
                  {task.deliverable_attachment && (
                    <a
                      href={task.deliverable_attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <Download className="w-3 h-3" /> Download Task Files
                    </a>
                  )}
                </div>
              </div>

              {/* Status Switcher */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                  className={`text-xs font-semibold border rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none ${getStatusBadgeVariant(
                    task.status
                  )}`}
                >
                  {availableStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal with Role-Based Assignee Mapping */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Assign deliverable to specific team member based on their project role."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Task Title *"
            placeholder="e.g. Conduct security test on login gate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Project *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_patent ? '(Patent Initiative)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Description & Requirements
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              placeholder="Detailed instructions or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* ROLE-BASED ASSIGNEE SELECTOR */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Assignee & Role
              </label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="">Unassigned</option>
                {allProfiles
                  .filter((p) => p.status === 'active')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} [{p.requested_role?.replace('_', ' ').toUpperCase() || 'MEMBER'}]
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <Input
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Input
            label="Deliverable Download Attachment (URL or File Link)"
            placeholder="e.g. https://example.com/downloads/task-assets.zip"
            value={deliverableAttachment}
            onChange={(e) => setDeliverableAttachment(e.target.value)}
            hint="Team members can directly download this to continue the development workflow."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
