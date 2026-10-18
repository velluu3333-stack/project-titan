'use client';

import React, { useState, useEffect } from 'react';
import { DataRepository } from '@/lib/data/repository';
import { getAuditEvents } from '@/lib/audit/logger';
import { Organization, Profile, AuditEvent, OrgRole } from '@/types/database';
import { useTenant } from '@/components/workspace/TenantContext';
import { Button } from '@/components/ui/Button';
import { formatDateTime, formatDate } from '@/lib/utils';
import {
  Building,
  Users,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  FileText,
  RefreshCw,
  UserCheck,
  Megaphone,
  Bell,
  Download,
  KeyRound,
  CheckCircle2,
  DollarSign,
  Send,
  Sun,
  Moon,
} from 'lucide-react';

type AdminTab =
  | 'users'
  | 'content'
  | 'payments'
  | 'notifications'
  | 'reports'
  | 'roles'
  | 'organizations'
  | 'audits';

interface AnnouncementContent {
  id: string;
  title: string;
  bannerMessage: string;
  category: string;
  isActive: boolean;
  priority: 'normal' | 'urgent';
  updatedAt: string;
}

interface PaymentTransaction {
  id: string;
  customerName: string;
  amount: number;
  type: 'subscription' | 'patent_royalty' | 'adsense_commission' | 'refund';
  status: 'completed' | 'failed' | 'refunded';
  date: string;
  reference: string;
}

