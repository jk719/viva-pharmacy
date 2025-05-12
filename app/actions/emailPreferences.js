"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

/**
 * Server action to get the user's email preferences
 * 
 * @returns {Object} Response with the user's email preferences or error
 */
export async function getUserEmailPreferences() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 401
      };
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id)
      .select('emailPreferences')
      .lean();

    if (!user) {
      return {
        success: false,
        message: 'User not found',
        status: 404
      };
    }

    return { 
      success: true, 
      emailPreferences: user.emailPreferences || {},
      status: 200
    };
  } catch (error) {
    console.error('Error getting email preferences:', error);
    return {
      success: false,
      message: 'Failed to get email preferences',
      status: 500
    };
  }
}

/**
 * Server action to update the user's email preferences
 * 
 * @param {FormData} formData - Form data containing email preferences
 * @returns {Object} Response with the updated email preferences or error
 */
export async function updateEmailPreferences(formData) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 401
      };
    }

    await dbConnect();
    
    // Get preferences from form data
    const preferencesJson = formData.get('preferences');
    
    if (!preferencesJson) {
      return {
        success: false,
        message: 'No preferences provided',
        status: 400
      };
    }
    
    // Parse preferences
    let emailPreferences;
    try {
      emailPreferences = JSON.parse(preferencesJson);
    } catch (error) {
      return {
        success: false,
        message: 'Invalid preferences format',
        status: 400
      };
    }

    // Find and update user
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        status: 404
      };
    }
    
    // Update preferences
    user.emailPreferences = {
      ...user.emailPreferences,
      ...emailPreferences
    };
    
    await user.save();

    return { 
      success: true, 
      emailPreferences: user.emailPreferences,
      message: 'Preferences updated successfully',
      status: 200
    };
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return {
      success: false,
      message: 'Failed to update email preferences',
      status: 500
    };
  }
} 