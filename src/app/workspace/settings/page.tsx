'use client';

import React from 'react';
import { useTenant } from '@/components/workspace/TenantContext';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, CreditCard, Shield, Building } from 'lucide-react';

export default function SettingsPage() {
  const { activeOrg, currentRole, can } = useTenant();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Organization Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          General profile, subscription plan, and security defaults for {activeOrg.name}.
        </p>
      </div>

      {/* Organization Details */}
      <Card className="p-5 space-y-4">
        <CardHeader className="p-0 pb-3 border-b border-zinc-100">
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Legal name and tenant identification</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Company Name" defaultValue={activeOrg.name} disabled={!can('org:edit')} />
          <Input label="Tenant Identifier (Slug)" defaultValue={activeOrg.slug} disabled />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            Current status:{' '}
            <strong className="text-emerald-600 uppercase">{activeOrg.status}</strong>
          </span>
          {can('org:edit') && <Button size="sm">Save Changes</Button>}
        </div>
      </Card>

      {/* Subscription & Plan Limits */}
      <Card className="p-5 space-y-4">
        <CardHeader className="p-0 pb-3 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SaaS Subscription & Plan</CardTitle>
              <CardDescription>Current tier entitlements and usage quotas</CardDescription>
            </div>
            <Badge variant="info" className="uppercase font-bold text-[10px]">
              {activeOrg.plan_id} Plan
            </Badge>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
            <span className="text-zinc-500 font-semibold uppercase text-[10px]">Max Members</span>
            <p className="text-sm font-bold text-zinc-900">Unlimited (Pro)</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
            <span className="text-zinc-500 font-semibold uppercase text-[10px]">AI Tool Executions</span>
            <p className="text-sm font-bold text-zinc-900">10,000 / month</p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 space-y-1">
            <span className="text-zinc-500 font-semibold uppercase text-[10px]">Audit Log Retention</span>
            <p className="text-sm font-bold text-zinc-900">365 Days</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Payment provider integration: <strong className="text-zinc-700">Awaiting Stripe/Paddle credentials</strong>
          </p>
          {can('org:manage_billing') && (
            <Button size="sm" variant="outline" leftIcon={<CreditCard className="w-3.5 h-3.5" />}>
              Manage Billing
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
