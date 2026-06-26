/**
 * Milestone Bonuses Management Page
 * 
 * This is an example implementation for your SuperAdmin panel.
 * Location: /superadmin/milestone-bonuses
 * 
 * Similar to your Payout Tiers page, this allows SuperAdmins to:
 * - View all milestone bonus configurations
 * - Create new milestone bonuses
 * - Edit existing milestones
 * - Delete milestones
 * - View earned bonuses
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Type definitions
interface MilestoneBonusConfig {
  id: string;
  name: string;
  description?: string;
  requiredQualifiedReferrals: number;
  bonusAmount: string;
  periodType: 'CALENDAR_YEAR' | 'ROLLING_YEAR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateMilestoneData {
  name: string;
  description: string;
  requiredQualifiedReferrals: number;
  bonusAmount: number;
  periodType: 'CALENDAR_YEAR' | 'ROLLING_YEAR';
  isActive: boolean;
}

export default function MilestoneBonusesPage() {
  const [milestones, setMilestones] = useState<MilestoneBonusConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateMilestoneData>({
    name: '',
    description: '',
    requiredQualifiedReferrals: 10,
    bonusAmount: 1000,
    periodType: 'CALENDAR_YEAR',
    isActive: true,
  });

  // Fetch milestone configurations
  const fetchMilestones = async () => {
    try {
      const token = localStorage.getItem('token'); // Or however you store JWT
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/milestone-bonuses`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch milestone bonuses');
      }

      const data = await response.json();
      setMilestones(data.data);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast.error('Failed to load milestone bonuses');
    } finally {
      setLoading(false);
    }
  };

  // Create new milestone bonus
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/milestone-bonuses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create milestone bonus');
      }

      toast.success('Milestone bonus created successfully!');
      setShowCreateModal(false);
      fetchMilestones(); // Refresh list
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        requiredQualifiedReferrals: 10,
        bonusAmount: 1000,
        periodType: 'CALENDAR_YEAR',
        isActive: true,
      });
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast.error('Failed to create milestone bonus');
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/milestone-bonuses/${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      toast.success(`Milestone ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchMilestones();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
    }
  };

  // Delete milestone
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/milestone-bonuses/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete milestone');
      }

      toast.success('Milestone deleted successfully');
      fetchMilestones();
    } catch (error: any) {
      console.error('Error deleting milestone:', error);
      toast.error(error.message || 'Failed to delete milestone');
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Milestone Bonuses</h1>
          <p className="text-gray-400 mt-2">
            Configure bonus rewards for partners who reach referral milestones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          + Create Milestone
        </button>
      </div>

      {/* Milestone List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left">MILESTONE NAME</th>
              <th className="px-6 py-4 text-left">REQUIRED REFERRALS</th>
              <th className="px-6 py-4 text-left">BONUS AMOUNT</th>
              <th className="px-6 py-4 text-left">PERIOD</th>
              <th className="px-6 py-4 text-left">STATUS</th>
              <th className="px-6 py-4 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((milestone) => (
              <tr key={milestone.id} className="border-t border-gray-700 hover:bg-gray-750">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold">{milestone.name}</div>
                    {milestone.description && (
                      <div className="text-sm text-gray-400 mt-1">
                        {milestone.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-purple-400 font-semibold">
                    {milestone.requiredQualifiedReferrals} referrals
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-green-400 font-bold text-lg">
                    ${parseFloat(milestone.bonusAmount).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-300">
                    {milestone.periodType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {milestone.isActive ? (
                    <span className="text-green-400 flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActive(milestone.id, milestone.isActive)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                      title={milestone.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {milestone.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => handleDelete(milestone.id, milestone.name)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {milestones.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No milestone bonuses configured yet. Create your first one!
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
        <h3 className="font-semibold text-blue-400 mb-3">How Milestone Bonuses Work</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• Partners automatically earn bonuses when they reach the required number of qualified referrals</li>
          <li>• Only referrals with ELIGIBLE_FOR_PAYOUT status count toward milestones</li>
          <li>• Each milestone can be earned once per calendar year (Jan 1 - Dec 31)</li>
          <li>• Partners receive automatic email notifications when milestones are achieved</li>
          <li>• You can create multiple milestone tiers (e.g., 10, 20, 50 referrals)</li>
          <li>• Only active milestones are tracked and awarded</li>
        </ul>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create Milestone Bonus</h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              {/* Milestone Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 20 Referrals Super Bonus"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when this bonus is earned..."
                  rows={3}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                />
              </div>

              {/* Required Referrals */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Required Qualified Referrals *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.requiredQualifiedReferrals}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    requiredQualifiedReferrals: parseInt(e.target.value) 
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Number of ELIGIBLE_FOR_PAYOUT referrals needed
                </p>
              </div>

              {/* Bonus Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bonus Amount ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.bonusAmount}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    bonusAmount: parseFloat(e.target.value) 
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>

              {/* Period Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Period Type *
                </label>
                <select
                  value={formData.periodType}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    periodType: e.target.value as 'CALENDAR_YEAR' | 'ROLLING_YEAR'
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="CALENDAR_YEAR">Calendar Year (Jan 1 - Dec 31)</option>
                  <option value="ROLLING_YEAR">Rolling Year (12 months)</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700"
                />
                <label className="ml-3 text-sm">
                  Activate immediately
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
