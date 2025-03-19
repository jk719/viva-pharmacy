'use client';

import { useState } from 'react';
import { emailTemplates } from '@/lib/email/loyaltyEmailTemplates';

const SAMPLE_DATA = {
  pointsEarned: {
    name: 'John Doe',
    pointsEarned: 500,
    totalPoints: 2500,
    tier: 'Gold',
    nextTierProgress: 500,
    nextTier: 'Platinum'
  },
  tierUpgrade: {
    name: 'John Doe',
    newTier: 'Platinum',
    benefits: [
      '1.75x point multiplier',
      'Exclusive discounts',
      'Early access to sales',
      '$20 reward coupon'
    ]
  },
  newCoupon: {
    name: 'John Doe',
    couponAmount: 25,
    couponCode: 'VIVA25OFF',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
  },
  specialEvent: {
    name: 'John Doe',
    eventName: 'Summer Sale Bonus',
    eventDescription: 'Earn double points on all purchases!',
    eventDates: 'June 1 - June 30',
    pointMultiplier: 2,
    bonusPoints: 500,
    minimumPurchase: 100
  },
  birthdayReward: {
    name: 'John Doe',
    birthdayPoints: 1000,
    specialCoupon: 'BDAYREWARD50'
  }
};

export default function EmailTemplatePreview() {
  const [selectedTemplate, setSelectedTemplate] = useState('pointsEarned');
  const [previewData, setPreviewData] = useState(SAMPLE_DATA.pointsEarned);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
    setPreviewData(SAMPLE_DATA[template]);
  };

  const handleTestSend = async () => {
    try {
      setSending(true);
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          email: testEmail,
          data: previewData
        })
      });

      if (!response.ok) throw new Error('Failed to send test email');
      
      toast.success('Test email sent successfully');
      setShowTestPanel(false);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSending(false);
    }
  };

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
            <div className="space-y-2">
              {Object.keys(emailTemplates).map((template) => (
                <button
                  key={template}
                  onClick={() => handleTemplateChange(template)}
                  className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                    selectedTemplate === template
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {template.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="md:col-span-2 border rounded-lg p-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Preview</h4>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: emailTemplates[selectedTemplate](previewData).html
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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