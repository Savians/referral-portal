'use client';

/**
 * Admin Portal Layout
 * 
 * Shared layout for all admin pages with navigation
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
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Mail,
  Activity,
  LogOut,
  Menu,
  X,
  Shield,
  ArrowRight,
} from 'lucide-react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Navigation items with role-based access control
const allNavigationItems = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Applications', 
    href: '/admin/applications', 
    icon: FileText, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Partners', 
    href: '/admin/partners', 
    icon: Users, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Referrals', 
    href: '/admin/referrals', 
    icon: TrendingUp, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Payments', 
    href: '/admin/payments', 
    icon: DollarSign, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Invites', 
    href: '/admin/invites', 
    icon: Mail, 
    roles: ['ADMIN', 'SUPER_ADMIN'] 
  },
  { 
    name: 'Audit Log', 
    href: '/admin/audit-log', 
    icon: Activity, 
    roles: ['ADMIN', 'SUPER_ADMIN'] // Both ADMIN and SUPER_ADMIN can see audit logs
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user has SuperAdmin access
  const hasSuperAdminAccess = user?.hasSuperAdminAccess || user?.availableRoles?.includes('SUPER_ADMIN');

  // Filter navigation based on user role
  const navigation = React.useMemo(() => {
    if (!user) return [];
    return allNavigationItems.filter((item) => item.roles.includes(user.role));
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSwitchToSuperAdmin = () => {
    // Simple navigation - no API call needed
    router.push('/superadmin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Top Navigation */}
      <nav className="bg-[#14235C] dark:bg-gray-800 text-white shadow-lg transition-colors">
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
              <div className="hidden text-2xl font-bold">
                Savians
                <span className="text-xs bg-[#F4C64E] dark:bg-yellow-500 text-[#14235C] dark:text-gray-900 px-2 py-1 rounded-full font-semibold ml-2">
                  ADMIN
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'bg-white/20 dark:bg-gray-700 text-white font-semibold'
                        : 'text-blue-100 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
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
              <ThemeToggle />
              
              {/* SuperAdmin Access Button */}
              {hasSuperAdminAccess && (
                <button
                  onClick={handleSwitchToSuperAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  title="Switch to SuperAdmin Panel"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">SuperAdmin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {user && (
                <div className="text-right">
                  <p className="text-sm font-medium">{user.fullName}</p>
                  <p className="text-xs text-blue-200 dark:text-gray-400">{user.role}</p>
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
                  (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));
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
                {/* SuperAdmin Access Button - Mobile */}
                {hasSuperAdminAccess && (
                  <button
                    onClick={handleSwitchToSuperAdmin}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mb-2"
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium">SuperAdmin Panel</span>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <div>
                    {user && (
                      <>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-blue-200 dark:text-gray-400">{user.role}</p>
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
              © {new Date().getFullYear()} Savians Admin Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white"
              >
                Privacy
              </Link>
              <a
                href="mailto:admin@savians.com"
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
