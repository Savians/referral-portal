'use client';

/**
 * SuperAdmin Agreement Templates Management
 * 
 * Manage partner agreement versions and content
 */

import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { FileText, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface AgreementTemplate {
  id: string;
  version: string;
  agreementText: string;  // Backend uses agreementText, not content
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AgreementTemplatesPage() {
  const { user, isLoading: authLoading } = useProtectedRoute(['SUPER_ADMIN']);

  const [templates, setTemplates] = useState<AgreementTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AgreementTemplate | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<AgreementTemplate | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFormData, setUploadFormData] = useState({
    version: '',
    description: '',
    isActive: false,
  });
  const [formData, setFormData] = useState({
    version: '',
    content: '',
    isActive: false,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch templates');

      const response = await res.json();
      console.log('Agreement templates response:', response);
      const data = response.success ? response.data : response;
      console.log('Agreement templates data:', data);
      setTemplates(data.data || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: AgreementTemplate) => {
    setEditingTemplate(template);
    setFormData({
      version: template.version,
      content: template.agreementText,  // Map agreementText to content for the form
      isActive: template.isActive,
    });
    setShowModal(true);
  };

  const handleView = (template: AgreementTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      version: '',
      content: '',
      isActive: false,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const url = editingTemplate
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates/${editingTemplate.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates`;
      
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

      toast.success('Agreement template saved successfully!');
      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleActivate = async (templateId: string) => {
    if (!confirm('Activating this template will deactivate all others. Continue?')) return;

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates/${templateId}/activate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to activate template');

      toast.success('Template activated successfully');
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this agreement template?')) return;

    try {
      const { getIdToken } = await import('@/lib/cognito');
      const token = await getIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates/${templateId}`,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['.pdf', '.docx', '.txt', '.html', '.md'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validTypes.includes(fileExt)) {
        toast.error('Only PDF, DOCX, TXT, HTML, and MD files are supported');
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
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Convert to base64 if it's a PDF or DOCX, otherwise just use the text
          if (uploadFile.name.toLowerCase().endsWith('.pdf') || uploadFile.name.toLowerCase().endsWith('.docx')) {
            resolve(result); // Already in base64 from readAsDataURL
          } else {
            resolve(result); // Plain text
          }
        };
        reader.onerror = reject;
        
        if (uploadFile.name.toLowerCase().endsWith('.pdf') || uploadFile.name.toLowerCase().endsWith('.docx')) {
          reader.readAsDataURL(uploadFile);
        } else {
          reader.readAsText(uploadFile);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/agreement-templates/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            version: uploadFormData.version,
            description: uploadFormData.description,
            isActive: uploadFormData.isActive,
            fileContent: fileContent,
            fileName: uploadFile.name,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload agreement');
      }

      const result = await res.json();
      
      toast.success(
        `Agreement ${result.data?.message || 'uploaded successfully'}! ${uploadFile.name.toLowerCase().endsWith('.pdf') ? 'Text extracted from PDF.' : uploadFile.name.toLowerCase().endsWith('.docx') ? 'Text extracted from DOCX.' : ''} Detected ${result.data?.detectedVariables?.length || 0} variables.`
      );
      
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadFormData({
        version: '',
        description: '',
        isActive: false,
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agreement Templates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage partner agreement versions and content
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Agreement
        </button>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Content Preview
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
            {templates.map((template) => (
              <tr key={template.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      v{template.version}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
                    {template.agreementText ? template.agreementText.substring(0, 100) + '...' : 'No content'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {template.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      <XCircle className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(template.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleView(template)}
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      title="View Agreement"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!template.isActive && (
                      <button
                        onClick={() => handleActivate(template.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Activate"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!template.isActive && (
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Agreement Template from File
            </h2>
            
            {/* Info Box */}
            <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-300 mb-2">
                <strong>Supported file types:</strong> .pdf, .docx, .txt, .html, .md
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                📄 <strong>PDF files:</strong> Text will be automatically extracted from the PDF
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                📝 <strong>DOCX files:</strong> Text will be automatically extracted from Word documents
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                Use <strong>{'{{variableName}}'}</strong> syntax for dynamic content that will be replaced during partner signup.
              </p>
            </div>

            {/* Variable Guide */}
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-2">
                📋 Available Variables for Agreements:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{partnerName}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Partner's full name</p>
                </div>
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{partnerId}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Partner ID</p>
                </div>
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{email}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Partner's email</p>
                </div>
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{date}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Current date</p>
                </div>
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{companyName}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Savians Tax Advisors</p>
                </div>
                <div>
                  <code className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                    {'{{phone}}'}
                  </code>
                  <p className="text-green-700 dark:text-green-400 mt-1">Partner's phone</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agreement File * (.pdf, .docx, .txt, .html, or .md)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.html,.md"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                {uploadFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    ✓ Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
                    {(uploadFile.name.endsWith('.pdf') || uploadFile.name.endsWith('.docx')) && ' - Text will be extracted'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version * (e.g., 1.0, 2.0, 2024-Q1)
                </label>
                <input
                  type="text"
                  required
                  value={uploadFormData.version}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, version: e.target.value })}
                  placeholder="e.g., 2.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  placeholder="Brief description of this version"
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
                  Set as active version (will be used for new partner signups)
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
                  Upload Agreement
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
              {editingTemplate ? 'Edit Agreement Template' : 'Create Agreement Template'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Version *
                </label>
                <input
                  type="text"
                  required
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., 1.0, 2.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Agreement Content * (HTML/Markdown)
                </label>
                <textarea
                  required
                  rows={20}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="Enter agreement content..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supports HTML and Markdown. Use placeholders like {'{'}partnerName{'}'}, {'{'}date{'}'}, etc.
                </p>
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
                  Set as active version (will deactivate all others)
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

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Agreement Preview - Version {previewTemplate.version}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {previewTemplate.isActive && (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3" />
                      Active Version
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                  style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}
                >
                  {previewTemplate.agreementText}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleEdit(previewTemplate);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Agreement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



