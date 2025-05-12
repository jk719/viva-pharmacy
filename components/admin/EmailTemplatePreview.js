'use client';

import { useState, useEffect } from 'react';
import { emailTemplates } from '@/lib/email/emailTemplates';
import { toast } from 'react-hot-toast';
import { sendTestEmail, getEmailTemplates } from '@/app/actions/emailAdmin';
import { generateSampleData } from '@/lib/email/sampleData';

export default function EmailTemplatePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState('pointsEarned');
  const [previewData, setPreviewData] = useState(generateSampleData('pointsEarned'));
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableTemplates, setAvailableTemplates] = useState({
    loyalty: [],
    order: [],
    account: [],
    prescription: [],
    other: []
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const result = await getEmailTemplates();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setAvailableTemplates(result.templates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setPreviewData(generateSampleData(template));
  };

  const handleTestSend = async () => {
    try {
      setSending(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('template', selectedTemplate);
      formData.append('email', testEmail);
      formData.append('data', JSON.stringify(previewData));
      
      const result = await sendTestEmail(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Test email sent successfully');
      setShowTestPanel(false);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

  // Get a nicely formatted template name for display
  const getTemplateDisplayName = (template) => {
    // Format the template name with spaces before capital letters
    const formattedName = template.replace(/([A-Z])/g, ' $1').trim();
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Email Template Preview</h2>
          <button
            onClick={() => setShowTestPanel(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Test Email
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Select Template</h3>
            <div className="space-y-4">
              {/* Loyalty Templates */}
              {availableTemplates.loyalty.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Loyalty Program</h4>
                  <div className="space-y-1">
                    {availableTemplates.loyalty.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          selectedTemplate === template
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getTemplateDisplayName(template)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Order Templates */}
              {availableTemplates.order.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Orders</h4>
                  <div className="space-y-1">
                    {availableTemplates.order.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          selectedTemplate === template
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getTemplateDisplayName(template)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Account Templates */}
              {availableTemplates.account.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Account</h4>
                  <div className="space-y-1">
                    {availableTemplates.account.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          selectedTemplate === template
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getTemplateDisplayName(template)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Prescription Templates */}
              {availableTemplates.prescription.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Prescriptions</h4>
                  <div className="space-y-1">
                    {availableTemplates.prescription.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          selectedTemplate === template
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getTemplateDisplayName(template)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Other Templates */}
              {availableTemplates.other.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Other</h4>
                  <div className="space-y-1">
                    {availableTemplates.other.map((template) => (
                      <button
                        key={template}
                        onClick={() => handleTemplateChange(template)}
                        className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                          selectedTemplate === template
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {getTemplateDisplayName(template)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="md:col-span-2 border rounded-lg p-4">
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto" style={{ maxHeight: '600px' }}>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Preview</h4>
              {emailTemplates[selectedTemplate] ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: emailTemplates[selectedTemplate](previewData).html
                  }}
                />
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No preview available for this template
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Send Test Email</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTestPanel(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTestSend}
                  disabled={sending || !testEmail}
                  className={`px-4 py-2 rounded-lg ${
                    sending || !testEmail
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {sending ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 