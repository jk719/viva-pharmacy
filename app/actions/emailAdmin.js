"use server";

import { emailService } from "@/lib/email/emailService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateVerificationToken } from '@/lib/auth';

/**
 * Send a test email using a specific template
 * 
 * @param {FormData} formData - Form data with template, email, and test data
 * @returns {Object} Success or error message
 */
export async function sendTestEmail(formData) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized', status: 401 };
    }
    
    // Parse the request data
    const template = formData.get('template');
    const email = formData.get('email');
    const data = JSON.parse(formData.get('data'));
    
    // Validate inputs
    if (!template || !email || !data) {
      return { error: 'Missing required fields', status: 400 };
    }
    
    if (!emailService.hasTemplate(template)) {
      return { error: 'Invalid template name', status: 400 };
    }
    
    // Send the test email
    await emailService.sendTestEmail(email, template, data);
    
    return { success: true, status: 200 };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { error: 'Failed to send test email', status: 500 };
  }
}

/**
 * Get all available email templates
 * 
 * @returns {Object} List of template names and categories
 */
export async function getEmailTemplates() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return { error: 'Unauthorized', status: 401 };
    }
    
    // Get template names from the email service
    const templates = emailService.getTemplateNames();
    
    // Group templates by category
    const categorizedTemplates = {
      loyalty: templates.filter(t => 
        ['pointsEarned', 'tierUpgrade', 'newCoupon', 'specialEvent', 'birthdayReward'].includes(t)
      ),
      order: templates.filter(t => 
        ['orderConfirmation', 'orderUpdate'].includes(t)
      ),
      account: templates.filter(t => 
        ['passwordReset', 'adminWelcome', 'verification'].includes(t)
      ),
      prescription: templates.filter(t => 
        ['reactPrescriptionStatus'].includes(t)
      ),
      other: templates.filter(t => 
        !['pointsEarned', 'tierUpgrade', 'newCoupon', 'specialEvent', 'birthdayReward',
          'orderConfirmation', 'orderUpdate', 'passwordReset', 'adminWelcome', 'verification',
          'reactPrescriptionStatus'].includes(t)
      )
    };
    
    return { templates: categorizedTemplates, status: 200 };
  } catch (error) {
    console.error('Error getting email templates:', error);
    return { error: 'Failed to get email templates', status: 500 };
  }
}

/**
 * Server action to send a welcome email to a new admin/manager
 * 
 * @param {FormData} formData - Form data containing email and name
 * @returns {Object} Response with success status
 */
export async function sendAdminWelcomeEmail(formData) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 401
      };
    }

    const email = formData.get('email');
    const name = formData.get('name');
    const role = formData.get('role') || 'MANAGER';
    
    if (!email || !name) {
      return {
        success: false,
        message: 'Missing required fields: email or name',
        status: 400
      };
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        success: false,
        message: 'User already exists with this email',
        status: 400
      };
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create new manager without password
    const newManager = new User({
      email: email.toLowerCase(),
      name,
      role,
      verificationToken,
      verificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isVerified: false,
      mustChangePassword: true
    });

    await newManager.save();

    // Send welcome email using emailService directly
    await emailService.sendAdminWelcomeEmail(
      { email, name },
      { verificationToken, role }
    );

    return { 
      success: true,
      manager: {
        id: newManager._id,
        email: newManager.email,
        name: newManager.name,
        role: newManager.role,
        createdAt: newManager.createdAt
      },
      message: 'Manager created and welcome email sent successfully',
      status: 201
    };
  } catch (error) {
    console.error('Error creating manager and sending welcome email:', error);
    return {
      success: false,
      message: 'Failed to create manager',
      status: 500
    };
  }
}

/**
 * Server action to get all managers
 * 
 * @returns {Object} Response with list of managers or error
 */
export async function getManagers() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 401
      };
    }

    await dbConnect();
    
    const managers = await User.find({ role: 'MANAGER' })
      .select('name email role createdAt')
      .lean();

    return { 
      success: true, 
      managers: managers.map(manager => ({
        ...manager,
        id: manager._id.toString(),
        _id: manager._id.toString()
      })),
      status: 200
    };
  } catch (error) {
    console.error('Error fetching managers:', error);
    return {
      success: false,
      message: 'Failed to fetch managers',
      status: 500
    };
  }
}

/**
 * Server action to get email monitoring stats
 * 
 * @returns {Object} Response with email stats or error
 */
export async function getEmailMonitoringStats() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 401
      };
    }

    // Import monitoring dynamically to avoid issues with server components
    const emailMonitoring = (await import('@/lib/email/monitoring')).default;
    const stats = emailMonitoring.getEmailStats();

    return { 
      success: true, 
      stats,
      timestamp: new Date().toISOString(),
      status: 200
    };
  } catch (error) {
    console.error('Error retrieving email stats:', error);
    return {
      success: false,
      message: 'Failed to retrieve email stats',
      status: 500
    };
  }
} 