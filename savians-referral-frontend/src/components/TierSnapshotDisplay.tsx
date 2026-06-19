/**
 * Tier Snapshot Display Component
 * 
 * Displays payout tier information from snapshot
 * Supports multiple variants: card, inline, detailed
 */

import React from 'react';
import type { PayoutTierSnapshot } from '@/types/api.types';
import { Award, TrendingUp, Users } from 'lucide-react';

interface TierSnapshotDisplayProps {
  snapshot: PayoutTierSnapshot | null;
  amount?: number | string;
  referralCount?: number;
  variant?: 'card' | 'inline' | 'detailed';
  className?: string;
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Bronze: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  Silver: {
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    text: 'text-gray-800',
    badge: 'bg-gray-100 text-gray-800 border-gray-400',
  },
  Gold: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    badge: 'bg-yellow-100 text-yellow-900 border-yellow-400',
  },
  Platinum: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-900 border-purple-400',
  },
  Default: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
  },
};

export default function TierSnapshotDisplay({
  snapshot,
  amount,
  referralCount,
  variant = 'card',
  className = '',
}: TierSnapshotDisplayProps) {
  if (!snapshot) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No tier assigned (0 referrals)
      </div>
    );
  }

  const colors = TIER_COLORS[snapshot.label] || TIER_COLORS.Default;
  const rangeText = snapshot.maxReferrals
    ? `${snapshot.minReferrals}-${snapshot.maxReferrals}`
    : `${snapshot.minReferrals}+`;

  // Inline variant - compact single line
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${colors.badge}`}>
          {snapshot.label}
        </span>
        <span className="text-sm text-gray-600">
          {rangeText} referrals • ${snapshot.payoutAmount.toLocaleString()}
        </span>
      </div>
    );
  }

  // Card variant - full information card
  if (variant === 'card') {
    return (
      <div className={`rounded-lg border-2 p-4 ${colors.bg} ${colors.border} ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${colors.text}`} />
            <span className={`font-bold text-lg ${colors.text}`}>{snapshot.label} Tier</span>
          </div>
          {snapshot.isActive ? (
            <span className="text-xs text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-xs text-gray-500 font-medium">Historical</span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              <span className="font-semibold">{rangeText}</span> referrals
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              <span className="font-semibold text-green-600">
                ${snapshot.payoutAmount.toLocaleString()}
              </span> per referral
            </span>
          </div>

          {referralCount !== undefined && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Current: <span className="font-semibold">{referralCount}</span> successful referrals
              </p>
            </div>
          )}

          {amount !== undefined && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Payment: <span className="font-semibold text-green-600">${Number(amount).toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Tier #{snapshot.displayOrder} • Snapshot captured {new Date(snapshot.generatedAt).toLocaleDateString()}
        </p>
      </div>
    );
  }

  // Detailed variant - expanded with progress
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 ${colors.badge}`}>
          {snapshot.label}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {rangeText} referrals
          </p>
          <p className="text-xs text-gray-600">
            ${snapshot.payoutAmount.toLocaleString()} per referral
          </p>
        </div>
      </div>

      {referralCount !== undefined && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">Progress</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${colors.text.replace('text', 'bg')}`}
                style={{
                  width: `${Math.min(
                    100,
                    ((referralCount - snapshot.minReferrals) /
                      ((snapshot.maxReferrals || snapshot.minReferrals + 1) - snapshot.minReferrals)) *
                      100
                  )}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700">
              {referralCount}/{snapshot.maxReferrals || '∞'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
