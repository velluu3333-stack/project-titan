import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'done':
    case 'completed':
    case 'approved':
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'in_progress':
    case 'trial':
    case 'planning':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'in_review':
    case 'pending':
    case 'pending_approval':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'blocked':
    case 'suspended':
    case 'urgent':
    case 'high':
    case 'failure':
    case 'denied':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'on_hold':
    case 'backlog':
    case 'todo':
    default:
      return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  }
}

export function getPriorityBadgeVariant(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
    case 'high':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low':
    default:
      return 'bg-zinc-100 text-zinc-600 border-zinc-200';
  }
}
