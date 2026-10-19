// Core Database Types for Project Titan

export type UserStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected' | 'deactivated' | 'blocked';
export type OrgStatus = 'active' | 'suspended' | 'trial' | 'cancelled';
export type PlanId = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export type OrgRole =
  | 'org_owner'
  | 'org_admin'
  | 'department_lead'
  | 'research_lead'
  | 'development_lead'
  | 'developer'
  | 'tester'
  | 'researcher'
  | 'production'
  | 'viewer';

export type MembershipStatus = 'active' | 'invited' | 'pending_approval' | 'suspended' | 'revoked';

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'blocked'
  | 'in_review'
  | 'completed'
  | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'in_review'
  | 'done';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_platform_admin: boolean;
  status: UserStatus;
  requested_role?: OrgRole;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrgStatus;
  plan_id: PlanId;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMembership {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  status: MembershipStatus;
  invited_by?: string | null;
  created_at: string;
  updated_at: string;
  user?: Profile;
  organization?: Organization;
}

export interface Department {
  id: string;
  org_id: string;
  name: string;
  description?: string | null;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
  lead?: Profile;
}

export interface Project {
  id: string;
  org_id: string;
  department_id?: string | null;
  name: string;
  description?: string | null;
  objective?: string | null;
  status: ProjectStatus;
  priority: Priority;
  owner_id: string;
  start_date?: string | null;
  deadline?: string | null;
  created_at: string;
  updated_at: string;
  // Patent & Innovation Royalty Attributes
  is_patent?: boolean;
  patent_holder_id?: string | null;
  patent_holder?: Profile;
  patent_registered_at?: string | null;
  patent_lock_months?: number; // e.g. 6 months lock-in
  patent_royalty_percentage?: number; // 50%
  // File download attachment for dev tasks / specifications
  deliverable_file_url?: string | null;
  deliverable_file_name?: string | null;
  // Relations & metrics
  owner?: Profile;
  department?: Department;
  tasks_count?: number;
  completed_tasks_count?: number;
}

export interface Task {
  id: string;
  org_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  owner_id: string;
  assignee_id?: string | null;
  due_date?: string | null;
  deliverable_attachment?: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  project?: Project;
}

export interface TaskComment {
  id: string;
  org_id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface AuditEvent {
  id: string;
  org_id?: string | null;
  actor_id?: string | null;
  event_type: string;
  target_resource: string;
  target_id?: string | null;
  outcome: 'success' | 'failure' | 'denied';
  metadata: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  actor?: Profile;
  organization?: Organization;
}

export interface LegalDocument {
  id: string;
  org_id: string;
  title: string;
  category: 'legal' | 'confidential' | 'contract' | 'ip_patent' | 'nda';
  file_name: string;
  file_size: string;
  is_confidential: boolean;
  uploaded_by_id: string;
  uploaded_at: string;
  download_url: string;
  uploaded_by?: Profile;
}

export interface MonetizationMetrics {
  adSenseTraffic: {
    month: string;
    pageviews: number;
    rpm: number;
    earnings: number;
  }[];
  paidMemberships: {
    id: string;
    member_name: string;
    email: string;
    tier: 'pro_monthly' | 'starter_monthly' | 'enterprise_annual';
    amount: number;
    status: 'active' | 'past_due' | 'cancelled';
    next_billing: string;
  }[];
}

export type PipelineStage =
  | 'admin_core'
  | 'dev_squad'
  | 'qa_testing'
  | 'white_coder'
  | 'research_lab'
  | 'production_ads';

export interface PipelineTransitionEvent {
  id: string;
  projectId: string;
  projectName: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  actorName: string;
  actorRole: string;
  timestamp: string;
  actionNote: string;
  changesSummary: string;
}

export interface BroadcastMessage {
  id: string;
  orgId: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: string;
  urgency: 'critical' | 'high' | 'normal' | 'patent_window';
  targetSquad: 'all' | 'developers' | 'research' | 'qa' | 'production' | 'white_coders';
  createdAt: string;
  acknowledgedBy: string[];
}

export interface UserInvention {
  id: string;
  userId: string;
  title: string;
  description: string;
  patentNumber: string;
  status: 'active_lockin' | 'filed' | 'review' | 'granted';
  lockinExpiry: string;
  grossRevenue: number;
  royaltyRate: number; // 50%
  earnedPayout: number;
  claimedPayout: number;
  filingDate: string;
}

export interface SquadPeerProfile {
  id: string;
  fullName: string;
  email: string;
  role: OrgRole;
  squad: string;
  reputationStars: number;
  patentsCount: number;
  patents: string[];
  tasksDone: number;
  efficiencyScore: string;
  status: string;
  bio: string;
  skills: string[];
  color: string;
}
