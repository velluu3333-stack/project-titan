import { OrgRole } from './database';

export type Permission =
  | 'platform:admin'
  | 'org:view'
  | 'org:edit'
  | 'org:delete'
  | 'org:manage_billing'
  | 'org:manage_members'
  | 'org:approve_users'
  | 'org:manage_departments'
  | 'projects:view'
  | 'projects:create'
  | 'projects:edit'
  | 'projects:delete'
  | 'tasks:view'
  | 'tasks:create'
  | 'tasks:edit'
  | 'tasks:delete'
  | 'tasks:assign'
  | 'documents:view_legal'
  | 'documents:upload'
  | 'monetization:view'
  | 'monetization:manage'
  | 'approvals:request'
  | 'approvals:decide'
  | 'research:view'
  | 'research:edit'
  | 'development:view'
  | 'development:edit'
  | 'production:view'
  | 'production:edit'
  | 'audit:view'
  | 'ai:execute_low_risk'
  | 'ai:execute_medium_risk'
  | 'ai:execute_high_risk';

export const ROLE_PERMISSIONS: Record<OrgRole, Permission[]> = {
  org_owner: [
    'org:view',
    'org:edit',
    'org:delete',
    'org:manage_billing',
    'org:manage_members',
    'org:approve_users',
    'org:manage_departments',
    'projects:view',
    'projects:create',
    'projects:edit',
    'projects:delete',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'tasks:assign',
    'documents:view_legal',
    'documents:upload',
    'monetization:view',
    'monetization:manage',
    'approvals:request',
    'approvals:decide',
    'research:view',
    'research:edit',
    'development:view',
    'development:edit',
    'production:view',
    'production:edit',
    'audit:view',
    'ai:execute_low_risk',
    'ai:execute_medium_risk',
    'ai:execute_high_risk',
  ],
  org_admin: [
    'org:view',
    'org:edit',
    'org:manage_members',
    'org:approve_users',
    'org:manage_departments',
    'projects:view',
    'projects:create',
    'projects:edit',
    'projects:delete',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:delete',
    'tasks:assign',
    'documents:view_legal',
    'documents:upload',
    'monetization:view',
    'approvals:request',
    'approvals:decide',
    'research:view',
    'research:edit',
    'development:view',
    'development:edit',
    'production:view',
    'production:edit',
    'audit:view',
    'ai:execute_low_risk',
    'ai:execute_medium_risk',
  ],
  department_lead: [
    'org:view',
    'projects:view',
    'projects:create',
    'projects:edit',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:assign',
    'documents:view_legal',
    'documents:upload',
    'monetization:view',
    'approvals:request',
    'research:view',
    'development:view',
    'production:view',
    'ai:execute_low_risk',
    'ai:execute_medium_risk',
  ],
  development_lead: [
    'org:view',
    'projects:view',
    'projects:create',
    'projects:edit',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:assign',
    'documents:upload',
    'development:view',
    'development:edit',
    'ai:execute_low_risk',
    'ai:execute_medium_risk',
  ],
  research_lead: [
    'org:view',
    'projects:view',
    'projects:create',
    'projects:edit',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'tasks:assign',
    'documents:upload',
    'research:view',
    'research:edit',
    'ai:execute_low_risk',
    'ai:execute_medium_risk',
  ],
  developer: [
    'org:view',
    'projects:view',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'development:view',
    'development:edit',
    'documents:upload',
    'ai:execute_low_risk',
  ],
  tester: [
    'org:view',
    'projects:view',
    'tasks:view',
    'tasks:edit',
    'development:view',
    'ai:execute_low_risk',
  ],
  researcher: [
    'org:view',
    'projects:view',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'research:view',
    'research:edit',
    'ai:execute_low_risk',
  ],
  production: [
    'org:view',
    'projects:view',
    'tasks:view',
    'tasks:create',
    'tasks:edit',
    'production:view',
    'production:edit',
    'monetization:view',
    'ai:execute_low_risk',
  ],
  viewer: [
    'org:view',
    'projects:view',
    'tasks:view',
    'research:view',
    'development:view',
    'production:view',
  ],
};
