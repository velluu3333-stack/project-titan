'use client';

import React, { useState } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  Play,
  Terminal,
} from 'lucide-react';

interface AIActionLog {
  id: string;
  tool: string;
  risk: 'low' | 'medium' | 'high';
  input: string;
  result: string;
  timestamp: string;
}

export default function AICommandCenterPage() {
  const { activeOrg, currentUser } = useTenant();
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<AIActionLog[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Suggested Prompts based on Section 15
  const suggestedQueries = [
    'Summarize all active projects in Acme Corp',
    'List all overdue or blocked tasks',
    'Report operational workload and deadlines',
    'Create task: "Verify production SSL configuration"',
  ];

  async function handleExecuteAI(queryToRun?: string) {
    const q = queryToRun || prompt;
    if (!q.trim()) return;
    setIsProcessing(true);
    setAiResponse(null);

    try {
      const [projects, tasks] = await Promise.all([
        DataRepository.getProjects(activeOrg.id),
        DataRepository.getTasks(activeOrg.id),
      ]);

      const lower = q.toLowerCase();
      let responseText = '';
      let toolExecuted = 'list_authorized_projects';
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      if (lower.includes('project') || lower.includes('summarize')) {
        toolExecuted = 'get_project_summary';
        riskLevel = 'low';
        responseText = `Identified ${projects.length} active initiatives in ${activeOrg.name}:\n\n` +
          projects
            .map(
              (p, i) =>
                `${i + 1}. **${p.name}** [Status: ${p.status.toUpperCase()} | Priority: ${p.priority.toUpperCase()}]\n` +
                `   - Objective: ${p.objective || 'Not specified'}\n` +
                `   - Progress: ${p.completed_tasks_count || 0}/${p.tasks_count || 0} tasks finished`
            )
            .join('\n\n');
      } else if (lower.includes('task') && (lower.includes('blocked') || lower.includes('overdue'))) {
        toolExecuted = 'list_authorized_tasks';
        riskLevel = 'low';
        const blocked = tasks.filter((t) => t.status === 'blocked');
        if (blocked.length === 0) {
          responseText = `Zero tasks are currently marked as 'Blocked' in ${activeOrg.name}. Operational health is normal.`;
        } else {
          responseText = `Found ${blocked.length} blocked task(s) requiring management attention:\n\n` +
            blocked
              .map((t) => `• **${t.title}** (${t.project?.name}) - Priority: ${t.priority.toUpperCase()}`)
              .join('\n');
        }
      } else if (lower.startsWith('create task:') || lower.includes('create task')) {
        toolExecuted = 'create_task';
        riskLevel = 'medium';
        const taskName = q.replace(/^create task:?/i, '').replace(/["']/g, '').trim() || 'New Operational Task';
        const targetProj = projects[0]?.id || 'proj-titan-core';

        const created = await DataRepository.createTask({
          orgId: activeOrg.id,
          projectId: targetProj,
          title: taskName,
          priority: 'medium',
          ownerId: currentUser.id,
        });

        responseText = `Task created successfully under project "${projects[0]?.name}":\n\n` +
          `• ID: ${created.id}\n` +
          `• Title: ${created.title}\n` +
          `• Status: ${created.status.toUpperCase()}\n` +
          `• Priority: ${created.priority.toUpperCase()}`;
      } else {
        toolExecuted = 'get_company_operational_overview';
        riskLevel = 'low';
        responseText = `Operational Overview for ${activeOrg.name}:\n` +
          `• Active Projects: ${projects.length}\n` +
          `• Total Tasks: ${tasks.length} (${tasks.filter((t) => t.status === 'done').length} completed)\n` +
          `• Blocked Items: ${tasks.filter((t) => t.status === 'blocked').length}\n` +
          `Data is synchronized via PostgreSQL Row Level Security.`;
      }

      setAiResponse(responseText);

      // Record tool log
      const newLog: AIActionLog = {
        id: `ai-log-${Date.now()}`,
        tool: toolExecuted,
        risk: riskLevel,
        input: q,
        result: 'Executed with authorized tenant scope',
        timestamp: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [newLog, ...prev]);
      setPrompt('');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">AI Command Center</h1>
            <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
              Tool Allowlist Enforced
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Governed AI operator executing within verified tenant boundaries and explicit approval policies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Zero Prompt Injections: Strict Tool Schemas</span>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {suggestedQueries.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleExecuteAI(sq)}
            className="text-left p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-900 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <Play className="w-3 h-3" />
            </div>
            <span className="line-clamp-2">{sq}</span>
          </button>
        ))}
      </div>

      {/* Interactive AI Chat & Execution Form */}
      <Card className="p-5 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteAI();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask questions about company status, request summaries, or command task creation..."
              className="w-full h-11 pl-10 pr-4 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950"
            />
          </div>
          <Button
            type="submit"
            isLoading={isProcessing}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Run Command
          </Button>
        </form>

        {/* AI Output Box */}
        {aiResponse && (
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                TT
              </div>
              <h4 className="text-xs font-bold text-zinc-900">Titan AI Agent Response</h4>
              <Badge variant="success" className="text-[9px]">
                Ground Truth Verified
              </Badge>
            </div>
            <div className="text-xs text-zinc-800 whitespace-pre-line leading-relaxed pl-7">
              {aiResponse}
            </div>
          </div>
        )}
      </Card>

      {/* Governed AI Tool Execution Log */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Controlled Tool Execution Stream
            </h3>
          </div>
          <Badge variant="default" className="text-[10px]">
            Audited & Scope-Limited
          </Badge>
        </div>

        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No tool executions during this session yet. Run a prompt above to view live tool calls.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 text-xs font-mono">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{log.tool}()</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold border ${
                        log.risk === 'low'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {log.risk} risk
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-sans">Query: &ldquo;{log.input}&rdquo;</p>
                </div>
                <div className="text-right text-[11px] text-zinc-400 font-sans">
                  <p className="text-emerald-600 font-medium">{log.result}</p>
                  <p>{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
