"use client";
import { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiMail } from 'react-icons/fi';
import { getOrderNotes, addOrderNote, sendOrderEmail } from '@/app/actions/orders';

export default function OrderNotes({ orderId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [orderId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const result = await getOrderNotes(orderId);
      
      if (result.success) {
        setNotes(result.notes);
      } else {
        console.error('Error fetching notes:', result.message);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setSending(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('content', newNote);
      
      // Use server action
      const result = await addOrderNote(formData);

      if (result.success) {
        setNewNote('');
        await fetchNotes();
      } else {
        console.error('Error adding note:', result.message);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailContent.trim()) return;

    try {
      setSending(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('content', emailContent);
      
      // Use server action
      const result = await sendOrderEmail(formData);

      if (result.success) {
        setEmailContent('');
        setShowEmailForm(false);
        await fetchNotes(); // Refresh notes to show email sent
      } else {
        console.error('Error sending email:', result.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Order Notes & Communication</h3>
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
        >
          <FiMail />
          <span>Email Customer</span>
        </button>
      </div>

      {showEmailForm && (
        <form onSubmit={handleSendEmail} className="bg-gray-50 p-4 rounded-lg">
          <textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Type your email message..."
            className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={sending}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              <FiSend className="w-4 h-4" />
              <span>Send Email</span>
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note._id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">{note.author}</span>
              <span className="text-xs text-gray-500">
                {new Date(note.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-700">{note.content}</p>
            {note.type === 'email' && (
              <div className="mt-2 text-xs text-gray-500">
                Email sent to customer
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAddNote} className="mt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note..."
            className="flex-1 rounded-lg border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <FiMessageSquare className="w-4 h-4" />
            <span>Add Note</span>
          </button>
        </div>
      </form>
    </div>
  );
} 