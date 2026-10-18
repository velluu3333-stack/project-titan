import {
  Profile,
  Organization,
  OrganizationMembership,
  Department,
  Project,
  Task,
  LegalDocument,
  MonetizationMetrics,
  ProjectStatus,
  TaskStatus,
  Priority,
  OrgRole,
  UserStatus,
} from '@/types/database';
import { recordAuditEvent } from '@/lib/audit/logger';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
);

// Initial structured profiles
const initialProfiles: Profile[] = [
  // 1. Tagda Top Admin & Founder
  {
    id: 'user-admin-top',
    email: 'admin.titan@company.internal',
    full_name: 'Vikramaditya Sharma',
    avatar_url: null,
    is_platform_admin: true,
    status: 'active',
    requested_role: 'org_owner',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  // 2. Department & Strategic Lead
  {
    id: 'user-dept-lead',
    email: 'marcus.lead@company.internal',
    full_name: 'Marcus Wright (Department Lead)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'department_lead',
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString(),
  },
  // 3. Research Lead
  {
    id: 'user-res-lead',
    email: 'dr.elena.rostova@company.internal',
    full_name: 'Dr. Elena Rostova (Research Lead)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'research_lead',
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date('2026-01-12').toISOString(),
  },
  // 4. Development Lead
  {
    id: 'user-dev-lead',
    email: 'john.reese.tech@company.internal',
    full_name: 'John Reese (Development Lead)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'development_lead',
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date('2026-01-15').toISOString(),
  },
  // 5. Developer
  {
    id: 'user-dev-core',
    email: 'alex.dev@company.internal',
    full_name: 'Alex Rivera (Core Developer)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'developer',
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
  },
  // 6. Tester & QA Lead
  {
    id: 'user-qa-tester',
    email: 'priya.tester@company.internal',
    full_name: 'Priya Patel (Security & QA Tester)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'tester',
    created_at: new Date('2026-02-05').toISOString(),
    updated_at: new Date('2026-02-05').toISOString(),
  },
  // 7. Researcher & Inventor (Has 50% Patent Project)
  {
    id: 'user-researcher-inv',
    email: 'tariq.innovator@company.internal',
    full_name: 'Tariq Al-Mansoor (Inventor Researcher)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'researcher',
    created_at: new Date('2026-02-10').toISOString(),
    updated_at: new Date('2026-02-10').toISOString(),
  },
  // 8. Production & Meta-Ads Growth Specialist
  {
    id: 'user-production-ads',
    email: 'sarah.growth@company.internal',
    full_name: 'Sarah Connor (Production & Meta-Ads Growth)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    requested_role: 'production',
    created_at: new Date('2026-02-12').toISOString(),
    updated_at: new Date('2026-02-12').toISOString(),
  },
  // 9. New User Pending Approval (Private software onboarding gate)
  {
    id: 'user-pending-1',
    email: 'rohit.candidate@external.com',
    full_name: 'Rohit Verma (Applied for Dev)',
    avatar_url: null,
    is_platform_admin: false,
    status: 'pending_approval',
    requested_role: 'developer',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialOrganizations: Organization[] = [
  {
    id: 'org-titan-hq',
    name: 'Titan Operating Enterprise',
    slug: 'titan-enterprise',
    status: 'active',
    plan_id: 'enterprise',
    created_by: 'user-admin-top',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

const initialMemberships: OrganizationMembership[] = [
  {
    id: 'mem-top-admin',
    org_id: 'org-titan-hq',
    user_id: 'user-admin-top',
    role: 'org_owner',
    status: 'active',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'mem-dept-lead',
    org_id: 'org-titan-hq',
    user_id: 'user-dept-lead',
    role: 'department_lead',
    status: 'active',
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'mem-res-lead',
    org_id: 'org-titan-hq',
    user_id: 'user-res-lead',
    role: 'research_lead',
    status: 'active',
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date('2026-01-12').toISOString(),
  },
  {
    id: 'mem-dev-lead',
    org_id: 'org-titan-hq',
    user_id: 'user-dev-lead',
    role: 'development_lead',
    status: 'active',
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'mem-dev-core',
    org_id: 'org-titan-hq',
    user_id: 'user-dev-core',
    role: 'developer',
    status: 'active',
    created_at: new Date('2026-02-01').toISOString(),
    updated_at: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'mem-tester',
    org_id: 'org-titan-hq',
    user_id: 'user-qa-tester',
    role: 'tester',
    status: 'active',
    created_at: new Date('2026-02-05').toISOString(),
    updated_at: new Date('2026-02-05').toISOString(),
  },
  {
    id: 'mem-inventor',
    org_id: 'org-titan-hq',
    user_id: 'user-researcher-inv',
    role: 'researcher',
    status: 'active',
    created_at: new Date('2026-02-10').toISOString(),
    updated_at: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'mem-production',
    org_id: 'org-titan-hq',
    user_id: 'user-production-ads',
    role: 'production',
    status: 'active',
    created_at: new Date('2026-02-12').toISOString(),
    updated_at: new Date('2026-02-12').toISOString(),
  },
];

const initialDepartments: Department[] = [
  {
    id: 'dept-eng',
    org_id: 'org-titan-hq',
    name: 'Software Engineering & QA',
    description: 'Core web apps, tool platforms, and testing suites',
    lead_id: 'user-dev-lead',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'dept-research',
    org_id: 'org-titan-hq',
    name: 'Research, Patents & Innovation',
    description: 'Exploratory technology, algorithms, and 50% royalty IP development',
    lead_id: 'user-res-lead',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'dept-growth',
    org_id: 'org-titan-hq',
    name: 'Production & Meta-Ads Marketing',
    description: 'Product launches, creative ad sets, and user acquisition campaigns',
    lead_id: 'user-production-ads',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

const initialProjects: Project[] = [
  {
    id: 'proj-patent-ai-indexer',
    org_id: 'org-titan-hq',
    department_id: 'dept-research',
    name: 'Autonomous High-Speed Tool Engine',
    description: 'Proprietary micro-tool search engine with programmatic SEO traffic pipeline.',
    objective: 'Drive 200,000 monthly pageviews for Google AdSense monetization.',
    status: 'active',
    priority: 'urgent',
    owner_id: 'user-researcher-inv',
    start_date: '2026-02-15',
    deadline: '2026-08-15',
    // PATENT & ROYALTY ATTRIBUTES:
    is_patent: true,
    patent_holder_id: 'user-researcher-inv',
    patent_registered_at: '2026-02-15T00:00:00Z',
    patent_lock_months: 6, // 6-month lock-in period
    patent_royalty_percentage: 50, // 50% of revenue goes to Tariq Al-Mansoor
    deliverable_file_url: 'https://example.com/downloads/tool-engine-specs-v1.zip',
    deliverable_file_name: 'tool-engine-specs-v1.zip',
    created_at: new Date('2026-02-15').toISOString(),
    updated_at: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'proj-meta-ads-campaign',
    org_id: 'org-titan-hq',
    department_id: 'dept-growth',
    name: 'Q2 Meta-Ads Creative Blitz & Growth',
    description: 'Meta Ads (Facebook/Instagram) targeting B2B subscribers and paid utility members.',
    objective: 'Attain 500 active paid pro members @ $29/mo.',
    status: 'in_review',
    priority: 'high',
    owner_id: 'user-production-ads',
    start_date: '2026-03-01',
    deadline: '2026-05-30',
    is_patent: false,
    deliverable_file_url: 'https://example.com/downloads/meta-creatives-pack.pdf',
    deliverable_file_name: 'meta-creatives-pack.pdf',
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date('2026-03-01').toISOString(),
  },
  {
    id: 'proj-qa-suite',
    org_id: 'org-titan-hq',
    department_id: 'dept-eng',
    name: 'PostgreSQL Stress & Pen-Testing Suite',
    description: 'Comprehensive test pipeline to guarantee zero cross-tenant leakages.',
    objective: '100% automated test coverage and security sign-off.',
    status: 'active',
    priority: 'urgent',
    owner_id: 'user-qa-tester',
    start_date: '2026-03-05',
    deadline: '2026-04-10',
    is_patent: false,
    deliverable_file_url: 'https://example.com/downloads/security-qa-manifest.json',
    deliverable_file_name: 'security-qa-manifest.json',
    created_at: new Date('2026-03-05').toISOString(),
    updated_at: new Date('2026-03-05').toISOString(),
  },
];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    org_id: 'org-titan-hq',
    project_id: 'proj-patent-ai-indexer',
    title: 'Deploy micro-tool backend & programmatic SEO sitemaps',
    description: 'Generate 1,000 high-intent utility pages for Google AdSense organic indexing.',
    status: 'in_progress',
    priority: 'urgent',
    owner_id: 'user-dev-lead',
    assignee_id: 'user-dev-core',
    due_date: '2026-03-25T18:00:00Z',
    deliverable_attachment: 'https://example.com/downloads/sitemap-config.ts',
    created_at: new Date('2026-03-01').toISOString(),
    updated_at: new Date('2026-03-01').toISOString(),
  },
  {
    id: 'task-2',
    org_id: 'org-titan-hq',
    project_id: 'proj-patent-ai-indexer',
    title: 'Verify 6-Month Patent Royalty Smart Calculation',
    description: 'Validate that 50% of the AdSense and member pool is credited to Tariq Al-Mansoor.',
    status: 'done',
    priority: 'high',
    owner_id: 'user-admin-top',
    assignee_id: 'user-res-lead',
    due_date: '2026-03-10T18:00:00Z',
    created_at: new Date('2026-03-02').toISOString(),
    updated_at: new Date('2026-03-10').toISOString(),
  },
  {
    id: 'task-3',
    org_id: 'org-titan-hq',
    project_id: 'proj-meta-ads-campaign',
    title: 'Design 10 High-CTR Video Hooks for Meta Ads',
    description: 'Creative studio exports for Facebook/Instagram dynamic placement.',
    status: 'todo',
    priority: 'high',
    owner_id: 'user-production-ads',
    assignee_id: 'user-production-ads',
    due_date: '2026-04-01T18:00:00Z',
    created_at: new Date('2026-03-05').toISOString(),
    updated_at: new Date('2026-03-05').toISOString(),
  },
  {
    id: 'task-4',
    org_id: 'org-titan-hq',
    project_id: 'proj-qa-suite',
    title: 'Execute Pen-Testing on Private Document Downloads',
    description: 'Verify that only authorized roles can download company legal contracts.',
    status: 'in_progress',
    priority: 'urgent',
    owner_id: 'user-qa-tester',
    assignee_id: 'user-qa-tester',
    due_date: '2026-03-28T18:00:00Z',
    created_at: new Date('2026-03-08').toISOString(),
    updated_at: new Date('2026-03-08').toISOString(),
  },
];

const initialLegalDocuments: LegalDocument[] = [
  {
    id: 'doc-legal-1',
    org_id: 'org-titan-hq',
    title: 'Mutual Non-Disclosure Agreement (Master NDA 2026)',
    category: 'nda',
    file_name: 'titan-master-nda-v2.pdf',
    file_size: '1.4 MB',
    is_confidential: true,
    uploaded_by_id: 'user-admin-top',
    uploaded_at: '2026-01-15T00:00:00Z',
    download_url: 'https://example.com/vault/titan-master-nda-v2.pdf',
  },
  {
    id: 'doc-legal-2',
    org_id: 'org-titan-hq',
    title: 'Patent & 50% 6-Month Inventor Royalty Assignment Agreement',
    category: 'ip_patent',
    file_name: 'ip-assignment-royalty-lockin.pdf',
    file_size: '2.8 MB',
    is_confidential: true,
    uploaded_by_id: 'user-admin-top',
    uploaded_at: '2026-02-15T00:00:00Z',
    download_url: 'https://example.com/vault/ip-assignment-royalty-lockin.pdf',
  },
  {
    id: 'doc-legal-3',
    org_id: 'org-titan-hq',
    title: 'Enterprise Software Terms of Service & Privacy Policy',
    category: 'legal',
    file_name: 'titan-enterprise-tos.pdf',
    file_size: '890 KB',
    is_confidential: false,
    uploaded_by_id: 'user-admin-top',
    uploaded_at: '2026-02-01T00:00:00Z',
    download_url: 'https://example.com/vault/titan-enterprise-tos.pdf',
  },
];

const initialMonetization: MonetizationMetrics = {
  adSenseTraffic: [
    { month: 'Oct 2025', pageviews: 45000, rpm: 8.5, earnings: 382.5 },
    { month: 'Nov 2025', pageviews: 82000, rpm: 9.2, earnings: 754.4 },
    { month: 'Dec 2025', pageviews: 135000, rpm: 11.0, earnings: 1485.0 },
    { month: 'Jan 2026', pageviews: 180000, rpm: 12.4, earnings: 2232.0 },
    { month: 'Feb 2026', pageviews: 240000, rpm: 13.5, earnings: 3240.0 },
    { month: 'Mar 2026 (Live)', pageviews: 310000, rpm: 14.2, earnings: 4402.0 },
  ],
  paidMemberships: [
    {
      id: 'sub-1',
      member_name: 'Acme Media Labs',
      email: 'billing@acmemedia.io',
      tier: 'enterprise_annual',
      amount: 4999.0,
      status: 'active',
      next_billing: '2027-01-15',
    },
    {
      id: 'sub-2',
      member_name: 'Nexus Growth Studio',
      email: 'growth@nexusstudio.co',
      tier: 'pro_monthly',
      amount: 99.0,
      status: 'active',
      next_billing: '2026-04-01',
    },
    {
      id: 'sub-3',
      member_name: 'DevCraft Software',
      email: 'payments@devcraft.org',
      tier: 'pro_monthly',
      amount: 99.0,
      status: 'active',
      next_billing: '2026-04-05',
    },
    {
      id: 'sub-4',
      member_name: 'Solo Founder Pro',
      email: 'founder@startupzero.tech',
      tier: 'starter_monthly',
      amount: 29.0,
      status: 'active',
      next_billing: '2026-04-12',
    },
  ],
};

// Memory stores
const profilesStore = [...initialProfiles];
const organizationsStore = [...initialOrganizations];
const membershipsStore = [...initialMemberships];
const departmentsStore = [...initialDepartments];
const projectsStore = [...initialProjects];
const tasksStore = [...initialTasks];
const legalDocsStore = [...initialLegalDocuments];
const monetizationStore = { ...initialMonetization };

export const DataRepository = {
  // Session & Storage Helpers
  saveActiveSession(user: Profile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('titan_active_user', JSON.stringify(user));
    }
  },

  getActiveSession(): Profile | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('titan_active_user');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
    }
    return null;
  },

  clearActiveSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('titan_active_user');
    }
  },

  loadStoredUsers(): void {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('titan_registered_users');
      if (raw) {
        try {
          const stored: Profile[] = JSON.parse(raw);
          stored.forEach((sp) => {
            const idx = profilesStore.findIndex((p) => p.email.toLowerCase() === sp.email.toLowerCase());
            if (idx === -1) {
              profilesStore.push(sp);
            } else {
              profilesStore[idx] = sp;
            }
          });
        } catch {}
      }
    }
  },

  persistStoredUsers(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('titan_registered_users', JSON.stringify(profilesStore));
    }
  },

  // Profiles & Onboarding Approval Gate
  async getProfile(id: string): Promise<Profile | null> {
    this.loadStoredUsers();
    return profilesStore.find((p) => p.id === id) || null;
  },

  async getAllProfiles(): Promise<Profile[]> {
    this.loadStoredUsers();
    return [...profilesStore];
  },

  async getPendingApprovals(): Promise<Profile[]> {
    this.loadStoredUsers();
    return profilesStore.filter((p) => p.status === 'pending_approval');
  },

  async approveUser(userId: string, assignedRole: OrgRole, actorId?: string): Promise<Profile | null> {
    const user = profilesStore.find((p) => p.id === userId);
    if (!user) return null;
    user.status = 'active';
    user.requested_role = assignedRole;
    user.updated_at = new Date().toISOString();

    // Check if membership already exists, otherwise create
    let mem = membershipsStore.find((m) => m.user_id === userId);
    if (!mem) {
      mem = {
        id: `mem-${Date.now()}`,
        org_id: 'org-titan-hq',
        user_id: user.id,
        role: assignedRole,
        status: 'active',
        invited_by: actorId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      membershipsStore.push(mem);
    } else {
      mem.status = 'active';
      mem.role = assignedRole;
    }

    await recordAuditEvent({
      orgId: 'org-titan-hq',
      actorId,
      eventType: 'user.approved',
      targetResource: 'profiles',
      targetId: userId,
      outcome: 'success',
      metadata: { email: user.email, role: assignedRole },
    });

    this.persistStoredUsers();
    return { ...user };
  },

  async rejectUser(userId: string, actorId?: string): Promise<Profile | null> {
    const user = profilesStore.find((p) => p.id === userId);
    if (!user) return null;
    user.status = 'rejected';
    user.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId: 'org-titan-hq',
      actorId,
      eventType: 'user.rejected',
      targetResource: 'profiles',
      targetId: userId,
      outcome: 'denied',
      metadata: { email: user.email },
    });

    this.persistStoredUsers();
    return { ...user };
  },

  async toggleBlockUser(userId: string, actorId?: string): Promise<Profile | null> {
    const user = profilesStore.find((p) => p.id === userId);
    if (!user) return null;
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    user.status = nextStatus;
    user.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId: 'org-titan-hq',
      actorId,
      eventType: nextStatus === 'blocked' ? 'user.blocked' : 'user.unblocked',
      targetResource: 'profiles',
      targetId: userId,
      outcome: nextStatus === 'blocked' ? 'denied' : 'success',
      metadata: { email: user.email, status: nextStatus },
    });

    this.persistStoredUsers();
    return { ...user };
  },

  async registerUserRequest(params: {
    fullName: string;
    email: string;
    requestedRole: OrgRole;
  }): Promise<Profile> {
    this.loadStoredUsers();
    const existing = profilesStore.find((p) => p.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error('An account request with this email already exists.');
    }

    const newProfile: Profile = {
      id: `user-${Date.now()}`,
      email: params.email,
      full_name: params.fullName,
      avatar_url: null,
      is_platform_admin: false,
      status: 'pending_approval', // Admin approval strictly required
      requested_role: params.requestedRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    profilesStore.push(newProfile);

    await recordAuditEvent({
      orgId: 'org-titan-hq',
      actorId: newProfile.id,
      eventType: 'user.registration_requested',
      targetResource: 'profiles',
      targetId: newProfile.id,
      outcome: 'success',
      metadata: { email: params.email, requestedRole: params.requestedRole },
    });

    this.persistStoredUsers();
    return newProfile;
  },

  // Organizations
  async getOrganization(id: string): Promise<Organization | null> {
    return organizationsStore.find((o) => o.id === id) || null;
  },

  async getAllOrganizations(): Promise<Organization[]> {
    return [...organizationsStore];
  },

  async updateOrganizationStatus(
    orgId: string,
    status: Organization['status'],
    actorId?: string
  ): Promise<Organization | null> {
    const org = organizationsStore.find((o) => o.id === orgId);
    if (!org) return null;
    org.status = status;
    org.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId,
      actorId,
      eventType: 'organization.status_changed',
      targetResource: 'organizations',
      targetId: orgId,
      outcome: 'success',
      metadata: { newStatus: status },
    });

    return { ...org };
  },

  // Memberships
  async getMembershipsForOrg(orgId: string): Promise<OrganizationMembership[]> {
    const mems = membershipsStore.filter((m) => m.org_id === orgId && m.status === 'active');
    return mems.map((m) => ({
      ...m,
      user: profilesStore.find((p) => p.id === m.user_id),
      organization: organizationsStore.find((o) => o.id === m.org_id),
    }));
  },

  async updateMemberRole(
    membershipId: string,
    newRole: OrgRole,
    actorId?: string
  ): Promise<OrganizationMembership | null> {
    const mem = membershipsStore.find((m) => m.id === membershipId);
    if (!mem) return null;
    const oldRole = mem.role;
    mem.role = newRole;
    mem.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId: mem.org_id,
      actorId,
      eventType: 'membership.role_updated',
      targetResource: 'organization_memberships',
      targetId: membershipId,
      outcome: 'success',
      metadata: { oldRole, newRole, userId: mem.user_id },
    });

    return { ...mem, user: profilesStore.find((p) => p.id === mem.user_id) };
  },

  async inviteMember(params: {
    orgId: string;
    email: string;
    fullName: string;
    role: OrgRole;
    actorId?: string;
  }): Promise<OrganizationMembership> {
    let profile = profilesStore.find((p) => p.email.toLowerCase() === params.email.toLowerCase());
    if (!profile) {
      profile = {
        id: `user-${Date.now()}`,
        email: params.email,
        full_name: params.fullName,
        avatar_url: null,
        is_platform_admin: false,
        status: 'active',
        requested_role: params.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      profilesStore.push(profile);
    }

    const membership: OrganizationMembership = {
      id: `mem-${Date.now()}`,
      org_id: params.orgId,
      user_id: profile.id,
      role: params.role,
      status: 'active',
      invited_by: params.actorId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: profile,
    };

    membershipsStore.push(membership);

    await recordAuditEvent({
      orgId: params.orgId,
      actorId: params.actorId,
      eventType: 'membership.invited',
      targetResource: 'organization_memberships',
      targetId: membership.id,
      outcome: 'success',
      metadata: { email: params.email, role: params.role },
    });

    return membership;
  },

  // Projects
  async getProjects(orgId: string): Promise<Project[]> {
    const orgProjects = projectsStore.filter((p) => p.org_id === orgId);
    return orgProjects.map((p) => {
      const pTasks = tasksStore.filter((t) => t.project_id === p.id);
      const completedTasks = pTasks.filter((t) => t.status === 'done');
      return {
        ...p,
        owner: profilesStore.find((u) => u.id === p.owner_id),
        patent_holder: p.patent_holder_id
          ? profilesStore.find((u) => u.id === p.patent_holder_id)
          : undefined,
        department: departmentsStore.find((d) => d.id === p.department_id),
        tasks_count: pTasks.length,
        completed_tasks_count: completedTasks.length,
      };
    });
  },

  async getProjectById(orgId: string, projectId: string): Promise<Project | null> {
    const p = projectsStore.find((p) => p.org_id === orgId && p.id === projectId);
    if (!p) return null;
    const pTasks = tasksStore.filter((t) => t.project_id === p.id);
    const completedTasks = pTasks.filter((t) => t.status === 'done');
    return {
      ...p,
      owner: profilesStore.find((u) => u.id === p.owner_id),
      patent_holder: p.patent_holder_id
        ? profilesStore.find((u) => u.id === p.patent_holder_id)
        : undefined,
      department: departmentsStore.find((d) => d.id === p.department_id),
      tasks_count: pTasks.length,
      completed_tasks_count: completedTasks.length,
    };
  },

  async createProject(params: {
    orgId: string;
    name: string;
    description?: string;
    objective?: string;
    priority: Priority;
    ownerId: string;
    departmentId?: string;
    deadline?: string;
    isPatent?: boolean;
    patentHolderId?: string;
    deliverableFileName?: string;
  }): Promise<Project> {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      org_id: params.orgId,
      name: params.name,
      description: params.description || null,
      objective: params.objective || null,
      status: 'planning',
      priority: params.priority,
      owner_id: params.ownerId,
      department_id: params.departmentId || null,
      deadline: params.deadline || null,
      is_patent: params.isPatent || false,
      patent_holder_id: params.isPatent ? params.patentHolderId || params.ownerId : null,
      patent_registered_at: params.isPatent ? new Date().toISOString() : null,
      patent_lock_months: params.isPatent ? 6 : undefined,
      patent_royalty_percentage: params.isPatent ? 50 : undefined,
      deliverable_file_name: params.deliverableFileName || null,
      deliverable_file_url: params.deliverableFileName
        ? `https://example.com/downloads/${params.deliverableFileName}`
        : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    projectsStore.unshift(newProject);

    await recordAuditEvent({
      orgId: params.orgId,
      actorId: params.ownerId,
      eventType: params.isPatent ? 'project.patent_created' : 'project.created',
      targetResource: 'projects',
      targetId: newProject.id,
      outcome: 'success',
      metadata: {
        name: params.name,
        isPatent: newProject.is_patent,
        patentHolderId: newProject.patent_holder_id,
      },
    });

    return {
      ...newProject,
      owner: profilesStore.find((u) => u.id === newProject.owner_id),
      patent_holder: newProject.patent_holder_id
        ? profilesStore.find((u) => u.id === newProject.patent_holder_id)
        : undefined,
      tasks_count: 0,
      completed_tasks_count: 0,
    };
  },

  async updateProjectStatus(
    orgId: string,
    projectId: string,
    status: ProjectStatus,
    actorId?: string
  ): Promise<Project | null> {
    const proj = projectsStore.find((p) => p.org_id === orgId && p.id === projectId);
    if (!proj) return null;
    proj.status = status;
    proj.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId,
      actorId,
      eventType: 'project.status_updated',
      targetResource: 'projects',
      targetId: projectId,
      outcome: 'success',
      metadata: { newStatus: status },
    });

    return this.getProjectById(orgId, projectId);
  },

  // Tasks
  async getTasks(orgId: string, projectId?: string): Promise<Task[]> {
    let tList = tasksStore.filter((t) => t.org_id === orgId);
    if (projectId) {
      tList = tList.filter((t) => t.project_id === projectId);
    }
    return tList.map((t) => ({
      ...t,
      assignee: profilesStore.find((u) => u.id === t.assignee_id),
      project: projectsStore.find((p) => p.id === t.project_id),
    }));
  },

  async createTask(params: {
    orgId: string;
    projectId: string;
    title: string;
    description?: string;
    priority: Priority;
    ownerId: string;
    assigneeId?: string;
    dueDate?: string;
    deliverableAttachment?: string;
  }): Promise<Task> {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      org_id: params.orgId,
      project_id: params.projectId,
      title: params.title,
      description: params.description || null,
      status: 'todo',
      priority: params.priority,
      owner_id: params.ownerId,
      assignee_id: params.assigneeId || null,
      due_date: params.dueDate || null,
      deliverable_attachment: params.deliverableAttachment || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tasksStore.unshift(newTask);

    await recordAuditEvent({
      orgId: params.orgId,
      actorId: params.ownerId,
      eventType: 'task.created',
      targetResource: 'tasks',
      targetId: newTask.id,
      outcome: 'success',
      metadata: { title: params.title, projectId: params.projectId, assigneeId: params.assigneeId },
    });

    return {
      ...newTask,
      assignee: profilesStore.find((u) => u.id === newTask.assignee_id),
      project: projectsStore.find((p) => p.id === newTask.project_id),
    };
  },

  async updateTaskStatus(
    orgId: string,
    taskId: string,
    status: TaskStatus,
    actorId?: string
  ): Promise<Task | null> {
    const task = tasksStore.find((t) => t.org_id === orgId && t.id === taskId);
    if (!task) return null;
    task.status = status;
    task.updated_at = new Date().toISOString();

    await recordAuditEvent({
      orgId,
      actorId,
      eventType: 'task.status_updated',
      targetResource: 'tasks',
      targetId: taskId,
      outcome: 'success',
      metadata: { newStatus: status },
    });

    return {
      ...task,
      assignee: profilesStore.find((u) => u.id === task.assignee_id),
      project: projectsStore.find((p) => p.id === task.project_id),
    };
  },

  // Legal & Confidential Documents
  async getLegalDocuments(orgId: string): Promise<LegalDocument[]> {
    return legalDocsStore
      .filter((d) => d.org_id === orgId)
      .map((d) => ({
        ...d,
        uploaded_by: profilesStore.find((u) => u.id === d.uploaded_by_id),
      }));
  },

  async uploadLegalDocument(params: {
    orgId: string;
    title: string;
    category: LegalDocument['category'];
    fileName: string;
    fileSize: string;
    isConfidential: boolean;
    uploadedById: string;
  }): Promise<LegalDocument> {
    const newDoc: LegalDocument = {
      id: `doc-${Date.now()}`,
      org_id: params.orgId,
      title: params.title,
      category: params.category,
      file_name: params.fileName,
      file_size: params.fileSize,
      is_confidential: params.isConfidential,
      uploaded_by_id: params.uploadedById,
      uploaded_at: new Date().toISOString(),
      download_url: `https://example.com/vault/${params.fileName}`,
    };

    legalDocsStore.unshift(newDoc);

    await recordAuditEvent({
      orgId: params.orgId,
      actorId: params.uploadedById,
      eventType: 'document.uploaded',
      targetResource: 'legal_documents',
      targetId: newDoc.id,
      outcome: 'success',
      metadata: { title: params.title, category: params.category, isConfidential: params.isConfidential },
    });

    return {
      ...newDoc,
      uploaded_by: profilesStore.find((u) => u.id === params.uploadedById),
    };
  },

  // Monetization & Earning Metrics (Google AdSense + Paid Members)
  async getMonetizationMetrics(): Promise<MonetizationMetrics> {
    return { ...monetizationStore };
  },

  async addAdSenseMonth(entry: { month: string; pageviews: number; rpm: number; earnings: number }) {
    monetizationStore.adSenseTraffic.push(entry);
    return { ...monetizationStore };
  },
};
