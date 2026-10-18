'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Building2, Users } from 'lucide-react';

export default function DepartmentsPage() {
  const { activeOrg } = useTenant();

  const departments = [
    {
      id: 'dept-eng',
      name: 'Engineering',
      description: 'Core software engineering, database architecture, and infrastructure reliability.',
      lead: 'John Reese',
      membersCount: 3,
    },
    {
      id: 'dept-prod',
      name: 'Product & Design',
      description: 'Product specifications, UX research, and company design system.',
      lead: 'Marcus Wright',
      membersCount: 2,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Departments</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Functional company divisions, leadership, and operational scope for {activeOrg.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{dept.name}</h3>
                  <p className="text-[11px] text-zinc-400">Lead: {dept.lead}</p>
                </div>
              </div>
              <Badge variant="default" className="text-[10px]">
                <Users className="w-3 h-3 mr-1" /> {dept.membersCount} Members
              </Badge>
            </div>
            <p className="text-xs text-zinc-600">{dept.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
