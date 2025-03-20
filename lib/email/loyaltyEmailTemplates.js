export const emailTemplates = {
  pointsEarned: (userData) => ({
    subject: "You've Earned VivaBucks Points! 🌟",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Great news, ${userData.name}!</h2>
        <p>You've earned ${userData.pointsEarned} VivaBucks points from your recent purchase.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">Current Balance: ${userData.totalPoints} points</p>
          <p style="margin: 5px 0 0;">Current Tier: ${userData.tier}</p>
        </div>
        ${userData.nextTierProgress ? `
          <p>You're only ${userData.nextTierProgress} points away from reaching ${userData.nextTier}!</p>
        ` : ''}
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          View Your Rewards
        </a>
      </div>
    `
  }),

  tierUpgrade: (userData) => ({
    subject: `Congratulations! You're Now ${userData.newTier} Tier! 🎉`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations, ${userData.name}!</h2>
        <p>You've reached ${userData.newTier} tier in our VivaBucks Rewards program.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your New Benefits:</h3>
          <ul style="margin-bottom: 0;">
            ${userData.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Explore Your New Benefits
        </a>
      </div>
    `
  }),

  newCoupon: (userData) => ({
    subject: 'Your VivaBucks Reward Coupon Is Here! 💝',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Here's your reward, ${userData.name}!</h2>
        <p>You've earned a new coupon for your loyalty:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #0066cc;">$${userData.couponAmount} OFF</h3>
          <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">${userData.couponCode}</p>
          <p style="margin-bottom: 0; font-size: 14px;">Expires: ${userData.expiryDate}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Shop Now
        </a>
      </div>
    `
  }),

  specialEvent: (userData) => ({
    subject: `${userData.eventName} - Special VivaBucks Event! 🎯`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${userData.eventName}</h2>
        <p>${userData.eventDescription}</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details:</h3>
          <ul style="margin-bottom: 0;">
            <li>Duration: ${userData.eventDates}</li>
            <li>Point Multiplier: ${userData.pointMultiplier}x</li>
            ${userData.bonusPoints ? `<li>Bonus Points: ${userData.bonusPoints}</li>` : ''}
            ${userData.minimumPurchase ? `<li>Minimum Purchase: $${userData.minimumPurchase}</li>` : ''}
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/shop" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          Shop Now
        </a>
      </div>
    `
  }),

  birthdayReward: (userData) => ({
    subject: 'Happy Birthday! Your Special VivaBucks Reward Is Here! 🎂',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Happy Birthday, ${userData.name}! 🎉</h2>
        <p>We're celebrating your special day with a birthday reward just for you:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
          <h3 style="margin-top: 0; color: #0066cc;">${userData.birthdayPoints} Bonus Points</h3>
          ${userData.specialCoupon ? `
            <p style="margin: 10px 0; font-size: 18px; font-weight: bold;">Special Birthday Coupon: ${userData.specialCoupon}</p>
          ` : ''}
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile/rewards" 
           style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">
          View Your Rewards
        </a>
      </div>
    `
  }),

  prescriptionStatus: (data) => ({
    subject: `Prescription ${data.status === 'verified' ? 'Approved' : 'Update Required'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/viva-online-logo.png" 
             alt="VIVA Pharmacy" style="max-width: 200px; margin-bottom: 20px;" />
        
        <h1>Prescription ${data.status === 'verified' ? 'Approved' : 'Update Required'}</h1>
        <p>Hello ${data.name},</p>
        
        ${data.status === 'verified' 
          ? `<p>Great news! Your prescription has been verified by our pharmacist. 
              You can now proceed with the checkout process.</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/prescriptions/checkout/${data.prescriptionId}"
                    style="background-color: #FF9F43; color: white; padding: 10px 20px; 
                           text-decoration: none; border-radius: 5px; display: inline-block;">
                 Proceed to Checkout
              </a></p>`
          : `<p>Our pharmacist has reviewed your prescription and requires additional information:</p>
              <p>${data.note || 'Please contact us for more details.'}</p>`
        }
        
        <p>Prescription ID: ${data.prescriptionId}</p>
        
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        
        <p style="color: #666; font-size: 14px;">
          If you have any questions, please contact us:<br />
          Phone: ${process.env.PHARMACY_PHONE}<br />
          Email: ${process.env.PHARMACY_EMAIL}
        </p>
      </div>
    `
  })
}; 