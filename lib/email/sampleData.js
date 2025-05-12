/**
 * Sample data for email template previews
 * This file provides test data for all email templates in the system
 */

export const generateSampleData = (templateName) => {
  // Default sample data for common templates
  const sampleData = {
    // Loyalty Program Templates
    pointsEarned: {
      name: 'John Doe',
      pointsEarned: 500,
      totalPoints: 2500,
      tier: 'Gold',
      nextTierProgress: 500,
      nextTier: 'Platinum'
    },
    tierUpgrade: {
      name: 'John Doe',
      newTier: 'Platinum',
      benefits: [
        '1.75x point multiplier',
        'Exclusive discounts',
        'Early access to sales',
        '$20 reward coupon'
      ]
    },
    newCoupon: {
      name: 'John Doe',
      couponAmount: 25,
      couponCode: 'VIVA25OFF',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
    },
    specialEvent: {
      name: 'John Doe',
      eventName: 'Summer Sale Bonus',
      eventDescription: 'Earn double points on all purchases!',
      eventDates: 'June 1 - June 30',
      pointMultiplier: 2,
      bonusPoints: 500,
      minimumPurchase: 100
    },
    birthdayReward: {
      name: 'John Doe',
      birthdayPoints: 1000,
      specialCoupon: 'BDAYREWARD50'
    },
    
    // Order Templates
    orderConfirmation: {
      orderNumber: 'VIV12345',
      customerName: 'John Doe',
      items: [
        { name: 'Pain Relief Tablets', quantity: 2, price: 12.99, image: 'https://via.placeholder.com/80x80?text=PR' },
        { name: 'Vitamin C Supplements', quantity: 1, price: 15.49, image: 'https://via.placeholder.com/80x80?text=VC' }
      ],
      subtotal: 41.47,
      tax: 3.32,
      total: 44.79,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      deliveryMethod: 'delivery',
      selectedTime: 'Monday, June 15, 2:00 PM - 4:00 PM',
      vivaBucksEarned: 45,
      rewardPointsEarned: 42
    },
    orderUpdate: {
      orderNumber: 'VIV12345',
      status: 'Shipped',
      message: 'Your order has been shipped and is on its way to you!',
      items: [
        { name: 'Pain Relief Tablets', quantity: 2, price: 12.99 },
        { name: 'Vitamin C Supplements', quantity: 1, price: 15.49 }
      ],
      total: 44.79,
      deliveryMethod: 'delivery',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
    },
    
    // Account Templates
    passwordReset: {
      name: 'John Doe',
      resetToken: 'abc123def456',
      isManagerReset: false
    },
    adminWelcome: {
      email: 'manager@example.com',
      verificationToken: 'xyz789abc123'
    },
    verificationEmail: {
      name: 'John Doe',
      token: 'verification123token456'
    },
    
    // Prescription Templates
    prescriptionStatus: {
      name: 'John Doe',
      prescriptionId: 'RX123456',
      status: 'verified',
      note: null
    },
    reactPrescriptionStatus: {
      name: 'John Doe',
      prescriptionId: 'RX123456',
      status: 'verified',
      medications: [
        { name: 'Amoxicillin', dosage: '500mg', instructions: 'Take 1 capsule by mouth 3 times a day until completed' },
        { name: 'Ibuprofen', dosage: '200mg', instructions: 'Take 2 tablets by mouth every 6 hours as needed for pain' }
      ],
      pharmacy: {
        name: 'Viva Pharmacy',
        phone: '555-123-4567',
        address: '123 Health Ave, New York, NY 10001'
      },
      doctor: 'Dr. Sarah Smith'
    },
    
    // Additional Templates
    refundConfirmation: {
      name: 'John Doe',
      orderNumber: 'VIV12345',
      refundAmount: 44.79,
      refundReason: 'Customer requested cancellation',
      refundDate: new Date().toLocaleDateString()
    },
    deliveryConfirmation: {
      customerName: 'John Doe',
      orderNumber: 'VIV12345',
      deliveryDate: new Date().toLocaleDateString(),
      items: [
        { name: 'Pain Relief Tablets', quantity: 2 },
        { name: 'Vitamin C Supplements', quantity: 1 }
      ]
    }
  };
  
  // If a template name is provided, return just that template's data
  if (templateName && sampleData[templateName]) {
    return sampleData[templateName];
  }
  
  // If the template doesn't have specific sample data, return a generic object
  if (templateName) {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      date: new Date().toISOString(),
      message: 'This is a generic sample for testing'
    };
  }
  
  // Return all sample data
  return sampleData;
}; 