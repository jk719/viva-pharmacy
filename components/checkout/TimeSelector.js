'use client';

const TimeSelector = ({ selectedTime, onTimeSelect }) => {
  // Generate time slots from 9 AM to 6 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour}:00`;
      const displayTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({ value: time, label: displayTime });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Preferred Pickup/Delivery Time
      </label>
      <select
        value={selectedTime}
        onChange={(e) => onTimeSelect(e.target.value)}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
        required
      >
        <option value="">Select a time</option>
        {timeSlots.map((slot) => (
          <option key={slot.value} value={slot.value}>
            {slot.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelector; 