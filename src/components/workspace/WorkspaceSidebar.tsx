'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Coins,
  Building2,
  FlaskConical,
  Code2,
  Palette,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Settings,
  ShieldAlert,
  Lock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTenant } from './TenantContext';
import { Badge } from '@/components/ui/Badge';

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const {
    currentRole,
    activeOrg,
    isPlatformAdminUser,
    pendingApprovals,
    isMobileSidebarOpen,
    closeMobileSidebar,
  } = useTenant();

  const primaryNavigation = [
    { title: 'Command Center', href: '/workspace/command-center', icon: LayoutDashboard },
    { title: 'Projects', href: '/workspace/projects', icon: FolderKanban },
    { title: 'Tasks', href: '/workspace/tasks', icon: CheckSquare },
    {
      title: 'Team & Hierarchy',
      href: '/workspace/team',
      icon: Users,
      badge: pendingApprovals.length > 0 ? `${pendingApprovals.length} new` : undefined,
    },
    { title: 'Earning & Monetization', href: '/workspace/earnings', icon: Coins, badge: '50% Royalty' },
    { title: 'Departments', href: '/workspace/departments', icon: Building2 },
    { title: 'Research & Patents', href: '/workspace/research', icon: FlaskConical },
    { title: 'Development Hub', href: '/workspace/development', icon: Code2 },
    { title: 'Production Studio', href: '/workspace/production', icon: Palette },
    { title: 'Legal & Secret Docs', href: '/workspace/documents', icon: Lock },
    { title: 'Communication', href: '/workspace/communication', icon: MessageSquare },
    { title: 'Reports & Charts', href: '/workspace/reports', icon: BarChart3 },
    { title: 'Security Center', href: '/workspace/security', icon: ShieldCheck },
    { title: 'Organization Settings', href: '/workspace/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Mobile drawer + Desktop static sidebar) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 flex flex-col h-full border-r border-zinc-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 select-none',
          'lg:static lg:translate-x-0 lg:w-64 lg:h-screen lg:sticky lg:top-0 lg:shadow-none lg:z-auto shrink-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand & Organization Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xs tracking-wider shadow-xs">
                TT
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">PROJECT TITAN</h1>
                <p className="text-[10px] uppercase font-semibold text-zinc-600 dark:text-zinc-400">Company OS</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2">
            <div className="truncate">
              <p className="text-[10px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">Organization</p>
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 truncate">{activeOrg.name}</p>
            </div>
            <Badge variant="info" className="text-[10px] uppercase font-semibold px-1.5 py-0">
              {activeOrg.plan_id}
            </Badge>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Company Navigation
          </p>
          {primaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white dark:text-zinc-900' : 'text-zinc-500')} />
                  <span className="truncate">{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.2 text-[9px] font-bold tracking-wider',
                      isActive
                        ? 'bg-zinc-800 dark:bg-zinc-300 text-zinc-200 dark:text-zinc-900'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Super Admin & Security Footer */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
          {isPlatformAdminUser && (
            <Link
              href="/platform-admin"
              onClick={closeMobileSidebar}
              className="flex items-center gap-2 rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/40 p-2 text-xs font-semibold text-purple-900 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-purple-700 dark:text-purple-400 shrink-0" />
              <span className="truncate">Platform Super Admin</span>
            </Link>
          )}

          <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
            <span>
              Role: <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{currentRole.replace('_', ' ')}</strong>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● RLS Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
