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
      {/* Modern Navigation - Fully Responsive */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <a href="https://savians.com" className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0">
              <img 
                src="/savians-logo.png" 
                alt="Savians Logo" 
                className="h-10 sm:h-12 w-auto"
              />
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-4 md:gap-6">
              <a 
                href="https://savians.com" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#14235C] dark:hover:text-white font-medium transition-colors"
              >
                Home
              </a>
              <Link 
                href="/login" 
                className="px-4 md:px-6 py-2.5 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
              <ThemeToggle />
            </div>

            {/* Mobile Navigation */}
            <div className="flex sm:hidden items-center gap-2">
              <ThemeToggle />
              <a 
                href="https://savians.com" 
                className="text-xs text-gray-700 dark:text-gray-300 hover:text-[#14235C] dark:hover:text-white font-medium px-2 py-1"
              >
                Home
              </a>
              <Link 
                href="/login" 
                className="px-3 py-2 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold transition-all shadow-md text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar - Why Become a Partner (Sticky on Desktop) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
              {/* Main Heading */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14235C] dark:text-white mb-3 sm:mb-4">
                  Why Become a Referral Partner?
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  Join our network of trusted professionals and unlock new revenue streams while providing exceptional value to your clients.
                </p>
              </div>

              {/* Benefits Cards */}
              <div className="space-y-3 sm:space-y-4">
                {/* Benefit 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#14235C] dark:bg-[#F4C64E] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Earn Competitive Commissions</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        Receive generous referral fees for every qualified client you refer. Our tiered commission structure rewards your success.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Trusted Expertise</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        Partner with Savians Tax Advisors, a recognized leader in tax consulting. Your clients receive top-tier professional service.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Simple & Transparent Process</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        Easy-to-use dashboard, real-time tracking, and straightforward payment terms. No hidden fees or complicated processes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600 dark:bg-yellow-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Dedicated Support</h3>
                      <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                        Access to our partner success team, marketing materials, and resources to help you succeed every step of the way.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="bg-gradient-to-r from-[#14235C] to-[#1e3470] dark:from-[#F4C64E] dark:to-[#f5d264] rounded-lg sm:rounded-xl p-4 sm:p-6 text-white dark:text-gray-900">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">500+</div>
                    <div className="text-xs sm:text-sm opacity-90">Active Partners</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">$2M+</div>
                    <div className="text-xs sm:text-sm opacity-90">Paid Out</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold mb-1">98%</div>
                    <div className="text-xs sm:text-sm opacity-90">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Application Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#14235C] dark:text-white mb-2 sm:mb-3">Apply Now</h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  Fill out the form below and we'll review your application within 2-3 business days.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
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
                className="flex items-center gap-2 px-8 py-3 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Trust Indicators */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure Application</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>2-3 Day Review</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                <span>Dedicated Support</span>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
