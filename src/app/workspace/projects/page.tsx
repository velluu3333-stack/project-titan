'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Project, ProjectStatus, Priority, Profile } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/lib/utils';
import {
  FolderKanban,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Download,
  Award,
  Clock,
  Sparkles,
  FileCode,
} from 'lucide-react';
import Link from 'next/link';

export default function ProjectsPage() {
  const { activeOrg, currentUser, can, allProfiles } = useTenant();
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [isPatent, setIsPatent] = useState(false);
  const [patentHolderId, setPatentHolderId] = useState('');
  const [deliverableFileName, setDeliverableFileName] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadProjects() {
    setIsLoading(true);
    try {
      const data = await DataRepository.getProjects(activeOrg.id);
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [activeOrg.id]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await DataRepository.createProject({
        orgId: activeOrg.id,
        name: name.trim(),
        description: description.trim() || undefined,
        objective: objective.trim() || undefined,
        priority,
        ownerId: currentUser.id,
        deadline: deadline || undefined,
        isPatent,
        patentHolderId: isPatent ? patentHolderId || currentUser.id : undefined,
        deliverableFileName: deliverableFileName.trim() || undefined,
      });

      setName('');
      setDescription('');
      setObjective('');
      setDeadline('');
      setIsPatent(false);
      setDeliverableFileName('');
      setIsCreateOpen(false);
      await loadProjects();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(projectId: string, newStatus: ProjectStatus) {
    await DataRepository.updateProjectStatus(activeOrg.id, projectId, newStatus, currentUser.id);
    await loadProjects();
  }

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  const availableStatuses: ProjectStatus[] = [
    'planning',
    'active',
    'on_hold',
    'blocked',
    'in_review',
    'completed',
    'archived',
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Projects</h1>
            <Badge variant="default" className="text-[10px]">
              {projects.length} Total Initiatives
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage company initiatives, patent lock-in royalties, milestones, and deliverable specs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${
                viewMode === 'list'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

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

          {can('projects:create') && (
            <Button
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Projects Presentation */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Loading initiatives...</div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" />}
          title="No projects found"
          description={
            statusFilter !== 'all'
              ? `There are currently no projects with status "${statusFilter}".`
              : 'Get started by creating your company’s first initiative.'
          }
          actionLabel={can('projects:create') ? 'Create Project' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((p) => {
            const progressPct =
              p.tasks_count && p.tasks_count > 0
                ? Math.round(((p.completed_tasks_count || 0) / p.tasks_count) * 100)
                : 0;

            return (
              <Card
                key={p.id}
                className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadgeVariant(
                        p.priority
                      )}`}
                    >
                      {p.priority}
                    </span>

                    <select
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value as ProjectStatus)}
                      className={`text-[11px] font-medium border rounded px-2 py-0.5 focus:outline-none cursor-pointer ${getStatusBadgeVariant(
                        p.status
                      )}`}
                    >
                      {availableStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/workspace/projects/${p.id}`}
                        className="text-sm font-bold text-zinc-950 dark:text-zinc-50 hover:text-blue-600 truncate"
                      >
                        {p.name}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* PATENT & ROYALTY BADGE */}
                  {p.is_patent && (
                    <div className="p-2.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-[11px] text-purple-950 dark:text-purple-200 space-y-1">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          Inventor Patent (50% Royalty)
                        </span>
                        <span className="text-[10px] bg-purple-200 dark:bg-purple-900 px-1.5 py-0.2 rounded font-bold">6-Mo Lock-in</span>
                      </div>
                      <p className="text-[10px] text-purple-800 dark:text-purple-300">
                        Idea Originator: <strong className="text-purple-950 dark:text-purple-100">{p.patent_holder?.full_name || 'Inventor'}</strong>
                      </p>
                    </div>
                  )}

                  {/* SPECIFICATION DOWNLOAD LINK */}
                  {p.deliverable_file_name && (
                    <div className="p-2 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-blue-800 dark:text-blue-300 font-medium truncate">
                        <FileCode className="w-3.5 h-3.5 shrink-0" />
                        {p.deliverable_file_name}
                      </span>
                      <a
                        href={p.deliverable_file_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{p.deadline ? formatDate(p.deadline) : 'No deadline'}</span>
                    </div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {p.completed_tasks_count || 0}/{p.tasks_count || 0} tasks ({progressPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-[11px] font-semibold uppercase text-zinc-500">
                <th className="py-3 px-4">Initiative</th>
                <th className="py-3 px-3">Patent Status</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Deliverable Spec</th>
                <th className="py-3 px-4 text-right">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    <Link href={`/workspace/projects/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                    <div className="text-[11px] font-normal text-zinc-500 truncate max-w-sm">
                      {p.objective || p.description}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    {p.is_patent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Patent (50% Royalty)
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">Standard</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <select
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value as ProjectStatus)}
                      className={`text-[10px] font-medium border rounded px-1.5 py-0.5 cursor-pointer ${getStatusBadgeVariant(
                        p.status
                      )}`}
                    >
                      {availableStatuses.map((st) => (
                        <option key={st} value={st}>
                          {st.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${getPriorityBadgeVariant(
                        p.priority
                      )}`}
                    >
                      {p.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    {p.deliverable_file_name ? (
                      <a
                        href={p.deliverable_file_url || '#'}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Download className="w-3 h-3" /> {p.deliverable_file_name}
                      </a>
                    ) : (
                      <span className="text-zinc-400 italic">None</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right text-zinc-500">
                    {p.deadline ? formatDate(p.deadline) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Create Project Modal with Patent Protocol */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Establish an initiative with defined objectives, priority, patent royalty, and deliverable specs."
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Project Name *"
            placeholder="e.g. Micro-Tool Programmatic SEO Engine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              placeholder="Brief context regarding this initiative..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            label="Objective"
            placeholder="Key measurable outcome (e.g. 200,000 monthly pageviews)"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />

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

            <Input
              type="date"
              label="Target Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* PATENT PROTOCOL SECTION */}
          <div className="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPatent}
                  onChange={(e) => setIsPatent(e.target.checked)}
                  className="rounded border-purple-400 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                  Register as Proprietary Patent Initiative
                </span>
              </label>
              <Badge variant="warning" className="text-[9px]">
                50% 6-Month Royalty
              </Badge>
            </div>

            {isPatent && (
              <div className="space-y-2 pt-2 border-t border-purple-200 dark:border-purple-900">
                <label className="block text-[11px] font-semibold text-purple-900 dark:text-purple-300">
                  Select Idea Originator / Patent Holder:
                </label>
                <select
                  value={patentHolderId}
                  onChange={(e) => setPatentHolderId(e.target.value)}
                  className="h-9 w-full rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">Choose team member...</option>
                  {allProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.requested_role?.replace('_', ' ') || 'Member'})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-purple-700 dark:text-purple-400">
                  50% of the project's generated revenue pool will be credited to this inventor for the initial 6 months.
                </p>
              </div>
            )}
          </div>

          {/* SPECIFICATION FILE UPLOAD / ATTACHMENT */}
          <Input
            label="Deliverable Spec File (for Dev team download)"
            placeholder="e.g. micro-tool-architecture-specs.zip"
            value={deliverableFileName}
            onChange={(e) => setDeliverableFileName(e.target.value)}
            hint="Team members can download this specification directly from the project card."
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
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
