'use client';

/**
 * Submission Source Badge Component
 * 
 * Displays how a referral was submitted (self vs partner)
 */

import React from 'react';
import { User, UserPlus } from 'lucide-react';

export type SubmissionSource = 'SELF_SUBMITTED' | 'PARTNER_SUBMITTED';

interface SubmissionSourceBadgeProps {
  submissionSource: SubmissionSource;
  /** If true, shows "You Submitted" for partner-submitted (partner viewing their own) */
  isOwnSubmission?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

export default function SubmissionSourceBadge({
  submissionSource,
  isOwnSubmission = false,
  size = 'sm',
}: SubmissionSourceBadgeProps) {
  // Determine label
  let label: string;
  let icon: React.ReactNode;
  let colorClasses: string;

  if (submissionSource === 'PARTNER_SUBMITTED' && isOwnSubmission) {
    label = 'You Submitted';
    icon = <UserPlus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    colorClasses = 'bg-purple-600 text-white border-purple-700 dark:bg-purple-500 dark:text-white dark:border-purple-600';
  } else if (submissionSource === 'PARTNER_SUBMITTED') {
    label = 'Partner Submitted';
    icon = <UserPlus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    colorClasses = 'bg-purple-600 text-white border-purple-700 dark:bg-purple-500 dark:text-white dark:border-purple-600';
  } else {
    label = 'Self Submitted';
    icon = <User className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    colorClasses = 'bg-gray-600 text-white border-gray-700 dark:bg-gray-500 dark:text-white dark:border-gray-600';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClasses} ${sizeClasses}`}
    >
      {icon}
      {label}
    </span>
  );
}
