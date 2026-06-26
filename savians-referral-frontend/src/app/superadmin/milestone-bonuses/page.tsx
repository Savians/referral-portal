'use client';

/**
 * SuperAdmin Milestone Bonuses Management
 * 
 * Configure milestone bonus rewards for partners
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Award, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MilestoneBonusConfig {
  id: string;
  name: string;
  description: string | null;
  requiredQualifiedReferrals: number;
  bonusAmount: string;
  periodType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MilestoneBonusesPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['SUPER_ADMIN']);

  const [milestones, setMilestones] = useState<MilestoneBonusConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MilestoneBonusConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    requiredQualifiedReferrals: 10,
    bonusAmount: 1000,
    periodType: 'CALENDAR_YEAR',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchMilestones();
    }
  }, [authLoading, user]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/milestone-bonuses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch milestone bonuses');

      const response = await res.json();
      const data = response.success ? response.data : response;
      setMilestones(data.data || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (milestone: MilestoneBonusConfig) => {
    setEditingMilestone(milestone);
    setFormData({
      name: milestone.name,
      description: milestone.description || '',
      requiredQualifiedReferrals: milestone.requiredQualifiedReferrals,
      bonusAmount: parseFloat(milestone.bonusAmount) || 0,
      periodType: milestone.periodType,
      isActive: milestone.isActive,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingMilestone(null);
    setFormData({
      name: '',
      description: '',
      requiredQualifiedReferrals: 10,
      bonusAmount: 1000,
      periodType: 'CALENDAR_YEAR',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const url = editingMilestone
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/milestone-bonuses/${editingMilestone.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/milestone-bonuses`;
      
      const method = editingMilestone ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save milestone bonus');
      }

      toast.success('Milestone bonus saved successfully!');
      setShowModal(false);
      fetchMilestones();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (milestoneId: string, milestoneName: string) => {
    if (!confirm(`Are you sure you want to delete "${milestoneName}"?`)) return;

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/milestone-bonuses/${milestoneId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete milestone');
      }

      toast.success('Milestone deleted successfully');
      fetchMilestones();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const toggleActive = async (milestone: MilestoneBonusConfig) => {
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/milestone-bonuses/${milestone.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !milestone.isActive }),
        }
      );

      if (!res.ok) throw new Error('Failed to update milestone');

      toast.success('Milestone status updated');
      fetchMilestones();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Milestone Bonuses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure bonus rewards for partners who reach referral milestones
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Milestone
        </button>
      </div>

      {/* Milestones Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Milestone Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Required Referrals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Bonus Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {milestones.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No milestone bonuses configured. Create your first milestone to get started.
                </td>
              </tr>
            ) : (
              milestones.map((milestone) => (
                <tr key={milestone.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white block">
                          {milestone.name}
                        </span>
                        {milestone.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {milestone.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {milestone.requiredQualifiedReferrals} referrals
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${parseFloat(milestone.bonusAmount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {milestone.periodType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(milestone)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        milestone.isActive
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {milestone.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {milestone.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(milestone.id, milestone.name)}
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
          How Milestone Bonuses Work
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Partners automatically earn bonuses when they reach the required number of qualified referrals</li>
          <li>• Only referrals with ELIGIBLE_FOR_PAYOUT status count toward milestones</li>
          <li>• Each milestone can be earned once per calendar year (January 1 - December 31)</li>
          <li>• Partners receive automatic email notifications when milestones are achieved</li>
          <li>• You can create multiple milestone tiers (e.g., 5, 10, 20, 50 referrals)</li>
          <li>• Only active milestones are tracked and awarded</li>
        </ul>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingMilestone ? 'Edit Milestone Bonus' : 'Create Milestone Bonus'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 20 Referrals Super Bonus"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this bonus is earned..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Required Qualified Referrals *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.requiredQualifiedReferrals}
                  onChange={(e) => setFormData({ ...formData, requiredQualifiedReferrals: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of ELIGIBLE_FOR_PAYOUT referrals needed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bonus Amount ($) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.bonusAmount || ''}
                  onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Period Type *
                </label>
                <select
                  value={formData.periodType}
                  onChange={(e) => setFormData({ ...formData, periodType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="CALENDAR_YEAR">Calendar Year (Jan 1 - Dec 31)</option>
                  <option value="ROLLING_YEAR">Rolling Year (12 months)</option>
                </select>
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
                  {editingMilestone ? 'Update' : 'Create'} Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
