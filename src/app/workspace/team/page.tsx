'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import {
  OrganizationMembership,
  OrgRole,
  UserInvention,
  SquadPeerProfile,
  Project,
} from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  ShieldCheck,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Code2,
  Bug,
  FlaskConical,
  Palette,
  Briefcase,
  Star,
  Award,
  Coins,
  Send,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export default function TeamPage() {
  const { activeOrg, currentUser, can, refreshTeamData, pendingApprovals } = useTenant();
  const [activeTab, setActiveTab] = useState<'self' | 'peers' | 'approvals'>('self');

  // State
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [inventions, setInventions] = useState<UserInvention[]>([]);
  const [peers, setPeers] = useState<SquadPeerProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isPitchInventionOpen, setIsPitchInventionOpen] = useState(false);
  const [selectedPeerDossier, setSelectedPeerDossier] = useState<SquadPeerProfile | null>(null);

  // Form State: Invite Member
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFullName, setInviteFullName] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('developer');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Pitch Invention
  const [inventionTitle, setInventionTitle] = useState('');
  const [inventionDescription, setInventionDescription] = useState('');
  const [estimatedRevenue, setEstimatedRevenue] = useState('35000');

  async function loadData() {
    setIsLoading(true);
    try {
      const [mData, invData, peersData, pData] = await Promise.all([
        DataRepository.getMembershipsForOrg(activeOrg.id),
        DataRepository.getUserInventions(currentUser?.id),
        DataRepository.getSquadPeerProfiles(),
        DataRepository.getProjects(activeOrg.id),
      ]);
      setMembers(mData);
      setInventions(invData);
      setPeers(peersData);
      setProjects(pData);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeOrg.id, currentUser?.id]);

  async function handleApproveUser(userId: string, roleToAssign: OrgRole) {
    await DataRepository.approveUser(userId, roleToAssign, currentUser.id);
    await refreshTeamData();
    await loadData();
  }

  async function handleRejectUser(userId: string) {
    await DataRepository.rejectUser(userId, currentUser.id);
    await refreshTeamData();
    await loadData();
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteFullName.trim()) {
      setFormError('Email and full name are required');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await DataRepository.inviteMember({
        orgId: activeOrg.id,
        email: inviteEmail.trim(),
        fullName: inviteFullName.trim(),
        role: inviteRole,
        actorId: currentUser.id,
      });
      setInviteEmail('');
      setInviteFullName('');
      setIsInviteOpen(false);
      await loadData();
      await refreshTeamData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePitchInvention(e: React.FormEvent) {
    e.preventDefault();
    if (!inventionTitle.trim() || !inventionDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await DataRepository.createInvention({
        userId: currentUser.id,
        title: inventionTitle.trim(),
        description: inventionDescription.trim(),
        estimatedRevenue: parseFloat(estimatedRevenue) || 30000,
      });
      setInventionTitle('');
      setInventionDescription('');
      setIsPitchInventionOpen(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClaimPayout(invId: string) {
    await DataRepository.claimRoyaltyPayout(invId, 5000);
    await loadData();
    alert('Royalty payout claim processed! 50% patent revenue transferred to member account.');
  }

  // Self stats
  const totalEarnedRoyalties = inventions.reduce((acc, inv) => acc + inv.earnedPayout, 0);
  const totalClaimedRoyalties = inventions.reduce((acc, inv) => acc + inv.claimedPayout, 0);
  const availablePayout = totalEarnedRoyalties - totalClaimedRoyalties;

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              User Intelligence & Squad Dossiers
            </h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              50% Royalty Enforced
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Personal patent portfolios, squad reputation stars, invention registries, and access governance for {activeOrg.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can('org:manage_members') && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => setIsInviteOpen(true)}
            >
              Invite Member
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => setIsPitchInventionOpen(true)}
          >
            Pitch Patent Idea
          </Button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('self')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'self'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>My Dossier & 50% Inventions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-extrabold">
            {inventions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('peers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'peers'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
          }`}
        >
          <Users className="w-4 h-4 text-blue-500" />
          <span>Squad Hall of Fame & Peer Profiles</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-500 font-extrabold">
            {peers.length}
          </span>
        </button>

        {can('org:approve_users') && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Access Approvals Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-500 font-extrabold animate-pulse">
                {pendingApprovals.length} New
              </span>
            )}
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* 👤 TAB 1: SELF IDENTITY & 50% PATENT INVENTIONS           */}
      {/* ======================================================== */}
      {activeTab === 'self' && (
        <div className="space-y-6">
          {/* Identity Header Card */}
          <Card className="p-6 border-zinc-200/90 dark:border-zinc-800/90 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-black text-2xl shadow-xl ring-2 ring-amber-300/40 shrink-0">
                  {currentUser?.full_name?.split(' ').map((n) => n[0]).join('') || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-zinc-950">
                      {currentUser?.is_platform_admin ? 'Supreme Admin' : currentUser?.requested_role?.replace('_', ' ') || 'Inventor'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      ● Clearance Level Alpha
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1">{currentUser?.full_name}</h2>
                  <p className="text-xs text-zinc-400">{currentUser?.email}</p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Total Royalty Earned</p>
                  <p className="text-base font-extrabold text-amber-400">${totalEarnedRoyalties.toLocaleString()}</p>
                  <span className="text-[9px] text-emerald-400">50% Gross Share</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Available Payout</p>
                  <p className="text-base font-extrabold text-emerald-400">${availablePayout.toLocaleString()}</p>
                  <span className="text-[9px] text-zinc-400">Ready to Claim</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center col-span-2 sm:col-span-1">
                  <p className="text-[10px] uppercase font-bold text-zinc-400">Reputation Rating</p>
                  <p className="text-base font-extrabold text-white flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>5.0</span>
                  </p>
                  <span className="text-[9px] text-zinc-400">Top 1% Contributor</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 50% Patent Royalty Lock-in Portfolio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>My 50% Patent Royalty Inventions ({inventions.length})</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  6-Month lock-in guarantee: 50% of all gross AdSense and membership revenue credited directly to inventor.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                onClick={() => setIsPitchInventionOpen(true)}
              >
                + Register New Patent
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventions.map((inv) => (
                <Card
                  key={inv.id}
                  className="p-5 border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 space-y-3.5 glow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                          {inv.patentNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          50% Royalty Active
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-950 dark:text-zinc-100">{inv.title}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                        ${inv.earnedPayout.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-400">My 50% Pool</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {inv.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    <div className="text-[10px] text-zinc-400">
                      <span>Filing: <strong>{formatDate(inv.filingDate)}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Lock-in: <strong>{formatDate(inv.lockinExpiry)}</strong></span>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      className="text-xs py-1 h-7 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                      onClick={() => handleClaimPayout(inv.id)}
                    >
                      Claim Royalty Payout
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* My Assigned Initiatives */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Initiatives In My Pipeline Custody ({projects.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects.map((p) => (
                <Card key={p.id} className="p-4 space-y-2 border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{p.name}</h4>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {p.objective || p.description}
                  </p>
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
                    <span>Priority: <strong className="uppercase text-zinc-700 dark:text-zinc-300">{p.priority}</strong></span>
                    <span>Deadline: {formatDate(p.deadline)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 TAB 2: SQUAD HALL OF FAME & PEER PROFILES             */}
      {/* ======================================================== */}
      {activeTab === 'peers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Squad Hall of Fame & Contributor Intelligence
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Inspect peer contributions, star reputation scores, patent filings, and velocity metrics across all squads.
              </p>
            </div>
            <span className="text-xs font-bold text-zinc-500">
              Total Squad Roster: {peers.length} Engineers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {peers.map((peer) => (
              <Card
                key={peer.id}
                className="p-5 border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/90 space-y-4 glow-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header: Avatar, Name, Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${peer.color} text-white flex items-center justify-center font-black text-base shadow-md ring-1 ring-zinc-700/30 shrink-0`}
                      >
                        {peer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-950 dark:text-zinc-50 truncate max-w-[150px]">
                          {peer.fullName}
                        </h4>
                        <p className="text-[10px] text-zinc-400 font-medium truncate">{peer.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-2 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {peer.squad}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-xs font-black">{peer.reputationStars}</span>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                    {peer.bio}
                  </p>

                  {/* Patents Badge */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Award className="w-3 h-3" /> Patents Registered:
                      </span>
                      <strong className="text-zinc-900 dark:text-zinc-100">{peer.patentsCount} Inventions</strong>
                    </div>
                    <p className="text-[11px] text-zinc-700 dark:text-zinc-300 truncate font-medium">
                      {peer.patents.join(' • ')}
                    </p>
                  </div>

                  {/* Skills Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {peer.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Tasks done + Inspect Dossier Button */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs mt-2">
                  <div className="text-[10px] text-zinc-400">
                    <span>Delivered: <strong className="text-zinc-800 dark:text-zinc-200">{peer.tasksDone} Units</strong></span>
                    <span className="mx-1.5">•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{peer.efficiencyScore}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] py-1 h-7 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                    onClick={() => setSelectedPeerDossier(peer)}
                  >
                    View Dossier →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔒 TAB 3: ACCESS APPROVALS QUEUE (Private Gate)          */}
      {/* ======================================================== */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <Card className="p-5 border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    Private Gate: Candidate Access Requests ({pendingApprovals.length})
                  </h3>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Random external sign-ups cannot enter workspace without Supreme Admin explicit verification.
                  </p>
                </div>
              </div>
              <Badge variant="warning" className="text-[10px] uppercase font-bold">
                Private Gate Active
              </Badge>
            </div>

            {pendingApprovals.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                Zero candidate accounts awaiting clearance. All members verified.
              </p>
            ) : (
              <div className="divide-y divide-amber-200 dark:divide-amber-900 bg-white dark:bg-zinc-900 rounded-xl border border-amber-200 dark:border-amber-900 overflow-hidden">
                {pendingApprovals.map((req) => (
                  <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{req.full_name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{req.email}</p>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                        Requested Clearance: {req.requested_role?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 h-8"
                        leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleApproveUser(req.id, req.requested_role || 'developer')}
                      >
                        Approve Clearance
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="text-xs py-1 h-8"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                        onClick={() => handleRejectUser(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🚀 MODAL: PITCH PATENT INVENTIONS                        */}
      {/* ======================================================== */}
      <Modal
        isOpen={isPitchInventionOpen}
        onClose={() => setIsPitchInventionOpen(false)}
        title="Register 50% Patent Royalty Invention"
        description="Submit your innovation into the Titan Operating System 6-month lock-in royalty pool."
      >
        <form onSubmit={handlePitchInvention} className="space-y-4">
          <Input
            label="Invention / Algorithm Title *"
            placeholder="e.g. Distributed Memory Buffer for Turbopack AST"
            value={inventionTitle}
            onChange={(e) => setInventionTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Technical Description & IP Claim *
            </label>
            <textarea
              value={inventionDescription}
              onChange={(e) => setInventionDescription(e.target.value)}
              placeholder="Describe what unique technical innovation this invention introduces..."
              required
              rows={3}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <Input
            type="number"
            label="Estimated Annual Gross Revenue ($)"
            placeholder="35000"
            value={estimatedRevenue}
            onChange={(e) => setEstimatedRevenue(e.target.value)}
          />

          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 space-y-1">
            <p className="font-bold">⚖️ 50% 6-Month Lock-in Terms:</p>
            <p>
              By submitting this patent registration, 50% of all gross programmatic and enterprise revenues generated by this tool are legally bound to your profile for 6 continuous months.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPitchInventionOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
              leftIcon={<Award className="w-3.5 h-3.5" />}
            >
              Register Patent
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* 🔍 MODAL: PEER FULL DOSSIER INSPECTOR                   */}
      {/* ======================================================== */}
      {selectedPeerDossier && (
        <Modal
          isOpen={Boolean(selectedPeerDossier)}
          onClose={() => setSelectedPeerDossier(null)}
          title={`Squad Contributor Dossier: ${selectedPeerDossier.fullName}`}
          description={`Comprehensive operational profile and verified patent claims.`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div
                className={`h-12 w-12 rounded-xl bg-gradient-to-br ${selectedPeerDossier.color} text-white flex items-center justify-center font-bold text-sm shrink-0`}
              >
                {selectedPeerDossier.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{selectedPeerDossier.fullName}</h4>
                <p className="text-[10px] text-zinc-400">{selectedPeerDossier.email}</p>
                <span className="text-[9px] font-extrabold uppercase text-amber-600 dark:text-amber-400">
                  {selectedPeerDossier.squad}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Technical Biography</p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {selectedPeerDossier.bio}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Registered Patents & IP</p>
              <div className="space-y-1.5">
                {selectedPeerDossier.patents.map((pat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center justify-between"
                  >
                    <span>{pat}</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-200 dark:bg-purple-900">
                      50% Pool Active
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Reputation Rating</p>
                <p className="text-sm font-black text-amber-500">⭐ {selectedPeerDossier.reputationStars} / 5.0</p>
              </div>
              <div className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <p className="text-[10px] uppercase font-bold text-zinc-400">Sprint Efficiency</p>
                <p className="text-sm font-black text-emerald-500">{selectedPeerDossier.efficiencyScore}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedPeerDossier(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* ✉️ MODAL: INVITE MEMBER                                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Squad Member"
        description="Add a member with clearance roles to this organization."
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <Input
            label="Full Name *"
            placeholder="e.g. Alex Morgan"
            value={inviteFullName}
            onChange={(e) => setInviteFullName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email Address *"
            placeholder="alex.morgan@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Assigned Role Clearance
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as OrgRole)}
              className="h-10 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="developer">Developer Squad</option>
              <option value="tester">User Testing & QA</option>
              <option value="researcher">Researcher (Patent Inventor)</option>
              <option value="production">Production (Meta-Ads / Growth)</option>
              <option value="development_lead">Development Lead</option>
              <option value="research_lead">Research Lead</option>
              <option value="department_lead">Department Lead</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
