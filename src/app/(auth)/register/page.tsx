'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DataRepository } from '@/lib/data/repository';
import { OrgRole } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4 sm:p-6 transition-colors">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>

      <Card className="max-w-md w-full p-6 sm:p-7 space-y-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
            TT
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Request Workspace Access
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            PROJECT TITAN is a private company operating system. Register with your real email to request system access.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 text-center space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Access Request Submitted!
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                Your request for <strong className="font-bold underline">{email}</strong> has been registered. Because this is a private company system, the <strong className="font-bold">Supreme Admin</strong> must approve your account before you can sign in.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/login">
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Go to Sign In Page
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Real Personal / Corporate Email *"
              placeholder="e.g. rahul@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Choose a Password *"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Desired Operational Role
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

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-start gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Zero Public Access: Accounts are placed into <strong className="text-zinc-700 dark:text-zinc-300">Pending Approval</strong> until verified by the Supreme Admin.
              </span>
            </div>

            <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
              Submit Request for Approval
            </Button>

            <div className="text-center pt-2 text-xs text-zinc-500">
              <span>Already approved? </span>
              <Link href="/login" className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline">
                Sign in here
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
