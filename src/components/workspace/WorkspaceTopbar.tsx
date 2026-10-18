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
    <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left Section: Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Mark */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <div className="h-6 w-6 rounded bg-zinc-950 dark:bg-white flex items-center justify-center text-white dark:text-zinc-950 font-bold text-[11px]">
            TT
          </div>
          <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hidden xs:inline">
            TITAN
          </span>
        </div>

        {/* Search Bar (Hidden on phone screens, visible on md+) */}
        <div className="hidden md:flex items-center gap-3 w-64 lg:w-80">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search projects, tasks, patents, legal docs..."
              className="h-8 w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pl-8 pr-3 text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Pending Approvals Notice for Admin */}
        {can('org:approve_users') && pendingApprovals.length > 0 && (
          <Link
            href="/workspace/team#approvals"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 animate-pulse"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{pendingApprovals.length} Pending Approval</span>
            <span className="sm:hidden">{pendingApprovals.length}</span>
          </Link>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          title="Toggle Dark / Light Mode"
          aria-label="Toggle Dark / Light Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* User Pill & Sign Out Button */}
        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="h-7 w-7 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
            {currentUser?.full_name
              ?.split(' ')
              .map((n) => n[0])
              .join('') || 'U'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold leading-none text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
              {currentUser?.full_name}
              {currentUser?.is_platform_admin ? (
                <span className="text-[9px] uppercase font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1 rounded">
                  Admin
                </span>
              ) : (
                <span className="text-[9px] uppercase font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                  {currentRole.replace('_', ' ')}
                </span>
              )}
            </p>
            <p className="text-[10px] text-zinc-500 leading-tight truncate">{currentUser?.email}</p>
          </div>

          <button
            onClick={logoutUser}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
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
