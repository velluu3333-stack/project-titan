'use client';

import React from 'react';
import { useTenant } from './TenantContext';
import {
  Search,
  Moon,
  Sun,
  UserCheck,
  Menu,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

export function WorkspaceTopbar() {
  const {
    currentUser,
    currentRole,
    pendingApprovals,
    isDarkMode,
    toggleDarkMode,
    toggleMobileSidebar,
    logoutUser,
    can,
  } = useTenant();

  return (
    <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left Section: Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Mark */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="h-7 w-7 rounded-lg bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-xs shadow-xs">
            TT
          </div>
          <span className="text-xs font-black tracking-wider text-zinc-900 dark:text-zinc-100 hidden xs:inline">
            TITAN
          </span>
        </div>

        {/* Search Bar with Keyboard Shortcut Chip */}
        <div className="hidden md:flex items-center w-72 lg:w-96">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
            <input
              type="text"
              placeholder="Search initiatives, tasks, patents, vault..."
              className="h-8.5 w-full rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-50/70 dark:bg-zinc-900/60 pl-8.5 pr-10 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-900 dark:focus:border-zinc-300 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400 dark:text-zinc-400 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pending Approvals Notice for Admin */}
        {can('org:approve_users') && pendingApprovals.length > 0 && (
          <Link
            href="/workspace/team#approvals"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-amber-300/80 dark:border-amber-700/80 bg-amber-50/90 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 animate-pulse shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">{pendingApprovals.length} Pending Approval</span>
            <span className="sm:hidden">{pendingApprovals.length}</span>
          </Link>
        )}

        {/* Live Systems Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/40 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Zero Failures</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
          title="Toggle Dark / Light Theme"
          aria-label="Toggle Dark / Light Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* User Pill & Sign Out Button */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-zinc-200/80 dark:border-zinc-800/80">
          <div className="relative">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-100 dark:to-zinc-300 text-white dark:text-zinc-950 flex items-center justify-center text-xs font-black shadow-xs ring-1 ring-zinc-700/20 dark:ring-white/20 shrink-0">
              {currentUser?.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('') || 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
          </div>

          <div className="text-left hidden md:block">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold leading-none text-zinc-900 dark:text-zinc-100">
                {currentUser?.full_name}
              </p>
              {currentUser?.is_platform_admin ? (
                <span className="text-[9px] uppercase font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-1 py-0.2 rounded">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] uppercase font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.2 rounded border border-zinc-200/60 dark:border-zinc-700/60">
                  {currentRole.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-tight truncate mt-0.5">
              {currentUser?.email}
            </p>
          </div>

          <button
            onClick={logoutUser}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-0.5"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
