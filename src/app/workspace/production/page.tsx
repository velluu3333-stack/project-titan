'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Palette, FileImage, ShieldCheck } from 'lucide-react';

export default function ProductionStudioPage() {
  const { activeOrg } = useTenant();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Production Studio</h1>
            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
              Creative Pipeline
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Deliverables, brand assets, and creative approvals for {activeOrg.name}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Brand Identity System v2.0</h3>
                <p className="text-[11px] text-zinc-400">Design System Deliverables</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px] uppercase font-bold">
              Delivered
            </Badge>
          </div>
          <p className="text-xs text-zinc-600">
            Typography, accessible color tokens, component guidelines, and icon assets.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
            <span>5 Assets Attached</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Signed Storage URLs
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
