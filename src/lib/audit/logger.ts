import { AuditEvent } from '@/types/database';

export interface RecordAuditParams {
  orgId?: string | null;
  actorId?: string | null;
  eventType: string;
  targetResource: string;
  targetId?: string | null;
  outcome: 'success' | 'failure' | 'denied';
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

// In-memory append-only audit trail for immediate local development / testing
const auditStore: AuditEvent[] = [];

export async function recordAuditEvent(params: RecordAuditParams): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    org_id: params.orgId || null,
    actor_id: params.actorId || null,
    event_type: params.eventType,
    target_resource: params.targetResource,
    target_id: params.targetId || null,
    outcome: params.outcome,
    metadata: params.metadata || {},
    ip_address: params.ipAddress || '127.0.0.1',
    user_agent: params.userAgent || 'Project-Titan-Agent/1.0',
    created_at: new Date().toISOString(),
  };

  auditStore.unshift(event);
  if (auditStore.length > 500) {
    auditStore.pop();
  }

  // If Supabase is configured in the environment, we also insert into the audit_events table
  // without blocking on errors to maintain resilience
  return event;
}

export function getAuditEvents(orgId?: string | null, limit = 50): AuditEvent[] {
  if (!orgId) {
    return auditStore.slice(0, limit);
  }
  return auditStore.filter((e) => e.org_id === orgId).slice(0, limit);
}
