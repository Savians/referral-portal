'use client';

export const dynamic = 'force-dynamic';

/**
 * Admin Invites Page
 * 
 * Create and manage partner invites
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Plus,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

const createInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  expiresInDays: z.number().min(1).max(30).optional(),
});

type CreateInviteFormData = z.infer<typeof createInviteSchema>;

export default function AdminInvitesPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['ADMIN', 'SUPER_ADMIN']);
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInviteFormData>({
    resolver: zodResolver(createInviteSchema),
    defaultValues: {
      expiresInDays: 7,
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      loadInvites();
    }
  }, [authLoading, user]);

  const loadInvites = async () => {
    try {
      const response = await adminService.listInvites({ limit: 50 });
      setInvites(response.data || []);
    } catch (error) {
      console.error('Failed to load invites:', error);
      toast.error('Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateInviteFormData) => {
    setIsSubmitting(true);
    try {
      const response = await adminService.createInvite(data);
      const token = response.data?.token;
      
      if (token) {
        setCreatedToken(token);
        toast.success('Invite created successfully!');
        reset();
        loadInvites();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create invite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/signup?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard!');
  };

  const copyTokenOnly = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success('Token copied to clipboard!');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14235C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Invites</h1>
              <p className="text-gray-600">
                Create and manage partner invites
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Invite
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-[#2C2C2C] mb-4">Create New Invite</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="form-input"
                    placeholder="partner@example.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="form-error">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="expiresInDays" className="form-label">
                    Expires In (Days)
                  </label>
                  <input
                    {...register('expiresInDays', { valueAsNumber: true })}
                    type="number"
                    id="expiresInDays"
                    min="1"
                    max="30"
                    className="form-input"
                    disabled={isSubmitting}
                  />
                  {errors.expiresInDays && (
                    <p className="form-error">{errors.expiresInDays.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Create Invite
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Token Display (after creation) */}
        {createdToken && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Invite Created Successfully!
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  Copy this token now - it cannot be retrieved later.
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-2">Invite Token:</p>
                  <p className="font-mono text-sm break-all text-gray-900 mb-3">
                    {createdToken}
                  </p>
                  <p className="text-xs text-gray-600 mb-2">Signup URL:</p>
                  <p className="font-mono text-sm break-all text-gray-900">
                    {window.location.origin}/signup?token={createdToken}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => copyInviteLink(createdToken)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Invite Link
                  </button>
                  <button
                    onClick={() => copyTokenOnly(createdToken)}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Token Only
                  </button>
                  <button
                    onClick={() => setCreatedToken(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invites List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {invites.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No invites yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Create your first invite to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Invite
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{invite.invitedEmail}</span>
                      </td>
                      <td className="px-6 py-4">
                        {invite.status === 'ACTIVE' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {invite.status === 'USED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Used
                          </span>
                        )}
                        {invite.status === 'EXPIRED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expired
                          </span>
                        )}
                        {invite.status === 'REVOKED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
