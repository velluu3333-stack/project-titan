'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Project, PipelineStage } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Crown,
  Code2,
  Cpu,
  FlaskConical,
  Bug,
  Palette,
  Coins,
  Send,
  Play,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  Layers,
  ArrowRight,
  Mail,
  Zap,
  Flame,
  X,
  ExternalLink,
} from 'lucide-react';

interface FlowNode {
  id: string;
  title: string;
  subtitle: string;
  type: 'trigger' | 'core' | 'action';
  squad: string;
  lead: string;
  status: string;
  colorScheme: 'cyan' | 'coral' | 'blue' | 'amber';
  badge: string;
  wireLabel: string;
}

export function CyberFlowCanvas() {
  const { activeOrg, currentUser } = useTenant();
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [activeWire, setActiveWire] = useState<string | null>(null);

  // Nodes metadata
  const nodes: Record<string, FlowNode> = {
    // Center Core
    admin_core: {
      id: 'admin_core',
      title: 'Supreme Admin Core',
      subtitle: 'Central Flow & Dispatch Engine',
      type: 'core',
      squad: 'HQ Command Station',
      lead: 'Vikramaditya Sharma',
      status: 'Live Orchestrating',
      colorScheme: 'coral',
      badge: 'Master Core',
      wireLabel: 'Core Hub',
    },
    // Left Ingestion Nodes (Cyan)
    patent_ingestion: {
      id: 'patent_ingestion',
      title: 'Patent & Idea Ingestion',
      subtitle: '50% Royalty Lock-in Trigger',
      type: 'trigger',
      squad: 'Research & Patent Lab',
      lead: 'Dr. Elena & Tariq',
      status: '3 Patents In-Flight',
      colorScheme: 'cyan',
      badge: '50% Royalty',
      wireLabel: 'Data Flow',
    },
    white_coder_engine: {
      id: 'white_coder_engine',
      title: 'White Coder Kernel',
      subtitle: 'Low-Latency Algorithm Engine',
      type: 'trigger',
      squad: 'White Coder Squad',
      lead: 'Kavya Sengupta',
      status: 'AST Optimizations Ready',
      colorScheme: 'cyan',
      badge: 'High Perf',
      wireLabel: 'Trigger',
    },
    sprint_backlog: {
      id: 'sprint_backlog',
      title: 'Sprint Backlog & Tasks',
      subtitle: 'Requirements Queue & Triggers',
      type: 'trigger',
      squad: 'Task Delegation Engine',
      lead: 'Admin Dispatcher',
      status: '14 Active Work Units',
      colorScheme: 'cyan',
      badge: 'Input',
      wireLabel: 'Input',
    },
    // Top Integration Node (Blue)
    broadcast_stream: {
      id: 'broadcast_stream',
      title: 'Emergency Broadcast & Feeds',
      subtitle: 'Gmail • Outlook • Siren Red Alerts',
      type: 'action',
      squad: 'Broadcast Hub',
      lead: 'Supreme Admin & Leads',
      status: 'Zero Unresolved Alerts',
      colorScheme: 'blue',
      badge: 'Multi-Channel',
      wireLabel: 'Broadcast',
    },
    // Right Action Nodes (Coral & Emerald)
    dev_squad: {
      id: 'dev_squad',
      title: 'Developer Squad Hub',
      subtitle: 'Core Frontend & API Engineering',
      type: 'action',
      squad: 'Developer Squad',
      lead: 'Alex Rivera',
      status: 'Executing Sprint Features',
      colorScheme: 'coral',
      badge: 'In-Flight',
      wireLabel: 'Send Task',
    },
    qa_gate: {
      id: 'qa_gate',
      title: 'User Testing & QA Gate',
      subtitle: 'Security Audit & RBAC Pen-Testing',
      type: 'action',
      squad: 'User Testing QA',
      lead: 'Priya Patel',
      status: '100% Pass Verification',
      colorScheme: 'coral',
      badge: 'Zero Leaks',
      wireLabel: 'Audit Gate',
    },
    production_ads: {
      id: 'production_ads',
      title: 'Production Studio & Ads',
      subtitle: 'Google AdSense & Meta-Ads Scaling',
      type: 'action',
      squad: 'Production Studio',
      lead: 'Sarah Connor',
      status: '$38,900 AdSense Yield',
      colorScheme: 'coral',
      badge: 'Live Scaling',
      wireLabel: 'Deploy Live',
    },
    royalty_engine: {
      id: 'royalty_engine',
      title: '50% Royalty Payout Engine',
      subtitle: 'Automated 6-Month Lock-in Split',
      type: 'action',
      squad: 'Monetization Vault',
      lead: 'Titan Treasury',
      status: '$64,225 Distributed',
      colorScheme: 'amber',
      badge: '50% Payout',
      wireLabel: 'Royalty Pool',
    },
  };

  // Run visual wave simulation through the flow graph
  const simulationSteps = [
    'patent_ingestion',
    'white_coder_engine',
    'admin_core',
    'dev_squad',
    'qa_gate',
    'production_ads',
    'royalty_engine',
  ];

  function runSimulation() {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(0);

    let step = 0;
    const interval = setInterval(() => {
      if (step < simulationSteps.length) {
        setActiveWire(simulationSteps[step]);
        setSelectedNode(nodes[simulationSteps[step]]);
        step++;
        setActiveStep(step);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setActiveWire(null);
      }
    }, 1400);
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-zinc-800/80 circuit-canvas shadow-2xl select-none min-h-[720px] flex flex-col justify-between">
      {/* Top Floating Control Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b border-zinc-800/60 bg-zinc-950/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg ring-1 ring-white/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
                TITAN FLOW ORBIT • Cybernetic Engine
              </h2>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800 animate-pulse">
                Interactive Graph
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              Click any node or wire to inspect live custody and trigger pipeline dispatches.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-rose-900/30"
            leftIcon={<Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />}
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? `Flow In Transit (Step ${activeStep}/7)...` : '▶ Run Live Flow Simulation'}
          </Button>

          {selectedNode && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-zinc-300 border-zinc-700 hover:bg-zinc-800"
              onClick={() => setSelectedNode(null)}
            >
              Reset Focus
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🌌 THE SVG CIRCUIT NETWORK & NODES                       */}
      {/* ======================================================== */}
      <div className="relative flex-1 w-full h-[620px] overflow-x-auto overflow-y-hidden">
        <svg
          viewBox="0 0 1200 640"
          className="w-full h-full min-w-[960px] pointer-events-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glowing neon filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glow-coral" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear Gradients for flowing cables */}
            <linearGradient id="cable-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
            </linearGradient>

            <linearGradient id="cable-coral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
              <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="cable-blue" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* =================================================== */}
          {/* ⚡ CURVED GLOWING SVG BUS/WIRES (Exact match to image) */}
          {/* =================================================== */}

          {/* 1. Left Top Cable: Patent Ingestion -> Center Core */}
          <path
            d="M 320 170 C 440 170, 460 330, 545 330"
            fill="none"
            stroke="#06b6d4"
            strokeWidth={activeWire === 'patent_ingestion' ? '4' : '2'}
            strokeDasharray={activeWire === 'patent_ingestion' ? '8 6' : 'none'}
            className={activeWire === 'patent_ingestion' ? 'animate-wire-flow' : ''}
            filter="url(#glow-cyan)"
            opacity={activeWire && activeWire !== 'patent_ingestion' ? 0.3 : 0.85}
          />

          {/* 2. Left Middle Cable: White Coder Engine -> Center Core */}
          <path
            d="M 320 330 C 420 330, 460 330, 545 330"
            fill="none"
            stroke="#06b6d4"
            strokeWidth={activeWire === 'white_coder_engine' ? '4' : '2.5'}
            strokeDasharray={activeWire === 'white_coder_engine' ? '8 6' : 'none'}
            className={activeWire === 'white_coder_engine' ? 'animate-wire-flow' : ''}
            filter="url(#glow-cyan)"
            opacity={activeWire && activeWire !== 'white_coder_engine' ? 0.3 : 0.85}
          />

          {/* 3. Left Bottom Cable: Sprint Backlog -> Center Core */}
          <path
            d="M 320 490 C 440 490, 460 330, 545 330"
            fill="none"
            stroke="#06b6d4"
            strokeWidth={activeWire === 'sprint_backlog' ? '4' : '2'}
            strokeDasharray={activeWire === 'sprint_backlog' ? '8 6' : 'none'}
            className={activeWire === 'sprint_backlog' ? 'animate-wire-flow' : ''}
            filter="url(#glow-cyan)"
            opacity={activeWire && activeWire !== 'sprint_backlog' ? 0.3 : 0.85}
          />

          {/* 4. Top Outgoing Cable: Center Core -> Broadcast Stream */}
          <path
            d="M 600 270 C 600 210, 600 170, 600 135"
            fill="none"
            stroke="#3b82f6"
            strokeWidth={activeWire === 'broadcast_stream' ? '4' : '2.5'}
            strokeDasharray={activeWire === 'broadcast_stream' ? '8 6' : 'none'}
            className={activeWire === 'broadcast_stream' ? 'animate-wire-flow' : ''}
            filter="url(#glow-blue)"
            opacity={activeWire && activeWire !== 'broadcast_stream' ? 0.3 : 0.85}
          />

          {/* 5. Right Top Cable: Center Core -> Developer Squad */}
          <path
            d="M 655 330 C 740 330, 770 160, 880 160"
            fill="none"
            stroke="#f43f5e"
            strokeWidth={activeWire === 'dev_squad' ? '4' : '2.5'}
            strokeDasharray={activeWire === 'dev_squad' ? '8 6' : 'none'}
            className={activeWire === 'dev_squad' ? 'animate-wire-flow' : ''}
            filter="url(#glow-coral)"
            opacity={activeWire && activeWire !== 'dev_squad' ? 0.3 : 0.85}
          />

          {/* 6. Right Mid-Top Cable: Center Core -> QA Gate */}
          <path
            d="M 655 330 C 740 330, 780 275, 880 275"
            fill="none"
            stroke="#f43f5e"
            strokeWidth={activeWire === 'qa_gate' ? '4' : '2'}
            strokeDasharray={activeWire === 'qa_gate' ? '8 6' : 'none'}
            className={activeWire === 'qa_gate' ? 'animate-wire-flow' : ''}
            filter="url(#glow-coral)"
            opacity={activeWire && activeWire !== 'qa_gate' ? 0.3 : 0.85}
          />

          {/* 7. Right Mid-Bottom Cable: Center Core -> Production Studio */}
          <path
            d="M 655 330 C 740 330, 780 395, 880 395"
            fill="none"
            stroke="#f43f5e"
            strokeWidth={activeWire === 'production_ads' ? '4' : '2.5'}
            strokeDasharray={activeWire === 'production_ads' ? '8 6' : 'none'}
            className={activeWire === 'production_ads' ? 'animate-wire-flow' : ''}
            filter="url(#glow-coral)"
            opacity={activeWire && activeWire !== 'production_ads' ? 0.3 : 0.85}
          />

          {/* 8. Right Bottom Cable: Center Core -> 50% Royalty Payout */}
          <path
            d="M 655 330 C 740 330, 770 515, 880 515"
            fill="none"
            stroke="#fb7185"
            strokeWidth={activeWire === 'royalty_engine' ? '4' : '2'}
            strokeDasharray={activeWire === 'royalty_engine' ? '8 6' : 'none'}
            className={activeWire === 'royalty_engine' ? 'animate-wire-flow' : ''}
            filter="url(#glow-coral)"
            opacity={activeWire && activeWire !== 'royalty_engine' ? 0.3 : 0.85}
          />

          {/* Wire Labels along the curves */}
          <text x="440" y="215" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.8">
            Data Flow ➔
          </text>
          <text x="440" y="320" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.8">
            Trigger ➔
          </text>
          <text x="440" y="445" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.8">
            Input ➔
          </text>

          <text x="735" y="215" fill="#fb7185" fontSize="10" fontWeight="bold" opacity="0.8">
            ➔ Publish
          </text>
          <text x="735" y="295" fill="#fb7185" fontSize="10" fontWeight="bold" opacity="0.8">
            ➔ Pen-Test
          </text>
          <text x="735" y="375" fill="#fb7185" fontSize="10" fontWeight="bold" opacity="0.8">
            ➔ Deploy
          </text>
          <text x="735" y="455" fill="#fb7185" fontSize="10" fontWeight="bold" opacity="0.8">
            ➔ 50% Share
          </text>

          {/* =================================================== */}
          {/* 🔴 CENTER GLOWING NODE (SUPREME ADMIN CORE)         */}
          {/* =================================================== */}
          <g
            className="cursor-pointer group"
            onClick={() => setSelectedNode(nodes.admin_core)}
          >
            {/* Outer Pulsing Glow Rings */}
            <circle
              cx="600"
              cy="330"
              r="62"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              filter="url(#glow-coral)"
              className="animate-core-pulse opacity-90"
            />
            <circle
              cx="600"
              cy="330"
              r="52"
              fill="none"
              stroke="#fb7185"
              strokeWidth="1.5"
              opacity="0.6"
            />

            {/* Inner Solid Hub */}
            <circle
              cx="600"
              cy="330"
              r="44"
              fill="#0f172a"
              stroke="#f43f5e"
              strokeWidth="2"
              className="transition-transform group-hover:scale-105"
            />

            {/* Center Emblem / Icon */}
            <g transform="translate(584, 314)">
              <Crown className="w-8 h-8 text-rose-400 group-hover:text-white transition-colors" />
            </g>

            {/* Center Label Pill */}
            <rect
              x="535"
              y="390"
              width="130"
              height="24"
              rx="12"
              fill="#090d16"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <text
              x="600"
              y="406"
              fill="#ffffff"
              fontSize="10"
              fontWeight="900"
              textAnchor="middle"
              letterSpacing="0.08em"
            >
              ADMIN CORE
            </text>
          </g>
        </svg>

        {/* ======================================================== */}
        {/* 🎴 INTERACTIVE REACT CARD NODES OVERLAY                 */}
        {/* ======================================================== */}

        {/* LEFT COLUMN: Ingestion Nodes (Cyan Neon Glowing Boxes) */}
        <div className="absolute left-6 top-8 space-y-16 w-64 sm:w-72 pointer-events-auto">
          {/* Left Node 1: Patent Ingestion */}
          <div
            onClick={() => setSelectedNode(nodes.patent_ingestion)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'patent_ingestion'
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/40'
                : 'border-cyan-500/70 bg-zinc-950/80 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(6,182,212,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white">{nodes.patent_ingestion.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                50% Pool
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.patent_ingestion.subtitle}</p>
          </div>

          {/* Left Node 2: White Coder Engine */}
          <div
            onClick={() => setSelectedNode(nodes.white_coder_engine)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'white_coder_engine'
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/40'
                : 'border-cyan-500/70 bg-zinc-950/80 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(6,182,212,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white">{nodes.white_coder_engine.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Kernel
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.white_coder_engine.subtitle}</p>
          </div>

          {/* Left Node 3: Sprint Backlog */}
          <div
            onClick={() => setSelectedNode(nodes.sprint_backlog)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'sprint_backlog'
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_24px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/40'
                : 'border-cyan-500/70 bg-zinc-950/80 hover:border-cyan-400 hover:shadow-[0_0_18px_rgba(6,182,212,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black text-white">{nodes.sprint_backlog.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Queue
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.sprint_backlog.subtitle}</p>
          </div>
        </div>

        {/* TOP INTEGRATION NODE: Emergency Broadcast Stream */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 w-72 sm:w-80 pointer-events-auto">
          <div
            onClick={() => setSelectedNode(nodes.broadcast_stream)}
            className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer text-center ${
              selectedNode?.id === 'broadcast_stream'
                ? 'border-blue-400 bg-blue-950/50 shadow-[0_0_24px_rgba(59,130,246,0.5)]'
                : 'border-blue-500/70 bg-zinc-950/85 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-center gap-2 pb-1">
              <Mail className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-black text-white">{nodes.broadcast_stream.title}</h3>
              <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.broadcast_stream.subtitle}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: Action & Execution Nodes (Coral & Emerald Glowing Boxes) */}
        <div className="absolute right-6 top-6 space-y-7 w-64 sm:w-76 pointer-events-auto">
          {/* Right Node 1: Developer Squad */}
          <div
            onClick={() => setSelectedNode(nodes.dev_squad)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'dev_squad'
                ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_24px_rgba(244,63,94,0.5)] ring-2 ring-rose-400/40'
                : 'border-rose-500/70 bg-zinc-950/80 hover:border-rose-400 hover:shadow-[0_0_18px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-black text-white">{nodes.dev_squad.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Dev Execution
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.dev_squad.subtitle}</p>
          </div>

          {/* Right Node 2: QA Gate */}
          <div
            onClick={() => setSelectedNode(nodes.qa_gate)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'qa_gate'
                ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_24px_rgba(244,63,94,0.5)] ring-2 ring-rose-400/40'
                : 'border-rose-500/70 bg-zinc-950/80 hover:border-rose-400 hover:shadow-[0_0_18px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-black text-white">{nodes.qa_gate.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                Pen-Testing
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.qa_gate.subtitle}</p>
          </div>

          {/* Right Node 3: Production & Meta-Ads */}
          <div
            onClick={() => setSelectedNode(nodes.production_ads)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'production_ads'
                ? 'border-rose-400 bg-rose-950/40 shadow-[0_0_24px_rgba(244,63,94,0.5)] ring-2 ring-rose-400/40'
                : 'border-rose-500/70 bg-zinc-950/80 hover:border-rose-400 hover:shadow-[0_0_18px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white">{nodes.production_ads.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                AdSense Live
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.production_ads.subtitle}</p>
          </div>

          {/* Right Node 4: 50% Royalty Payout */}
          <div
            onClick={() => setSelectedNode(nodes.royalty_engine)}
            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
              selectedNode?.id === 'royalty_engine'
                ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_24px_rgba(245,158,11,0.5)] ring-2 ring-amber-400/40'
                : 'border-amber-500/70 bg-zinc-950/80 hover:border-amber-400 hover:shadow-[0_0_18px_rgba(245,158,11,0.3)]'
            }`}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white">{nodes.royalty_engine.title}</h3>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                Pool Active
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">{nodes.royalty_engine.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🔍 FLOATING NODE INSPECTOR SLIDE-OVER DRAWER             */}
      {/* ======================================================== */}
      {selectedNode && (
        <div className="absolute right-4 bottom-4 top-20 w-80 sm:w-96 rounded-3xl bg-zinc-950/95 border border-zinc-700/80 p-5 shadow-2xl backdrop-blur-xl z-30 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Node Telemetry Inspector
                </h4>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                {selectedNode.badge}
              </span>
              <h3 className="text-base font-black text-white mt-1.5">{selectedNode.title}</h3>
              <p className="text-xs text-zinc-400">{selectedNode.subtitle}</p>
            </div>

            <div className="space-y-2 p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase text-[10px] font-bold">Squad Lead:</span>
                <strong className="text-white">{selectedNode.lead}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase text-[10px] font-bold">Assigned Unit:</span>
                <span className="text-zinc-300 font-semibold">{selectedNode.squad}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 uppercase text-[10px] font-bold">Live Status:</span>
                <span className="text-emerald-400 font-bold">{selectedNode.status}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                Interactive Conduit Actions
              </p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trigger real-time execution waves directly through this circuit node into the Titan Operating System.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-zinc-800">
            <Button
              size="sm"
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md"
              leftIcon={<Zap className="w-3.5 h-3.5" />}
              onClick={() => {
                alert(`Triggered live conduit action for "${selectedNode.title}"! Telemetry pulse dispatched.`);
              }}
            >
              Trigger Conduit Pulse ➔
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-zinc-400 border-zinc-800 hover:bg-zinc-900"
              onClick={() => setSelectedNode(null)}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
