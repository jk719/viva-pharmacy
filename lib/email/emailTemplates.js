import { wrapInBaseTemplate, EmailComponents, BRAND_COLORS } from './emailBase';
import { createTemplateFromReactEmail } from './renderReactEmail';
import PrescriptionEmailTemplate from '@/components/emails/PrescriptionEmailTemplate';

// Helper function to validate and format image URLs
function validateImageUrl(url, fallbackName) {
  if (!url || url === 'null' || url === 'undefined') {
    // Return a placeholder image if URL is invalid
    return `https://via.placeholder.com/80x80?text=${encodeURIComponent(fallbackName.substring(0, 2))}`;
  }
  return url;
}

// Helper for currency formatting
function formatCurrency(value) {
  return parseFloat(value).toFixed(2);
}

/**
 * Consolidated email templates for Viva Pharmacy
 * All templates use the base template structure for consistent styling
 */
export const emailTemplates = {
  // Loyalty Program Emails
  pointsEarned: (userData) => {
    const content = `
      ${EmailComponents.header("You've Earned VivaBucks Points! 🌟")}
      
      <div class="content">
        <h2>Great news, ${userData.name}!</h2>
        <p>You've earned ${userData.pointsEarned} VivaBucks points from your recent purchase.</p>
        
        ${EmailComponents.section(`
          <p style="margin: 0;"><strong>Current Balance:</strong> ${userData.totalPoints} points</p>
          <p style="margin: 5px 0 0;"><strong>Current Tier:</strong> ${userData.tier}</p>
        `)}
        
        ${userData.nextTierProgress ? `
          <p>You're only ${userData.nextTierProgress} points away from reaching ${userData.nextTier}!</p>
        ` : ''}
        
        ${EmailComponents.button('View Your Rewards', `${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards`)}
      </div>
    `;
    
    return {
      subject: "You've Earned VivaBucks Points! 🌟",
      html: wrapInBaseTemplate(content, {
        preheader: `You've earned ${userData.pointsEarned} VivaBucks points!`
      })
    };
  },
  
  tierUpgrade: (userData) => {
    const content = `
      ${EmailComponents.header(`Congratulations on Your ${userData.newTier} Tier! 🎉`)}
      
      <div class="content">
        <h2>Congratulations, ${userData.name}!</h2>
        <p>You've reached ${userData.newTier} tier in our VivaBucks Rewards program.</p>
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0;">Your New Benefits:</h3>
          <ul style="margin-bottom: 0;">
            ${userData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        `)}
        
        ${EmailComponents.button('Explore Your New Benefits', `${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards`)}
      </div>
    `;
    
    return {
      subject: `Congratulations! You're Now ${userData.newTier} Tier! 🎉`,
      html: wrapInBaseTemplate(content, {
        preheader: `You've reached ${userData.newTier} tier in our rewards program!`
      })
    };
  },
  
  newCoupon: (userData) => {
    const content = `
      ${EmailComponents.header('Your VivaBucks Reward Coupon Is Here! 💝')}
      
      <div class="content">
        <h2>Here's your reward, ${userData.name}!</h2>
        <p>You've earned a new coupon for your loyalty:</p>
        
        ${EmailComponents.rewardsSection(`
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">$${userData.couponAmount} OFF</h3>
          <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">${userData.couponCode}</p>
          <p style="margin-bottom: 0; font-size: 14px;">Expires: ${userData.expiryDate}</p>
        `)}
        
        ${EmailComponents.button('Shop Now', `${process.env.NEXT_PUBLIC_BASE_URL}/shop`)}
      </div>
    `;
    
    return {
      subject: 'Your VivaBucks Reward Coupon Is Here! 💝',
      html: wrapInBaseTemplate(content, {
        preheader: `You've earned a $${userData.couponAmount} coupon!`
      })
    };
  },
  
  specialEvent: (userData) => {
    const content = `
      ${EmailComponents.header(userData.eventName, 'Special VivaBucks Event!')}
      
      <div class="content">
        <p>${userData.eventDescription}</p>
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0;">Event Details:</h3>
          <ul style="margin-bottom: 0;">
            <li>Duration: ${userData.eventDates}</li>
            <li>Point Multiplier: ${userData.pointMultiplier}x</li>
            ${userData.bonusPoints ? `<li>Bonus Points: ${userData.bonusPoints}</li>` : ''}
            ${userData.minimumPurchase ? `<li>Minimum Purchase: $${userData.minimumPurchase}</li>` : ''}
          </ul>
        `)}
        
        ${EmailComponents.button('Shop Now', `${process.env.NEXT_PUBLIC_BASE_URL}/shop`)}
      </div>
    `;
    
    return {
      subject: `${userData.eventName} - Special VivaBucks Event! 🎯`,
      html: wrapInBaseTemplate(content, {
        preheader: userData.eventDescription
      })
    };
  },
  
  birthdayReward: (userData) => {
    const content = `
      ${EmailComponents.header('Happy Birthday! 🎂', 'Your Special VivaBucks Reward Is Here!')}
      
      <div class="content">
        <h2>Happy Birthday, ${userData.name}! 🎉</h2>
        <p>We're celebrating your special day with a birthday reward just for you:</p>
        
        ${EmailComponents.rewardsSection(`
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">${userData.birthdayPoints} Bonus Points</h3>
          ${userData.specialCoupon ? `
            <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">Special Birthday Coupon: ${userData.specialCoupon}</p>
          ` : ''}
        `)}
        
        ${EmailComponents.button('View Your Rewards', `${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards`)}
      </div>
    `;
    
    return {
      subject: 'Happy Birthday! Your Special VivaBucks Reward Is Here! 🎂',
      html: wrapInBaseTemplate(content, {
        preheader: `Celebrate with ${userData.birthdayPoints} bonus points!`
      })
    };
  },
  
  // Order-related Emails
  orderConfirmation: (data) => {
    const content = `
      ${EmailComponents.header('Thank You for Your Order! 🎉', `Order #${data.orderNumber}`)}
      
      <div class="content">
        <p class="greeting">Hi ${data.customerName},</p>
        <p>Your order has been confirmed and we're getting it ready!</p>
        
        ${EmailComponents.section(`
          <h2 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">Order Summary</h2>
          
          ${data.items.map(item => {
            const imageUrl = validateImageUrl(item.image, item.name);
            return `
              <div style="display: flex; margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
                <img src="${imageUrl}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
                <div style="flex: 1;">
                  <p style="font-weight: bold; margin: 0 0 5px 0;">${item.name}</p>
                  <p style="color: ${BRAND_COLORS.textLight}; font-size: 0.9em; margin: 0;">
                    Quantity: ${item.quantity} × $${formatCurrency(item.price)}
                  </p>
                </div>
              </div>
            `;
          }).join('')}
          
          <div style="margin-top: 20px; border-top: 2px solid ${BRAND_COLORS.border}; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Subtotal</span>
              <span>$${formatCurrency(data.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Tax</span>
              <span>$${formatCurrency(data.tax)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; font-size: 1.1em; margin-top: 10px; border-top: 1px solid ${BRAND_COLORS.border}; padding-top: 10px;">
              <span>Total</span>
              <span>$${formatCurrency(data.total)}</span>
            </div>
          </div>
        `)}
        
        ${(data.vivaBucksEarned || data.rewardPointsEarned) ? 
          EmailComponents.rewardsSection(`
            <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Rewards Earned! 🌟</h3>
            ${data.vivaBucksEarned ? `
              <p style="font-size: 1.2em; font-weight: bold; margin: 5px 0;">$${formatCurrency(data.vivaBucksEarned)} VivaBucks</p>
            ` : ''}
            ${data.rewardPointsEarned ? `
              <p style="font-size: 1.2em; font-weight: bold; margin: 5px 0;">${data.rewardPointsEarned} Reward Points</p>
            ` : ''}
          `)
        : ''}
        
        ${EmailComponents.section(`
          <h2 style="color: ${BRAND_COLORS.primary}; margin-top: 0;">${data.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Details</h2>
          
          ${data.deliveryMethod === 'delivery' ? `
            <p><strong>Shipping Address:</strong><br>
            ${data.shippingAddress.street}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
          ` : `
            <p><strong>Pickup Location:</strong><br>
            Viva Pharmacy<br>
            123 Main Street<br>
            New York, NY 10001</p>
          `}
          <p><strong>Selected Time:</strong> ${data.selectedTime}</p>
        `)}
      </div>
    `;
    
    return {
      subject: `Order Confirmation - #${data.orderNumber}`,
      html: wrapInBaseTemplate(content, {
        preheader: `Thank you for your order! #${data.orderNumber}`
      })
    };
  },
  
  orderUpdate: (data) => {
    const content = `
      ${EmailComponents.header('Order Status Update', `Order #${data.orderNumber}`)}
      
      <div class="content">
        ${EmailComponents.statusBadge(data.status, data.status !== 'Cancelled')}
        
        <p>${data.message}</p>
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0;">Order Summary</h3>
          ${data.items.map(item => `
            <div style="margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid ${BRAND_COLORS.border};">
              <p style="font-weight: bold; margin-bottom: 5px;">${item.name}</p>
              <p style="margin: 0;">Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
            </div>
          `).join('')}
          <p style="font-weight: bold; margin-top: 15px;">Total: $${data.total.toFixed(2)}</p>
        `)}
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0;">Delivery Details</h3>
          ${data.deliveryMethod === 'delivery' ? `
            <p>Shipping Address:</p>
            <p>${data.shippingAddress.street}</p>
            <p>${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
            <p>${data.shippingAddress.country}</p>
          ` : `
            <p>Pickup at store</p>
          `}
        `)}
      </div>
    `;
    
    return {
      subject: `Order Status Update - #${data.orderNumber}`,
      html: wrapInBaseTemplate(content, {
        preheader: `Your order #${data.orderNumber} status: ${data.status}`
      })
    };
  },
  
  // New refund confirmation template
  refundConfirmation: (data) => {
    const content = `
      ${EmailComponents.header('Refund Confirmation', `Order #${data.orderNumber}`)}
      
      <div class="content">
        <p>Dear ${data.name || 'Valued Customer'},</p>
        <p>Your refund for Order #${data.orderNumber} has been processed successfully.</p>
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Refund Details</h3>
          <p><strong>Amount:</strong> $${formatCurrency(data.amount)}</p>
          <p><strong>Reason:</strong> ${data.reason}</p>
          <p><strong>Date Processed:</strong> ${new Date(data.processedDate).toLocaleDateString()}</p>
        `)}
        
        <p>The refund should appear in your account within 5-10 business days.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
      </div>
    `;
    
    return {
      subject: `Refund Processed for Order #${data.orderNumber}`,
      html: wrapInBaseTemplate(content, {
        preheader: `Your refund of $${formatCurrency(data.amount)} has been processed`
      })
    };
  },
  
  // Email verification template
  verificationEmail: (data) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${data.token}`;
    
    const content = `
      ${EmailComponents.header('Verify Your Email Address')}
      
      <div class="content">
        <p>Hello ${data.name || 'there'},</p>
        <p>Please click the button below to verify your email address:</p>
        
        ${EmailComponents.button('Verify Email', verificationUrl, true)}
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: ${BRAND_COLORS.bgSecondary}; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${verificationUrl}
        </p>
        
        <p>This link will expire in 24 hours.</p>
      </div>
    `;
    
    return {
      subject: 'Verify Your Email Address',
      html: wrapInBaseTemplate(content, {
        preheader: 'Please verify your email address to complete your registration'
      })
    };
  },
  
  // Delivery confirmation template
  deliveryConfirmation: (data) => {
    const content = `
      ${EmailComponents.header('Prescription Delivery Confirmation')}
      
      <div class="content">
        ${EmailComponents.statusBadge('Delivery Confirmed', true)}
        
        <p>Hello ${data.customerName || 'there'},</p>
        <p>Your prescription has been delivered successfully!</p>
        
        ${EmailComponents.section(`
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Delivery Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Delivery Date:</strong> ${new Date(data.deliveryDate).toLocaleDateString()}</p>
          <p><strong>Delivery Address:</strong></p>
          <p>
            ${data.address.street}<br>
            ${data.address.city}, ${data.address.state} ${data.address.zipCode}
          </p>
        `)}
        
        ${data.instructions ? EmailComponents.section(`
          <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary};">Special Instructions</h3>
          <p>${data.instructions}</p>
        `) : ''}
        
        <p>Thank you for choosing Viva Pharmacy for your prescription needs. If you have any questions about your delivery, please contact us.</p>
      </div>
    `;
    
    return {
      subject: 'Your Prescription Delivery Confirmation',
      html: wrapInBaseTemplate(content, {
        preheader: 'Your prescription has been delivered successfully'
      })
    };
  },
  
  // Account-related Emails
  adminWelcome: (data) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const encodedToken = encodeURIComponent(data.verificationToken);
    const verificationUrl = `${baseUrl}/verify-email?token=${encodedToken}`;
    
    const content = `
      ${EmailComponents.header('Welcome to Viva Pharmacy Admin')}
      
      <div class="content">
        <p>Hello,</p>
        <p>You have been invited to join Viva Pharmacy's management system as a Manager.</p>
        
        ${EmailComponents.section(`
          <p><strong>Please follow these steps to get started:</strong></p>
          <div style="margin-bottom: 10px;">
            <span style="background-color: ${BRAND_COLORS.secondary}; color: white; padding: 2px 8px; border-radius: 50%; margin-right: 8px; font-size: 14px;">1</span>
            Click the verification button below to verify your email
          </div>
          <div style="margin-bottom: 10px;">
            <span style="background-color: ${BRAND_COLORS.secondary}; color: white; padding: 2px 8px; border-radius: 50%; margin-right: 8px; font-size: 14px;">2</span>
            After verification, you'll be prompted to set your password
          </div>
          <div style="margin-bottom: 10px;">
            <span style="background-color: ${BRAND_COLORS.secondary}; color: white; padding: 2px 8px; border-radius: 50%; margin-right: 8px; font-size: 14px;">3</span>
            Use your email and password to access the management portal
          </div>
        `, 'steps')}
        
        ${EmailComponents.button('Verify Email & Set Password', verificationUrl, true)}
        
        <p style="color: ${BRAND_COLORS.error}; font-weight: bold;">
          Important: This verification link will expire in 24 hours.
          Please complete the verification process as soon as possible.
        </p>
        
        <p>If you have any questions or issues, please contact the system administrator.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          Viva Pharmacy Team
        </p>
      </div>
    `;
    
    return {
      subject: 'Welcome to Viva Pharmacy Admin',
      html: wrapInBaseTemplate(content, {
        preheader: 'You have been invited to join Viva Pharmacy as a Manager'
      })
    };
  },
  
  passwordReset: (data) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${data.resetToken}`;
    
    const content = `
      ${EmailComponents.header(data.isManagerReset ? 'Set Your Password' : 'Reset Your Password')}
      
      <div class="content">
        <p>Hello ${data.name},</p>
        <p>${data.isManagerReset 
          ? 'You need to set up your password for your Viva Pharmacy manager account.' 
          : 'We received a request to reset your password for your Viva Pharmacy account.'}</p>
        
        <p>Please click the button below to ${data.isManagerReset ? 'set' : 'reset'} your password:</p>
        
        ${EmailComponents.button(
          data.isManagerReset ? 'Set Password' : 'Reset Password', 
          resetUrl,
          true
        )}
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: ${BRAND_COLORS.bgSecondary}; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${resetUrl}
        </p>
        
        <p>This link will expire in 1 hour.</p>
        
        ${data.isManagerReset 
          ? '<p><strong>Note:</strong> You must set your password to access the management portal.</p>' 
          : '<p>If you did not request this reset, please ignore this email.</p>'}
      </div>
    `;
    
    return {
      subject: data.isManagerReset ? 'Set Your Viva Pharmacy Password' : 'Reset Your Viva Pharmacy Password',
      html: wrapInBaseTemplate(content, {
        preheader: data.isManagerReset 
          ? 'Set your password for Viva Pharmacy manager account' 
          : 'Reset your password for Viva Pharmacy'
      })
    };
  },
  
  // React Email integration for prescription emails
  // This creates a template function that renders the React component
  reactPrescriptionStatus: createTemplateFromReactEmail(
    PrescriptionEmailTemplate,
    (data) => `Prescription ${data.status === 'verified' ? 'Approved' : 'Update Required'}`
  ),
  
  // For backward compatibility, we'll keep the regular prescriptionStatus template
  // but in the future, consider fully migrating to the React version
  
  // Add more React Email component integrations here as they are created
};

// Export the components and utilities for reuse
export { validateImageUrl, formatCurrency, EmailComponents, BRAND_COLORS }; 