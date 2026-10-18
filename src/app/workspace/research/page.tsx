'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FlaskConical, FileText, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ResearchLabPage() {
  const { activeOrg } = useTenant();

  const briefs = [
    {
      id: 'res-1',
      title: 'PostgreSQL Multi-Tenant Scaling Strategies (RLS vs Schema-per-Tenant)',
      hypothesis: 'PostgreSQL Row Level Security with combined tenant indexes delivers 4x lower operational overhead than dynamic schema creation at 1,000 tenants.',
      status: 'approved',
      author: 'Sarah Connor',
      sourcesCount: 6,
      updatedAt: '2026-03-01',
    },
    {
      id: 'res-2',
      title: 'AI Tool Execution Guardrails: Sandbox Evaluation',
      hypothesis: 'Server-side allowlisted schemas with explicit parameter validation eliminate 99% of prompt injection tool abuse.',
      status: 'in_review',
      author: 'Marcus Wright',
      sourcesCount: 4,
      updatedAt: '2026-03-05',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Research Lab</h1>
            <Badge variant="info" className="text-[10px] uppercase font-bold">
              Evidence-Based
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Structured research briefs, citations, hypotheses, and peer reviews for {activeOrg.name}.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {briefs.map((brief) => (
          <Card key={brief.id} className="p-5 space-y-3 hover:border-zinc-300 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 text-purple-700 rounded-lg mt-0.5">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{brief.title}</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Author: {brief.author}</p>
                </div>
              </div>
              <Badge
                variant={brief.status === 'approved' ? 'success' : 'warning'}
                className="text-[10px] uppercase font-bold"
              >
                {brief.status.replace('_', ' ')}
              </Badge>
            </div>

            <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-3 text-xs text-zinc-700">
              <strong className="text-zinc-900">Hypothesis / Core Claim:</strong> {brief.hypothesis}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
              <span>{brief.sourcesCount} Verified Sources Cited</span>
              <span>Updated {formatDate(brief.updatedAt)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
