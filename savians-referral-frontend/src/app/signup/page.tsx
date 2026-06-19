'use client';

/**
 * Partner Signup Page
 * 
 * Validates invite token and allows partner signup
 * GET /api/public/invite/validate/{token}
 * POST /api/auth/signup
 */

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { publicService } from '@/services/public.service';
import { authService } from '@/services/auth.service';
import { signIn } from '@/lib/cognito';
import { toast } from 'sonner';
import { PASSWORD_REGEX } from '@/lib/constants';
import { useAuth } from '@/providers/AuthProvider';

// Validation schema matching backend
const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/, 'Invalid phone number').optional().or(z.literal('')),
  businessName: z.string().max(255).optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(PASSWORD_REGEX, 'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [inviteData, setInviteData] = useState<{
    email: string;
    fullName?: string | null;
    phone?: string | null;
    businessName?: string | null;
    businessType?: string | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Validate invite token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setIsValid(false);
      return;
    }

    validateInvite();
  }, [token]);

  const validateInvite = async () => {
    try {
      const response = await publicService.validateInvite(token!);
      setIsValid(response.valid);
      setInviteData({
        email: response.email,
        fullName: response.fullName,
        phone: response.phone,
        businessName: response.businessName,
        businessType: response.businessType,
      });
      
      // Pre-fill form with all available data
      setValue('email', response.email);
      if (response.fullName) setValue('fullName', response.fullName);
      if (response.phone) setValue('phone', response.phone);
      if (response.businessName) setValue('businessName', response.businessName);
      if (response.businessType) setValue('jobTitle', response.businessType);
    } catch (error: any) {
      setIsValid(false);
      toast.error(error.message || 'Invalid or expired invite token');
    } finally {
      setIsValidating(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Create account
      await authService.signup({
        inviteToken: token!,
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        ...(data.phone && { phone: data.phone }),
        ...(data.businessName && { businessName: data.businessName }),
        ...(data.jobTitle && { jobTitle: data.jobTitle }),
      });

      toast.success('Account created successfully!');

      // Step 2: Auto-login the user with Cognito
      await signIn({
        email: data.email,
        password: data.password,
      });

      // Step 3: Redirect directly to agreement page
      router.push('/partner/agreement');
    } catch (error: any) {
      console.error('Signup/login error:', error);
      
      // Check if error is from signup or login
      if (error.response?.data?.error?.message) {
        // Backend API error (signup failed)
        toast.error(error.response.data.error.message);
      } else if (error.message) {
        // Cognito error (login failed) - account was created but auto-login failed
        toast.error('Account created but auto-login failed. Please login manually.');
        // Redirect to login page after short delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error('Failed to create account');
      }
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
          <p className="text-gray-600">Validating invite...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!token || !isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-savians-navy mb-4">
            Invalid Invite Token
          </h2>
          <p className="text-gray-600 mb-6">
            The invite link is invalid or has expired. Please contact your administrator for a new invite.
          </p>
          <Link href="/" className="btn-primary w-full inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Signup form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-savians-yellow rounded-lg flex items-center justify-center">
                <span className="text-savians-navy text-xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold text-savians-navy">Savians</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-savians-navy mb-4">
            Complete Your Registration
          </h1>
          <p className="text-gray-600">
            You've been invited to join Savians as a referral partner. Complete the form below to create your account.
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (read-only, visible) */}
            <div>
              <label className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                className="form-input bg-gray-100 text-gray-900 font-medium cursor-not-allowed"
                readOnly
                value={inviteData?.email || ''}
              />
              <p className="text-xs text-gray-500 mt-1">This is the email your invite was sent to</p>
            </div>

            {/* Full Name (read-only if provided) */}
            <div>
              <label className="form-label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('fullName')}
                type="text"
                className={`form-input ${inviteData?.fullName ? 'bg-gray-100 text-gray-900 font-medium cursor-not-allowed' : ''}`}
                placeholder="John Doe"
                readOnly={!!inviteData?.fullName}
              />
              {errors.fullName && (
                <p className="form-error">{errors.fullName.message}</p>
              )}
              {inviteData?.fullName && (
                <p className="text-xs text-gray-500 mt-1">From your application</p>
              )}
            </div>

            {/* Phone (read-only if provided) */}
            <div>
              <label className="form-label">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                className={`form-input ${inviteData?.phone ? 'bg-gray-100 text-gray-900 font-medium cursor-not-allowed' : ''}`}
                placeholder="(555) 123-4567"
                readOnly={!!inviteData?.phone}
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
              {inviteData?.phone && (
                <p className="text-xs text-gray-500 mt-1">From your application</p>
              )}
            </div>

            {/* Business Name (read-only if provided) */}
            <div>
              <label className="form-label">Business Name</label>
              <input
                {...register('businessName')}
                type="text"
                className={`form-input ${inviteData?.businessName ? 'bg-gray-100 text-gray-900 font-medium cursor-not-allowed' : ''}`}
                placeholder="Your Company LLC"
                readOnly={!!inviteData?.businessName}
              />
              {errors.businessName && (
                <p className="form-error">{errors.businessName.message}</p>
              )}
              {inviteData?.businessName && (
                <p className="text-xs text-gray-500 mt-1">From your application</p>
              )}
            </div>

            {/* Job Title (mapped from businessType, read-only if provided) */}
            <div>
              <label className="form-label">Job Title</label>
              <input
                {...register('jobTitle')}
                type="text"
                className={`form-input ${inviteData?.businessType ? 'bg-gray-100 text-gray-900 font-medium cursor-not-allowed' : ''}`}
                placeholder="Financial Advisor"
                readOnly={!!inviteData?.businessType}
              />
              {errors.jobTitle && (
                <p className="form-error">{errors.jobTitle.message}</p>
              )}
              {inviteData?.businessType && (
                <p className="text-xs text-gray-500 mt-1">From your application</p>
              )}
            </div>

            {/* Password (no copy/paste) */}
            <div>
              <label className="form-label">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Create a strong password"
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password (no copy/paste) */}
            <div>
              <label className="form-label">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Re-enter your password"
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-sm text-gray-500 text-center">
              By creating an account, you agree to Savians' Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-savians-navy animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
