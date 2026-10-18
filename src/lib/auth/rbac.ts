import { OrgRole, Profile } from '@/types/database';
import { Permission, ROLE_PERMISSIONS } from '@/types/rbac';

export function hasPermission(role: OrgRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function isPlatformAdmin(user: Profile | undefined | null): boolean {
  if (!user) return false;
  return user.is_platform_admin === true;
}

export function canAccessTenant(
  userRole: OrgRole | undefined | null,
  targetOrgId: string,
  userOrgId: string,
  isPlatformAdminUser = false
): boolean {
  if (isPlatformAdminUser) return true;
  if (!userRole) return false;
  return targetOrgId === userOrgId;
}
