'use client';

/**
 * Login Page
 * 
 * Cognito authentication with role-based redirect
 */

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const redirectTo = searchParams.get('redirect') || null;

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // If user is already logged in, redirect to their dashboard
      if (user.role === 'PARTNER') {
        router.push('/partner/dashboard');
      } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      
      toast.success('Logged in successfully!');

      // AuthProvider handles redirect based on role
      // But if there's a specific redirect param, use it
      if (redirectTo) {
        router.push(redirectTo);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      let isSuspension = false;
      
      // Check for API error (from axios interceptor - structure: { code, message, statusCode })
      if (error.code === 'FORBIDDEN' || error.message?.includes('suspended')) {
        errorMessage = error.message || 
          'Your account has been suspended by the administrator. Please contact support at admin@savians.com for more information.';
        isSuspension = true;
      }
      // Check for Cognito-specific errors
      else if (error.code === 'NotAuthorizedException') {
        errorMessage = 'Incorrect email or password.';
      } else if (error.code === 'UserNotConfirmedException') {
        errorMessage = 'Please confirm your email address first.';
      } else if (error.code === 'UserNotFoundException') {
        errorMessage = 'No account found with this email.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error with appropriate styling
      if (isSuspension) {
        toast.error(errorMessage, {
          duration: 10000, // Show for 10 seconds
          style: {
            background: '#FEE2E2',
            border: '1px solid #DC2626',
            color: '#991B1B',
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-[#2C2C2C] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Sign in to access your portal
            </p>

            {/* Login Form */}
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
                />
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    disabled={isLoading}
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
                {errors.password && (
                  <p className="form-error">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#14235C] hover:underline"
                >
                  Forgot password?
                </Link>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
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
                  New to Savians?
                </span>
              </div>
            </div>

            {/* Apply Link */}
            <Link
              href="/apply"
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              Become a Partner
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[#14235C] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#14235C] hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
