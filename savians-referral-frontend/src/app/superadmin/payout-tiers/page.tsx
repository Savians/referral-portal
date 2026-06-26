'use client';

/**
 * SuperAdmin Payout Tiers Management
 * 
 * Configure referral payout tier structure
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { DollarSign, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PayoutTier {
  id: string;
  label: string;
  minReferrals: number;
  maxReferrals: number | null;
  payoutAmount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function PayoutTiersPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['SUPER_ADMIN']);

  const [tiers, setTiers] = useState<PayoutTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<PayoutTier | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    minReferrals: 0,
    maxReferrals: null as number | null,
    payoutAmount: 0,
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchTiers();
    }
  }, [authLoading, user]);

  const fetchTiers = async () => {
    try {
      setLoading(true);
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/payout-tiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch tiers');

      const response = await res.json();
      const data = response.success ? response.data : response;
      setTiers(data.data || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier: PayoutTier) => {
    setEditingTier(tier);
    setFormData({
      label: tier.label || `Tier ${tier.minReferrals}-${tier.maxReferrals || '∞'}`,
      minReferrals: tier.minReferrals,
      maxReferrals: tier.maxReferrals,
      payoutAmount: typeof tier.payoutAmount === 'string' ? parseFloat(tier.payoutAmount) : tier.payoutAmount,
      isActive: tier.isActive,
      displayOrder: tier.displayOrder || 0,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTier(null);
    setFormData({
      label: '',
      minReferrals: 0,
      maxReferrals: null,
      payoutAmount: 0,
      isActive: true,
      displayOrder: 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const url = editingTier
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/payout-tiers/${editingTier.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/payout-tiers`;
      
      const method = editingTier ? 'PATCH' : 'POST';

      // Ensure all numeric fields are actually numbers, not strings
      const payload = {
        label: formData.label,
        minReferrals: Number(formData.minReferrals),
        maxReferrals: formData.maxReferrals === null ? null : Number(formData.maxReferrals),
        payoutAmount: Number(formData.payoutAmount),
        isActive: formData.isActive,
        displayOrder: Number(formData.displayOrder),
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error?.message || errorData.error || errorData.message || 'Failed to save tier';
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      toast.success('Payout tier saved successfully!');
      setShowModal(false);
      fetchTiers();
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this payout tier?')) return;

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/payout-tiers/${tierId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to delete tier');

      toast.success('Tier deleted successfully');
      fetchTiers();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const toggleActive = async (tier: PayoutTier) => {
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/payout-tiers/${tier.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !tier.isActive }),
        }
      );

      if (!res.ok) throw new Error('Failed to update tier');

      toast.success('Tier status updated');
      fetchTiers();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payout Tiers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure referral payout structure based on number of successful referrals
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Tier
        </button>
      </div>

      {/* Tiers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tier Label
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tier Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payout Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tiers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No payout tiers configured. Create your first tier to get started.
                </td>
              </tr>
            ) : (
              tiers.map((tier) => (
                <tr key={tier.id}>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tier.label || `Tier ${tier.minReferrals}-${tier.maxReferrals || '∞'}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tier.minReferrals} - {tier.maxReferrals === null ? '∞' : tier.maxReferrals} referrals
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${tier.payoutAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(tier)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        tier.isActive
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {tier.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {tier.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tier.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(tier)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tier.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How Payout Tiers Work
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Tiers determine commission amount based on total successful paid referrals</li>
          <li>• Each tier covers a range of referrals (e.g., 0-10, 11-50, 51+)</li>
          <li>• Use null for maxReferrals to create an unlimited top tier</li>
          <li>• Overlapping ranges are not allowed</li>
          <li>• Only active tiers are used for payment calculations</li>
        </ul>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTier ? 'Edit Payout Tier' : 'Create Payout Tier'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tier Label *
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Starter, Bronze, Silver, Gold"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Referrals *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={isNaN(formData.minReferrals) ? '' : formData.minReferrals}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({ ...formData, minReferrals: isNaN(val) ? 0 : val });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Referrals (leave empty for unlimited)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxReferrals ?? ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setFormData({ ...formData, maxReferrals: null });
                    } else {
                      const val = parseInt(e.target.value);
                      setFormData({ ...formData, maxReferrals: isNaN(val) ? null : val });
                    }
                  }}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payout Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={isNaN(formData.payoutAmount) ? '' : formData.payoutAmount}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, payoutAmount: isNaN(val) ? 0 : val });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  {editingTier ? 'Update' : 'Create'} Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



