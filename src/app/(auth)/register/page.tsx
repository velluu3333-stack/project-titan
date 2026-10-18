'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataRepository } from '@/lib/data/repository';
import { OrgRole } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Lock, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [requestedRole, setRequestedRole] = useState<OrgRole>('developer');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await DataRepository.registerUserRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        requestedRole,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>

      <Card className="max-w-md w-full p-6 space-y-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
            TT
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Request Workspace Access
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            PROJECT TITAN is a private company operating system. All account requests require explicit admin approval.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Access Request Submitted!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1">
                Your request has been routed to the Supreme Admin. You will receive an approval notification once your identity and role have been verified.
              </p>
            </div>
            <Link href="/workspace/command-center" className="block pt-2">
              <Button size="sm" variant="outline" className="w-full">
                Enter as Demo Admin / Member
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Full Legal Name *"
              placeholder="e.g. Rohit Verma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Corporate / Work Email *"
              placeholder="rohit@company.internal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Requested Operational Role
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as OrgRole)}
                className="h-10 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="developer">Developer (Software & Web Tools)</option>
                <option value="tester">Tester & QA (Security & Bugs)</option>
                <option value="researcher">Researcher (Patents & Innovations)</option>
                <option value="production">Production (Meta-Ads / Growth Marketing)</option>
                <option value="department_lead">Department Lead</option>
              </select>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-100 dark:border-zinc-700 flex items-start gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Zero Public Access: Accounts are placed into a <strong className="text-zinc-700 dark:text-zinc-300">Pending Approval</strong> state until cleared by the Supreme Admin.
              </span>
            </div>

            <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
              Submit Request for Approval
            </Button>

            <div className="text-center pt-2 text-xs text-zinc-500">
              Already approved?{' '}
              <Link href="/workspace/command-center" className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
                Enter Workspace
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
