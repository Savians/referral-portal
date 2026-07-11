'use client';

/**
 * Combined W-9 & Banking Details Onboarding Page
 * 
 * Partner uploads W-9 form and submits banking details after accepting agreement
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { FileText, AlertCircle, Loader2, Download, Upload, Building2, CheckCircle2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);

  // W-9 Form fields
  const [w9File, setW9File] = useState<File | null>(null);
  const [w9FileName, setW9FileName] = useState<string>('');

  // Banking Details fields
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [zelleId, setZelleId] = useState('');

  // Consent checkbox
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    checkStatusAndLoadData();
  }, []);

  const checkStatusAndLoadData = async () => {
    try {
      // Load partner profile
      const profile = await partnerService.getProfile();
      setPartnerData(profile);
      
      // Check if they've already completed onboarding
      if (profile.w9CompletedAt && profile.hasBankingDetails) {
        // Already completed, redirect to dashboard
        router.push('/partner/dashboard');
        return;
      }

      // Check if agreement has been accepted
      if (!profile.hasAcceptedAgreement) {
        toast.error('Please accept the partnership agreement first');
        router.push('/activate');
        return;
      }

      // Pre-fill banking if exists
      if (profile.bankName) {
        setBankName(profile.bankName);
      }
      if (profile.zelleId) {
        setZelleId(profile.zelleId);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load onboarding status:', error);
      toast.error('Failed to load form data');
      setIsLoading(false);
    }
  };

  const handleW9FileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setW9File(file);
      setW9FileName(file.name);
    }
  };

  const handleDownloadW9Template = () => {
    // Open IRS W-9 form in new tab
    window.open('https://www.irs.gov/pub/irs-pdf/fw9.pdf', '_blank');
  };

  const validateForm = (): boolean => {
    // Validate W-9
    if (!w9File) {
      toast.error('Please upload your completed W-9 form');
      return false;
    }

    // Validate Banking Details
    if (!bankName.trim()) {
      toast.error('Bank name is required');
      return false;
    }

    if (!routingNumber.trim() || routingNumber.length !== 9) {
      toast.error('Valid 9-digit routing number is required');
      return false;
    }

    if (!accountNumber.trim()) {
      toast.error('Account number is required');
      return false;
    }

    if (accountNumber !== confirmAccountNumber) {
      toast.error('Account numbers do not match');
      return false;
    }

    // Validate consent
    if (!hasConsent) {
      toast.error('Please confirm that all information is correct');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload W-9 file to S3
      const uploadUrlResponse = await partnerService.requestUploadUrl({
        fileName: w9File!.name,
        fileType: w9File!.type,
        mimeType: w9File!.type,
        fileSizeBytes: w9File!.size,
        documentType: 'W9_FORM',
      });

      // Upload file to S3
      await fetch(uploadUrlResponse.uploadUrl, {
        method: 'PUT',
        body: w9File,
        headers: {
          'Content-Type': w9File!.type,
        },
      });

      // Step 2: Submit W-9 completion (with S3 key)
      await partnerService.submitW9Upload({
        w9DocumentS3Key: uploadUrlResponse.s3Key,
        fileName: w9File!.name,
      });

      // Step 3: Submit banking details
      await partnerService.submitBankingDetails({
        bankName: bankName.trim(),
        routingNumber: routingNumber.trim(),
        accountNumber: accountNumber.trim(),
        zelleId: zelleId.trim() || undefined,
      });

      toast.success('Onboarding completed successfully!');
      
      // Redirect to dashboard
      router.push('/partner/dashboard');
    } catch (error: any) {
      console.error('Onboarding submission failed:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14235C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading onboarding form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Onboarding
          </h1>
          <p className="text-gray-600">
            One last step! Submit your W-9 form and banking details to start earning commissions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* W-9 Form Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <FileText className="w-8 h-8 text-[#14235C] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  IRS Form W-9
                </h2>
                <p className="text-gray-600 mb-4">
                  The IRS requires us to collect Form W-9 from all partners to report commission payments. 
                  This is a standard tax form used to request your Taxpayer Identification Number (TIN).
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-2">How to complete your W-9:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Download the official W-9 form from the IRS</li>
                        <li>Fill out all required fields including your name, address, and Tax ID</li>
                        <li>Sign and date the form</li>
                        <li>Save as PDF and upload below</li>
                      </ol>
                      <p className="mt-3 text-xs text-blue-800">
                        <strong>Note:</strong> Your information is encrypted and stored securely. We use bank-level security to protect your sensitive data.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Download W-9 Button */}
                <button
                  type="button"
                  onClick={handleDownloadW9Template}
                  className="flex items-center gap-2 bg-white border-2 border-[#14235C] text-[#14235C] px-6 py-3 rounded-lg hover:bg-[#14235C] hover:text-white transition-colors mb-6"
                >
                  <Download className="w-5 h-5" />
                  Download W-9 Form (IRS.gov)
                </button>

                {/* Upload W-9 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Completed W-9 Form <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#14235C] transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleW9FileChange}
                      className="hidden"
                      id="w9-upload"
                    />
                    <label
                      htmlFor="w9-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      {w9FileName ? (
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {w9FileName}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        PDF only, max 5MB
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banking Details Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <Building2 className="w-8 h-8 text-[#14235C] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Banking Details
                </h2>
                <p className="text-gray-600 mb-4">
                  Please provide your banking information so we can send your commission payments directly to your account. 
                  All banking details are encrypted and stored securely.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-900">
                      <p className="font-medium mb-1">Why we need your banking details:</p>
                      <p>
                        We send commission payments via direct deposit (ACH) or Zelle for faster, more secure payments. 
                        You'll receive payment within 2-3 business days of approval.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Banking Form Fields */}
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g., Chase, Bank of America, Wells Fargo"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                    />
                  </div>

                  {/* Routing Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 9) {
                          setRoutingNumber(value);
                        }
                      }}
                      placeholder="9-digit routing number"
                      maxLength={9}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The 9-digit number at the bottom left of your check
                    </p>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                      placeholder="Your account number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono"
                    />
                  </div>

                  {/* Confirm Account Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\s/g, ''))}
                      placeholder="Re-enter your account number"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono"
                    />
                  </div>

                  {/* Zelle ID (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zelle ID (Email or Phone) - Optional
                    </label>
                    <input
                      type="text"
                      value={zelleId}
                      onChange={(e) => setZelleId(e.target.value)}
                      placeholder="email@example.com or +1234567890"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If you prefer Zelle payments, provide your Zelle email or phone number
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                required
                className="w-5 h-5 text-[#14235C] rounded border-gray-300 focus:ring-2 focus:ring-[#14235C] mt-0.5"
              />
              <span className="text-sm text-gray-700">
                <strong>I certify that:</strong> The information I have provided is accurate and complete. 
                I understand that this information will be used to process commission payments and for tax reporting purposes. 
                I authorize Savians to store my banking details securely and use them for payment processing.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#14235C] text-white px-6 py-3 rounded-lg hover:bg-[#0d1640] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Onboarding'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
