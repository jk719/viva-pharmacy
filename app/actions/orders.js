"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Order from '@/models/Order';
import { emailService } from '@/lib/email/emailService';

/**
 * Server action to send an email to a customer about their order
 * 
 * @param {FormData} formData - Form data containing email content and order ID
 * @returns {Object} Response with the created note or error
 */
export async function sendOrderEmail(formData) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 403
      };
    }

    const orderId = formData.get('orderId');
    const content = formData.get('content');
    
    if (!content?.trim()) {
      return {
        success: false,
        message: 'Email content is required',
        status: 400
      };
    }

    await dbConnect();

    const order = await Order.findById(orderId)
      .populate('userId', 'email name');
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        status: 404
      };
    }

    // Send email using the emailService directly
    await emailService.sendOrderUpdateEmail({
      email: order.userId.email,
      name: order.userId.name || order.userId.email
    }, {
      orderNumber: order.orderNumber,
      message: content,
      status: order.status,
      items: order.items,
      total: order.total,
      deliveryMethod: order.deliveryMethod,
      shippingAddress: order.shippingAddress
    });

    // Add email to order notes
    const note = {
      content,
      author: session.user.name || session.user.email,
      type: 'email',
      createdAt: new Date()
    };

    order.notes = order.notes || [];
    order.notes.push(note);
    await order.save();

    return { 
      success: true, 
      note,
      status: 200
    };
  } catch (error) {
    console.error('Error sending order email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      status: 500
    };
  }
}

/**
 * Server action to get order notes
 * 
 * @param {string} orderId - The order ID to get notes for
 * @returns {Object} Response with the notes or error
 */
export async function getOrderNotes(orderId) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 403
      };
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        status: 404
      };
    }

    return { 
      success: true, 
      notes: order.notes || [],
      status: 200
    };
  } catch (error) {
    console.error('Error getting order notes:', error);
    return {
      success: false,
      message: 'Failed to get notes',
      status: 500
    };
  }
}

/**
 * Server action to add a note to an order
 * 
 * @param {FormData} formData - Form data containing note content and order ID
 * @returns {Object} Response with the created note or error
 */
export async function addOrderNote(formData) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return { 
        success: false, 
        message: 'Unauthorized', 
        status: 403
      };
    }

    const orderId = formData.get('orderId');
    const content = formData.get('content');
    
    if (!content?.trim()) {
      return {
        success: false,
        message: 'Note content is required',
        status: 400
      };
    }

    await dbConnect();

    const order = await Order.findById(orderId);
    
    if (!order) {
      return {
        success: false,
        message: 'Order not found',
        status: 404
      };
    }

    // Add note to order
    const note = {
      content,
      author: session.user.name || session.user.email,
      type: 'admin',
      createdAt: new Date()
    };

    order.notes = order.notes || [];
    order.notes.push(note);
    await order.save();

    return { 
      success: true, 
      note,
      status: 200
    };
  } catch (error) {
    console.error('Error adding order note:', error);
    return {
      success: false,
      message: 'Failed to add note',
      status: 500
    };
  }
} 