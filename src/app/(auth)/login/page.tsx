'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataRepository } from '@/lib/data/repository';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin.titan@company.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const all = await DataRepository.getAllProfiles();
      const user = all.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError('No registered account found with this corporate email.');
        return;
      }

      if (user.status === 'pending_approval') {
        setError('Your account is currently PENDING APPROVAL by the Supreme Admin. Access is blocked.');
        return;
      }

      if (user.status === 'rejected' || user.status === 'suspended') {
        setError('This account has been suspended or rejected by company administration.');
        return;
      }

      // Approved user -> enter workspace
      router.push('/workspace/command-center');
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
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm mx-auto shadow-xs">
            TT
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sign In to Company OS
          </h1>
          <p className="text-xs text-zinc-500">
            Authenticated session protected by PostgreSQL Row Level Security (RLS).
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Corporate Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-100 dark:border-zinc-700 text-[11px] text-zinc-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pre-filled with Supreme Admin credentials for instant access.</span>
          </div>

          <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
            Sign In to Workspace
          </Button>

          <div className="text-center pt-2 text-xs text-zinc-500">
            Don't have an approved account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Request Approval
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
