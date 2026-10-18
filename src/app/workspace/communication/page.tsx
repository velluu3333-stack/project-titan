'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquare, Bell, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function CommunicationPage() {
  const { activeOrg } = useTenant();

  const announcements = [
    {
      id: 'ann-1',
      title: 'Titan OS Migration: Milestone 1 Verification Complete',
      author: 'Sarah Connor',
      date: '2026-03-05',
      content:
        'All engineering teams have verified local and staging PostgreSQL RLS isolation. Production migration scheduled for next sprint.',
      type: 'Decision Record',
    },
    {
      id: 'ann-2',
      title: 'Company Operational Standup Summary',
      author: 'Marcus Wright',
      date: '2026-03-04',
      content:
        'Cross-functional teams aligned on Q1 sprint goals. Creative studio finalizing brand tokens.',
      type: 'Meeting Note',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Communication Center</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Decision records, company announcements, and asynchronous updates for {activeOrg.name}.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <Card key={item.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900">{item.title}</h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Posted by {item.author} on {formatDate(item.date)}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
              {item.content}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
