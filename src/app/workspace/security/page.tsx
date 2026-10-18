'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { getAuditEvents } from '@/lib/audit/logger';
import { AuditEvent } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Lock, KeyRound, AlertTriangle, FileText } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function SecurityCenterPage() {
  const { activeOrg, currentUser } = useTenant();
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    setEvents(getAuditEvents(activeOrg.id, 25));
  }, [activeOrg.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Security Center</h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold">
              RLS Active
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Access controls, active security policies, and tenant audit trail for {activeOrg.name}.
          </p>
        </div>
      </div>

      {/* Security Posture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase text-zinc-900">Row Level Security</h4>
          </div>
          <p className="text-xs text-zinc-600">
            PostgreSQL policies isolate database rows. Cross-organization data leak attempts are rejected at the engine level.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <KeyRound className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase text-zinc-900">RBAC Enforcement</h4>
          </div>
          <p className="text-xs text-zinc-600">
            9 server-enforced roles with fine-grained permission matrices. Privilege escalation strictly barred.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-700">
            <Lock className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase text-zinc-900">Append-Only Audit Trail</h4>
          </div>
          <p className="text-xs text-zinc-600">
            All administrative, project, and task state changes are logged immutably.
          </p>
        </Card>
      </div>

      {/* Tenant Specific Audit Trail */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Organization Audit Trail ({events.length})
            </h3>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No audit records logged for this organization yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold uppercase text-zinc-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Event Type</th>
                <th className="py-3 px-3">Target Resource</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-4 text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-zinc-700">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 px-4 text-[11px] text-zinc-500">
                    {formatDateTime(evt.created_at)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-900">{evt.event_type}</td>
                  <td className="py-2.5 px-3 text-zinc-500">{evt.target_resource}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
                      {evt.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-zinc-500">{evt.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
