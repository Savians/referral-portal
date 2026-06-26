'use client';

/**
 * Partner Portal Layout
 * 
 * Shared layout for all partner pages with navigation
 * Includes agreement gate enforcement
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import ThemeToggle from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  FileText,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const navigation = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { name: 'Referrals', href: '/partner/referrals', icon: Users },
  { name: 'Payments', href: '/partner/payments', icon: DollarSign },
  { name: 'Profile', href: '/partner/profile', icon: User },
];

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAgreement, setIsCheckingAgreement] = useState(true);

  // Check if current route is a public referral page (e.g., /partner/RP-1234)
  const isPublicReferralPage = /^\/partner\/RP-\d+/.test(pathname);

  // Agreement Gate Enforcement - SKIP for public referral pages
  useEffect(() => {
    // Skip all checks for public referral pages
    if (isPublicReferralPage) {
      setIsCheckingAgreement(false);
      return;
    }

    // Skip check if we're already on the agreement page
    if (pathname === '/partner/agreement') {
      setIsCheckingAgreement(false);
      return;
    }

    // Wait for user data to load
    if (!user) {
      return;
    }

    // Only check for partners
    if (user.role === 'PARTNER') {
      const hasAccepted = user.partner?.hasAcceptedAgreement;
      
      if (!hasAccepted) {
        // Partner hasn't accepted agreement - redirect to agreement page
        console.log('Agreement not accepted, redirecting to agreement page');
        router.push('/partner/agreement');
        return;
      }
    }

    setIsCheckingAgreement(false);
  }, [user, pathname, router, isPublicReferralPage]);

  // Show loading while checking agreement status - SKIP for public pages
  if (isCheckingAgreement && pathname !== '/partner/agreement' && !isPublicReferralPage) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14235C] dark:border-[#F4C64E] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // For public referral pages, render children without navigation
  if (isPublicReferralPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Navigation */}
      <nav className="bg-[#14235C] dark:bg-gray-800 text-white shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/partner/dashboard"
              className="text-2xl font-bold hover:opacity-90 transition-opacity"
            >
              Savians
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/partner/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-700 text-white font-semibold'
                        : 'text-blue-100 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu & Theme Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  {user.partner?.partnerId && (
                    <p className="text-xs text-blue-200 dark:text-gray-400">{user.partner.partnerId}</p>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-gray-700 hover:bg-white/20 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 dark:border-gray-700">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/partner/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-700 text-white font-semibold'
                        : 'text-blue-100 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-white/10 dark:border-gray-700">
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <div>
                    {user && (
                      <>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        {user.partner?.partnerId && (
                          <p className="text-xs text-blue-200 dark:text-gray-400">{user.partner.partnerId}</p>
                        )}
                      </>
                    )}
                  </div>
                  <ThemeToggle />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-white/10 dark:bg-gray-700 hover:bg-white/20 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Savians. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white"
              >
                Privacy Policy
              </Link>
              <a
                href="mailto:support@savians.com"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
