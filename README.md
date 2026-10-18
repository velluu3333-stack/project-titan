# PROJECT TITAN • Company Operating System

A secure, multi-tenant, AI-powered Company Operating System designed for small and medium-sized teams, built with Next.js 16 (App Router), TypeScript Strict Mode, Tailwind CSS, and PostgreSQL Row Level Security (RLS).

---

## 1. Architectural Highlights

- **Multi-Tenant Isolation**: Tenant boundaries are enforced in PostgreSQL via Row Level Security (RLS) policies. Access is resolved server-side; client-supplied tenant identifiers are never trusted blindly.
- **Role-Based Access Control (RBAC)**: 9 initial roles (`org_owner`, `org_admin`, `project_manager`, `team_lead`, `developer`, `researcher`, `production_member`, `viewer`) mapped through an explicit permission matrix.
- **Platform Super Admin Boundary**: Platform infrastructure (`/platform-admin`) is strictly separated from tenant administration with dedicated permission verification.
- **Governed AI Automation**: Server-side tool allowlist (`list_authorized_projects`, `list_authorized_tasks`, `get_project_summary`, `create_task`, `update_task_status`) with risk-tier classification and audit logging.
- **Append-Only Auditing**: Every security-sensitive action, membership change, project update, and AI execution is logged immutably.
- **Dual-Mode Data Layer**: Seamlessly connects to managed Supabase PostgreSQL instances or runs against a stateful server-side relational store for offline development and test execution.

---

## 2. Directory Structure

```
├── supabase/
│   └── migrations/
│       ├── 20261018000001_initial_schema.sql    # Relational schema (profiles, orgs, projects, tasks, audits)
│       └── 20261018000002_rls_policies.sql      # Database-level Row Level Security policies
├── src/
│   ├── app/
│   │   ├── page.tsx                             # Product Landing & Access Portal
│   │   ├── platform-admin/                      # Super Admin Console (/platform-admin)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── workspace/                           # Company Operating System Workspace (/workspace)
│   │       ├── command-center/page.tsx          # Real-time Operational KPIs & Workload
│   │       ├── projects/page.tsx                # Projects (Kanban & List views, modals)
│   │       ├── projects/[id]/page.tsx           # Initiative details, objectives & deliverables
│   │       ├── tasks/page.tsx                   # Task management, priorities & assignments
│   │       ├── team/page.tsx                    # Memberships & RBAC permission matrix
│   │       ├── departments/page.tsx             # Functional departments & leadership
│   │       ├── research/page.tsx                # Evidence-based research lab & briefs
│   │       ├── development/page.tsx             # Technical specs & GitHub webhook boundary
│   │       ├── production/page.tsx              # Creative assets & deliverables
│   │       ├── documents/page.tsx               # Company handbooks & documentation
│   │       ├── communication/page.tsx           # Decisions & announcements
│   │       ├── ai/page.tsx                      # AI Command Center & tool allowlist
│   │       ├── reports/page.tsx                 # Velocity & progress analytics
│   │       ├── security/page.tsx                # Isolation status & tenant audit trail
│   │       └── settings/page.tsx                # Organization profile & SaaS plan quotas
│   ├── components/
│   │   ├── ui/                                  # Accessible design system (Button, Input, Card, Modal, etc.)
│   │   └── workspace/                           # TenantContext, WorkspaceSidebar, WorkspaceTopbar
│   ├── lib/
│   │   ├── auth/                                # RBAC matrix and permission checkers
│   │   ├── audit/                               # Append-only audit logging subsystem
│   │   ├── data/                                # DataRepository layer
│   │   └── utils.ts                             # Styling & formatting utilities
│   └── types/                                   # Database, RBAC, and workspace TypeScript definitions
├── tests/
│   └── security-and-rbac.test.ts                # Automated security & cross-tenant tests
└── .env.example                                 # Environment template
```

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
# 1. Clone and navigate to workspace
cd "team elite"

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local in-memory verification)
cp .env.example .env.local

# 4. Run automated security and RBAC tests
npm test

# 5. Run Next.js Turbopack development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to open the application portal, or navigate directly to:
- `/workspace/command-center` for the Company Operating System
- `/platform-admin` for the Platform Super Admin Console

---

## 4. Verification & Testing

PROJECT TITAN contains an automated unit and security test suite validating:
- Cross-tenant data isolation (User from Org A cannot access Org B records).
- Strict separation between Platform Super Admin and Tenant Admins.
- RBAC permission enforcement per role.
- State transitions on initiatives and tasks.
- Non-destructive organization suspension policies.

Run the test suite with:
```bash
npm test
```

Run production build verification with:
```bash
npm run build
```
