'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { DataRepository } from '@/lib/data/repository';
import { OrganizationMembership, OrgRole, Profile } from '@/types/database';
import { ROLE_PERMISSIONS } from '@/types/rbac';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  KeyRound,
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
} from 'lucide-react';

export default function TeamPage() {
  const { activeOrg, currentUser, can, refreshTeamData, pendingApprovals } = useTenant();
  const [members, setMembers] = useState<OrganizationMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedRolePreview, setSelectedRolePreview] = useState<OrgRole | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<OrgRole>('developer');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadMembers() {
    setIsLoading(true);
    try {
      const data = await DataRepository.getMembershipsForOrg(activeOrg.id);
      setMembers(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, [activeOrg.id]);

  async function handleApproveUser(userId: string, roleToAssign: OrgRole) {
    await DataRepository.approveUser(userId, roleToAssign, currentUser.id);
    await refreshTeamData();
    await loadMembers();
  }

  async function handleRejectUser(userId: string) {
    await DataRepository.rejectUser(userId, currentUser.id);
    await refreshTeamData();
    await loadMembers();
  }

  async function handleInviteMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !fullName.trim()) {
      setFormError('Email and full name are required');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      await DataRepository.inviteMember({
        orgId: activeOrg.id,
        email: email.trim(),
        fullName: fullName.trim(),
        role,
        actorId: currentUser.id,
      });
      setEmail('');
      setFullName('');
      setRole('developer');
      setIsInviteOpen(false);
      await loadMembers();
      await refreshTeamData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(membershipId: string, newRole: OrgRole) {
    if (!can('org:manage_members')) {
      alert('You do not have permission to modify roles in this organization.');
      return;
    }
    await DataRepository.updateMemberRole(membershipId, newRole, currentUser.id);
    await loadMembers();
    await refreshTeamData();
  }

  // Filter members by hierarchy
  const adminOwner = members.find((m) => m.role === 'org_owner');
  const leads = members.filter((m) =>
    ['department_lead', 'research_lead', 'development_lead', 'org_admin'].includes(m.role)
  );
  const coreTeam = members.filter((m) =>
    ['developer', 'tester', 'researcher', 'production', 'viewer'].includes(m.role)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Team Hierarchy & Access Control
            </h1>
            <Badge variant="success" className="text-[10px] uppercase font-bold tracking-wider">
              RBAC Enforced
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Admin governance, Department Leads, Developer/Tester/Researcher/Production rosters.
          </p>
        </div>

        {can('org:manage_members') && (
          <Button
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsInviteOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </div>

      {/* PENDING APPROVALS QUEUE (Private Software Gate) */}
      <div id="approvals">
        {pendingApprovals.length > 0 && can('org:approve_users') && (
          <Card className="p-5 border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  New Account Requests Awaiting Admin Approval ({pendingApprovals.length})
                </h3>
              </div>
              <Badge variant="warning" className="text-[10px]">
                Private Gate Active
              </Badge>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Random sign-ups are blocked by default. Review identity and grant explicit system entry:
            </p>

            <div className="divide-y divide-amber-200 dark:divide-amber-900 bg-white dark:bg-zinc-900 rounded-lg border border-amber-200 dark:border-amber-900 overflow-hidden">
              {pendingApprovals.map((req) => (
                <div key={req.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{req.full_name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">{req.email}</p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                      Applied for: {req.requested_role?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 sm:pt-0">
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs py-1 h-8"
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleApproveUser(req.id, req.requested_role || 'developer')}
                    >
                      Approve
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
          </Card>
        )}
      </div>

      {/* 1. TOP "TAGDA" ADMIN PROFILE */}
      {adminOwner && (
        <Card className="p-6 border-zinc-900 dark:border-zinc-700 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 text-white shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-zinc-950 flex items-center justify-center font-extrabold text-xl shadow-lg">
                <Crown className="w-8 h-8 text-zinc-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-zinc-950">
                    Supreme Admin & Founder (Tagda)
                  </span>
                  <span className="text-[10px] text-zinc-400">Master Authority</span>
                </div>
                <h2 className="text-lg font-extrabold mt-1">{adminOwner.user?.full_name}</h2>
                <p className="text-xs text-zinc-400">{adminOwner.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-xs text-zinc-400">
                <p className="font-semibold text-emerald-400">● 100% Platform Access</p>
                <p>All 31 Permissions Granted</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 2. LEADS TIER (Department, Research & Dev Leads) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Leadership & Department Heads ({leads.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <Card key={lead.id} className="p-4 space-y-2 hover:border-zinc-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{lead.user?.full_name}</h4>
                  <p className="text-[10px] text-zinc-400">{lead.user?.email}</p>
                </div>
                <Badge variant="info" className="text-[9px] uppercase font-bold">
                  {lead.role.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-500">
                Directs operational workflows, approves submissions, and leads strategy.
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. CORE FUNCTIONAL ROSTERS (Dev, Tester, Researcher, Production) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Core Execution Squad ({coreTeam.length})
          </h3>
          <span className="text-[11px] text-zinc-500">Developer • Tester • Researcher • Production (Meta-Ads)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coreTeam.map((mem) => {
            const getIcon = () => {
              if (mem.role === 'developer') return <Code2 className="w-4 h-4 text-blue-600" />;
              if (mem.role === 'tester') return <Bug className="w-4 h-4 text-rose-600" />;
              if (mem.role === 'researcher') return <FlaskConical className="w-4 h-4 text-purple-600" />;
              if (mem.role === 'production') return <Palette className="w-4 h-4 text-emerald-600" />;
              return <Users className="w-4 h-4 text-zinc-600" />;
            };

            const getRoleLabel = () => {
              if (mem.role === 'production') return 'Production (Meta-Ads)';
              if (mem.role === 'tester') return 'Tester & QA';
              if (mem.role === 'researcher') return 'Researcher (Inventor)';
              return mem.role.replace('_', ' ');
            };

            return (
              <Card key={mem.id} className="p-4 space-y-3 hover:border-zinc-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">{getIcon()}</div>
                  <Badge variant="default" className="text-[9px] capitalize">
                    {getRoleLabel()}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{mem.user?.full_name}</h4>
                  <p className="text-[10px] text-zinc-400">{mem.user?.email}</p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-600 font-semibold">Active Member</span>
                  <span className="text-zinc-400">{formatDate(mem.created_at)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite New Team Member"
        description="Add a member with pre-configured role assignments."
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email Address *"
            placeholder="alex.morgan@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
            >
              <option value="developer">Developer</option>
              <option value="tester">Tester & QA</option>
              <option value="researcher">Researcher</option>
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
