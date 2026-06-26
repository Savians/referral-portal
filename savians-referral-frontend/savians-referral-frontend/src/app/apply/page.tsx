'use client';

/**
 * Partner Application Form - Multi-Step Process
 * 
 * Step 1: Application details → Next
 * Step 2: Agreement signature → Submit Application
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { toast } from 'sonner';
import type { CreateApplicationInput } from '@/types/api.types';
import SignatureCanvas from '@/components/SignatureCanvas';

// Validation schema
const applicationSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Invalid phone number').optional().or(z.literal('')),
  companyName: z.string().max(255).optional().or(z.literal('')),
  businessType: z.string().max(100).optional().or(z.literal('')),
  message: z.string().max(2000).optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const AGREEMENT_TEXT = `TAX ASSESSMENT PLAN – LEGAL SERVICE AGREEMENT

Effective Upon Acceptance at Checkout

This Agreement ("Agreement") is entered into by and between Savians LLC and Savians Tax Advisors Tulsa LLC, collectively doing business as "Savians Tax Advisors" (hereinafter referred to as the "Company"), and you, the Client.

This Agreement supplements any prior Assessment Agreement between the Parties and governs the provision of tax assessment, analysis, and advisory services. This Agreement does not include implementation, execution, or operational services, which shall be subject to a separate written Implementation Plan Agreement, if applicable.

By proceeding with payment and signing this agreement, you confirm that you have read, understood, and agreed to the following terms:

1. SCOPE OF SERVICES

a) Savians Tax Advisors will provide tax strategy analysis, planning, and advisory services to assist the Client in identifying legally permissible opportunities to reduce tax liability. Services begin after onboarding is complete and continue through delivery of the tax assessment and recommendations.

b) The Company provides advisory services only, including strategic guidance and compliance-oriented recommendations. The Client acknowledges that Savians Tax Advisors does not perform implementation, execution, transactional, or operational services under this Agreement.

c) Any implementation of recommended strategies may occur only pursuant to a separate written Implementation Plan Agreement executed between the Client and Savians Tax Advisors.

d) For the avoidance of doubt, no provision of this Agreement shall be construed as obligating Savians Tax Advisors to implement or execute any tax strategy.

2. MONEY-BACK GUARANTEE

a) If Company cannot identify and document legal tax strategies that show tax savings of at least four (4) times the amount you paid as an assessment fee, we will issue a refund to your original payment. Please refer to the Refund Policy for further details and exclusions.

b) "Projected tax savings" shall mean good-faith estimates based on the Client's financial data, applicable tax laws, and reasonable assumptions, and may depend on proper implementation and future conditions.

c) Any refund issued under this provision shall constitute the Client's sole and exclusive remedy, and the Client expressly waives any additional claims, damages, or causes of action arising out of or related to the services provided under this Agreement.

3. NON-ENGAGEMENT CLAUSE

If the assessment shows potential savings of four (4) times your payment or more, but Client chooses not to proceed, no refund or payment is due. The obligation is only on Company to show qualifying tax saving strategies and not to guarantee client action.

4. REFUND POLICY

a) Before Sharing Any Documents: You may request a full refund at any time before sharing any documents with Savians Tax Advisors. Please note that full refunds exclude actual payment processing fees incurred by the Company (typically ranging between $99–$110, depending on the payment provider).

b) Before Assessment Completion: If you decide to withdraw after uploading your documents to the portal but before completion of your tax assessment, 70% of your payment will be refunded, with 30% retained to cover preliminary work completed.

c) After Assessment Delivery: Once your full tax-saving assessment has been delivered, refunds are only available under the Money-Back Guarantee outlined above.

5. CLIENT RESPONSIBILITIES

You agree to provide accurate, timely, and complete information necessary to perform the services. Inaccurate or missing information may affect the effectiveness of our assessment.

6. CONFIDENTIALITY AND DATA PROTECTION

Both Parties acknowledge they may receive confidential or proprietary information during this engagement, including but not limited to Client financial data and Savians' proprietary methods ("Confidential Information").

The Parties agree to:
a) Maintain the strict confidentiality of all Confidential Information;
b) Use Confidential Information solely for the purposes of this Agreement;
c) Implement commercially reasonable safeguards to protect Confidential Information from unauthorized disclosure;
d) Return or securely destroy Confidential Information upon termination of this Agreement, unless retention is required by law.

These obligations survive the termination of this Agreement.

7. LIMITATION OF LIABILITY

Savians' total liability for any claim arising out of or relating to this Agreement is limited to the total amount paid by the Client under this Agreement. In no event shall Savians be liable for any indirect, incidental, or consequential damages.

8. TERMINATION

a) The Client may terminate this Agreement at any time by providing written notice to the Company. Any applicable refunds shall be governed strictly by the Refund Policy set forth herein.

b) The Company may terminate this Agreement upon written notice if the Client fails to provide required information, fails to cooperate, or if the Company determines that it cannot reasonably perform the services.

9. GOVERNING LAW

This Agreement shall be governed by and construed in accordance with the laws of the State of Texas.

10. ENTIRE AGREEMENT

This Agreement, together with any referenced policies or prior agreements, constitutes the entire understanding between the Parties and supersedes all prior discussions or agreements relating to the subject matter herein.

By signing below, you acknowledge having read, understood, and agreed to the terms of this Agreement.

SAVIANS TAX ADVISORS
Signature: [Company Signature]
Name: Nagesh Mishra
Title: Managing Partner & Co-Founder

CLIENT
Name: [To be filled]
Date: [To be filled]
Signature: [To be drawn]`;

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationFormData | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [hasReadAgreement, setHasReadAgreement] = useState(false);
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split('T')[0]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
  });

  const onNextStep = (data: ApplicationFormData) => {
    setApplicationData(data);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const onFinalSubmit = async () => {
    if (!applicationData || !signatureDataUrl || !hasReadAgreement) {
      toast.error('Please complete all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanData: CreateApplicationInput = {
        fullName: applicationData.fullName,
        email: applicationData.email,
        ...(applicationData.phone && { phone: applicationData.phone }),
        ...(applicationData.companyName && { companyName: applicationData.companyName }),
        ...(applicationData.businessType && { businessType: applicationData.businessType }),
        ...(applicationData.message && { message: applicationData.message }),
        agreementVersion: '1.0',
        agreementText: AGREEMENT_TEXT,
        signatureDataUrl: signatureDataUrl,
        agreementDate: new Date(agreementDate).toISOString(),
      };

      await publicService.submitApplication(cleanData);
      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
      reset();
      setApplicationData(null);
      setSignatureDataUrl(null);
      setStep(1);
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
            Thank you! Our team will review your application and contact you within 2-3 business days.
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
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F4C64E] rounded-lg flex items-center justify-center">
                <span className="text-[#14235C] text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-[#14235C] dark:text-white">Savians</span>
            </Link>
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-[#14235C] flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 1 ? 'bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900' : 'bg-green-500 text-white'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Details</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                step === 2 ? 'bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Agreement</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#14235C] dark:text-white mb-4">Become a Referral Partner</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {step === 1 && 'Tell us about yourself and your business'}
            {step === 2 && 'Review and sign the partner agreement'}
          </p>
        </div>

        {/* Step 1: Application Details */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit(onNextStep)} className="space-y-6">
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
                  Phone Number
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

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-[#14235C] dark:bg-[#F4C64E] text-white dark:text-gray-900 rounded-lg hover:bg-[#1a2d75] dark:hover:bg-[#f5d264] font-semibold shadow-lg transition-all"
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Agreement & Signature */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            {/* Agreement Text */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#14235C] dark:text-white mb-4">
                Referral Partner Agreement
              </h2>
              <div className="h-96 overflow-y-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-900">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800 dark:text-gray-200">
{AGREEMENT_TEXT}
                  </pre>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReadAgreement}
                  onChange={(e) => setHasReadAgreement(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[#14235C] dark:text-[#F4C64E] focus:ring-[#14235C] dark:focus:ring-[#F4C64E]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I have read and understood the Referral Partner Agreement and agree to its terms and conditions.
                </span>
              </label>
            </div>

            {/* Date Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={agreementDate}
                onChange={(e) => setAgreementDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#14235C] dark:focus:ring-[#F4C64E] focus:border-transparent"
              />
            </div>

            {/* Signature Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Signature <span className="text-red-500">*</span>
              </label>
              <SignatureCanvas
                onSignatureChange={setSignatureDataUrl}
                width={600}
                height={200}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo(0, 0);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                type="button"
                onClick={onFinalSubmit}
                disabled={isSubmitting || !hasReadAgreement || !signatureDataUrl}
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
          </div>
        )}
      </div>
    </div>
  );
}
