'use client';

/**
 * Admin Partner Detail Page
 * 
 * View detailed partner information
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  ShieldOff,
  ShieldCheck,
} from 'lucide-react';

export default function AdminPartnerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.id as string;
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [partner, setPartner] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    if (!authLoading && user && partnerId) {
      loadPartner();
    }
  }, [authLoading, user, partnerId]);

  const loadPartner = async () => {
    try {
      const response = await adminService.getPartner(partnerId);
      setPartner(response.data);
    } catch (error) {
      console.error('Failed to load partner:', error);
      toast.error('Failed to load partner details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Please provide a reason for suspension');
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.suspendPartner(partnerId, suspendReason);
      toast.success('Partner suspended successfully');
      setShowSuspendModal(false);
      setSuspendReason('');
      loadPartner(); // Reload to show updated status
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to suspend partner');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsuspend = async () => {
    const confirmed = confirm(
      `Are you sure you want to reactivate ${partner.fullName}?\n\nThis will:\n- Restore their login access\n- Allow them to submit new referrals\n- Make their referral form public again`
    );

    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await adminService.unsuspendPartner(partnerId, 'Access restored by admin');
      toast.success('Partner access restored successfully');
      loadPartner(); // Reload to show updated status
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to restore partner access');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendClick = () => {
    setShowSuspendModal(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Partner not found</p>
          <Link href="/admin/partners" className="btn-primary">
            Back to Partners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/partners"
            className="text-[#14235C] hover:underline flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">
                {partner.fullName}
              </h1>
              <p className="text-gray-600">Partner ID: {partner.partnerId}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${
                partner.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}
            >
              {partner.status === 'ACTIVE' ? (
                <CheckCircle className="w-4 h-4 inline mr-1" />
              ) : (
                <XCircle className="w-4 h-4 inline mr-1" />
              )}
              {partner.status}
            </span>
          </div>
        </div>

        {/* Suspend Modal */}
        <ConfirmModal
          isOpen={showSuspendModal}
          onClose={() => {
            setShowSuspendModal(false);
            setSuspendReason('');
          }}
          onConfirm={() => handleSuspend()}
          title="Suspend Partner"
          description={`You are about to suspend ${partner.fullName}.\n\nThis will:\n• Disable their login access\n• Prevent them from submitting new referrals\n• Hide their referral form from public view\n\nReason for suspension:\n${suspendReason || '(No reason provided)'}\n\nTo confirm this action, please type SUSPEND below:`}
          confirmWord="SUSPEND"
          confirmButtonText="Suspend Partner"
          isProcessing={isProcessing}
          variant="danger"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${partner.email}`}
                      className="text-sm text-[#14235C] hover:underline"
                    >
                      {partner.email}
                    </a>
                  </div>
                </div>
                {partner.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <a
                        href={`tel:${partner.phone}`}
                        className="text-sm text-[#14235C] hover:underline"
                      >
                        {partner.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </h2>
              <div className="space-y-4">
                {partner.businessName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Name</p>
                    <p className="text-sm font-semibold text-[#2C2C2C]">
                      {partner.businessName}
                    </p>
                  </div>
                )}
                {partner.jobTitle && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Job Title</p>
                    <p className="text-sm text-gray-900">{partner.jobTitle}</p>
                  </div>
                )}
                {partner.partnerType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Partner Type</p>
                    <p className="text-sm text-gray-900">{partner.partnerType}</p>
                  </div>
                )}
                {partner.referralAudience && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Referral Audience</p>
                    <p className="text-sm text-gray-900">{partner.referralAudience}</p>
                  </div>
                )}
                {partner.estimatedVolume && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Estimated Volume</p>
                    <p className="text-sm text-gray-900">{partner.estimatedVolume}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {(partner.city || partner.state || partner.address) && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h2>
                <div className="space-y-2">
                  {partner.address && (
                    <p className="text-sm text-gray-900">{partner.address}</p>
                  )}
                  {(partner.city || partner.state) && (
                    <p className="text-sm text-gray-900">
                      {partner.city}
                      {partner.city && partner.state && ', '}
                      {partner.state}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partner.paymentMethod && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm text-gray-900">{partner.paymentMethod}</p>
                  </div>
                )}
                {partner.legalName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Legal Name</p>
                    <p className="text-sm text-gray-900">{partner.legalName}</p>
                  </div>
                )}
                {partner.w9Status && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">W-9 Status</p>
                    <p className="text-sm text-gray-900">{partner.w9Status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Referrals</p>
                    <p className="text-2xl font-bold text-[#2C2C2C]">
                      {partner._count?.referrals || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Payments</p>
                    <p className="text-2xl font-bold text-[#2C2C2C]">
                      {partner._count?.payments || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Onboarding Method</p>
                  <p className="text-gray-900">{partner.onboardingMethod || 'N/A'}</p>
                </div>
                {partner.approvedAt && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Approved</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">
                        {new Date(partner.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Joined</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-[#2C2C2C] mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/admin/referrals?partnerId=${partner.partnerId}`}
                  className="btn-primary w-full block text-center"
                >
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  View Referrals
                </Link>
                <Link
                  href={`/admin/payments?partnerId=${partner.partnerId}`}
                  className="btn-outline w-full block text-center"
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  View Payments
                </Link>

                {partner.status === 'ACTIVE' && (
                  <>
                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Suspension Reason
                      </label>
                      <textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="Provide a detailed reason for suspension..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={handleSuspendClick}
                      disabled={isProcessing || !suspendReason.trim()}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2 disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Suspending...
                        </>
                      ) : (
                        <>
                          <ShieldOff className="w-4 h-4" />
                          Suspend Partner
                        </>
                      )}
                    </button>
                  </>
                )}

                {partner.status === 'SUSPENDED' && (
                  <>
                    {partner.suspendReason && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Suspension Reason:
                        </p>
                        <p className="text-sm text-gray-900 bg-red-50 border border-red-200 rounded-lg p-3">
                          {partner.suspendReason}
                        </p>
                        {partner.suspendedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Suspended on {new Date(partner.suspendedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleUnsuspend}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2 disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Revoke Access (Reactivate)
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
