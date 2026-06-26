'use client';

/**
 * Partner Agreement Acceptance Page
 * 
 * Partners must read and sign the agreement before accessing their dashboard
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SignatureCanvas from '@/components/SignatureCanvas';
import { toast } from 'sonner';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { isAuthenticated } from '@/lib/cognito';
import { api } from '@/services/api';

export const dynamic = 'force-dynamic';

export default function PartnerAgreementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreement, setAgreement] = useState<any>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [agreementDate, setAgreementDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadAgreement();
  }, []);

  const loadAgreement = async () => {
    try {
      // Check if user is authenticated via Cognito
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/login');
        return;
      }

      const response = await api.get('/api/partner/agreement/current');
      
      // If already accepted, redirect to dashboard
      if (response.data.hasAccepted) {
        router.push('/partner/dashboard');
        return;
      }

      setAgreement(response.data);
    } catch (error: any) {
      console.error('Failed to load agreement:', error);
      toast.error(error.message || 'Failed to load agreement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signatureDataUrl) {
      toast.error('Please provide your signature');
      return;
    }

    if (!fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!hasReadAgreement) {
      toast.error('Please confirm you have read the agreement');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push('/login');
        return;
      }

      await api.post('/api/partner/agreement/accept', {
        signatureDataUrl,
        fullName,
        agreedAt: new Date(agreementDate).toISOString(),
      });

      toast.success('Agreement accepted successfully!');
      
      // Small delay to show success message, then redirect to dashboard
      setTimeout(() => {
        router.push('/partner/dashboard');
        // Force page reload to refresh user data with updated agreement status
        window.location.href = '/partner/dashboard';
      }, 1000);
    } catch (error: any) {
      console.error('Failed to accept agreement:', error);
      toast.error(error.message || 'Failed to accept agreement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14235C] dark:border-[#F4C64E] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading agreement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-[#14235C] dark:text-[#F4C64E]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Referral Partner Agreement
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Version {agreement?.currentVersion || '1.0'}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Action Required</p>
                <p>
                  You must read and accept this agreement before accessing your referral partner dashboard.
                  Please read through the entire agreement carefully.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Text */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6 transition-colors">
          <div 
            className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 whitespace-pre-wrap text-sm leading-relaxed"
            style={{ maxHeight: '500px', overflowY: 'auto' }}
          >
            {agreement?.agreementText}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasReadAgreement}
                onChange={(e) => setHasReadAgreement(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#14235C] border-gray-300 rounded focus:ring-[#14235C]"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I have read and understood the entire agreement above and agree to its terms and conditions.
              </span>
            </label>
          </div>
        </div>

        {/* Signature Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Sign Agreement
          </h2>

          {/* Full Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Enter your full legal name"
            />
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={agreementDate}
              onChange={(e) => setAgreementDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Signature */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Signature *
            </label>
            <SignatureCanvas onSignatureChange={setSignatureDataUrl} />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={isSubmitting || !signatureDataUrl || !hasReadAgreement}
              className="flex items-center gap-2 px-6 py-3 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg font-semibold hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-gray-900"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept Agreement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
