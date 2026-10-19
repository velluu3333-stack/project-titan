'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { PipelineStage, PipelineTransitionEvent, Project } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDateTime } from '@/lib/utils';
import {
  Crown,
  Code2,
  Cpu,
  FlaskConical,
  Bug,
  Palette,
  ArrowRight,
  Send,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  RefreshCw,
  GitCommit,
  ShieldCheck,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface SquadNodeConfig {
  id: PipelineStage;
  title: string;
  lead: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  glowColor: string;
  bgGradient: string;
  badge: string;
}

const SQUAD_NODES: Record<PipelineStage, SquadNodeConfig> = {
  admin_core: {
    id: 'admin_core',
    title: 'Supreme Admin Command Core',
    lead: 'Vikramaditya Sharma',
    role: 'Supreme Admin (Master Authority)',
    icon: Crown,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/80',
    glowColor: 'shadow-[0_0_35px_rgba(245,158,11,0.25)]',
    bgGradient: 'from-amber-950/40 via-zinc-950 to-zinc-900',
    badge: 'HQ Authority',
  },
  dev_squad: {
    id: 'dev_squad',
    title: 'Developer Squad',
    lead: 'Alex Rivera',
    role: 'Core Frontend & API Engineering',
    icon: Code2,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/80',
    glowColor: 'shadow-[0_0_30px_rgba(59,130,246,0.25)]',
    bgGradient: 'from-blue-950/40 via-zinc-950 to-zinc-900',
    badge: 'Code Engine',
  },
  white_coder: {
    id: 'white_coder',
    title: 'White Coder Squad',
    lead: 'Kavya Sengupta',
    role: 'Low-Level Kernel & Algorithms',
    icon: Cpu,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/80',
    glowColor: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    bgGradient: 'from-cyan-950/40 via-zinc-950 to-zinc-900',
    badge: 'High Perf',
  },
  research_lab: {
    id: 'research_lab',
    title: 'Research & Patent Lab',
    lead: 'Dr. Elena Rostova & Tariq',
    role: '50% Royalty Pool Inventions',
    icon: FlaskConical,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/80',
    glowColor: 'shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    bgGradient: 'from-purple-950/40 via-zinc-950 to-zinc-900',
    badge: '50% Royalty',
  },
  qa_testing: {
    id: 'qa_testing',
    title: 'User Testing & QA Squad',
    lead: 'Priya Patel',
    role: 'Security Audit & RBAC Pen-Testing',
    icon: Bug,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/80',
    glowColor: 'shadow-[0_0_30px_rgba(244,63,94,0.25)]',
    bgGradient: 'from-rose-950/40 via-zinc-950 to-zinc-900',
    badge: 'Zero Bugs',
  },
  production_ads: {
    id: 'production_ads',
    title: 'Production Studio (Meta-Ads)',
    lead: 'Sarah Connor',
    role: 'Google AdSense & Growth Scaling',
    icon: Palette,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/80',
    glowColor: 'shadow-[0_0_30px_rgba(16,185,129,0.25)]',
    bgGradient: 'from-emerald-950/40 via-zinc-950 to-zinc-900',
    badge: 'Live Scaling',
  },
};

export function LivePipelineOrbit() {
  const { activeOrg, currentUser, can } = useTenant();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<PipelineStage>('dev_squad');
  const [auditEvents, setAuditEvents] = useState<PipelineTransitionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<PipelineStage>('qa_testing');
  const [actionNote, setActionNote] = useState('');
  const [changesSummary, setChangesSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const projList = await DataRepository.getProjects(activeOrg.id);
        setProjects(projList);
        const defaultProjId = projList[0]?.id || 'proj-1';
        setSelectedProjectId(defaultProjId);

        const [stage, events] = await Promise.all([
          DataRepository.getPipelineStage(defaultProjId),
          DataRepository.getPipelineAuditEvents(defaultProjId),
        ]);
        setCurrentStage(stage);
        setAuditEvents(events);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [activeOrg.id]);

  async function handleProjectChange(projId: string) {
    setSelectedProjectId(projId);
    setIsLoading(true);
    try {
      const [stage, events] = await Promise.all([
        DataRepository.getPipelineStage(projId),
        DataRepository.getPipelineAuditEvents(projId),
      ]);
      setCurrentStage(stage);
      setAuditEvents(events);
    } finally {
      setIsLoading(false);
    }
  }

  function openDispatchModal(to: PipelineStage, defaultNote = '', defaultChanges = '') {
    setTargetStage(to);
    setActionNote(defaultNote || `Dispatched to ${SQUAD_NODES[to].title} for next operational cycle.`);
    setChangesSummary(defaultChanges || 'Verified security compliance and milestone deliverables.');
    setIsTransitionModalOpen(true);
  }

  async function executeTransition(e: React.FormEvent) {
    e.preventDefault();
    if (!actionNote.trim()) return;

    setIsSubmitting(true);
    try {
      const activeProj = projects.find((p) => p.id === selectedProjectId);
      const projName = activeProj?.name || 'Titan Initiative';

      const result = await DataRepository.transitionPipelineStage({
        projectId: selectedProjectId,
        projectName: projName,
        toStage: targetStage,
        actorName: currentUser.full_name,
        actorRole: currentUser.is_platform_admin ? 'Supreme Admin' : currentUser.requested_role || 'Developer',
        actionNote: actionNote.trim(),
        changesSummary: changesSummary.trim() || 'Deliverable checked and signed off.',
      });

      setCurrentStage(result.newStage);
      setAuditEvents((prev) => [result.event, ...prev]);
      setIsTransitionModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeNode = SQUAD_NODES[currentStage];

  return (
    <Card className="border border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-950 text-white p-5 sm:p-6 rounded-2xl shadow-xl overflow-hidden relative">
      {/* Background Cybernetic Grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Header bar: Title, Project Selector, Active Custodian badge */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-white">
                  Live Operations Pipeline Orbit
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/70 flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  Full Dispatch Flow Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Centralized Admin Command dispatching and routing initiatives across all 5 engineering squads in real-time.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector & Active Custody Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Project Track:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="text-xs font-bold bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-900 text-white">
                  {p.name} {p.is_patent ? '(50% Patent)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Current Custody:</span>
            <span className={`text-xs font-black uppercase flex items-center gap-1.5 ${activeNode.color}`}>
              <activeNode.icon className="w-3.5 h-3.5" />
              {activeNode.title}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌌 MAIN ORBIT ARCHITECTURE MATRIX (Admin Center + 5 Nodes) */}
      {/* ======================================================== */}
      <div className="relative z-10 py-8 px-2 sm:px-4">
        {/* Visual Pipeline Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          
          {/* LEFT COLUMN: Developer Squad & White Coder Squad */}
          <div className="space-y-4">
            {/* 1. Developer Squad Block */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                currentStage === 'dev_squad'
                  ? `${SQUAD_NODES.dev_squad.borderColor} bg-gradient-to-br ${SQUAD_NODES.dev_squad.bgGradient} ${SQUAD_NODES.dev_squad.glowColor} ring-2 ring-blue-500/40`
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Developer Squad</h3>
                    <p className="text-[10px] text-zinc-400">{SQUAD_NODES.dev_squad.lead}</p>
                  </div>
                </div>
                <Badge variant="info" className="text-[9px] uppercase font-extrabold">
                  {currentStage === 'dev_squad' ? '● IN CUSTODY' : 'Ready'}
                </Badge>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                Constructs frontends, APIs, and business services. Submits code to QA for test suites.
              </p>

              {/* Dev Actions */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-blue-300 border-blue-500/40 hover:bg-blue-500/20"
                  onClick={() => openDispatchModal('qa_testing', 'Dev team completed sprint features. Handing over to QA for automated verification.')}
                >
                  Send to QA →
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
                  onClick={() => openDispatchModal('white_coder', 'Dev squad passed core algorithms to White Coder for low-level memory optimization.')}
                >
                  Pass to White Coder →
                </Button>
              </div>
            </div>

            {/* 2. White Coder Squad Block */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                currentStage === 'white_coder'
                  ? `${SQUAD_NODES.white_coder.borderColor} bg-gradient-to-br ${SQUAD_NODES.white_coder.bgGradient} ${SQUAD_NODES.white_coder.glowColor} ring-2 ring-cyan-500/40`
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">White Coder Squad</h3>
                    <p className="text-[10px] text-zinc-400">{SQUAD_NODES.white_coder.lead}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] uppercase font-extrabold text-cyan-400 border-cyan-600/60">
                  {currentStage === 'white_coder' ? '● IN CUSTODY' : 'Standby'}
                </Badge>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                Specialist White Coders refactoring core engines, Turbopack optimizations, and cryptographic speed.
              </p>

              {/* White Coder Actions */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20"
                  onClick={() => openDispatchModal('qa_testing', 'White Coder optimized core kernel. Passed to QA for penetration testing.')}
                >
                  Pass to QA →
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                  onClick={() => openDispatchModal('admin_core', 'White Coder completed micro-benchmarks. Returning to Admin for approval.')}
                >
                  Return to Admin ↑
                </Button>
              </div>
            </div>
          </div>

          {/* =================================================== */}
          {/* 👑 CENTER COLUMN: SUPREME ADMIN COMMAND CORE NODE   */}
          {/* =================================================== */}
          <div className="flex flex-col items-center justify-center p-2">
            <div
              className={`w-full p-6 rounded-3xl border-2 transition-all duration-500 relative text-center space-y-4 ${
                currentStage === 'admin_core'
                  ? `${SQUAD_NODES.admin_core.borderColor} bg-gradient-to-b ${SQUAD_NODES.admin_core.bgGradient} ${SQUAD_NODES.admin_core.glowColor} ring-4 ring-amber-500/30 scale-102`
                  : 'border-amber-600/60 bg-gradient-to-b from-amber-950/20 via-zinc-950 to-zinc-900 shadow-lg'
              }`}
            >
              {/* Pulsing indicator */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 shadow-xl ring-2 ring-amber-300/40">
                    <Crown className="w-9 h-9 text-zinc-950 animate-bounce" />
                  </div>
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-zinc-950 animate-pulse" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  Supreme Admin Core
                </span>
                <h3 className="text-base font-black text-white mt-1.5">
                  Vikramaditya Sharma
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Master Authority • Pipeline Orchestrator
                </p>
              </div>

              <div className="text-xs text-zinc-300 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-left space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
                  <span>Active Initiative</span>
                  <span className="text-amber-400">Clearance: Level 5</span>
                </div>
                <p className="font-bold text-white text-xs truncate">
                  {activeProject?.name || 'Project Titan'}
                </p>
                <p className="text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                  {activeProject?.objective || activeProject?.description || 'Operational roadmap active.'}
                </p>
              </div>

              {/* Admin Central Dispatch Pipeline Buttons */}
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
                  Direct Admin Pipeline Dispatch:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] py-1 h-8 font-bold"
                    onClick={() => openDispatchModal('dev_squad', 'Admin dispatched initiative specifications to Developer Squad for implementation.')}
                  >
                    ➔ Dispatch to Dev
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] py-1 h-8 font-bold"
                    onClick={() => openDispatchModal('research_lab', 'Admin directed Research Lab to file 50% royalty patent claims.')}
                  >
                    ➔ Send to Research
                  </Button>
                  <Button
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] py-1 h-8 font-bold"
                    onClick={() => openDispatchModal('white_coder', 'Admin ordered White Coder squad to optimize backend algorithms.')}
                  >
                    ➔ Send White Coder
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-1 h-8 font-bold"
                    onClick={() => openDispatchModal('production_ads', 'Admin authorized Production Studio to launch Meta-Ads campaigns.')}
                  >
                    ➔ Direct to Production
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Research Lab & User Testing (QA) */}
          <div className="space-y-4">
            {/* 3. Research & Patent Lab */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                currentStage === 'research_lab'
                  ? `${SQUAD_NODES.research_lab.borderColor} bg-gradient-to-br ${SQUAD_NODES.research_lab.bgGradient} ${SQUAD_NODES.research_lab.glowColor} ring-2 ring-purple-500/40`
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Research & Patent Lab</h3>
                    <p className="text-[10px] text-zinc-400">{SQUAD_NODES.research_lab.lead}</p>
                  </div>
                </div>
                <Badge variant="warning" className="text-[9px] uppercase font-extrabold text-purple-300 bg-purple-950/80 border-purple-800">
                  {currentStage === 'research_lab' ? '● IN CUSTODY' : '50% Royalty'}
                </Badge>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                Inventors drafting patent proposals with 6-month lock-in agreement and 50% revenue distribution.
              </p>

              {/* Research Actions */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-purple-300 border-purple-500/40 hover:bg-purple-500/20"
                  onClick={() => openDispatchModal('dev_squad', 'Research Lab synthesized algorithmic formula. Handing over to Dev Squad for implementation.')}
                >
                  Send to Dev →
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                  onClick={() => openDispatchModal('admin_core', 'Research Lab submitted patent claims to Supreme Admin for legal registration.')}
                >
                  Submit to Admin ↑
                </Button>
              </div>
            </div>

            {/* 4. User Testing & QA Squad */}
            <div
              className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                currentStage === 'qa_testing'
                  ? `${SQUAD_NODES.qa_testing.borderColor} bg-gradient-to-br ${SQUAD_NODES.qa_testing.bgGradient} ${SQUAD_NODES.qa_testing.glowColor} ring-2 ring-rose-500/40`
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">User Testing & QA</h3>
                    <p className="text-[10px] text-zinc-400">{SQUAD_NODES.qa_testing.lead}</p>
                  </div>
                </div>
                <Badge variant="danger" className="text-[9px] uppercase font-extrabold">
                  {currentStage === 'qa_testing' ? '● IN CUSTODY' : 'Testing'}
                </Badge>
              </div>

              <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                Security penetration testing, fuzzing multi-tenant RLS isolation, and user experience sign-offs.
              </p>

              {/* QA Actions */}
              <div className="pt-3 mt-2 border-t border-zinc-800/80 flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20 font-bold"
                  onClick={() => openDispatchModal('production_ads', 'QA signed off with 100% test pass rate. Handing over to Production Studio for deployment.')}
                >
                  ✓ Sign Off to Production →
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] py-1 h-7 text-rose-300 border-rose-500/40 hover:bg-rose-500/20"
                  onClick={() => openDispatchModal('dev_squad', 'QA discovered edge-case anomaly. Returning to Developer Squad for patch.')}
                >
                  ✗ Reject back to Dev ←
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CENTER: Production Studio (Meta-Ads & Growth) */}
        <div className="mt-5 max-w-2xl mx-auto">
          <div
            className={`p-4 rounded-2xl border transition-all duration-300 relative ${
              currentStage === 'production_ads'
                ? `${SQUAD_NODES.production_ads.borderColor} bg-gradient-to-r ${SQUAD_NODES.production_ads.bgGradient} ${SQUAD_NODES.production_ads.glowColor} ring-2 ring-emerald-500/40`
                : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Production Studio & Meta-Ads</h3>
                    <Badge variant="success" className="text-[9px] uppercase font-extrabold">
                      {currentStage === 'production_ads' ? '● LIVE IN PRODUCTION' : 'AdSense Ready'}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Lead: {SQUAD_NODES.production_ads.lead} • Programmatic SEO Traffic & Meta-Ads Monetization
                  </p>
                </div>
              </div>

              {/* Production Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  onClick={() => openDispatchModal('admin_core', 'Production Studio deployed build live, launched Google AdSense traffic streams, and sent telemetry report to Admin.')}
                >
                  Deploy Live & Notify Admin ↑
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 📜 LIVE AUDIT STREAM & PIPELINE TRANSIT LOGS            */}
      {/* ======================================================== */}
      <div className="relative z-10 mt-6 pt-5 border-t border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Live Pipeline Transit Stream & Verification Audit
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-zinc-400">
            Real-time handovers tracked: {auditEvents.length} events
          </span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {auditEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-zinc-400">{formatDateTime(ev.timestamp)}</span>
                  <span className="font-bold text-amber-400">{ev.actorName}</span>
                  <span className="text-[10px] text-zinc-400">({ev.actorRole})</span>
                  <span className="text-zinc-500">transferred</span>
                  <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-white font-semibold text-[10px]">
                    {SQUAD_NODES[ev.fromStage]?.title || ev.fromStage}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                  <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold text-[10px]">
                    {SQUAD_NODES[ev.toStage]?.title || ev.toStage}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 italic">{ev.actionNote}</p>
                <p className="text-[10px] text-zinc-400 font-mono">Changes: {ev.changesSummary}</p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recorded</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🚀 DISPATCH / TRANSITION PIPELINE MODAL                  */}
      {/* ======================================================== */}
      <Modal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        title={`Pipeline Transit: Transfer to ${SQUAD_NODES[targetStage]?.title}`}
        description="Dispatch the active initiative to the next squad node with verification logs."
      >
        <form onSubmit={executeTransition} className="space-y-4">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Initiative:</span>
              <strong className="text-white">{activeProject?.name}</strong>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Transfer Pathway:</span>
              <div className="flex items-center gap-1 font-bold text-white">
                <span className="text-zinc-400">{SQUAD_NODES[currentStage].title}</span>
                <ArrowRight className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400">{SQUAD_NODES[targetStage].title}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Action Handover Note *
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              placeholder="e.g. Completed initial API and models. Handing over for QA testing."
              required
              rows={3}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Deliverables & Changes Summary
            </label>
            <Input
              value={changesSummary}
              onChange={(e) => setChangesSummary(e.target.value)}
              placeholder="e.g. Added 12 unit tests, verified zero RLS leaks"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTransitionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Confirm Dispatch
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
