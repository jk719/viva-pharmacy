'use client';

export default function TestEmail() {
  const sendTestEmail = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
      });
      const data = await response.json();
      alert(data.success ? 'Email sent successfully!' : 'Failed to send email');
      console.log(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending email');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Email Setup</h1>
      <button
        onClick={sendTestEmail}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Send Test Email
      </button>
    </div>
  );
}