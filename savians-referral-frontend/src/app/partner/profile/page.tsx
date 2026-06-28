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
} from 'lucide-react';
import { PARTNER_TYPES, US_STATES, PHONE_REGEX } from '@/lib/constants';

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
    </div>
  );
}
