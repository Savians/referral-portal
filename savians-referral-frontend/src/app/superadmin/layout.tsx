'use client';

/**
 * SuperAdmin Portal Layout
 * 
 * Shared layout for all superadmin pages with navigation
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { authService } from '@/services/auth.service';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Award,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowLeft,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Navigation items - all require SUPER_ADMIN role
const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/superadmin/dashboard', 
    icon: LayoutDashboard, 
  },
  { 
    name: 'System Users', 
    href: '/superadmin/system-users', 
    icon: Users, 
  },
  { 
    name: 'Agreement Templates', 
    href: '/superadmin/agreement-templates', 
    icon: FileText, 
  },
  { 
    name: 'Payout Tiers', 
    href: '/superadmin/payout-tiers', 
    icon: DollarSign, 
  },
  { 
    name: 'Milestone Bonuses', 
    href: '/superadmin/milestone-bonuses', 
    icon: Award, 
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SuperAdmin users can always access Admin dashboard
  const canAccessAdmin = user?.role === 'SUPER_ADMIN';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchToAdmin = () => {
    // Simple navigation - no API call needed
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 dark:bg-gradient-to-r dark:from-purple-950 dark:to-indigo-950 text-white shadow-lg transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="https://savians.com"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity mr-8"
            >
              <img 
                src="/savians-logo.png" 
                alt="Savians Tax Advisors" 
                className="h-8 w-auto object-contain"
                style={{ maxWidth: '200px' }}
                onError={(e) => {
                  // Fallback to text if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden items-center gap-2">
                <Shield className="w-6 h-6" />
                Savians
                <span className="text-xs bg-yellow-400 dark:bg-yellow-500 text-purple-900 dark:text-gray-900 px-2 py-1 rounded-full font-semibold">
                  SUPER ADMIN
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/superadmin/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-700 text-white font-semibold'
                        : 'text-purple-100 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User Menu & Theme Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              {/* Back to Admin Panel Button */}
              {canAccessAdmin && (
                <button
                  onClick={handleSwitchToAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-[#14235C] hover:bg-[#1a2d75] text-white rounded-lg transition-colors"
                  title="Switch to Admin Panel"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Admin Panel</span>
                </button>
              )}
              
              <ThemeToggle />
              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-purple-200 dark:text-gray-400">{user.role}</p>
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
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/superadmin/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-700 text-white font-semibold'
                        : 'text-purple-100 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-white/10 dark:border-gray-700">
                {/* Back to Admin Panel Button - Mobile */}
                {canAccessAdmin && (
                  <button
                    onClick={handleSwitchToAdmin}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-[#14235C] hover:bg-[#1a2d75] text-white rounded-lg transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      <span className="text-sm font-medium">Admin Panel</span>
                    </div>
                  </button>
                )}
                
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <div>
                    {user && (
                      <>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-purple-200 dark:text-gray-400">{user.role}</p>
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
              © {new Date().getFullYear()} Savians SuperAdmin Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-white"
              >
                Privacy
              </Link>
              <a
                href="mailto:superadmin@savians.com"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-900 dark:hover:text-white"
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
