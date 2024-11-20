"use client";

import { useState } from 'react';
import axios from 'axios';

export default function TestSMS() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleTest = async () => {
    try {
      setStatus('Sending...');
      setError('');

      const response = await axios.post('/api/test-twilio', {
        phoneNumber
      });

      setStatus(`Success! Message ID: ${response.data.messageId}`);
    } catch (error) {
      console.error('Test failed:', error);
      setError(error.response?.data?.details || error.message);
      setStatus('Failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Test Twilio SMS</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Phone Number:</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            className="border p-2 rounded"
          />
        </div>

        <button
          onClick={handleTest}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Test SMS
        </button>

        {status && (
          <div className="text-green-600">
            Status: {status}
          </div>
        )}

        {error && (
          <div className="text-red-600">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}