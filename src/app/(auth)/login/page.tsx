'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataRepository } from '@/lib/data/repository';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, ShieldCheck, AlertCircle, KeyRound, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin.titan@company.internal');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const all = await DataRepository.getAllProfiles();
      const user = all.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setError('No registered account found with this email. Please request access first.');
        return;
      }

      if (user.status === 'pending_approval') {
        setError(
          'Access Blocked: Your account request is still PENDING APPROVAL by the Supreme Admin. Please wait for verification.'
        );
        return;
      }

      if (user.status === 'rejected' || user.status === 'suspended' || user.status === 'blocked') {
        setError('Access Denied: This account has been blocked or suspended by company administration.');
        return;
      }

      // Successful login -> save session in LocalStorage
      DataRepository.saveActiveSession(user);

      // Route to workspace
      router.push('/workspace/command-center');
    } finally {
      setIsLoading(false);
    }
  }

  function handleQuickFill(fillEmail: string) {
    setEmail(fillEmail);
    setPassword('admin123');
    setError('');
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
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
            TT
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign In to PROJECT TITAN
          </h1>
          <p className="text-xs text-zinc-500">
            Private corporate operating system protected by Row Level Security (RLS).
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Real / Corporate Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
            Sign In to Workspace
          </Button>
        </form>

        {/* Quick Testing Helpers */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <KeyRound className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick-Fill Accounts For Testing:</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin.titan@company.internal')}
              className="flex-1 text-left px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 transition-colors"
            >
              👑 <strong className="font-bold">Supreme Admin</strong>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('tariq.innovator@company.internal')}
              className="flex-1 text-left px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 transition-colors"
            >
              💡 <strong className="font-bold">Inventor (50% Patent)</strong>
            </button>
          </div>
        </div>

        <div className="text-center pt-1 text-xs text-zinc-500">
          <span>New team member? </span>
          <Link
            href="/register"
            className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            Request Access With Real Email
          </Link>
        </div>
      </Card>
    </div>
  );
}
