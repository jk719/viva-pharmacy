import mongoose from 'mongoose';

const pharmacyEmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true
  },
  pin: {
    type: String,
    required: [true, 'PIN is required'],
    minlength: [4, 'PIN must be at least 4 digits']
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const activeSessionSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'PharmacyEmployee'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  actions: [{
    type: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

export const PharmacyEmployee = mongoose.models.PharmacyEmployee || mongoose.model('PharmacyEmployee', pharmacyEmployeeSchema);
export const ActiveSession = mongoose.models.ActiveSession || mongoose.model('ActiveSession', activeSessionSchema); 