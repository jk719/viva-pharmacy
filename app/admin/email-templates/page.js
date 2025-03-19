import EmailTemplatePreview from '@/components/admin/EmailTemplatePreview';

export default function EmailTemplatesPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Preview and test loyalty program email templates
          </p>
        </div>

        <EmailTemplatePreview />
      </div>
    </div>
  );
} 