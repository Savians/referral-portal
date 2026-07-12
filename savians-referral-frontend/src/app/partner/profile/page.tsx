'use client';

export const dynamic = 'force-dynamic';

/**
 * Partner Profile Page
 * 
 * View and edit partner profile information
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/providers/AuthProvider';
import { partnerService } from '@/services/partner.service';
import type { UpdateProfileInput } from '@/types/api.types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Shield,
  Calendar,
  CheckCircle,
  Loader2,
  FileText,
  Download,
  ExternalLink,
  X,
  Building2,
  Edit,
} from 'lucide-react';
import { PARTNER_TYPES, US_STATES, PHONE_REGEX } from '@/lib/constants';

// W-9 Section Component
function W9Section() {
  const [isLoading, setIsLoading] = useState(true);
  const [w9Data, setW9Data] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchW9Data = async () => {
      try {
        const response = await partnerService.getW9Status();
        if (response.w9Completed) {
          const profile = await partnerService.getProfile();
          setW9Data(profile);
        }
      } catch (error) {
        console.error('Failed to fetch W-9 data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchW9Data();
  }, []);

  const handleViewW9 = async () => {
    try {
      const response = await partnerService.downloadW9();
      console.log('W-9 response:', response);
      // Use viewUrl for inline display in modal
      if (response.data?.viewUrl) {
        setPdfUrl(response.data.viewUrl);
        setIsPdfModalOpen(true);
      } else if (response.viewUrl) {
        // Try without .data nesting
        setPdfUrl(response.viewUrl);
        setIsPdfModalOpen(true);
      } else {
        console.error('No viewUrl in response:', response);
        toast.error('View URL not available');
      }
    } catch (error: any) {
      console.error('Failed to load W-9 form:', error);
      toast.error('Failed to load W-9 form');
    }
  };

  const handleDownloadW9 = async () => {
    try {
      const response = await partnerService.downloadW9();
      console.log('W-9 download response:', response);
      // Use downloadUrl for file download
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        toast.success('W-9 download started');
      } else if (response.downloadUrl) {
        // Try without .data nesting
        window.open(response.downloadUrl, '_blank');
        toast.success('W-9 download started');
      } else {
        console.error('No downloadUrl in response:', response);
        toast.error('Download URL not available');
      }
    } catch (error: any) {
      console.error('Failed to download W-9:', error);
      toast.error('Failed to download W-9');
    }
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl(null);
  };

  if (isLoading) {
    return null;
  }

  if (!w9Data?.w9CompletedAt) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          W-9 Tax Information
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  W-9 Form Submitted
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your W-9 form was submitted on {new Date(w9Data.w9CompletedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}. All your tax information is securely stored in your uploaded W-9 document.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleViewW9}
              className="btn-primary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View W-9 Form
            </button>
            <button
              onClick={handleDownloadW9}
              className="btn-outline flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* W-9 PDF Modal */}
      {isPdfModalOpen && pdfUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={closePdfModal}
        >
          <div 
            className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                W-9 Form
              </h3>
              <button
                onClick={closePdfModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="W-9 Form"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Banking Section Component
function BankingSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [bankingData, setBankingData] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    bankName: '',
    routingNumber: '',
    accountNumber: '',
    zelleId: '',
  });

  useEffect(() => {
    fetchBankingData();
  }, []);

  const fetchBankingData = async () => {
    try {
      const response = await partnerService.getBankingDetails();
      if (response.hasBankingDetails) {
        setBankingData(response);
      }
    } catch (error) {
      console.error('Failed to fetch banking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setEditForm({
      bankName: bankingData.bankName || '',
      routingNumber: bankingData.routingNumber || '',
      accountNumber: '',
      zelleId: bankingData.zelleId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBanking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.bankName || !editForm.routingNumber || !editForm.accountNumber || !editForm.zelleId) {
      toast.error('All fields are required');
      return;
    }

    if (editForm.routingNumber.length !== 9) {
      toast.error('Routing number must be 9 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await partnerService.updateBankingDetails(editForm);
      toast.success('Banking details updated successfully');
      setIsEditModalOpen(false);
      fetchBankingData();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update banking details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!bankingData) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Banking Details
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Bank Name
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {bankingData.bankName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Account Number
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg font-mono">
                ****{bankingData.accountNumberLast4}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Zelle ID
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {bankingData.zelleId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleEdit}
              className="btn-outline flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Banking Details
            </button>
          </div>
        </div>
      </div>

      {/* Edit Banking Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Edit Banking Details
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateBanking} className="p-6 space-y-4">
              <div>
                <label htmlFor="edit-bankName" className="form-label">
                  Bank Name *
                </label>
                <input
                  id="edit-bankName"
                  type="text"
                  value={editForm.bankName}
                  onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-routingNumber" className="form-label">
                  Routing Number (ABA) *
                </label>
                <input
                  id="edit-routingNumber"
                  type="text"
                  value={editForm.routingNumber}
                  onChange={(e) => setEditForm({ ...editForm, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  className="form-input font-mono"
                  maxLength={9}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-accountNumber" className="form-label">
                  Account Number *
                </label>
                <input
                  id="edit-accountNumber"
                  type="text"
                  value={editForm.accountNumber}
                  onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                  className="form-input font-mono"
                  placeholder="Enter your full account number"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-zelleId" className="form-label">
                  Zelle ID *
                </label>
                <input
                  id="edit-zelleId"
                  type="text"
                  value={editForm.zelleId}
                  onChange={(e) => setEditForm({ ...editForm, zelleId: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Banking Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  street: z.string().optional().or(z.literal('')),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits').optional().or(z.literal('')),
  businessName: z.string().optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  partnerType: z.string().optional().or(z.literal('')),
  referralAudience: z.string().optional().or(z.literal('')),
  estimatedVolume: z.string().optional().or(z.literal('')),
  paymentMethod: z.string().optional().or(z.literal('')),
  legalName: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ZipCodeData {
  city: string;
  state: string;
}

export default function PartnerProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const { user: protectedUser } = useProtectedRoute(['PARTNER']);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zipCodeData, setZipCodeData] = useState<ZipCodeData | null>(null);
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false);
  const [agreementData, setAgreementData] = useState<{
    id: string;
    version: string;
    acceptedAt: string;
    hasPdf: boolean;
  } | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const zipCode = watch('zipCode');

  // ZIP code lookup function
  const lookupZipCode = async (zip: string) => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setZipCodeData(null);
      return;
    }

    setIsLookingUpZip(true);
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (response.ok) {
        const data = await response.json();
        if (data.places && data.places.length > 0) {
          setZipCodeData({
            city: data.places[0]['place name'],
            state: data.places[0]['state abbreviation']
          });
        } else {
          setZipCodeData(null);
        }
      } else {
        setZipCodeData(null);
      }
    } catch (error) {
      console.error('ZIP lookup error:', error);
      setZipCodeData(null);
    } finally {
      setIsLookingUpZip(false);
    }
  };

  // Watch ZIP code and lookup when it changes
  useEffect(() => {
    if (zipCode && zipCode.length === 5) {
      lookupZipCode(zipCode);
    } else {
      setZipCodeData(null);
    }
  }, [zipCode]);

  // Fetch agreement data if partner has accepted agreement
  useEffect(() => {
    const fetchAgreementData = async () => {
      if (user?.partner?.hasAcceptedAgreement) {
        setIsLoadingAgreement(true);
        try {
          const response = await partnerService.getCurrentAgreement();
          
          if (response && response.latestAcceptedAgreement) {
            setAgreementData(response.latestAcceptedAgreement);
          }
        } catch (error: any) {
          console.error('Failed to fetch agreement data:', error);
        } finally {
          setIsLoadingAgreement(false);
        }
      }
    };

    fetchAgreementData();
  }, [user?.partner?.hasAcceptedAgreement]);

  useEffect(() => {
    if (user && user.partner) {
      // Parse address if it exists to extract street and ZIP
      let street = '';
      let zipCode = '';
      
      if (user.partner.address) {
        // Parse format: "street, city, state zipCode, USA"
        const parts = user.partner.address.split(',').map(p => p.trim());
        if (parts.length >= 1) {
          street = parts[0]; // First part is street
        }
        // Extract ZIP code from the second-to-last part
        if (parts.length >= 3) {
          const stateZipPart = parts[parts.length - 2]; // e.g., "NY 10001"
          const zipMatch = stateZipPart.match(/\d{5}$/);
          if (zipMatch) {
            zipCode = zipMatch[0];
          }
        }
      }

      // Pre-fill form with user data
      reset({
        fullName: user.fullName || '',
        phone: user.partner.phone || '',
        street: street,
        zipCode: zipCode,
        businessName: user.partner.businessName || '',
        jobTitle: user.partner.jobTitle || '',
        partnerType: user.partner.partnerType || '',
        referralAudience: user.partner.referralAudience || '',
        estimatedVolume: user.partner.estimatedVolume || '',
        paymentMethod: user.partner.paymentMethod || '',
        legalName: user.partner.legalName || '',
      });

      // If we have a ZIP code, lookup city/state
      if (zipCode) {
        lookupZipCode(zipCode);
      }
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      // Construct address string if street and zipCode are provided
      let addressString = '';
      if (data.street && data.zipCode && zipCodeData) {
        addressString = `${data.street}, ${zipCodeData.city}, ${zipCodeData.state} ${data.zipCode}, USA`;
      }

      // Filter out empty strings and prepare update data
      const cleanedData: UpdateProfileInput = {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phone && { phone: data.phone }),
        ...(addressString && { address: addressString }),
        ...(zipCodeData?.city && { city: zipCodeData.city }),
        ...(zipCodeData?.state && { state: zipCodeData.state }),
        ...(data.businessName && { businessName: data.businessName }),
        ...(data.jobTitle && { jobTitle: data.jobTitle }),
        ...(data.partnerType && { partnerType: data.partnerType }),
        ...(data.referralAudience && { referralAudience: data.referralAudience }),
        ...(data.estimatedVolume && { estimatedVolume: data.estimatedVolume }),
        ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
        ...(data.legalName && { legalName: data.legalName }),
      };

      await partnerService.updateProfile(cleanedData);
      
      toast.success('Profile updated successfully!');
      
      // Refresh user data
      await refreshUser();
      
      // Reset form dirty state
      reset(data);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewAgreement = async () => {
    if (!agreementData?.id) {
      toast.error('Agreement not found');
      return;
    }

    try {
      const response = await partnerService.getAgreementPdf(agreementData.id);
      
      // Use viewUrl for modal display (inline)
      if (response.viewUrl) {
        setPdfUrl(response.viewUrl);
        setIsPdfModalOpen(true);
      } else if (response.downloadUrl) {
        // Fallback to downloadUrl if viewUrl not available
        setPdfUrl(response.downloadUrl);
        setIsPdfModalOpen(true);
      } else {
        toast.error('Agreement PDF URL not available');
      }
    } catch (error: any) {
      console.error('Failed to fetch agreement PDF:', error);
      toast.error(error.message || 'Failed to load agreement');
    }
  };

  const handleDownloadAgreement = async () => {
    if (!agreementData?.id) {
      toast.error('Agreement not found');
      return;
    }

    try {
      const response = await partnerService.getAgreementPdf(agreementData.id);
      
      // Use downloadUrl for file download (attachment)
      if (response.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.fileName || `savians-agreement-v${agreementData.version}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Agreement download started');
      } else {
        toast.error('Agreement PDF URL not available');
      }
    } catch (error: any) {
      console.error('Failed to download agreement:', error);
      toast.error(error.message || 'Failed to download agreement');
    }
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfUrl(null);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2C2C2C] dark:text-white mb-2">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your account information and preferences
          </p>
        </div>

        {/* Account Information - Read Only */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Contact support to change your email
              </p>
            </div>
            {user.partner?.partnerId && (
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Partner ID
                </label>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg font-mono">
                  {user.partner.partnerId}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Role
              </label>
              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                {user.role}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                Status
              </label>
              <p
                className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        {user.partner?.hasAcceptedAgreement && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Partner Agreement
            </h2>
            
            {isLoadingAgreement ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#14235C] dark:text-blue-500" />
              </div>
            ) : agreementData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                      Agreement Version
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      v{agreementData.version}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Accepted On
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                      {new Date(agreementData.acceptedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {agreementData.hasPdf && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleViewAgreement}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Agreement
                    </button>
                    <button
                      onClick={handleDownloadAgreement}
                      className="btn-outline flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  </div>
                )}

                {!agreementData.hasPdf && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Your signed agreement is being processed. Please check back later or contact support if this persists.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No agreement information available.
                </p>
              </div>
            )}
          </div>
        )}

        {/* W-9 Information Section */}
        <W9Section />

        {/* Banking Details Section */}
        <BankingSection />

        {/* Editable Profile Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  {...register('fullName')}
                  type="text"
                  id="fullName"
                  className="form-input"
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="form-error">{errors.fullName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="form-input"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessName" className="form-label">
                  Business Name
                </label>
                <input
                  {...register('businessName')}
                  type="text"
                  id="businessName"
                  className="form-input"
                  placeholder="ABC Consulting LLC"
                />
              </div>
              <div>
                <label htmlFor="jobTitle" className="form-label">
                  Job Title
                </label>
                <input
                  {...register('jobTitle')}
                  type="text"
                  id="jobTitle"
                  className="form-input"
                  placeholder="Senior Consultant"
                />
              </div>
              <div>
                <label htmlFor="partnerType" className="form-label">
                  Partner Type
                </label>
                <select
                  {...register('partnerType')}
                  id="partnerType"
                  className="form-input"
                >
                  <option value="">Select type...</option>
                  {PARTNER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="legalName" className="form-label">
                  Legal Name (for payments)
                </label>
                <input
                  {...register('legalName')}
                  type="text"
                  id="legalName"
                  className="form-input"
                  placeholder="Legal entity name"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="referralAudience" className="form-label">
                  Target Audience
                </label>
                <input
                  {...register('referralAudience')}
                  type="text"
                  id="referralAudience"
                  className="form-input"
                  placeholder="Describe your typical referrals"
                />
              </div>
              <div>
                <label htmlFor="estimatedVolume" className="form-label">
                  Estimated Monthly Referrals
                </label>
                <select
                  {...register('estimatedVolume')}
                  id="estimatedVolume"
                  className="form-input"
                >
                  <option value="">Select volume...</option>
                  <option value="1-5">1-5 referrals</option>
                  <option value="6-10">6-10 referrals</option>
                  <option value="11-20">11-20 referrals</option>
                  <option value="21+">21+ referrals</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="form-label">
                  Preferred Payment Method
                </label>
                <select
                  {...register('paymentMethod')}
                  id="paymentMethod"
                  className="form-input"
                >
                  <option value="">Select method...</option>
                  <option value="ACH">ACH Transfer</option>
                  <option value="Wire">Wire Transfer</option>
                  <option value="Check">Check</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address Information
            </h2>
            <div className="space-y-4">
              {/* Street Address */}
              <div>
                <label htmlFor="street" className="form-label">
                  Street Address
                </label>
                <input
                  {...register('street')}
                  type="text"
                  id="street"
                  className="form-input"
                  placeholder="123 Main Street, Apt 4B"
                />
                {errors.street && (
                  <p className="form-error">{errors.street.message}</p>
                )}
              </div>

              {/* ZIP Code with City/State Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="form-label">
                    ZIP Code
                  </label>
                  <input
                    {...register('zipCode')}
                    type="text"
                    id="zipCode"
                    maxLength={5}
                    className="form-input"
                    placeholder="12345"
                  />
                  {errors.zipCode && (
                    <p className="form-error">{errors.zipCode.message}</p>
                  )}
                </div>

                {/* City and State Display (Read-only) */}
                <div>
                  <label className="form-label">
                    City, State
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg min-h-[46px]">
                    {isLookingUpZip && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Looking up...</span>
                      </div>
                    )}
                    {!isLookingUpZip && zipCodeData && (
                      <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium">{zipCodeData.city}, {zipCodeData.state}</span>
                      </div>
                    )}
                    {!isLookingUpZip && !zipCodeData && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Enter ZIP code above
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    City and State are automatically fetched from ZIP code
                  </p>
                </div>
              </div>

              {/* Current Address Display */}
              {user?.partner?.address && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                    Current Address on File:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {user.partner.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            {isDirty && (
              <button
                type="button"
                onClick={() => reset()}
                className="btn-outline"
                disabled={isSaving}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* PDF Modal */}
      {isPdfModalOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={closePdfModal}>
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white px-6 py-4 flex items-center justify-between z-10 rounded-t-lg">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Partner Agreement - v{agreementData?.version}
              </h3>
              <button
                onClick={closePdfModal}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="w-full h-full pt-16 pb-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0 rounded-b-lg"
                title="Agreement PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
