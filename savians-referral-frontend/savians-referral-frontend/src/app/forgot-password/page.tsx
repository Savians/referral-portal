'use client';

/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset link
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { KeyRound, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/providers/AuthProvider';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
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

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', {
        email: data.email,
      });

      setIsSuccess(true);
      toast.success('Password reset link sent! Check your email.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      // Generic error for security (don't reveal if email exists)
      const errorMessage = error.message || 'Unable to process request. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Success state - show confirmation
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
                Check Your Email
              </h1>
              <p className="text-gray-600 text-center mb-6">
                If an account exists with <strong>{getValues('email')}</strong>, you'll receive a password reset link shortly.
              </p>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  What to do next:
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
                  <li>Check your email inbox</li>
                  <li>Look for an email from Savians</li>
                  <li>Click the reset link in the email</li>
                  <li>The link expires in 30 minutes</li>
                </ol>
              </div>

              {/* Didn't receive email */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the email?
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-sm text-[#14235C] hover:underline font-medium"
                >
                  Try again
                </button>
              </div>

              {/* Back to Login */}
              <Link
                href="/login"
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Request form
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
              Reset Password
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  autoFocus
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Remember your password?
                </span>
              </div>
            </div>

            {/* Back to Login */}
            <Link
              href="/login"
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>

          {/* Security Note */}
          <p className="mt-6 text-center text-sm text-gray-600">
            For security reasons, we'll send the reset link to the email on file. If you don't receive it within a few minutes, check your spam folder.
          </p>
        </div>
      </main>
    </div>
  );
}
