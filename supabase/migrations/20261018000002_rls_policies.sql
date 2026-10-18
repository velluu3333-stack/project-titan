-- Migration: 20261018000002_rls_policies.sql
-- Description: PostgreSQL Row Level Security (RLS) policies for complete multi-tenant isolation

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_execution_records ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if user is platform admin
CREATE OR REPLACE FUNCTION is_platform_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles WHERE id = user_id AND is_platform_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check active membership in organization
CREATE OR REPLACE FUNCTION is_org_member(user_id UUID, target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_memberships
        WHERE user_id = user_id AND org_id = target_org_id AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Check if user has specific org roles
CREATE OR REPLACE FUNCTION has_org_role(user_id UUID, target_org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_memberships
        WHERE user_id = user_id AND org_id = target_org_id AND status = 'active' AND role = ANY(allowed_roles)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (id = auth.uid() OR is_platform_admin(auth.uid()));

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (id = auth.uid());

-- ----------------------------------------------------
-- ORGANIZATIONS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Members can view their own organizations"
ON organizations FOR SELECT
USING (
    is_platform_admin(auth.uid()) OR
    id IN (SELECT org_id FROM organization_memberships WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Org owners can update their organization"
ON organizations FOR UPDATE
USING (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), id, ARRAY['org_owner'])
);

-- ----------------------------------------------------
-- ORGANIZATION MEMBERSHIPS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Members can view memberships in their organizations"
ON organization_memberships FOR SELECT
USING (
    is_platform_admin(auth.uid()) OR
    is_org_member(auth.uid(), org_id)
);

CREATE POLICY "Owners and admins can manage memberships"
ON organization_memberships FOR INSERT
WITH CHECK (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), org_id, ARRAY['org_owner', 'org_admin'])
);

CREATE POLICY "Owners and admins can update memberships"
ON organization_memberships FOR UPDATE
USING (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), org_id, ARRAY['org_owner', 'org_admin'])
);

-- ----------------------------------------------------
-- PROJECTS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Members can view projects in their organization"
ON projects FOR SELECT
USING (
    is_platform_admin(auth.uid()) OR
    is_org_member(auth.uid(), org_id)
);

CREATE POLICY "Authorized roles can create projects"
ON projects FOR INSERT
WITH CHECK (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), org_id, ARRAY['org_owner', 'org_admin', 'project_manager', 'team_lead'])
);

CREATE POLICY "Authorized roles can update projects"
ON projects FOR UPDATE
USING (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), org_id, ARRAY['org_owner', 'org_admin', 'project_manager']) OR
    owner_id = auth.uid()
);

-- ----------------------------------------------------
-- TASKS POLICIES
-- ----------------------------------------------------
CREATE POLICY "Members can view tasks in their organization"
ON tasks FOR SELECT
USING (
    is_platform_admin(auth.uid()) OR
    is_org_member(auth.uid(), org_id)
);

CREATE POLICY "Authorized members can create tasks"
ON tasks FOR INSERT
WITH CHECK (
    is_platform_admin(auth.uid()) OR
    is_org_member(auth.uid(), org_id) AND NOT has_org_role(auth.uid(), org_id, ARRAY['viewer'])
);

CREATE POLICY "Authorized members can update tasks"
ON tasks FOR UPDATE
USING (
    is_platform_admin(auth.uid()) OR
    (is_org_member(auth.uid(), org_id) AND NOT has_org_role(auth.uid(), org_id, ARRAY['viewer']))
);

-- ----------------------------------------------------
-- AUDIT EVENTS (Append-Only)
-- ----------------------------------------------------
CREATE POLICY "Members can view audit events for their organization"
ON audit_events FOR SELECT
USING (
    is_platform_admin(auth.uid()) OR
    has_org_role(auth.uid(), org_id, ARRAY['org_owner', 'org_admin'])
);

CREATE POLICY "System and authorized actors can append audit events"
ON audit_events FOR INSERT
WITH CHECK (TRUE);

-- Prevent deletion and update of audit events
CREATE POLICY "Audit events cannot be modified"
ON audit_events FOR UPDATE
USING (FALSE);

CREATE POLICY "Audit events cannot be deleted"
ON audit_events FOR DELETE
USING (FALSE);
