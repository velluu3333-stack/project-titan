import { Project, Task, OrgRole, Profile } from './database';

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string | number;
  requiredPermission?: string;
  section?: string;
}

export interface WorkspaceSummary {
  activeProjectsCount: number;
  tasksDueTodayCount: number;
  overdueTasksCount: number;
  tasksInReviewCount: number;
  blockedTasksCount: number;
  teamMembersCount: number;
  recentProjects: Project[];
  upcomingTasks: Task[];
  recentActivity: {
    id: string;
    description: string;
    timestamp: string;
    actorName: string;
    type: 'project' | 'task' | 'member' | 'approval';
  }[];
}

export interface CurrentUserContext {
  user: Profile;
  activeOrgId: string;
  role: OrgRole;
  isPlatformAdmin: boolean;
}
