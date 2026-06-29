'use client';

/**
 * Partner Application Form - Single Step
 * 
 * Collect application details only.
 * Agreement signature will be collected during signup after approval.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { CheckCircle, Loader2, DollarSign, Users, Award, TrendingUp, Shield, Sparkles, Target, Handshake, BadgeCheck, Rocket, PenLine } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';
import type { CreateApplicationInput } from '@/types/api.types';
import ThemeToggle from '@/components/ThemeToggle';

// Validation schema
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Invalid phone number'),
  street: z.string().min(5, 'Street address is required').max(500),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  companyName: z.string().max(255).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ZipCodeData {
  city: string;
  state: string;
}


export default function ApplyPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zipCodeData, setZipCodeData] = useState<ZipCodeData | null>(null);
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const zipCode = watch('zipCode');

  // IntersectionObserver: hide floating button when form is visible
  useEffect(() => {
    const formEl = document.getElementById('application-form');
    if (!formEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBtn(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(formEl);
    return () => observer.disconnect();
  }, []);

  // ZIP code lookup function
  const lookupZipCode = async (zip: string) => {
    if (!/^\d{5}$/.test(zip)) {
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
          toast.error('Invalid ZIP code');
        }
      } else {
        setZipCodeData(null);
        toast.error('ZIP code not found');
      }
    } catch (error) {
      console.error('ZIP lookup error:', error);
      setZipCodeData(null);
      toast.error('Error looking up ZIP code');
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

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      // Construct address string
      const addressString = `${data.street}, ${zipCodeData?.city || ''}, ${zipCodeData?.state || ''} ${data.zipCode}, USA`;

      const cleanData: CreateApplicationInput = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: addressString,
        ...(data.companyName && { companyName: data.companyName }),
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
          <button
            onClick={() => window.location.href = '/'}
            className="block px-6 py-3 w-full bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen landing-page-bg">
      {/* Modern Navigation - Fully Responsive */}
      <header className="bg-white/10 dark:bg-gray-900/20 backdrop-blur-md border-b border-white/10 dark:border-gray-700/30 sticky top-0 z-50">
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
                className="text-white/80 hover:text-white font-medium transition-colors"
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
                className="text-xs text-white/80 hover:text-white font-medium px-2 py-1"
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

      {/* Hero CTA Banner - Right Aligned, Golden */}
      <div className="landing-content-right px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-2">
        <div className="bg-gradient-to-r from-[#F4C64E]/90 to-[#f5d264]/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 text-center shadow-2xl border border-[#F4C64E]/40">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#14235C] mb-2">
            Become a Savians Referral Partner Today
          </h2>
          <p className="text-[#14235C]/80 text-base sm:text-lg font-medium mb-4">
            Start referring. Help your network. Earn rewards.
          </p>
          <button
            onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-8 py-3 bg-[#14235C] text-white font-bold rounded-lg hover:bg-[#1a2d75] transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Apply Now →
          </button>
        </div>
      </div>
      {/* Why Become a Referral Partner - Glass Tiles */}
      <div className="landing-content-right px-4 sm:px-6 lg:px-8 py-4">
        <div className="glass-panel rounded-2xl p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#F4C64E]" />
            <span className="text-sm font-semibold text-[#F4C64E]">Partner Benefits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Why Become a Referral Partner?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card 1 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Help Your Network Save More on Taxes</h3>
                <p className="text-white/60 text-xs leading-relaxed">Introduce contacts to proactive tax planning that may help them discover meaningful, legally supported tax savings.</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Handshake className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">Create Value Through Trusted Referrals</h3>
                <p className="text-white/60 text-xs leading-relaxed">Help someone reduce tax stress, plan before year-end, and keep more of what they earn.</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-green-300 transition-colors">Earn Rewards for Qualified Referrals</h3>
                <p className="text-white/60 text-xs leading-relaxed">Get rewarded when your referral enrolls in the Savians Tax Assessment Program.</p>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">Grow Your Referral Income</h3>
                <p className="text-white/60 text-xs leading-relaxed">Earn $500, $600, or $700 per qualified referral based on your tier.</p>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">Unlock an Annual Bonus</h3>
                <p className="text-white/60 text-xs leading-relaxed">Earn an additional $1,000 annual bonus when you reach 10 qualified referrals.</p>
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">No Tax Expertise Required</h3>
                <p className="text-white/60 text-xs leading-relaxed">Simply make the introduction — no need to explain tax strategies or sell anything.</p>
              </div>
            </div>
          </div>

          {/* Card 7 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">We Handle the Advisory Process</h3>
                <p className="text-white/60 text-xs leading-relaxed">Savians handles assessment, tax strategy review, and advisory from start to finish.</p>
              </div>
            </div>
          </div>

          {/* Card 8 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-rose-300 transition-colors">Strengthen Your Relationships</h3>
                <p className="text-white/60 text-xs leading-relaxed">Position yourself as a trusted resource by connecting people with high-value tax advisory.</p>
              </div>
            </div>
          </div>

          {/* Card 9 */}
          <div className="glass-panel rounded-xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default sm:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Partner With a Compliance-Focused Tax Advisory Firm</h3>
                <p className="text-white/60 text-xs leading-relaxed">Savians focuses on proactive, IRS-compliant tax planning designed around each client's facts, income, structure, and goals.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form - Right Aligned, Semi-Transparent */}
      <div id="application-form" className="landing-content-right px-4 sm:px-6 lg:px-8 py-6 sm:py-10 scroll-mt-24">
            <div className="glass-panel rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#14235C]/5 to-transparent dark:from-[#F4C64E]/5 rounded-full blur-3xl -z-0"></div>

              <div className="relative z-10">
                <div className="mb-6 sm:mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4C64E]/20 rounded-full mb-3 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-[#F4C64E]">Quick Application</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Apply Now</h2>
                  <p className="text-sm sm:text-base text-white/70">
                    Fill out the form below and we'll review your application within 2-3 business days.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                  {/* Full Name */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address Section with Alert */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                          US Residence Is Required
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          You need to be a US Resident to become a part of this program!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('street')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="123 Main Street, Apt 4B"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* ZIP Code with City/State Display */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register('zipCode')}
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                          placeholder="12345"
                        />
                        {errors.zipCode && (
                          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                            <span className="text-xs">⚠</span> {errors.zipCode.message}
                          </p>
                        )}
                      </div>
                      {/* City and State Display */}
                      {zipCodeData && (
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium">{zipCodeData.city}, {zipCodeData.state}</span>
                          </div>
                        </div>
                      )}
                      {isLookingUpZip && (
                        <div className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      {...register('companyName')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Message */}
                  <div className="group">
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Tell us about yourself
                    </label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent resize-none transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500"
                      placeholder="Tell us about your business and why you'd like to become a referral partner..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-xs">⚠</span> {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#14235C] to-[#1e3470] dark:from-[#F4C64E] dark:to-[#f5d264] text-white dark:text-gray-900 rounded-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                      <span className="relative z-10">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <Rocket className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Trust Indicators */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Secure Application</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">SSL Encrypted</span>
                    </div>

                    <div className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">2-3 Day Review</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Fast Response</span>
                    </div>

                    <div className="group flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-200">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                          <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dedicated Support</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">We're Here to Help</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA Section - Moved from left sidebar */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#14235C] via-[#1e3470] to-[#14235C] dark:from-[#F4C64E] dark:via-[#f5d264] dark:to-[#F4C64E] rounded-2xl p-8 text-center shadow-2xl border border-white/10 dark:border-gray-900/10 group cursor-default mt-6">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>

              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 dark:bg-gray-900/10 rounded-full mb-4 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8 text-white dark:text-gray-900" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white dark:text-gray-900 mb-3 leading-tight">
                  Take the S.T.E.P. to Success With Savians
                </h3>
                <p className="text-white/90 dark:text-gray-900/90 text-base font-medium">
                  Start referring. Help your network. Earn rewards.
                </p>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/80 dark:text-gray-900/80">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5" />
                    <span>Trusted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span>Rewarding</span>
                  </div>
                </div>
              </div>
            </div>
      </div>

      {/* Full Content Section - From Document */}
      <div className="landing-content-right px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="glass-panel rounded-2xl shadow-xl p-8 sm:p-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Become a Savians Referral Partner
            </h2>
            <p className="text-xl text-white/80 font-semibold mb-2">
              Help People Save on Taxes. Get Rewarded for Trusted Referrals.
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-white/80 leading-relaxed mb-6">
              Many high-income earners, business owners, investors, and professionals are paying more in taxes than they may need to — not because they are doing anything wrong, but because they do not have proactive tax planning in place.
            </p>
            <p className="text-white/80 leading-relaxed mb-6">
              As a Savians Referral Partner, you can help connect your network with a tax advisory team focused on legal, strategic, and year-round tax planning. When your referral becomes a qualified client, you earn referral rewards — and your referral gets the opportunity to identify tax-saving strategies that may help them keep more of what they earn.
            </p>
            <p className="text-white/80 leading-relaxed font-semibold">
              This is more than a referral program. It is a way to create value for your network while building an additional income opportunity for yourself.
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12"></div>

          {/* Main Content Sections */}
          <div className="space-y-12">
            {/* Section 1 */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Why Become a Savians Referral Partner?
              </h3>

              <div className="space-y-8">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    1. Help Your Network Access Advanced Tax Planning
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Most people only think about taxes during filing season, when many planning opportunities are already gone. Savians helps qualified clients look at the bigger picture — income, entities, real estate, investments, retirement planning, deductions, and long-term tax strategy.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    By referring someone to Savians, you may help them move from reactive tax filing to proactive tax planning.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    2. Your Referral May Benefit from Real Tax-Saving Opportunities
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    The people you refer may be strong candidates for tax planning if they are:
                  </p>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>High-income W-2 earners</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Business owners</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Real estate investors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Self-employed professionals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Families with complex income sources</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Individuals paying significant federal taxes each year</span>
                    </li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    Through the Savians Tax Assessment Program, they receive a detailed review of their tax situation and potential planning opportunities based on their facts and eligibility.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    3. Earn Referral Rewards for Qualified Referrals
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Savians rewards approved referral partners when referred clients enroll in and pay for the Tax Assessment Program.
                  </p>
                  <p className="text-white/80 font-semibold mb-3">
                    Referral reward structure:
                  </p>
                  <ul className="space-y-2 text-white/80 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Referrals 1–3: $500 per qualified referral</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Referrals 4–7: $600 per qualified referral</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>Referrals 8 and above: $700 per qualified referral</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] mt-1">•</span>
                      <span>10 qualified referrals in a calendar year: Additional $1,000 annual bonus</span>
                    </li>
                  </ul>
                  <p className="text-white/80 leading-relaxed">
                    The more qualified clients you refer, the more your rewards can grow.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    4. Build Trust by Referring a High-Value Service
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    A tax problem is often one of the biggest financial pain points for successful people. When you introduce them to Savians, you are not just referring a service — you are offering them access to a professional advisory process that may help reduce stress, improve planning, and create better financial clarity.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    A good referral can strengthen your relationship with clients, friends, business contacts, and professional networks.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    5. Simple Referral Process
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    The Savians referral process is designed to be simple and trackable.
                  </p>
                  <p className="text-white/80 leading-relaxed mb-3">
                    Here is how it works:
                  </p>
                  <ol className="space-y-2 text-white/80 mb-4">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] font-bold">1.</span>
                      <span>You submit the referral using the official Savians referral process.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] font-bold">2.</span>
                      <span>Savians reviews the referral and connects with the prospective client.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] font-bold">3.</span>
                      <span>The client enrolls in the Tax Assessment Program.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F4C64E] font-bold">4.</span>
                      <span>Once the client's payment is received, cleared, and the referral is verified, your referral reward becomes eligible for payment.</span>
                    </li>
                  </ol>
                  <p className="text-white/80 leading-relaxed">
                    No tax advice, selling, or technical explanation is required from you. Your role is simply to make a trusted introduction.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold text-white mb-4">
                    6. Partner with a Brand Built Around Compliance and Strategy
                  </h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Savians Tax Advisors focuses on proactive, IRS-compliant tax planning. Our goal is to help clients identify legal strategies based on their specific income, structure, assets, and goals.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    Referral Partners are expected to represent Savians professionally and ethically. We do not allow misleading claims, unrealistic promises, or unauthorized marketing. This protects the client, the partner, and the Savians brand.
                  </p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Who Should You Refer */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Who Should You Refer?
              </h3>
              <p className="text-white/80 leading-relaxed mb-4">
                You may know someone who is a good fit if they say things like:
              </p>
              <ul className="space-y-3 text-white/80 bg-white/5 rounded-xl p-6 border border-white/10">
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"I pay too much in taxes."</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"My CPA only files my return."</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"I made good income, but I don't know where the money went."</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"I own rental properties and need better tax planning."</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"My business is growing, but my tax bill is growing too."</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#F4C64E] mt-1">•</span>
                  <span>"I want to plan before year-end instead of waiting until tax season."</span>
                </li>
              </ul>
              <p className="text-white/80 leading-relaxed mt-4">
                These are often signs that the person may benefit from a deeper tax strategy assessment.
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Partner Benefit + Client Benefit */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Partner Benefit + Client Benefit
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                The Savians Referral Partner Program is designed to create value on both sides.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-blue-400/30 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white mb-3">
                    For the Referral Partner:
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    You earn referral rewards for qualified referrals and create an additional income opportunity through your network.
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-green-400/30 backdrop-blur-sm">
                  <h4 className="text-lg font-bold text-white mb-3">
                    For the Referred Client:
                  </h4>
                  <p className="text-white/80 leading-relaxed">
                    They receive access to a professional tax assessment process that may help identify legal tax-saving opportunities, reduce tax stress, and improve long-term planning.
                  </p>
                </div>
              </div>
              {/* <p className="text-white/80 leading-relaxed mt-6 font-semibold text-center">
                That is the power of a good referral: you get rewarded, and your referral may get meaningful financial value.
              </p> */}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

            {/* Final CTA */}
            {/* <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Take the S.T.E.P. to Success with Savians
              </h3>
              <p className="text-white/80 leading-relaxed mb-6 max-w-3xl mx-auto">
                The Savians Tax Expert Partners Program is built for people who believe in relationships, trust, and value creation.
              </p>
              <p className="text-white/80 leading-relaxed mb-8 max-w-3xl mx-auto">
                If you know high-income earners, business owners, real estate investors, or professionals who may need proactive tax planning, becoming a Savians Referral Partner gives you a simple way to help them — while being rewarded for qualified introductions.
              </p>
              <div className="bg-gradient-to-r from-[#14235C] to-[#1e3470] dark:from-[#F4C64E] dark:to-[#f5d264] rounded-2xl p-8 text-center">
                <h4 className="text-2xl font-bold text-white dark:text-gray-900 mb-3">
                  Become a Savians Referral Partner Today
                </h4>
                <p className="text-white/90 dark:text-gray-900/90 text-lg font-medium">
                  Start referring. Help your network. Earn rewards.
                </p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {showFloatingBtn && (
        <button
          onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#F4C64E] to-[#f5d264] text-[#14235C] font-bold rounded-full shadow-2xl hover:shadow-[0_8px_30px_rgba(244,198,78,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 animate-[fadeInUp_0.4s_ease-out]"
          aria-label="Apply Now"
        >
          <PenLine className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="text-sm sm:text-base whitespace-nowrap">Apply Now</span>
        </button>
      )}
    </div>
  );
}
