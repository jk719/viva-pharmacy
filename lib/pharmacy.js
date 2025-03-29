import { ActiveSession } from '@/models/PharmacyEmployee';

export async function getActivePharmacySession(employeeId) {
  const activeSession = await ActiveSession.findOne({
    employeeId,
    isActive: true,
    endTime: null
  });
  
  return activeSession;
} 