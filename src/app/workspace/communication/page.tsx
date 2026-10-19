'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { BroadcastMessage } from '@/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDateTime, formatDate } from '@/lib/utils';
import {
  Radio,
  AlertTriangle,
  Bell,
  Send,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Flame,
  Award,
  Filter,
} from 'lucide-react';

export default function CommunicationPage() {
  const { activeOrg, currentUser, can } = useTenant();
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [urgency, setUrgency] = useState<BroadcastMessage['urgency']>('critical');
  const [targetSquad, setTargetSquad] = useState<BroadcastMessage['targetSquad']>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBroadcasts() {
    setIsLoading(true);
    try {
      const data = await DataRepository.getBroadcastMessages(activeOrg.id);
      setBroadcasts(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBroadcasts();
  }, [activeOrg.id]);

  async function handleCreateBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await DataRepository.createBroadcastMessage({
        orgId: activeOrg.id,
        title: title.trim(),
        content: content.trim(),
        senderName: currentUser.full_name,
        senderRole: currentUser.is_platform_admin ? 'Supreme Admin' : currentUser.requested_role?.replace('_', ' ') || 'Squad Lead',
        urgency,
        targetSquad,
      });

      setTitle('');
      setContent('');
      setIsBroadcastModalOpen(false);
      await loadBroadcasts();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAcknowledge(bcastId: string) {
    await DataRepository.acknowledgeBroadcast(bcastId, currentUser.id);
    await loadBroadcasts();
  }

  const criticalBroadcast = broadcasts.find((b) => b.urgency === 'critical');

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (filterUrgency === 'all') return true;
    return b.urgency === filterUrgency;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Broadcast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              Broadcasting Hub & Emergency Dispatch
            </h1>
            <Badge variant="danger" className="text-[10px] uppercase font-bold tracking-wider animate-pulse">
              Live Feed
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Company-wide emergency red alerts, patent submission windows, and priority squad communications for {activeOrg.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="danger"
            className="bg-rose-600 hover:bg-rose-500 font-bold"
            leftIcon={<Radio className="w-3.5 h-3.5 animate-pulse" />}
            onClick={() => setIsBroadcastModalOpen(true)}
          >
            Transmit Priority Broadcast
          </Button>
        </div>
      </div>

      {/* 🚨 CRITICAL RED ALERT HERO BANNER (If active) */}
      {criticalBroadcast && (
        <Card className="p-5 border-2 border-rose-500 bg-gradient-to-r from-rose-950 via-zinc-950 to-zinc-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-600/30 border border-rose-500/50 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                    FLASH RED ALERT
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Transmitted by {criticalBroadcast.senderName} ({criticalBroadcast.senderRole})
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-white">{criticalBroadcast.title}</h2>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
                  {criticalBroadcast.content}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <span className="text-[10px] text-zinc-400 font-mono">
                {formatDateTime(criticalBroadcast.createdAt)}
              </span>
              <Button
                size="sm"
                variant="primary"
                className={`text-xs py-1 h-8 ${
                  criticalBroadcast.acknowledgedBy.includes(currentUser.id)
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-white text-zinc-950 hover:bg-zinc-200 font-bold'
                }`}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleAcknowledge(criticalBroadcast.id)}
              >
                {criticalBroadcast.acknowledgedBy.includes(currentUser.id)
                  ? 'Transmission Acknowledged'
                  : 'Acknowledge Alert'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/50">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mr-1">Urgency:</span>
          {[
            { id: 'all', label: 'All Transmissions' },
            { id: 'critical', label: '🔴 Critical Alerts' },
            { id: 'high', label: '🟠 High Priority' },
            { id: 'patent_window', label: '🟣 Patent Windows' },
            { id: 'normal', label: '🔵 Routine' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterUrgency(item.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterUrgency === item.id
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-zinc-400">
          Showing {filteredBroadcasts.length} broadcasts
        </span>
      </div>

      {/* Broadcast Transmissions Feed */}
      <div className="space-y-3.5">
        {filteredBroadcasts.map((bcast) => {
          const isAcked = bcast.acknowledgedBy.includes(currentUser.id);

          const getUrgencyStyles = () => {
            switch (bcast.urgency) {
              case 'critical':
                return {
                  border: 'border-rose-300 dark:border-rose-900/80',
                  badge: 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800',
                  icon: <Flame className="w-4 h-4 text-rose-600" />,
                  label: 'CRITICAL ALERT',
                };
              case 'high':
                return {
                  border: 'border-amber-300 dark:border-amber-900/80',
                  badge: 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
                  icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
                  label: 'HIGH PRIORITY',
                };
              case 'patent_window':
                return {
                  border: 'border-purple-300 dark:border-purple-900/80',
                  badge: 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
                  icon: <Award className="w-4 h-4 text-purple-600" />,
                  label: '50% PATENT WINDOW',
                };
              case 'normal':
              default:
                return {
                  border: 'border-blue-300 dark:border-blue-900/80',
                  badge: 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
                  icon: <Bell className="w-4 h-4 text-blue-600" />,
                  label: 'OPERATIONAL BULLETIN',
                };
            }
          };

          const urgencyConfig = getUrgencyStyles();

          return (
            <Card
              key={bcast.id}
              className={`p-5 space-y-3 border ${urgencyConfig.border} bg-white dark:bg-zinc-900/90 glow-card transition-all`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border flex items-center gap-1 ${urgencyConfig.badge}`}>
                      {urgencyConfig.icon}
                      {urgencyConfig.label}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                      Target: {bcast.targetSquad.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 mt-1">{bcast.title}</h3>
                  <p className="text-[11px] text-zinc-400">
                    Transmitted by <strong className="text-zinc-700 dark:text-zinc-300">{bcast.senderName}</strong> ({bcast.senderRole}) • {formatDateTime(bcast.createdAt)}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {bcast.acknowledgedBy.length} Acknowledged
                  </span>
                  <Button
                    size="sm"
                    variant={isAcked ? 'outline' : 'primary'}
                    className={`text-xs py-1 h-7 ${isAcked ? 'text-emerald-600 border-emerald-300 dark:border-emerald-800' : ''}`}
                    onClick={() => handleAcknowledge(bcast.id)}
                  >
                    {isAcked ? '✓ Acknowledged' : 'Acknowledge'}
                  </Button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {bcast.content}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Transmit Priority Company Broadcast"
        description="Issue an emergency alert or critical milestone notice across all squad nodes."
      >
        <form onSubmit={handleCreateBroadcast} className="space-y-4">
          <Input
            label="Broadcast Title *"
            placeholder="e.g. RED ALERT: Mandatory Turbopack Optimization Sprint"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Urgency Level *
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as BroadcastMessage['urgency'])}
                className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="critical">🔴 Critical Alert (Red Flash)</option>
                <option value="high">🟠 High Priority Urgent</option>
                <option value="patent_window">🟣 50% Patent Window Notice</option>
                <option value="normal">🔵 Routine Bulletin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Target Audience *
              </label>
              <select
                value={targetSquad}
                onChange={(e) => setTargetSquad(e.target.value as BroadcastMessage['targetSquad'])}
                className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              >
                <option value="all">All Squad Nodes (Company-Wide)</option>
                <option value="developers">Developers Only</option>
                <option value="white_coders">White Coders Squad</option>
                <option value="research">Research & Patent Lab</option>
                <option value="qa">User Testing & QA</option>
                <option value="production">Production & Meta-Ads</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Broadcast Message Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="State the instructions, urgency, and expected actions for the squads..."
              required
              rows={4}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold"
              leftIcon={<Radio className="w-3.5 h-3.5" />}
            >
              Transmit Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
