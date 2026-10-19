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

  const navGroups = [
    {
      label: 'Core Command',
      items: [
        { title: 'Command Center', href: '/workspace/command-center', icon: LayoutDashboard },
        { title: 'Projects', href: '/workspace/projects', icon: FolderKanban },
        { title: 'Tasks', href: '/workspace/tasks', icon: CheckSquare },
        {
          title: 'Team & Hierarchy',
          href: '/workspace/team',
          icon: Users,
          badge: pendingApprovals.length > 0 ? `${pendingApprovals.length} new` : undefined,
          badgeVariant: 'warning',
        },
      ],
    },
    {
      label: 'Revenue & IP Engine',
      items: [
        { title: 'Earning & Monetization', href: '/workspace/earnings', icon: Coins, badge: '50% Royalty', badgeVariant: 'info' },
        { title: 'Departments', href: '/workspace/departments', icon: Building2 },
        { title: 'Research & Patents', href: '/workspace/research', icon: FlaskConical },
        { title: 'Development Hub', href: '/workspace/development', icon: Code2 },
        { title: 'Production Studio', href: '/workspace/production', icon: Palette },
      ],
    },
    {
      label: 'Governance & Security',
      items: [
        { title: 'Legal & Secret Docs', href: '/workspace/documents', icon: Lock },
        { title: 'Communication', href: '/workspace/communication', icon: MessageSquare },
        { title: 'Reports & Charts', href: '/workspace/reports', icon: BarChart3 },
        { title: 'Security Center', href: '/workspace/security', icon: ShieldCheck },
        { title: 'Organization Settings', href: '/workspace/settings', icon: Settings },
      ],
    },
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
          'fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-950 flex flex-col h-full border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl transition-transform duration-300 select-none',
          'lg:static lg:translate-x-0 lg:w-64 lg:h-screen lg:sticky lg:top-0 lg:shadow-none lg:z-auto shrink-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand & Organization Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-zinc-950 font-extrabold text-xs tracking-wider shadow-sm ring-1 ring-zinc-700/20 dark:ring-white/20">
                TT
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs font-black tracking-wider text-zinc-950 dark:text-zinc-50 uppercase">
                    PROJECT TITAN
                  </h1>
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    v2.0
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Company Operating System
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobileSidebar}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 p-2.5">
            <div className="truncate min-w-0 pr-2">
              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Active Tenant
              </p>
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                {activeOrg.name}
              </p>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
              {activeOrg.plan_id}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={cn(
                        'relative flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all group',
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 hover:text-zinc-950 dark:hover:text-zinc-100'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-white dark:text-zinc-950'
                              : 'text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.2 text-[9px] font-bold tracking-wider',
                            isActive
                              ? 'bg-zinc-800 text-zinc-200 dark:bg-zinc-300 dark:text-zinc-900'
                              : item.badgeVariant === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Super Admin & Security Footer */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/80 space-y-2">
          {isPlatformAdminUser && (
            <Link
              href="/platform-admin"
              onClick={closeMobileSidebar}
              className="flex items-center gap-2 rounded-lg border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 p-2 text-xs font-semibold text-purple-900 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <ShieldAlert className="h-4 w-4 text-purple-700 dark:text-purple-400 shrink-0" />
              <span className="truncate">Platform Super Admin</span>
            </Link>
          )}

          <div className="flex items-center justify-between px-1 text-[11px] text-zinc-500">
            <span className="truncate">
              Role: <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{currentRole.replace('_', ' ')}</strong>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              RLS
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
