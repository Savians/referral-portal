'use client';

/**
 * Banking Details Submission Page
 * 
 * Partner submits banking details after W-9 completion
 * - Collects bank name, routing number, account number, Zelle ID
 * - Shows signature from agreement (no re-signing)
 * - Final step before accessing dashboard
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { Building2, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function BankingDetailsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreementData, setAgreementData] = useState<any>(null);

  // Form fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [zelleId, setZelleId] = useState('');

  useEffect(() => {
    checkStatusAndLoadData();
  }, []);

  const checkStatusAndLoadData = async () => {
    try {
      // Check W-9 status first
      const w9Status = await partnerService.getW9Status();
      
      if (!w9Status.hasAcceptedAgreement) {
        toast.error('Please accept the partnership agreement first');
        router.push('/activate');
        return;
      }

      if (!w9Status.w9Completed) {
        toast.error('Please complete W-9 form first');
        router.push('/activate/w9');
        return;
      }

      // Check if banking already completed
      try {
        const bankingData = await partnerService.getBankingDetails();
        if (bankingData.hasBankingDetails) {
          // Already completed, go to dashboard
          router.push('/partner/dashboard');
          return;
        }
      } catch (error) {
        // No banking details yet, that's okay
      }

      // Load agreement for signature
      const agreement = await partnerService.getCurrentAgreement();
      setAgreementData(agreement);
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load form data');
      setIsLoading(false);
    }
  };

  const formatRoutingNumber = (value: string) => {
    // Only allow digits, max 9
    return value.replace(/\D/g, '').slice(0, 9);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!bankName || !routingNumber || !accountNumber || !zelleId) {
      toast.error('All fields are required');
      return;
    }

    if (routingNumber.length !== 9) {
      toast.error('Routing number must be 9 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      await partnerService.submitBankingDetails({
        bankName,
        routingNumber,
        accountNumber,
        zelleId,
      });

      toast.success('Banking details submitted successfully!');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/partner/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('Failed to submit banking details:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to submit banking details');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#14235C] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#14235C] rounded-full mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Banking Details
          </h1>
          <p className="text-gray-600">
            Final step: Provide your banking information for commission payments
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm text-gray-600">Agreement</span>
            </div>
            <div className="w-12 h-0.5 bg-green-600"></div>
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm text-gray-600">W-9 Form</span>
            </div>
            <div className="w-12 h-0.5 bg-[#14235C]"></div>
            <div className="flex items-center">
              <div className="h-5 w-5 rounded-full bg-[#14235C] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <span className="ml-2 text-sm font-semibold text-gray-900">Banking</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Name */}
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                id="bankName"
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., Chase Bank"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                required
              />
            </div>

            {/* Routing Number */}
            <div>
              <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Routing Number (ABA) *
              </label>
              <input
                id="routingNumber"
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(formatRoutingNumber(e.target.value))}
                placeholder="9 digits"
                maxLength={9}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Found at the bottom of your check (first 9 digits)
              </p>
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                id="accountNumber"
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Your bank account number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                This account will be used for commission payments
              </p>
            </div>

            {/* Zelle ID */}
            <div>
              <label htmlFor="zelleId" className="block text-sm font-medium text-gray-700 mb-2">
                Zelle ID (Email or Phone) *
              </label>
              <input
                id="zelleId"
                type="text"
                value={zelleId}
                onChange={(e) => setZelleId(e.target.value)}
                placeholder="email@example.com or phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Email address or phone number linked to your Zelle account
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Your information is secure</p>
                  <p>All banking details are encrypted and stored securely. We will never share your information with third parties.</p>
                </div>
              </div>
            </div>

            {/* Signature from Agreement */}
            {agreementData?.signatureDataUrl && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Certification
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  By submitting this form, you certify that the banking information provided is accurate and belongs to you.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Your Signature (from Agreement)</p>
                      <div className="border border-gray-300 rounded bg-white p-2 h-20 flex items-center justify-center">
                        <Image
                          src={agreementData.signatureDataUrl}
                          alt="Signature"
                          width={200}
                          height={60}
                          className="max-h-16 w-auto"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Date</p>
                      <div className="border border-gray-300 rounded bg-white p-2 h-20 flex items-center px-4">
                        <p className="text-sm font-medium">
                          {new Date(agreementData.acceptedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#14235C] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1a2d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Complete Setup & Access Dashboard'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:contactus@savians.com" className="text-[#14235C] hover:underline">
              contactus@savians.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
