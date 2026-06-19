/**
 * Confirmation Modal with GitHub-style text verification
 * 
 * Requires user to type a specific word to confirm destructive actions
 */

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue: string) => void;
  title: string;
  description: string;
  confirmWord: string;
  confirmButtonText?: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  isProcessing?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord,
  confirmButtonText = 'Confirm',
  inputLabel = 'Type the word below to confirm:',
  inputPlaceholder,
  isProcessing = false,
  variant = 'danger',
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isMatch, setIsMatch] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
      setIsMatch(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsMatch(inputValue === confirmWord);
  }, [inputValue, confirmWord]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isMatch && !isProcessing) {
      onConfirm(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isMatch && !isProcessing) {
      handleConfirm();
    } else if (e.key === 'Escape' && !isProcessing) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      icon: 'bg-red-100',
      iconColor: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 disabled:bg-red-300',
      border: 'border-red-200',
      focus: 'focus:ring-red-500 focus:border-red-500',
    },
    warning: {
      icon: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300',
      border: 'border-yellow-200',
      focus: 'focus:ring-yellow-500 focus:border-yellow-500',
    },
    info: {
      icon: 'bg-blue-100',
      iconColor: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
      border: 'border-blue-200',
      focus: 'focus:ring-blue-500 focus:border-blue-500',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${styles.icon}`}>
              <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {inputLabel}
            </label>
            <div
              className={`p-3 rounded-lg border-2 ${styles.border} bg-gray-50 mb-3`}
            >
              <code className="text-sm font-mono font-semibold text-gray-900">
                {confirmWord}
              </code>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder || `Type "${confirmWord}" to confirm`}
              disabled={isProcessing}
              className={`w-full px-4 py-3 border-2 rounded-lg transition-all ${
                inputValue && !isMatch
                  ? 'border-red-300 focus:ring-red-200'
                  : isMatch
                  ? 'border-green-300 focus:ring-green-200'
                  : 'border-gray-300'
              } focus:outline-none focus:ring-2 ${
                styles.focus
              } disabled:bg-gray-100 disabled:cursor-not-allowed`}
              autoFocus
            />
            {inputValue && !isMatch && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="font-medium">✗</span> Text does not match
              </p>
            )}
            {isMatch && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <span className="font-medium">✓</span> Text matches - you can proceed
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch || isProcessing}
            className={`px-5 py-2.5 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center gap-2 ${styles.button}`}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
