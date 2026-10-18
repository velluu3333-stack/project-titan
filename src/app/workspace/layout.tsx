import React, { Suspense } from 'react';
import { TenantProvider } from '@/components/workspace/TenantContext';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceTopbar } from '@/components/workspace/WorkspaceTopbar';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
        <Suspense fallback={<aside className="hidden lg:block w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950" />}>
          <WorkspaceSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          <WorkspaceTopbar />
          <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto bg-slate-50 dark:bg-zinc-950 min-w-0">
            <Suspense fallback={<div className="py-12 text-center text-xs text-zinc-500">Loading workspace...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </TenantProvider>
  );
}
