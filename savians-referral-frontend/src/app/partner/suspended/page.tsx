'use client';

export const dynamic = 'force-dynamic';

/**
 * Partner Account Suspended Page
 * 
 * Displayed when a partner's account has been suspended by admin
 */

import React from 'react';
import Link from 'next/link';
import { ShieldOff, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function PartnerSuspendedPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-red-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
              <ShieldOff className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Account Suspended
            </h1>
            <p className="text-red-100 text-lg">
              Your referral partner account has been temporarily suspended
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-2">
                  What does this mean?
                </h2>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>You cannot access your partner portal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>You cannot submit new referrals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Your referral form is hidden from public view</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Existing referrals and payments are not affected</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Why was my account suspended?
                </h2>
                <p className="text-blue-800 mb-4">
                  Your account may have been suspended for one of the following reasons:
                </p>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Violation of terms of service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Suspicious or fraudulent activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Outstanding compliance requirements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Administrative review in progress</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-green-900 mb-2">
                  What should I do?
                </h2>
                <p className="text-green-800 mb-4">
                  To resolve this suspension and restore your account access:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-green-200">
                    <Mail className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Contact Support</p>
                      <a
                        href="mailto:admin@savians.com"
                        className="text-green-700 hover:text-green-800 underline text-sm"
                      >
                        admin@savians.com
                      </a>
                    </div>
                  </div>
                  <p className="text-sm text-green-700">
                    Include your Partner ID and a detailed explanation in your email. Our team will review your case and respond within 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:admin@savians.com?subject=Account%20Suspension%20Appeal"
                className="flex-1 bg-[#14235C] hover:bg-[#1a2d75] text-white font-medium rounded-lg px-6 py-3 transition-colors text-center flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Administrator
              </a>
              <button
                onClick={handleLogout}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Logout
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-[#14235C] underline"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>
            If you believe this suspension was made in error, please contact our support team immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
