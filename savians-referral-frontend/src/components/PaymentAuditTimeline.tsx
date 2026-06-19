/**
 * Payment Audit Timeline Component
 * 
 * Displays audit history as vertical timeline
 */

import React, { useState } from 'react';
import type { PaymentAuditLog } from '@/types/api.types';
import { CheckCircle, XCircle, AlertCircle, DollarSign, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PaymentAuditTimelineProps {
  auditLogs: PaymentAuditLog[];
  maxVisible?: number;
}

const ACTION_STYLES: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  PAYMENT_AUTO_CREATED: { icon: AlertCircle, color: 'text-blue-600 bg-blue-100', label: 'Created' },
  PAYMENT_APPROVE: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Approved' },
  PAYMENT_MARK_PAID: { icon: DollarSign, color: 'text-emerald-600 bg-emerald-100', label: 'Paid' },
  PAYMENT_REJECT: { icon: XCircle, color: 'text-red-600 bg-red-100', label: 'Rejected' },
  UPDATE: { icon: Clock, color: 'text-gray-600 bg-gray-100', label: 'Updated' },
};

function getRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}

export default function PaymentAuditTimeline({ auditLogs, maxVisible = 10 }: PaymentAuditTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No audit history available</p>
      </div>
    );
  }

  const visibleLogs = expanded ? auditLogs : auditLogs.slice(0, maxVisible);
  const hasMore = auditLogs.length > maxVisible;

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Timeline entries */}
        <div className="space-y-6">
          {visibleLogs.map((log, index) => {
            const style = ACTION_STYLES[log.action] || ACTION_STYLES.UPDATE;
            const Icon = style.icon;
            const isSystemAction = !log.performedBy;

            return (
              <div key={log.id} className="relative pl-12">
                {/* Icon */}
                <div className={`absolute left-0 w-8 h-8 rounded-full ${style.color} flex items-center justify-center border-2 border-white`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{style.label}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getRelativeTime(log.performedAt)}
                      </p>
                    </div>
                    
                    {isSystemAction ? (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                        SYSTEM
                      </span>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {log.performedBy?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.performedBy?.role}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-3 space-y-1">
                      {log.metadata.approvedAmount && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Amount:</span> ${Number(log.metadata.approvedAmount).toLocaleString()}
                        </p>
                      )}
                      {log.metadata.calculatedAmount && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Calculated:</span> ${Number(log.metadata.calculatedAmount).toLocaleString()}
                        </p>
                      )}
                      {log.metadata.tierLabel && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Tier:</span> {log.metadata.tierLabel}
                        </p>
                      )}
                      {log.metadata.rejectionReason && (
                        <p className="text-sm text-red-700 mt-2">
                          <span className="font-medium">Reason:</span> {log.metadata.rejectionReason}
                        </p>
                      )}
                      {log.metadata.paymentReference && (
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reference:</span> {log.metadata.paymentReference}
                        </p>
                      )}
                      {log.metadata.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {log.metadata.notes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Field change */}
                  {log.field && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium capitalize">
                        {log.field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>{' '}
                      {log.oldValue && (
                        <>
                          <span className="line-through">{log.oldValue}</span>
                          {' → '}
                        </>
                      )}
                      <span className="font-medium text-gray-900">{log.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show More/Less button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2 border-t border-gray-200 mt-4 pt-4"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {auditLogs.length - maxVisible} More
            </>
          )}
        </button>
      )}
    </div>
  );
}