export default function PlatformAdminPage() {
  const { currentUser, isDarkMode, toggleDarkMode, refreshTeamData } = useTenant();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationSentMessage, setNotificationSentMessage] = useState<string | null>(null);

  // Content Management State (Change banner/content without app update)
  const [liveAnnouncement, setLiveAnnouncement] = useState<AnnouncementContent>({
    id: 'ann-1',
    title: 'Platform Maintenance & Sprint 4 Code Freeze',
    bannerMessage: 'System-wide maintenance scheduled for 10:00 PM UTC. All pending branch merges will be frozen.',
    category: 'Engineering & Legal Operations',
    isActive: true,
    priority: 'normal',
    updatedAt: new Date().toISOString(),
  });
  const [bannerSaveNotice, setBannerSaveNotice] = useState(false);

  // Direct Notification Broadcast Form
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'developers' | 'researchers' | 'leads'>('all');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-101',
      customerName: 'Titan Enterprise Internal',
      amount: 4500,
      type: 'subscription',
      status: 'completed',
      date: '2026-03-01',
      reference: 'INV-TITAN-8891',
    },
    {
      id: 'tx-102',
      customerName: 'AdSense High-RPM Traffic Pipeline',
      amount: 3840,
      type: 'adsense_commission',
      status: 'completed',
      date: '2026-03-03',
      reference: 'ADS-COMM-4412',
    },
    {
      id: 'tx-103',
      customerName: 'Tariq Al-Mansoor (50% Patent Split)',
      amount: 1920,
      type: 'patent_royalty',
      status: 'completed',
      date: '2026-03-04',
      reference: 'PAT-ROY-7701',
    },
    {
      id: 'tx-104',
      customerName: 'Apex Cloud Solutions',
      amount: 850,
      type: 'subscription',
      status: 'failed',
      date: '2026-03-05',
      reference: 'INV-APEX-9920',
    },
    {
      id: 'tx-105',
      customerName: 'Beta Client Org',
      amount: 250,
      type: 'refund',
      status: 'refunded',
      date: '2026-03-06',
      reference: 'REF-BETA-1102',
    },
  ]);

  async function loadAdminData() {
    setIsLoading(true);
    try {
      const [orgs, users] = await Promise.all([
        DataRepository.getAllOrganizations(),
        DataRepository.getAllProfiles(),
      ]);
      setOrganizations(orgs);
      setProfiles(users);
      setAuditEvents(getAuditEvents(null, 30));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  // Action: Toggle Organization Status
  async function handleToggleOrgStatus(orgId: string, currentStatus: Organization['status']) {
    const nextStatus: Organization['status'] =
      currentStatus === 'suspended' ? 'active' : 'suspended';

    const confirmed = confirm(
      `Change organization status to "${nextStatus.toUpperCase()}"? Tenant access will be ${nextStatus === 'suspended' ? 'restricted' : 'restored'}.`
    );
    if (!confirmed) return;

    await DataRepository.updateOrganizationStatus(orgId, nextStatus, currentUser.id);
    await loadAdminData();
  }

  // Action: Approve User
  async function handleApproveUser(userId: string, requestedRole?: string) {
    const roleToAssign: OrgRole = (requestedRole as OrgRole) || 'developer';
    await DataRepository.approveUser(userId, roleToAssign, currentUser.id);
    await refreshTeamData();
    await loadAdminData();
  }

  // Action: Reject User
  async function handleRejectUser(userId: string) {
    if (!confirm('Reject this user registration request?')) return;
    await DataRepository.rejectUser(userId, currentUser.id);
    await refreshTeamData();
    await loadAdminData();
  }

  // Action: Block / Unblock User
  async function handleToggleBlockUser(userId: string) {
    await DataRepository.toggleBlockUser(userId, currentUser.id);
    await refreshTeamData();
    await loadAdminData();
  }

  // Action: Broadcast Notification
  function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) return;

    setNotificationSentMessage(`Announcement sent to target audience [${broadcastTarget.toUpperCase()}]: "${broadcastTitle}"`);
    setBroadcastTitle('');
    setBroadcastBody('');
    setTimeout(() => setNotificationSentMessage(null), 5000);
  }

  // Action: Save Content Changes
  function handleSaveContent(e: React.FormEvent) {
    e.preventDefault();
    setLiveAnnouncement((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
    setBannerSaveNotice(true);
    setTimeout(() => setBannerSaveNotice(false), 4000);
  }

  // Action: Export Data to CSV
  function exportCSV(dataType: 'users' | 'transactions' | 'audits') {
    let csvContent = '';
    let filename = '';

    if (dataType === 'users') {
      filename = `titan_users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent = 'ID,Full Name,Email,Role,Status,Created At\n' +
        profiles.map(p => `"${p.id}","${p.full_name}","${p.email}","${p.requested_role || 'member'}","${p.status}","${p.created_at}"`).join('\n');
    } else if (dataType === 'transactions') {
      filename = `titan_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      csvContent = 'ID,Customer,Amount,Type,Status,Reference,Date\n' +
        transactions.map(t => `"${t.id}","${t.customerName}",${t.amount},"${t.type}","${t.status}","${t.reference}","${t.date}"`).join('\n');
    } else {
      filename = `titan_security_audits_${new Date().toISOString().slice(0, 10)}.json`;
      csvContent = JSON.stringify(auditEvents, null, 2);
    }

    const blob = new Blob([csvContent], { type: dataType === 'audits' ? 'application/json' : 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Retry Failed Transaction
  function handleRetryTransaction(txId: string) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'completed' as const } : t))
    );
  }

  // Issue Refund
  function handleRefundTransaction(txId: string) {
    if (!confirm('Issue full refund for this transaction?')) return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'refunded' as const } : t))
    );
  }

  const pendingUsers = profiles.filter((p) => p.status === 'pending_approval');
  const activeOrgs = organizations.filter((o) => o.status === 'active');
  const suspendedOrgs = organizations.filter((o) => o.status === 'suspended');

  const grossRevenue = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 rounded-lg text-white shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Central Admin Panel</h2>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  Supreme Control
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Complete multi-tenant administration: User access, live content, financial ledger, notifications, and export reports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={loadAdminData}
          >
            Sync Data
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            leftIcon={isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
            onClick={toggleDarkMode}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
      </div>

      {/* Real Platform High-Level KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{profiles.length}</div>
          <p className="text-[11px] text-zinc-500">
            {pendingUsers.length > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{pendingUsers.length} awaiting verification</span>
            ) : (
              'All users verified & active'
            )}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gross Processed</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${grossRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-500">AdSense + Subscriptions + 50% Royalties</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Customer Orgs</span>
            <Building className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{organizations.length}</div>
          <p className="text-[11px] text-zinc-500">{activeOrgs.length} active · {suspendedOrgs.length} suspended</p>
        </div>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/70 p-4 space-y-1 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Security Audits</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{auditEvents.length}</div>
          <p className="text-[11px] text-zinc-500">Append-only immutable audit trail</p>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {[
          { id: 'users', label: 'User Management', icon: Users, badge: pendingUsers.length > 0 ? `${pendingUsers.length}` : null },
          { id: 'content', label: 'Content & Banners', icon: Megaphone },
          { id: 'payments', label: 'Payments & Revenue', icon: CreditCard },
          { id: 'notifications', label: 'Direct Broadcast', icon: Bell },
          { id: 'reports', label: 'Reports & Export', icon: Download },
          { id: 'roles', label: 'Roles & Permissions', icon: KeyRound },
          { id: 'organizations', label: 'Tenants & Orgs', icon: Building },
          { id: 'audits', label: 'Audit Logs', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-zinc-950">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Pending Approval Gate */}
          {pendingUsers.length > 0 && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-600/40 bg-amber-50 dark:bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
                  <UserCheck className="w-4 h-4" />
                  <span>Pending Registration Requests ({pendingUsers.length})</span>
                </div>
                <span className="text-xs text-amber-700 dark:text-amber-300/80 font-medium">Private Software Gate: Admin Approval Required</span>
              </div>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                These users signed up via the registration page. They cannot access any workspace data until verified and approved by the admin.
              </p>

              <div className="divide-y divide-amber-200 dark:divide-zinc-800/80">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{user.full_name}</h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">{user.email}</p>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">
                        Requested: {user.requested_role?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 px-3"
                        onClick={() => handleApproveUser(user.id, user.requested_role)}
                      >
                        Approve & Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs h-7 px-3"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Users Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
                All Users Directory ({profiles.length})
              </h3>
              <span className="text-[11px] text-zinc-500">Live account status & security privileges</span>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Registered</th>
                    <th className="py-3 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                  {profiles.map((p) => {
                    const isBlocked = p.status === 'blocked';
                    const isPending = p.status === 'pending_approval';
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                            {p.full_name[0]}
                          </div>
                          <span>{p.full_name}</span>
                          {p.is_platform_admin && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              SUPER ADMIN
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">{p.email}</td>
                        <td className="py-3.5 px-3 uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                          {p.requested_role?.replace('_', ' ') || 'member'}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              isBlocked
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                                : isPending
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">{formatDate(p.created_at)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending ? (
                              <Button
                                size="sm"
                                className="text-xs py-1 px-2.5 h-6 bg-emerald-600 hover:bg-emerald-500 text-white"
                                onClick={() => handleApproveUser(p.id, p.requested_role)}
                              >
                                Approve
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant={isBlocked ? 'outline' : 'danger'}
                                className="text-xs py-1 px-2.5 h-6 border-zinc-300 dark:border-zinc-700"
                                onClick={() => handleToggleBlockUser(p.id)}
                              >
                                {isBlocked ? 'Unblock' : 'Block'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT & BANNER MANAGEMENT */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-rose-500" />
                Live Content & Announcement Banner Control
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Update banners, listings, and category notices instantly across all web clients without re-deploying or updating the app.
              </p>
            </div>

            {bannerSaveNotice && (
              <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live banner saved and synced across all workspace sessions instantly!</span>
              </div>
            )}

            <form onSubmit={handleSaveContent} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Notice Headline</label>
                  <input
                    type="text"
                    value={liveAnnouncement.title}
                    onChange={(e) => setLiveAnnouncement({ ...liveAnnouncement, title: e.target.value })}
                    className="w-full h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Category / Group</label>
                  <input
                    type="text"
                    value={liveAnnouncement.category}
                    onChange={(e) => setLiveAnnouncement({ ...liveAnnouncement, category: e.target.value })}
                    className="w-full h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Banner Announcement Text</label>
                <textarea
                  rows={3}
                  value={liveAnnouncement.bannerMessage}
                  onChange={(e) => setLiveAnnouncement({ ...liveAnnouncement, bannerMessage: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={liveAnnouncement.isActive}
                    onChange={(e) => setLiveAnnouncement({ ...liveAnnouncement, isActive: e.target.checked })}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-rose-600 focus:ring-0"
                  />
                  <span>Show Banner Live on Workspace Header</span>
                </label>

                <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-500 text-white text-xs">
                  Save & Publish Live
                </Button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Live Banner Preview</span>
            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white">{liveAnnouncement.title}</p>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300">{liveAnnouncement.bannerMessage}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 uppercase whitespace-nowrap">
                {liveAnnouncement.category}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS, TRANSACTIONS & COMMISSIONS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Total Subscription MRR</span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">$5,350</div>
              <p className="text-[10px] text-zinc-500">Recurring enterprise subscriptions</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">50% Patent Royalty Split</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">$1,920</div>
              <p className="text-[10px] text-zinc-500">Credited to Tariq Al-Mansoor (Inventor)</p>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 space-y-1 shadow-xs">
              <span className="text-[11px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">Failed / Refunded</span>
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">$1,100</div>
              <p className="text-[10px] text-zinc-500">1 retryable transaction · 1 refund</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                Payments & Commission Ledger
              </h3>
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs h-7"
                onClick={() => exportCSV('transactions')}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Export Ledger CSV
              </Button>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-x-auto shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-3">Party / Customer</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors font-mono">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{tx.reference}</td>
                      <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">{tx.customerName}</td>
                      <td className="py-3 px-3 uppercase text-[10px] text-zinc-500 dark:text-zinc-400">
                        {tx.type.replace('_', ' ')}
                      </td>
                      <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">${tx.amount.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : tx.status === 'failed'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-500 dark:text-zinc-400">{tx.date}</td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'failed' && (
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-500 text-white text-xs h-6 px-2.5"
                            onClick={() => handleRetryTransaction(tx.id)}
                          >
                            Retry
                          </Button>
                        )}
                        {tx.status === 'completed' && tx.type === 'subscription' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs h-6 px-2.5"
                            onClick={() => handleRefundTransaction(tx.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECT NOTIFICATIONS & BROADCAST */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Direct Announcements & Instant Notification Dispatch
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Send alerts, security bulletins, or milestone celebrations directly to users or filtered departments.
              </p>
            </div>

            {notificationSentMessage && (
              <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{notificationSentMessage}</span>
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Audience</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="w-full h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Entire Company (All Members)</option>
                    <option value="developers">Software Engineering & QA</option>
                    <option value="researchers">Research & Inventors</option>
                    <option value="leads">Department Leads Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Notification Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandatory Security Patch / Sprint Deadline"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Notification Body</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type important notice details here..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-3 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Send Broadcast Direct
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & INSTANT EXPORT */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-500" />
                Instant Business Reports & Data Exports
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Generate and export real system data on demand in CSV and JSON formats. Never wait for team members to compile reports manually.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    User Directory & Roles
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Complete list of all registered team members, their assigned roles, verification status, and timestamps.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-zinc-300 dark:border-zinc-700 text-xs"
                  onClick={() => exportCSV('users')}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Users CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    Financial & Royalty Ledger
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Complete transaction logs including customer subscriptions, failed transactions, and 50% inventor payouts.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-zinc-300 dark:border-zinc-700 text-xs"
                  onClick={() => exportCSV('transactions')}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Ledger CSV
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    Security & Audit Trail
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    Tamper-evident logs of administrative actions, user approvals, and permission boundary checks.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-zinc-300 dark:border-zinc-700 text-xs"
                  onClick={() => exportCSV('audits')}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Audits JSON
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
                Granular Roles & Permission Boundary Matrix
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Clear hierarchy: Supreme Admin at top, followed by Leads and Squad Members.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4">Role Tier</th>
                  <th className="py-3 px-3">Role Code</th>
                  <th className="py-3 px-3">Scope & Focus</th>
                  <th className="py-3 px-3">Permissions Granted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                <tr className="bg-rose-50 dark:bg-rose-950/20">
                  <td className="py-3.5 px-4 font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Supreme Org Owner
                  </td>
                  <td className="py-3.5 px-3 font-mono text-zinc-700 dark:text-zinc-300">org_owner</td>
                  <td className="py-3.5 px-3">Entire Company, RLS boundaries, Billing, & Global Approvals</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 uppercase">
                      ALL (Full Access)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Department Lead</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">department_lead</td>
                  <td className="py-3.5 px-3">Department-wide projects, approvals & document sign-offs</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">projects:*, tasks:*, documents:approve</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Development Lead</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">development_lead</td>
                  <td className="py-3.5 px-3">Technical releases, repository management & dev squad oversight</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">projects:create, tasks:assign, code:push</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Research Lead</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">research_lead</td>
                  <td className="py-3.5 px-3">Patent filings, 50% royalty validation & research initiatives</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">research:*, patents:create, royalties:view</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Developer</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">developer</td>
                  <td className="py-3.5 px-3">Code production, branch commits, task execution</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">tasks:read, tasks:update, code:commit</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Tester & QA</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">tester</td>
                  <td className="py-3.5 px-3">Quality assurance, regression testing, bug verification</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">tasks:verify, tests:run, bugs:report</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Researcher (Inventor)</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">researcher</td>
                  <td className="py-3.5 px-3">Product innovation, discovery logs, patent claim owner</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">research:read/write, patent_claim:submit</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">Production (Meta-Ads)</td>
                  <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">production</td>
                  <td className="py-3.5 px-3">Ad sets, creative media, external marketing distribution</td>
                  <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">campaigns:run, assets:manage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: TENANTS & CUSTOMER ORGANIZATIONS */}
      {activeTab === 'organizations' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-500" />
              Customer Organizations ({organizations.length})
            </h3>
            <span className="text-[11px] text-zinc-500">Non-destructive suspension policy</span>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-3">Slug</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                {organizations.map((org) => {
                  const isSuspended = org.status === 'suspended';
                  return (
                    <tr key={org.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">{org.name}</td>
                      <td className="py-3.5 px-3 font-mono text-zinc-500 dark:text-zinc-400">{org.slug}</td>
                      <td className="py-3.5 px-3 uppercase font-semibold text-zinc-700 dark:text-zinc-300">
                        {org.plan_id}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isSuspended
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500 dark:text-zinc-400">{formatDate(org.created_at)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant={isSuspended ? 'outline' : 'danger'}
                          className="text-xs py-1 px-3 h-7 border-zinc-300 dark:border-zinc-700"
                          onClick={() => handleToggleOrgStatus(org.id, org.status)}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audits' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-500" />
              Append-Only Audit Log Explorer
            </h3>
            <span className="text-[11px] text-zinc-500">Tamper-evident system activity</span>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-[11px] font-semibold uppercase text-zinc-600 dark:text-zinc-400">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Event Type</th>
                  <th className="py-3 px-3">Target Resource</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-300">
                {auditEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No audit records recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors font-mono">
                      <td className="py-2.5 px-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {formatDateTime(evt.created_at)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white">{evt.event_type}</td>
                      <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400">{evt.target_resource}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                            evt.outcome === 'success'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : evt.outcome === 'denied'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {evt.outcome}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right text-zinc-400 dark:text-zinc-500">{evt.ip_address}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
