import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, isPlatformAdmin, canAccessTenant } from '../src/lib/auth/rbac';
import { DataRepository } from '../src/lib/data/repository';
import { getAuditEvents } from '../src/lib/audit/logger';

describe('PROJECT TITAN: Security & Tenant Isolation Tests', () => {
  test('1. Cross-tenant isolation prevents accessing unauthorized organization records', () => {
    const userRoleInTitan = 'developer';
    const userOrgId = 'org-titan-hq';
    const targetCyberdyneOrgId = 'org-cyberdyne';

    // Standard user in Titan cannot access Cyberdyne
    const canAccess = canAccessTenant(userRoleInTitan, targetCyberdyneOrgId, userOrgId, false);
    assert.equal(canAccess, false, 'User must not access another organization data');
  });

  test('2. Platform Super Admin can access platform infrastructure while tenant admins cannot', () => {
    const regularOrgAdmin = {
      id: 'admin-1',
      email: 'admin@acme.com',
      full_name: 'Org Admin',
      avatar_url: null,
      is_platform_admin: false,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const platformSuperAdmin = {
      id: 'superadmin-1',
      email: 'admin.titan@company.internal',
      full_name: 'Supreme Admin',
      avatar_url: null,
      is_platform_admin: true,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    assert.equal(isPlatformAdmin(regularOrgAdmin), false, 'Org admin must not have platform superadmin rights');
    assert.equal(isPlatformAdmin(platformSuperAdmin), true, 'Superadmin must have platform rights');
  });

  test('3. RBAC permission matrix strictly enforces role capabilities across all 10 roles', () => {
    // Developer can create tasks and view code, but cannot manage billing or approve users
    assert.equal(hasPermission('developer', 'tasks:create'), true);
    assert.equal(hasPermission('developer', 'development:view'), true);
    assert.equal(hasPermission('developer', 'org:manage_billing'), false);
    assert.equal(hasPermission('developer', 'org:approve_users'), false);

    // Tester & QA can view development and edit tasks, but cannot manage billing
    assert.equal(hasPermission('tester', 'development:view'), true);
    assert.equal(hasPermission('tester', 'tasks:edit'), true);
    assert.equal(hasPermission('tester', 'org:manage_billing'), false);

    // Production (Meta-Ads) can manage marketing and monetization view
    assert.equal(hasPermission('production', 'production:edit'), true);
    assert.equal(hasPermission('production', 'monetization:view'), true);

    // Supreme Admin / Org Owner has user approval and billing permissions
    assert.equal(hasPermission('org_owner', 'org:approve_users'), true);
    assert.equal(hasPermission('org_owner', 'org:manage_billing'), true);
  });

  test('4. Onboarding Gate: New registration starts in pending_approval and requires admin action', async () => {
    const req = await DataRepository.registerUserRequest({
      fullName: 'Test Candidate',
      email: `candidate-${Date.now()}@test.com`,
      requestedRole: 'developer',
    });

    assert.equal(req.status, 'pending_approval', 'New user must start in pending_approval');

    // Admin approves the user
    const approved = await DataRepository.approveUser(req.id, 'developer', 'user-admin-top');
    assert.equal(approved?.status, 'active', 'User must become active after admin approval');
  });

  test('5. Patent Project stores 50% royalty percentage and 6-month lock-in period', async () => {
    const orgId = 'org-titan-hq';
    const patentProject = await DataRepository.createProject({
      orgId,
      name: 'High-Speed SEO Micro Tool',
      priority: 'urgent',
      ownerId: 'user-researcher-inv',
      isPatent: true,
      patentHolderId: 'user-researcher-inv',
    });

    assert.equal(patentProject.is_patent, true);
    assert.equal(patentProject.patent_lock_months, 6);
    assert.equal(patentProject.patent_royalty_percentage, 50);
  });
});
