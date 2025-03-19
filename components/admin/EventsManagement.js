'use client';

import { useState, useEffect } from 'react';
import { EVENT_TYPES } from '@/lib/loyalty/eventsService';

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PROMOTION',
    description: '',
    startDate: '',
    endDate: '',
    pointMultiplier: 1,
    bonusPoints: 0,
    minimumPurchase: 0,
    eligibleTiers: ['None'],
    isActive: true
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/admin/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Special Events</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Create New Event
        </button>
      </div>

      {/* Event List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {event.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Type:</span> {event.type}
              </p>
              <p className="text-sm">
                <span className="font-medium">Duration:</span>{' '}
                {new Date(event.startDate).toLocaleDateString()} -{' '}
                {new Date(event.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Multiplier:</span> {event.pointMultiplier}x
              </p>
              {event.bonusPoints > 0 && (
                <p className="text-sm">
                  <span className="font-medium">Bonus Points:</span> {event.bonusPoints}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  {Object.values(EVENT_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Add other form fields */}

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 