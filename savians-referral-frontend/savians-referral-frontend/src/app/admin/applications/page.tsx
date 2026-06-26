'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Applications Page
 * 
 * Review and approve/reject partner applications
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import type { PartnerApplication } from '@/types/api.types';
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Filter,
  FileSignature,
  X,
} from 'lucide-react';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminApplicationsPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING');
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementToView, setAgreementToView] = useState<PartnerApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [applicationToReject, setApplicationToReject] = useState<PartnerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      loadApplications();
    }
  }, [authLoading, user, statusFilter]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const response = await adminService.listApplications(params);
      setApplications(response.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await adminService.approveApplication(id);
      toast.success('Application approved! Invite sent to partner.');
      loadApplications();
      setSelectedApp(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to approve application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      await adminService.rejectApplication(id, rejectionReason || undefined);
      toast.success('Application rejected');
      loadApplications();
      setSelectedApp(null);
      setShowRejectModal(false);
      setApplicationToReject(null);
      setRejectionReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to reject application');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Applications</h1>
          <p className="text-gray-600">
            Review and approve partner applications
          </p>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-[#14235C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No applications found</p>
            <p className="text-sm text-gray-500">
              {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} applications` : 'No applications yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#2C2C2C] mb-1">
                      {app.fullName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1 ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {getStatusIcon(app.status)}
                    {app.status}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${app.email}`} className="hover:text-[#14235C] underline">
                      {app.email}
                    </a>
                  </div>
                  {app.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${app.phone}`} className="hover:text-[#14235C]">
                        {app.phone}
                      </a>
                    </div>
                  )}
                  {app.companyName && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{app.companyName}</span>
                    </div>
                  )}
                </div>

                {/* Business Type */}
                {app.businessType && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Business Type</p>
                    <p className="text-sm text-gray-900">{app.businessType}</p>
                  </div>
                )}

                {/* Message */}
                {app.message && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Message</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {app.message}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {app.adminNotes && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                    <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {app.adminNotes}
                    </p>
                  </div>
                )}

                {/* Review Info */}
                {app.reviewedBy && app.reviewedAt && (
                  <div className="text-xs text-gray-500 mb-4">
                    Reviewed on {new Date(app.reviewedAt).toLocaleDateString()}
                  </div>
                )}

                {/* View Agreement Button */}
                {app.signatureDataUrl && (
                  <button
                    onClick={() => {
                      setAgreementToView(app);
                      setShowAgreementModal(true);
                    }}
                    className="w-full mb-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileSignature className="w-4 h-4" />
                    View Signed Agreement
                  </button>
                )}

                {/* Action Buttons */}
                {app.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleApprove(app.id)}
                      disabled={isProcessing}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setApplicationToReject(app);
                        setShowRejectModal(true);
                      }}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agreement Viewer Modal */}
      {showAgreementModal && agreementToView && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
                  <FileSignature className="w-6 h-6" />
                  Signed Agreement
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {agreementToView.fullName} • {new Date(agreementToView.agreementAcceptedAt || agreementToView.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAgreementModal(false);
                  setAgreementToView(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Agreement Text */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Agreement Content</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                    {agreementToView.agreementText || 'No agreement text available'}
                  </pre>
                </div>
              </div>

              {/* Agreement Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Agreement Version</p>
                  <p className="text-sm font-medium text-gray-900">{agreementToView.agreementVersion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Signed Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {agreementToView.agreementDate 
                      ? new Date(agreementToView.agreementDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">IP Address</p>
                  <p className="text-sm font-medium text-gray-900">{agreementToView.ipAddress || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Accepted At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {agreementToView.agreementAcceptedAt
                      ? new Date(agreementToView.agreementAcceptedAt).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Signature */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Signature</h3>
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                  {agreementToView.signatureDataUrl ? (
                    <img
                      src={agreementToView.signatureDataUrl}
                      alt="Signature"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-8">No signature available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Signed by {agreementToView.fullName}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowAgreementModal(false);
                  setAgreementToView(null);
                }}
                className="w-full btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && applicationToReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                  Reject Application
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {applicationToReject.fullName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setApplicationToReject(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to reject this application? This action cannot be undone.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={isProcessing}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none disabled:opacity-50"
                  placeholder="Enter the reason for rejection..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be saved as an admin note on the application.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setApplicationToReject(null);
                  setRejectionReason('');
                }}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg px-4 py-3 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(applicationToReject.id)}
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
