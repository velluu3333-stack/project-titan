'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Profile, OrgRole } from '@/types/database';
import { Permission } from '@/types/rbac';
import { hasPermission } from '@/lib/auth/rbac';
import { DataRepository } from '@/lib/data/repository';

export type ThemeAccent = 'zinc' | 'blue' | 'emerald' | 'purple';

interface TenantContextValue {
  currentUser: Profile;
  activeOrg: Organization;
  currentRole: OrgRole;
  organizations: Organization[];
  allProfiles: Profile[];
  pendingApprovals: Profile[];
  isPlatformAdminUser: boolean;
  isDarkMode: boolean;
  themeAccent: ThemeAccent;
  can: (permission: Permission) => boolean;
  switchOrganization: (orgId: string) => void;
  switchRoleForDemo: (role: OrgRole) => void;
  switchUserForDemo: (userId: string) => void;
  toggleDarkMode: () => void;
  setThemeAccent: (accent: ThemeAccent) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  loginUser: (user: Profile) => void;
  logoutUser: () => void;
  refreshTeamData: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile>({
    id: 'user-admin-top',
    email: 'admin.titan@company.internal',
    full_name: 'Vikramaditya Sharma',
    avatar_url: null,
    is_platform_admin: true,
    status: 'active',
    requested_role: 'org_owner',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string>('org-titan-hq');
  const [currentRole, setCurrentRole] = useState<OrgRole>('org_owner');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('titan-theme');
      if (saved) return saved === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [themeAccent, setThemeAccent] = useState<ThemeAccent>('zinc');
  const [pendingApprovals, setPendingApprovals] = useState<Profile[]>([]);

  const refreshTeamData = async () => {
    const [profiles, orgs, pending] = await Promise.all([
      DataRepository.getAllProfiles(),
      DataRepository.getAllOrganizations(),
      DataRepository.getPendingApprovals(),
    ]);
    setAllProfiles(profiles);
    setOrganizations(orgs);
    setPendingApprovals(pending);
  };

  useEffect(() => {
    refreshTeamData();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('titan-theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('titan-theme', 'light');
      } catch {}
    }
  }, [isDarkMode]);

  const activeOrg =
    organizations.find((o) => o.id === activeOrgId) || {
      id: 'org-titan-hq',
      name: 'Titan Operating Enterprise',
      slug: 'titan-enterprise',
      status: 'active',
      plan_id: 'enterprise',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

  const can = (permission: Permission): boolean => {
    return hasPermission(currentRole, permission);
  };

  const switchOrganization = (orgId: string) => {
    setActiveOrgId(orgId);
  };

  const switchRoleForDemo = (role: OrgRole) => {
    setCurrentRole(role);
  };

  const switchUserForDemo = (userId: string) => {
    const target = allProfiles.find((p) => p.id === userId);
    if (target) {
      setCurrentUser(target);
      if (target.requested_role) {
        setCurrentRole(target.requested_role);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const loginUser = (user: Profile) => {
    DataRepository.saveActiveSession(user);
    setCurrentUser(user);
    if (user.requested_role) {
      setCurrentRole(user.requested_role);
    }
  };

  const logoutUser = () => {
    DataRepository.clearActiveSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentUser,
        activeOrg,
        currentRole,
        organizations,
        allProfiles,
        pendingApprovals,
        isPlatformAdminUser: currentUser.is_platform_admin,
        isDarkMode,
        themeAccent,
        can,
        switchOrganization,
        switchRoleForDemo,
        switchUserForDemo,
        toggleDarkMode,
        setThemeAccent,
        isMobileSidebarOpen,
        setMobileSidebarOpen: setIsMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        loginUser,
        logoutUser,
        refreshTeamData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
