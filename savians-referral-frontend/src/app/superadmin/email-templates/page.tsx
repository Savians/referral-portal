'use client';

/**
 * SuperAdmin Email Templates Management
 * 
 * Configure all system email templates
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Mail, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  templateKey: string;
  templateName: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  description?: string;
  variables?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['SUPER_ADMIN']);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    templateKey: '',
    templateName: '',
    subject: '',
    description: '',
    isActive: true,
  });
  
  // Variable guide for each email type
  const templateVariableGuides: Record<string, { title: string; variables: Array<{ name: string; description: string }> }> = {
    'ACCOUNT_SUSPENDED': {
      title: 'Account Suspension Email',
      variables: [
        { name: '{{partnerName}}', description: "Partner's full name" },
        { name: '{{partnerId}}', description: "Partner's unique ID (e.g., P-12345)" },
        { name: '{{suspendReason}}', description: 'Reason for suspension' },
        { name: '{{suspendedBy}}', description: 'Who suspended the account (Admin/SuperAdmin)' },
        { name: '{{supportEmail}}', description: 'Support email (support@savians.com)' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'APPLICATION_APPROVED': {
      title: 'Application Approval Email',
      variables: [
        { name: '{{partnerName}}', description: "Applicant's full name" },
        { name: '{{fullName}}', description: 'Same as partnerName' },
        { name: '{{signupUrl}}', description: 'Registration URL with token' },
        { name: '{{loginUrl}}', description: 'Login page URL' },
        { name: '{{expiresInDays}}', description: 'Days until signup link expires' },
        { name: '{{approvalDate}}', description: 'Date of approval' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'PARTNER_INVITATION': {
      title: 'Partner Invitation Email',
      variables: [
        { name: '{{invitedEmail}}', description: 'Email address being invited' },
        { name: '{{partnerName}}', description: 'Email prefix as name' },
        { name: '{{signupUrl}}', description: 'Registration URL with token' },
        { name: '{{inviteUrl}}', description: 'Same as signupUrl' },
        { name: '{{expiresInDays}}', description: 'Days until invitation expires' },
        { name: '{{expiryDate}}', description: 'Formatted expiry date' },
        { name: '{{invitedBy}}', description: 'Name of person sending invite' },
        { name: '{{referrerName}}', description: 'Same as invitedBy' },
        { name: '{{companyName}}', description: 'Savians Tax Advisors' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'REFERRAL_STATUS_CHANGED': {
      title: 'Referral Status Change Email',
      variables: [
        { name: '{{partnerName}}', description: "Partner's full name" },
        { name: '{{partnerId}}', description: "Partner's unique ID" },
        { name: '{{referralId}}', description: 'Referral ID (e.g., REF-12345)' },
        { name: '{{clientName}}', description: "Client's full name" },
        { name: '{{clientEmail}}', description: "Client's email address" },
        { name: '{{oldStatus}}', description: 'Previous referral status' },
        { name: '{{newStatus}}', description: 'New referral status' },
        { name: '{{statusLabel}}', description: 'Human-readable status label' },
        { name: '{{changedBy}}', description: 'Who changed the status' },
        { name: '{{notes}}', description: 'Admin notes about the change' },
        { name: '{{conversionDate}}', description: 'Date of status change' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'PASSWORD_RESET': {
      title: 'Password Reset Email',
      variables: [
        { name: '{{partnerName}}', description: "User's full name" },
        { name: '{{resetUrl}}', description: 'Password reset URL with token' },
        { name: '{{expiresInHours}}', description: 'Hours until link expires' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'REFERRAL_CONVERTED': {
      title: 'Referral Conversion Notification',
      variables: [
        { name: '{{partnerName}}', description: "Partner's full name" },
        { name: '{{partnerId}}', description: "Partner's unique ID" },
        { name: '{{referralId}}', description: 'Referral ID' },
        { name: '{{clientName}}', description: 'Converted client name' },
        { name: '{{conversionDate}}', description: 'Date of conversion' },
        { name: '{{commissionAmount}}', description: 'Commission earned (if applicable)' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
    'PAYMENT_PROCESSED': {
      title: 'Payment Processed Email',
      variables: [
        { name: '{{partnerName}}', description: "Partner's full name" },
        { name: '{{partnerId}}', description: "Partner's unique ID" },
        { name: '{{amount}}', description: 'Payment amount ($)' },
        { name: '{{referralCount}}', description: 'Number of referrals paid for' },
        { name: '{{paymentDate}}', description: 'Date of payment' },
        { name: '{{paymentMethod}}', description: 'Payment method (ACH, Check, etc.)' },
        { name: '{{supportEmail}}', description: 'Support email' },
        { name: '{{portalUrl}}', description: 'Partner portal URL' },
      ],
    },
  };
  
  const currentGuide = uploadFormData.templateKey ? templateVariableGuides[uploadFormData.templateKey] : null;
  const [formData, setFormData] = useState({
    templateKey: '',
    templateName: '',
    subject: '',
    htmlBody: '',
    textBody: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchTemplates();
    }
  }, [authLoading, user]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch templates');

      const response = await res.json();
      const data = response.success ? response.data : response;
      setTemplates(data.data || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      templateKey: template.templateKey,
      templateName: template.templateName,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || '',
      description: template.description || '',
      isActive: template.isActive,
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      templateKey: '',
      templateName: '',
      subject: '',
      htmlBody: '',
      textBody: '',
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const url = editingTemplate
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates/${editingTemplate.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates`;
      
      const method = editingTemplate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to save template');

      toast.success('Template saved successfully!');
      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates/${templateId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to delete template');

      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const toggleActive = async (template: EmailTemplate) => {
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates/${template.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: !template.isActive }),
        }
      );

      if (!res.ok) throw new Error('Failed to update template');

      toast.success('Template status updated');
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDownloadBlueprint = async () => {
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates/blueprint`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to download blueprint');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'email-template-blueprint.html';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Blueprint downloaded successfully');
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.html') && !file.name.endsWith('.txt')) {
        toast.error('Only .html and .txt files are supported');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();

      // Read file content
      const fileContent = await uploadFile.text();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/email-templates/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            templateKey: uploadFormData.templateKey,
            templateName: uploadFormData.templateName,
            subject: uploadFormData.subject,
            description: uploadFormData.description,
            isActive: uploadFormData.isActive,
            fileContent: fileContent,
            fileName: uploadFile.name,
          }),
        }
      );

      if (!res.ok) throw new Error('Failed to upload template');

      const result = await res.json();
      
      toast.success(
        `Template ${result.data?.message || 'uploaded successfully'}! Detected ${result.data?.detectedVariables?.length || 0} variables.`
      );
      
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadFormData({
        templateKey: '',
        templateName: '',
        subject: '',
        description: '',
        isActive: true,
      });
      fetchTemplates();
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure email content for all system notifications
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadBlueprint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Mail className="w-4 h-4" />
            Download Blueprint
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Template
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {template.templateName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {template.subject}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleActive(template)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  template.isActive
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {template.textBody ? template.textBody.substring(0, 100) + '...' : template.description || 'No description'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>

            <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
              Updated: {new Date(template.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Email Template from File
            </h2>
            
            {/* Info Box */}
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">
                <strong>Supported file types:</strong> .html, .txt
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Use <strong>{'{{variableName}}'}</strong> syntax for dynamic content. Select a template key below to see all available variables.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Key * (e.g., ACCOUNT_SUSPENDED)
                </label>
                <select
                  required
                  value={uploadFormData.templateKey}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, templateKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a template type...</option>
                  <option value="ACCOUNT_SUSPENDED">ACCOUNT_SUSPENDED - Account Suspension</option>
                  <option value="APPLICATION_APPROVED">APPLICATION_APPROVED - Application Approval</option>
                  <option value="PARTNER_INVITATION">PARTNER_INVITATION - Partner Invitation</option>
                  <option value="REFERRAL_STATUS_CHANGED">REFERRAL_STATUS_CHANGED - Referral Status Update</option>
                  <option value="PASSWORD_RESET">PASSWORD_RESET - Password Reset</option>
                  <option value="REFERRAL_CONVERTED">REFERRAL_CONVERTED - Referral Conversion</option>
                  <option value="PAYMENT_PROCESSED">PAYMENT_PROCESSED - Payment Processed</option>
                </select>
              </div>

              {/* Variable Guide - Shows when template key is selected */}
              {currentGuide && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
                    📋 Available Variables for {currentGuide.title}:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {currentGuide.variables.map((variable, index) => (
                      <div key={index} className="text-xs">
                        <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded font-mono">
                          {variable.name}
                        </code>
                        <p className="text-green-700 dark:text-green-400 ml-1 mt-1">
                          {variable.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-3 italic">
                    💡 Copy and paste these variables into your template. They will be automatically replaced with actual values when emails are sent.
                  </p>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template File * (.html or .txt)
                </label>
                <input
                  type="file"
                  accept=".html,.txt"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                {uploadFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name * (Display Name)
                </label>
                <input
                  type="text"
                  required
                  value={uploadFormData.templateName}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, templateName: e.target.value })}
                  placeholder="e.g., Account Suspension Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={uploadFormData.subject}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, subject: e.target.value })}
                  placeholder="Your Savians Account Has Been Suspended"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  placeholder="Brief description of when this template is used"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="uploadIsActive"
                  checked={uploadFormData.isActive}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="uploadIsActive" className="text-sm text-gray-700 dark:text-gray-300">
                  Set as active (will be used for emails immediately)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Upload Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Key * (e.g., PARTNER_INVITATION)
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingTemplate}
                  value={formData.templateKey}
                  onChange={(e) => setFormData({ ...formData, templateKey: e.target.value })}
                  placeholder="e.g., PARTNER_INVITATION"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template Name * (Display Name)
                </label>
                <input
                  type="text"
                  required
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                  placeholder="e.g., Partner Invitation Email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  HTML Body *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.htmlBody}
                  onChange={(e) => setFormData({ ...formData, htmlBody: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="<html>...</html>"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plain Text Body
                </label>
                <textarea
                  rows={6}
                  value={formData.textBody}
                  onChange={(e) => setFormData({ ...formData, textBody: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of when this template is used"
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
                  {editingTemplate ? 'Update' : 'Create'} Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



