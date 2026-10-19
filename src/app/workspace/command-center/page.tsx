'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { CyberFlowCanvas } from '@/components/workspace/CyberFlowCanvas';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Radio, Sparkles } from 'lucide-react';

export default function CommandCenterPage() {
  const { activeOrg, currentUser } = useTenant();

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Sleek, Minimal Cybernetic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 uppercase">
              TITAN ORBIT CANVAS
            </h1>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 flex items-center gap-1 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              Live Flow Active
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-semibold hidden md:inline">•</span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden md:inline">
            Autonomous Pipeline Operating Core for <strong className="text-zinc-900 dark:text-zinc-200">{activeOrg.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>RLS Active</span>
          </div>
          <span className="h-3 w-px bg-zinc-300 dark:bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-semibold text-[11px]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>50% Patent Pool</span>
          </div>
        </div>
      </div>

      {/* 🌌 THE CENTERPIECE: CYBERNETIC VISUAL NODE FLOW GRAPH */}
      <CyberFlowCanvas />
    </div>
  );
}
