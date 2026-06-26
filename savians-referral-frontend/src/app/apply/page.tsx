'use client';

/**
 * Partner Application Form - Single Step
 * 
 * Collect application details only.
 * Agreement signature will be collected during signup after approval.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';
import type { CreateApplicationInput } from '@/types/api.types';
import ThemeToggle from '@/components/ThemeToggle';

// Validation schema
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Invalid phone number'),
  companyName: z.string().max(255).optional().or(z.literal('')),
  businessType: z.string().max(100).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;


export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const cleanData: CreateApplicationInput = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.businessType && { businessType: data.businessType }),
        ...(data.message && { message: data.message }),
      };

      await publicService.submitApplication(cleanData);
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Application Received!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your interest! Our team will review your application and contact you within 2-3 business days.
            If approved, you'll receive an invitation email with a signup link where you'll complete your registration and sign the partner agreement.
          </p>
          <Link href="/" className="block px-6 py-3 w-full bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center">
              <img 
                src="/savians-logo.png" 
                alt="Savians Logo" 
                className="h-12 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-[#14235C] dark:hover:text-white flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#14235C] dark:text-white mb-4">Become a Referral Partner</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Tell us about yourself and your business. After approval, you'll receive an invitation to complete your registration.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('fullName')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
                placeholder="Acme Corp"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business Type
              </label>
              <input
                type="text"
                {...register('businessType')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
                placeholder="e.g., Financial Advisory, CPA Firm, Insurance"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tell us about yourself
              </label>
              <textarea
                {...register('message')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent resize-none"
                placeholder="Tell us about your business and why you'd like to become a referral partner..."
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
