'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Project, Task, ProjectStatus, Priority, TaskStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import {
  FolderKanban,
  CheckSquare,
  ArrowLeft,
  Calendar,
  User,
  Plus,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

function ProjectDetailContent() {
  const params = useParams();
  const projectId = params?.id as string;
  const { activeOrg, currentUser, can } = useTenant();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProjectData() {
    setIsLoading(true);
    try {
      const [proj, taskList] = await Promise.all([
        DataRepository.getProjectById(activeOrg.id, projectId),
        DataRepository.getTasks(activeOrg.id, projectId),
      ]);
      setProject(proj);
      setTasks(taskList);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [activeOrg.id, projectId]);

  async function handleUpdateProjectStatus(status: ProjectStatus) {
    if (!project) return;
    await DataRepository.updateProjectStatus(activeOrg.id, project.id, status, currentUser.id);
    await loadProjectData();
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim() || !project) return;
    setIsSubmitting(true);
    try {
      await DataRepository.createTask({
        orgId: activeOrg.id,
        projectId: project.id,
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        priority: taskPriority,
        ownerId: currentUser.id,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setIsCreateTaskOpen(false);
      await loadProjectData();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateTaskStatus(taskId: string, status: TaskStatus) {
    await DataRepository.updateTaskStatus(activeOrg.id, taskId, status, currentUser.id);
    await loadProjectData();
  }

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-zinc-500">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Link
          href="/workspace/projects"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </Link>
        <Card className="text-center py-12">
          <h2 className="text-sm font-bold text-zinc-900">Project Not Found</h2>
          <p className="mt-1 text-xs text-zinc-500">
            This project does not exist or does not belong to {activeOrg.name}.
          </p>
        </Card>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'done');
  const progressPct =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div>
        <Link
          href="/workspace/projects"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-zinc-900">{project.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeVariant(
                  project.status
                )}`}
              >
                {project.status.replace('_', ' ')}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadgeVariant(
                  project.priority
                )}`}
              >
                {project.priority}
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-2xl">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {can('tasks:create') && (
              <Button
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsCreateTaskOpen(true)}
              >
                Add Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Project Metadata Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-zinc-400">Target Deadline</p>
          <p className="text-sm font-bold text-zinc-800 mt-1">
            {project.deadline ? formatDate(project.deadline) : 'No deadline set'}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-zinc-400">Completion Status</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-bold text-zinc-800">{progressPct}%</p>
            <span className="text-xs text-zinc-500">
              {completedTasks.length}/{tasks.length} tasks
            </span>
          </div>
          <div className="mt-2 w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-zinc-900 h-full rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-[10px] font-semibold uppercase text-zinc-400">Initiative Objective</p>
          <p className="text-xs text-zinc-700 mt-1 line-clamp-2">
            {project.objective || 'No objective recorded.'}
          </p>
        </Card>
      </div>

      {/* Tasks Table for this Project */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Project Tasks ({tasks.length})
            </h3>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<CheckSquare className="w-6 h-6" />}
              title="No tasks in this project"
              description="Add deliverables and tasks to begin tracking milestone progress."
              actionLabel="Add Task"
              onAction={() => setIsCreateTaskOpen(true)}
            />
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${getPriorityBadgeVariant(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <h4 className="text-xs font-semibold text-zinc-900 truncate">{task.title}</h4>
                  </div>
                  {task.description && (
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className={`text-xs font-medium border rounded px-2 py-1 cursor-pointer ${getStatusBadgeVariant(
                      task.status
                    )}`}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title={`Add Task to ${project.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title *"
            placeholder="e.g. Implement schema migration"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-zinc-300 p-2.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              placeholder="Task details..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
                className="h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <Input
              type="date"
              label="Due Date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateTaskOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-500">Loading project...</div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
