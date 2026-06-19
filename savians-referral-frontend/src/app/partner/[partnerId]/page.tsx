'use client';

/**
 * Public Referral Form
 * 
 * Partner shares this link: /partner/RP-9271
 * Validates partner and accepts referral submissions
 * 
 * GET /api/public/referral-form/{partnerId}
 * POST /api/public/referrals
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';
import type { CreateReferralInput, ReferralFormData } from '@/types/api.types';

// Validation schema matching backend
const referralSchema = z.object({
  clientFullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().regex(/^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Invalid phone number').optional().or(z.literal('')),
  estimatedIncome: z.string().max(50).optional().or(z.literal('')),
  serviceNeeded: z.string().max(255).optional().or(z.literal('')),
  additionalNotes: z.string().max(2000).optional().or(z.literal('')),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'You must provide consent to submit this referral' }),
  }),
});

type ReferralFormDataType = z.infer<typeof referralSchema>;

export default function PublicReferralFormPage() {
  const params = useParams();
  const partnerId = params.partnerId as string;

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [partnerData, setPartnerData] = useState<ReferralFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<ReferralFormDataType | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReferralFormDataType>({
    resolver: zodResolver(referralSchema),
  });

  // Restore form data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem(`referral_form_${partnerId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setLastSubmittedData(parsed);
        // Pre-fill form fields
        Object.keys(parsed).forEach((key) => {
          setValue(key as any, parsed[key]);
        });
      } catch (error) {
        console.error('Failed to restore form data:', error);
      }
    }
  }, [partnerId, setValue]);

  // Validate partner on mount
  useEffect(() => {
    if (!partnerId || !/^RP-\d+$/.test(partnerId)) {
      setIsValidating(false);
      setIsValid(false);
      return;
    }

    validatePartner();
  }, [partnerId]);

  const validatePartner = async () => {
    try {
      const data = await publicService.getReferralFormData(partnerId);
      setPartnerData(data);
      setIsValid(true);
    } catch (error: any) {
      setIsValid(false);
      toast.error(error.message || 'Partner not found or inactive');
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: ReferralFormDataType) => {
    setIsSubmitting(true);
    
    // Save form data to sessionStorage for persistence
    sessionStorage.setItem(`referral_form_${partnerId}`, JSON.stringify(data));
    setLastSubmittedData(data);
    
    try {
      const referralData: CreateReferralInput = {
        partnerId: partnerId,
        clientFullName: data.clientFullName,
        clientEmail: data.clientEmail,
        consentGiven: true,
        ...(data.clientPhone && { clientPhone: data.clientPhone }),
        ...(data.estimatedIncome && { estimatedIncome: data.estimatedIncome }),
        ...(data.serviceNeeded && { serviceNeeded: data.serviceNeeded }),
        ...(data.additionalNotes && { additionalNotes: data.additionalNotes }),
      };

      const response = await publicService.submitReferral(referralData);
      
      console.log('Referral submission response:', response);
      
      // Backend should provide calendlyUrl, use it directly
      const calendlyUrl = response.calendlyUrl;
      
      console.log('Calendly URL:', calendlyUrl);
      
      // Show success message briefly
      setIsSuccess(true);
      toast.success('Referral submitted successfully! Redirecting to schedule your consultation...');

      // Redirect to Calendly after 2 seconds
      if (calendlyUrl) {
        console.log('Redirecting to:', calendlyUrl);
        setTimeout(() => {
          // Clear form data after successful redirect
          sessionStorage.removeItem(`referral_form_${partnerId}`);
          window.location.href = calendlyUrl;
        }, 2000);
      } else {
        console.error('No Calendly URL in response:', response);
        toast.error('Calendly URL not available. Please contact support.');
      }
    } catch (error: any) {
      console.error('Failed to submit referral:', error);
      toast.error(error.message || 'Failed to submit referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-savians-navy animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating referral link...</p>
        </div>
      </div>
    );
  }

  // Invalid partner
  if (!isValid || !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-savians-navy mb-4">
            Invalid Referral Link
          </h2>
          <p className="text-gray-600 mb-6">
            This referral link is invalid or the partner is no longer accepting referrals. 
            Please contact your referral partner for an updated link.
          </p>
          <Link href="/" className="btn-primary w-full inline-block">
            Visit Savians Website
          </Link>
        </div>
      </div>
    );
  }

  // Success state with redirect message
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header with Brand Colors */}
            <div className="bg-gradient-to-r from-savians-navy to-savians-navy-light px-8 py-6">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-savians-navy mb-3">
                  Referral Submitted Successfully!
                </h2>
                <p className="text-lg text-gray-600">
                  Thank you for your interest in Savians tax advisory services.
                </p>
              </div>

              {/* Redirect Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Schedule Your Consultation
                    </h3>
                    <p className="text-sm text-blue-800 leading-relaxed mb-3">
                      You'll be redirected to our Calendly booking page in a moment to select a convenient time for your tax consultation.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="font-medium">Redirecting now...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                  What Happens Next
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center text-savians-navy text-xs font-bold">
                      1
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">
                      <span className="font-medium">Book your appointment</span> — Choose a date and time that works for you
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center text-savians-navy text-xs font-bold">
                      2
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">
                      <span className="font-medium">Receive confirmation</span> — Get an email with meeting details
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-savians-yellow rounded-full flex items-center justify-center text-savians-navy text-xs font-bold">
                      3
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">
                      <span className="font-medium">Prepare for your consultation</span> — Review your tax situation
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  If you're not redirected automatically, you can close this page.<br />
                  Our team will contact you within 1-2 business days to schedule your consultation.
                </p>
                {/* Manual redirect button for testing */}
                <button
                  onClick={() => {
                    // Fallback: manually trigger redirect for testing
                    const fallbackUrl = 'https://calendly.com/contactus-savians/';
                    console.log('Manual redirect triggered');
                    window.location.href = fallbackUrl;
                  }}
                  className="text-sm text-savians-navy hover:text-savians-navy-light underline"
                >
                  Click here if not redirected
                </button>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>IRS Compliant 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Avg. Tax Savings 70%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Trusted by Professionals</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Referral form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-savians-yellow rounded-lg flex items-center justify-center">
                <span className="text-savians-navy text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-savians-navy">Savians</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Partner Info Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-savians-yellow/20 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-savians-yellow/10 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-6 h-6 text-savians-navy" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">You've been referred by</p>
              <h2 className="text-2xl font-bold text-savians-navy">
                {partnerData.partnerName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Partner ID: {partnerData.partnerDisplayId}
              </p>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-savians-navy mb-4">
            Schedule Your Tax Consultation
          </h1>
          <p className="text-lg text-gray-600">
            Complete the form below and our team will contact you to discuss how we can help minimize your tax burden.
          </p>
        </div>

        {/* Referral Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="form-label">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('clientFullName')}
                type="text"
                className="form-input"
                placeholder="John Doe"
              />
              {errors.clientFullName && (
                <p className="form-error">{errors.clientFullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register('clientEmail')}
                type="email"
                className="form-input"
                placeholder="john@example.com"
              />
              {errors.clientEmail && (
                <p className="form-error">{errors.clientEmail.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone Number</label>
              <input
                {...register('clientPhone')}
                type="tel"
                className="form-input"
                placeholder="(555) 123-4567"
              />
              {errors.clientPhone && (
                <p className="form-error">{errors.clientPhone.message}</p>
              )}
            </div>

            {/* Estimated Income */}
            <div>
              <label className="form-label">Estimated Annual Income</label>
              <select {...register('estimatedIncome')} className="form-input">
                <option value="">Select a range</option>
                <option value="Under $100k">Under $100k</option>
                <option value="$100k - $250k">$100k - $250k</option>
                <option value="$250k - $500k">$250k - $500k</option>
                <option value="$500k - $1M">$500k - $1M</option>
                <option value="$1M - $5M">$1M - $5M</option>
                <option value="Over $5M">Over $5M</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.estimatedIncome && (
                <p className="form-error">{errors.estimatedIncome.message}</p>
              )}
            </div>

            {/* Service Needed */}
            <div>
              <label className="form-label">Service Needed</label>
              <select {...register('serviceNeeded')} className="form-input">
                <option value="">Select a service</option>
                <option value="Tax Planning">Tax Planning</option>
                <option value="Tax Preparation">Tax Preparation</option>
                <option value="Business Tax">Business Tax</option>
                <option value="Estate Planning">Estate Planning</option>
                <option value="Bookkeeping">Bookkeeping</option>
                <option value="CFO Services">CFO Services</option>
                <option value="Audit Support">Audit Support</option>
                <option value="Other">Other</option>
              </select>
              {errors.serviceNeeded && (
                <p className="form-error">{errors.serviceNeeded.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div>
              <label className="form-label">
                Additional Information (optional)
              </label>
              <textarea
                {...register('additionalNotes')}
                rows={4}
                className="form-input"
                placeholder="Tell us about your tax situation or specific needs..."
              />
              {errors.additionalNotes && (
                <p className="form-error">{errors.additionalNotes.message}</p>
              )}
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3">
              <input
                {...register('consentGiven')}
                type="checkbox"
                id="consent"
                className="mt-1 w-4 h-4 text-savians-navy border-gray-300 rounded focus:ring-savians-navy"
              />
              <label htmlFor="consent" className="text-sm text-gray-700">
                I consent to be contacted by Savians regarding tax advisory services. 
                I understand that submitting this form does not obligate me to any services. 
                <span className="text-red-500"> *</span>
              </label>
            </div>
            {errors.consentGiven && (
              <p className="form-error">{errors.consentGiven.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Referral'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Your information is secure and will only be used to contact you about Savians tax advisory services.
            </p>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Why choose Savians?</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-700">
            <span>✓ IRS Compliant 100%</span>
            <span>✓ Average Tax Savings 70%</span>
            <span>✓ Trusted by High-Income Earners</span>
          </div>
        </div>
      </div>
    </div>
  );
}
