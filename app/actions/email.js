"use server";

import { emailQueue } from "@/lib/email/emailQueue";

export async function sendLoyaltyEmail(type, userData, additionalData) {
  try {
    await emailQueue.add(type, { user: userData, ...additionalData });
    return { success: true };
  } catch (error) {
    console.error('Error sending loyalty email:', error);
    return { success: false, error: error.message };
  }
} 