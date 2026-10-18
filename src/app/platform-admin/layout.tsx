'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Building,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { TenantProvider, useTenant } from '@/components/workspace/TenantContext';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPlatformAdminUser, currentUser } = useTenant();

  if (!isPlatformAdminUser) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/60 p-6 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Access Denied: Platform Admin Required</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            You do not possess platform super-administrator privileges. Organization administrator
            rights do not grant access to multi-tenant platform infrastructure.
          </p>
          <div className="pt-2">
            <Link
              href="/workspace/command-center"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Organization Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Platform Admin Topbar */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-rose-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs">
            PA
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
              Titan Platform Super Admin
            </h1>
            <p className="text-[10px] text-zinc-500">Multi-Tenant Infrastructure Console</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono hidden sm:inline">
            Admin: <strong className="text-zinc-800 dark:text-zinc-200">{currentUser.email}</strong>
          </span>
          <Link
            href="/workspace/command-center"
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Workspace
          </Link>
        </div>
      </header>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <Suspense fallback={<div className="min-h-screen bg-zinc-900 text-zinc-400 p-8">Loading console...</div>}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </TenantProvider>
  );
}
