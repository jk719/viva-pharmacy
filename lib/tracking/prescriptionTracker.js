import { createClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';

class PrescriptionTracker extends EventEmitter {
  constructor() {
    super();
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async trackEvent(eventType, data) {
    try {
      const { error } = await this.supabase
        .from('prescription_events')
        .insert([{
          event_type: eventType,
          prescription_id: data.prescriptionId,
          user_id: data.userId,
          metadata: data,
          timestamp: new Date()
        }]);

      if (error) throw error;

      this.emit(eventType, data);
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }

  async getPrescriptionTimeline(prescriptionId) {
    try {
      const { data, error } = await this.supabase
        .from('prescription_events')
        .select('*')
        .eq('prescription_id', prescriptionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Timeline fetch error:', error);
      return [];
    }
  }
}

export const prescriptionTracker = new PrescriptionTracker(); 