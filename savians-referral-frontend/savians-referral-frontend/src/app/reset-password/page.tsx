'use client';

/**
 * Reset Password Page
 * 
 * Allows users to set a new password using a reset token
 */

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface TokenVerificationResult {
  valid: boolean;
  email?: string;
  expiresAt?: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'valid' | 'invalid' | 'expired' | null>(null);
  const [tokenData, setTokenData] = useState<TokenVerificationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch('password');

  // Redirect authenticated users to their dashboard (but allow password reset to complete)
  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !isSuccess) {
      if (user.role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, isSuccess, router]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenStatus('invalid');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await api.get<TokenVerificationResult>(`/api/auth/verify-reset-token/${token}`);
        
        if (response.data.valid) {
          setTokenStatus('valid');
          setTokenData(response.data);
        } else {
          setTokenStatus('invalid');
        }
      } catch (error: any) {
        console.error('Token verification error:', error);
        
        if (error.message?.includes('expired')) {
          setTokenStatus('expired');
        } else {
          setTokenStatus('invalid');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword: data.password,
      });

      setIsSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.message?.includes('expired')) {
        errorMessage = 'Reset link has expired. Please request a new one.';
      } else if (error.message?.includes('invalid')) {
        errorMessage = 'Invalid reset link. Please request a new one.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
    if (strength <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid/Expired token
  if (tokenStatus !== 'valid') {
    const isExpired = tokenStatus === 'expired';
    
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-[#14235C] text-white py-4 px-6">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              Savians
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className={`${isExpired ? 'bg-yellow-100' : 'bg-red-100'} rounded-full p-4`}>
                  {isExpired ? (
                    <AlertCircle className="w-12 h-12 text-yellow-600" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-600" />
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-2">
                {isExpired ? 'Link Expired' : 'Invalid Link'}
              </h1>
              <p className="text-gray-600 text-center mb-6">
                {isExpired
                  ? 'This password reset link has expired. Reset links are only valid for 30 minutes.'
                  : 'This password reset link is invalid or has already been used.'}
              </p>

              {/* Request new link */}
              <Link
                href="/forgot-password"
                className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
              >
                Request New Reset Link
              </Link>

              {/* Back to Login */}
              <Link
                href="/login"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-[#14235C] text-white py-4 px-6">
          <div className="max-w-7xl mx-auto">
            <Link href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
              Savians
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-2">
                Password Reset!
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Your password has been successfully reset. You can now log in with your new password.
              </p>

              {/* Auto-redirect notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-blue-800">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              {/* Manual login link */}
              <Link
                href="/login"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Go to Login Now
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#14235C] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold hover:opacity-90 transition-opacity">
            Savians
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#14235C] rounded-full p-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-2">
              Set New Password
            </h1>
            <p className="text-gray-600 text-center mb-2">
              Resetting password for:
            </p>
            <p className="text-[#14235C] font-semibold text-center mb-8">
              {tokenData?.email}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-input pr-10"
                    placeholder="Enter new password"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-semibold ${
                        passwordStrength.label === 'Weak' ? 'text-red-600' :
                        passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="form-input pr-10"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="form-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={password && password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                      {password && password.length >= 8 ? '✓' : '○'}
                    </span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={password && /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {password && /[A-Z]/.test(password) ? '✓' : '○'}
                    </span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={password && /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {password && /[a-z]/.test(password) ? '✓' : '○'}
                    </span>
                    One lowercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={password && /[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {password && /[0-9]/.test(password) ? '✓' : '○'}
                    </span>
                    One number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={password && /[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                      {password && /[^A-Za-z0-9]/.test(password) ? '✓' : '○'}
                    </span>
                    One special character
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#14235C] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
