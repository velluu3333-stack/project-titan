'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Code2, GitPullRequest, GitBranch, Terminal, ShieldAlert } from 'lucide-react';

export default function DevelopmentHubPage() {
  const { activeOrg } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Development Hub</h1>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Software Engineering
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Technical specs, repository integration, and release workflows for {activeOrg.name}.
          </p>
        </div>
      </div>

      {/* GitHub Integration Status Banner (Clearly labeled setup state) */}
      <Card className="border-amber-200 bg-amber-50/30 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                GitHub Repository Integration: Awaiting Webhook Configuration
              </h3>
              <p className="text-xs text-amber-800/80 leading-relaxed max-w-xl">
                Connect your organization’s GitHub repository via OAuth or Personal Access Token. Incoming
                webhooks will be verified with HMAC SHA-256 signatures before triggering tasks or build
                events.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
            Configure Webhook
          </Button>
        </div>
      </Card>

      {/* Technical Workflow Pipelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-zinc-900">Branching & RLS Policies</h4>
          </div>
          <p className="text-xs text-zinc-500">
            All database migrations follow strict semantic versioning in `supabase/migrations/`.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-zinc-900">Automated Tests</h4>
          </div>
          <p className="text-xs text-zinc-500">
            Unit and integration suites verify multi-tenant isolation before production releases.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-zinc-900">Security Gate</h4>
          </div>
          <p className="text-xs text-zinc-500">
            Zero production credentials stored in code bundles; secrets enforced server-side.
          </p>
        </Card>
      </div>
    </div>
  );
}
