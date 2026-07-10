'use client';

/**
 * W-9 Form Submission Page
 * 
 * Partner submits IRS Form W-9 after accepting agreement
 * - Pre-populates name and address from partner profile
 * - Reuses signature from agreement (no re-signing)
 * - Collects TIN/EIN and tax classification
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { partnerService } from '@/services/partner.service';
import { toast } from 'sonner';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

export default function W9FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);

  // Form fields
  const [taxClassification, setTaxClassification] = useState<string>('individual');
  const [llcTaxClass, setLlcTaxClass] = useState<string>('');
  const [tinType, setTinType] = useState<'ssn' | 'ein'>('ssn');
  const [tinEin, setTinEin] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [exemptPayeeCode, setExemptPayeeCode] = useState('');
  const [fatcaCode, setFatcaCode] = useState('');

  useEffect(() => {
    checkStatusAndLoadData();
  }, []);

  const checkStatusAndLoadData = async () => {
    try {
      // Check W-9 status
      const w9Status = await partnerService.getW9Status();
      
      if (w9Status.w9Completed) {
        // Already completed, redirect to banking
        router.push('/activate/banking');
        return;
      }

      if (!w9Status.hasAcceptedAgreement) {
        // Must accept agreement first
        toast.error('Please accept the partnership agreement first');
        router.push('/activate');
        return;
      }

      // Load partner profile to pre-fill
      const profile = await partnerService.getProfile();
      setPartnerData(profile);
      
      // Pre-fill address fields
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setState(profile.state || '');
      setZipCode(profile.zipCode || '');
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load W-9 status:', error);
      toast.error('Failed to load form data');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!tinEin) {
      toast.error('TIN/EIN is required');
      return;
    }

    if (!address || !city || !state || !zipCode) {
      toast.error('Complete address is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await partnerService.submitW9({
        taxClassification,
        llcTaxClassification: taxClassification === 'llc' ? llcTaxClass : undefined,
        tinType,
        tinEin,
        address,
        city,
        state,
        zipCode,
        exemptPayeeCode: exemptPayeeCode || undefined,
        fatcaExemptionCode: fatcaCode || undefined,
      });

      toast.success('W-9 form submitted successfully!');
      
      // Redirect to banking details
      router.push('/activate/banking');
    } catch (error: any) {
      console.error('W-9 submission failed:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to submit W-9 form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#14235C] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading W-9 form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-[#14235C] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IRS Form W-9
          </h1>
          <p className="text-gray-600">
            Request for Taxpayer Identification Number and Certification
          </p>
        </div>

        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Why do we need this?</p>
              <p>
                The IRS requires us to collect Form W-9 from all partners to report commission payments.
                Your information is encrypted and stored securely.
              </p>
            </div>
          </div>
        </div>

        {/* W-9 Form */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Line 1: Name (Pre-filled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1. Name (as shown on your income tax return). Name is required on this line; do not leave this line blank. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partnerData?.fullName || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Line 2: Business name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                2. Business name/disregarded entity name, if different from above
              </label>
              <input
                type="text"
                value={partnerData?.businessName || ''}
                disabled
                placeholder="Leave blank if same as line 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Line 3: Federal tax classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                3. Federal tax classification (Check only one of the following seven boxes.) <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="individual"
                    checked={taxClassification === 'individual'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>Individual/sole proprietor or single-member LLC</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="c_corporation"
                    checked={taxClassification === 'c_corporation'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>C Corporation</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="s_corporation"
                    checked={taxClassification === 's_corporation'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>S Corporation</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="partnership"
                    checked={taxClassification === 'partnership'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>Partnership</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="trust_estate"
                    checked={taxClassification === 'trust_estate'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>Trust/estate</span>
                </label>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="taxClass"
                      value="llc"
                      checked={taxClassification === 'llc'}
                      onChange={(e) => setTaxClassification(e.target.value)}
                      className="w-4 h-4 text-[#14235C]"
                    />
                    <span>Limited liability company. Enter the tax classification (C=C corporation, S=S corporation, P=Partnership) ▶</span>
                  </label>
                  {taxClassification === 'llc' && (
                    <input
                      type="text"
                      value={llcTaxClass}
                      onChange={(e) => setLlcTaxClass(e.target.value.toUpperCase())}
                      placeholder="Enter C, S, or P"
                      maxLength={1}
                      className="ml-6 w-24 px-3 py-2 border border-gray-300 rounded-lg uppercase"
                    />
                  )}
                  <p className="text-xs text-gray-500 ml-6 mt-1">
                    Note: Check the appropriate box in the line above for the tax classification of the single-member owner. Do not check LLC if the LLC is classified as a single-member LLC that is disregarded from the owner unless the owner of the LLC is another LLC that is not disregarded from the owner for U.S. federal tax purposes. Otherwise, a single-member LLC that is disregarded from the owner should check the appropriate box for the tax classification of its owner.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="taxClass"
                    value="other"
                    checked={taxClassification === 'other'}
                    onChange={(e) => setTaxClassification(e.target.value)}
                    className="w-4 h-4 text-[#14235C]"
                  />
                  <span>Other (see instructions) ▶</span>
                </label>
              </div>
            </div>

            {/* Line 4: Exemptions (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4. Exemptions (codes apply only to certain entities, not individuals; see instructions on page 3):
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Exempt payee code (if any)
                    </label>
                    <input
                      type="text"
                      value={exemptPayeeCode}
                      onChange={(e) => setExemptPayeeCode(e.target.value)}
                      placeholder="Leave blank if not exempt"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Exemption from FATCA reporting code (if any)
                    </label>
                    <input
                      type="text"
                      value={fatcaCode}
                      onChange={(e) => setFatcaCode(e.target.value)}
                      placeholder="Leave blank if not exempt"
                      maxLength={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  (Applies to accounts maintained outside the U.S.)
                </p>
              </div>
            </div>

            {/* Line 5: Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                5. Address (number, street, and apt. or suite no.) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
              />
            </div>

            {/* Line 6: City, State, ZIP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                6. City, state, and ZIP code <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-6 gap-4">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                  className="col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="ST"
                  maxLength={2}
                  required
                  className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="ZIP"
                  maxLength={10}
                  required
                  className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Line 7: List account number(s) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                7. List account number(s) here (optional)
              </label>
              <input
                type="text"
                placeholder="List account number(s) here (optional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent bg-gray-100"
                disabled
              />
            </div>

            {/* Part I: TIN */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Part I — Taxpayer Identification Number (TIN)
              </h3>
              
              <p className="text-sm text-gray-700 mb-4">
                Enter your TIN in the appropriate box. The TIN provided must match the name given on line 1 to avoid backup withholding. For individuals, this is generally your social security number (SSN). However, for a resident alien, sole proprietor, or disregarded entity, see the instructions for Part I, later. For other entities, it is your employer identification number (EIN). If you do not have a number, see How to get a TIN, later.
              </p>
              
              <p className="text-sm text-gray-700 mb-4 font-medium">
                Note: If the account is in more than one name, see the instructions for line 1. Also see What Name and Number To Give the Requester for guidelines on whose number to enter.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="radio"
                        name="tinType"
                        value="ssn"
                        checked={tinType === 'ssn'}
                        onChange={() => setTinType('ssn')}
                        className="w-4 h-4 text-[#14235C]"
                      />
                      <span className="font-medium">Social security number</span>
                    </label>
                    {tinType === 'ssn' && (
                      <input
                        type="text"
                        value={tinEin}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 9) value = value.slice(0, 9);
                          setTinEin(value);
                        }}
                        placeholder="___-__-____"
                        required
                        className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono text-lg"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <span className="text-sm">or</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="radio"
                      name="tinType"
                      value="ein"
                      checked={tinType === 'ein'}
                      onChange={() => setTinType('ein')}
                      className="w-4 h-4 text-[#14235C]"
                    />
                    <span className="font-medium">Employer identification number</span>
                  </label>
                  {tinType === 'ein' && (
                    <input
                      type="text"
                      value={tinEin}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 9) value = value.slice(0, 9);
                        setTinEin(value);
                      }}
                      placeholder="__-_______"
                      required
                      className="w-full max-w-xs px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-[#14235C] focus:border-transparent font-mono text-lg"
                    />
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  Enter digits only (no dashes or spaces). The format will be applied automatically on the generated PDF.
                </p>
              </div>
            </div>

            {/* Part II: Certification */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Part II — Certification
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2 mb-4">
                <p className="font-medium">Under penalties of perjury, I certify that:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and</li>
                  <li>I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and</li>
                  <li>I am a U.S. citizen or other U.S. person (defined below); and</li>
                  <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
                </ol>
                <p className="text-xs mt-3 font-medium">
                  Certification instructions. You must cross out item 2 above if you have been notified by the IRS that you are currently subject to backup withholding because you have failed to report all interest and dividends on your tax return. For real estate transactions, item 2 does not apply. For mortgage interest paid, acquisition or abandonment of secured property, cancellation of debt, contributions to an individual retirement arrangement (IRA), and generally, payments other than interest and dividends, you are not required to sign the certification, but you must provide your correct TIN. See the instructions for Part II, later.
                </p>
              </div>

              <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Sign Here
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Signature of U.S. person ▶
                  </p>
                  {partnerData?.latestAgreement?.signatureDataUrl ? (
                    <div className="border border-gray-300 rounded-lg p-2 bg-white inline-block">
                      <img 
                        src={partnerData.latestAgreement.signatureDataUrl} 
                        alt="Signature" 
                        className="h-16 max-w-md"
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-600 text-sm">
                      Signature from agreement will be used
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Date ▶</p>
                  <p className="text-sm font-medium text-gray-900">
                    {partnerData?.latestAgreement?.acceptedAt ? new Date(partnerData.latestAgreement.acceptedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-xs text-blue-900">
                <p className="font-medium mb-1">General Instructions</p>
                <p>
                  Section references are to the Internal Revenue Code unless otherwise noted. Future developments. For the latest information about developments related to Form W-9 and its instructions, such as legislation enacted after they were published, go to www.irs.gov/FormW9.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
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
                    Submitting W-9...
                  </>
                ) : (
                  'Submit W-9 Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
