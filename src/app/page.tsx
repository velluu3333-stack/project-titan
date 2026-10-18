import Link from 'next/link';
import {
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  Lock,
  Coins,
  Award,
  Crown,
  UserCheck,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-zinc-950 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
              TT
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-zinc-900">
                PROJECT TITAN
              </span>
              <span className="text-[10px] block font-semibold text-zinc-500 uppercase tracking-wider">
                Company Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              Request Access
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-700 border border-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/workspace/command-center"
              className="text-xs font-semibold text-white bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              Enter Workspace
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-700">
          <Crown className="w-3.5 h-3.5 text-amber-500" />
          <span>Private Company Software • Admin Approval Gate Active</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 max-w-4xl mx-auto leading-tight">
          The All-in-One Operating System <br />
          <span className="text-zinc-700">
            For Next-Gen Engineering Teams
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Unify Supreme Admin governance, Department Leads, Developer/Tester/Meta-Ads squads, Google AdSense traffic tracking, and 50% 6-Month Patent Royalty models under one roof.
        </p>

        {/* Hero Actions: Sign In & Request Access */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-950 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            Sign In to Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-50 transition-all shadow-xs w-full sm:w-auto"
          >
            <UserCheck className="w-4 h-4 text-amber-600" />
            Request Access
          </Link>
        </div>
      </section>

      {/* Core Highlights */}
      <section className="py-16 border-t border-zinc-200 bg-zinc-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Supreme Admin & Squad
              </h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Clear hierarchy: Supreme Admin (Tagda), Department Leads, Developers, Testers, Researchers, and Meta-Ads Production.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                50% Patent Royalty Pool
              </h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Team members who invent ideas get a 6-month lock-in with 50% gross revenue distribution credited to their name.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                AdSense & Memberships
              </h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                Dual monetization: Programmatic SEO tool traffic revenue + recurring paid pro members tracked with live charts.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs space-y-2">
              <Lock className="w-5 h-5 text-rose-600" />
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Legal & Confidential Vault
              </h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                NDAs, patent agreements, and dev task specifications with protected role downloads and zero public exposure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 bg-white text-center text-xs text-zinc-500">
        <p className="font-semibold text-zinc-800">PROJECT TITAN • Company Operating System</p>
        <p className="mt-1 text-[11px] text-zinc-500">
          Powered by Next.js 16, TypeScript Strict Mode & PostgreSQL Row Level Security.
        </p>
      </footer>
    </div>
  );
}
