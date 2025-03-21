export const generateDeliveryConfirmationEmail = (deliveryDetails) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const getDeliverySpeedText = (speed) => {
        const speedTexts = {
            'NEXT_DAY': 'Next Day Delivery (Free)',
            'SAME_DAY': 'Same Day Delivery ($5.00)',
            'ONE_HOUR': '1 Hour Delivery ($7.00)'
        };
        return speedTexts[speed] || speed;
    };

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #003366; text-align: center;">Prescription Delivery Confirmed</h1>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #0066cc; margin-bottom: 15px;">Delivery Details</h2>
                <p><strong>Estimated Delivery:</strong> ${formatDate(deliveryDetails.estimatedDelivery)}</p>
                <p><strong>Delivery Type:</strong> ${getDeliverySpeedText(deliveryDetails.deliverySpeed)}</p>
                <p><strong>Amount Paid:</strong> $${deliveryDetails.amount.toFixed(2)}</p>
            </div>

            <div style="background-color: #e8f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="color: #0066cc; margin-bottom: 15px;">Delivery Address</h2>
                <p>${deliveryDetails.contact.name}</p>
                <p>${deliveryDetails.address.street} ${deliveryDetails.address.apartment || ''}</p>
                <p>${deliveryDetails.address.city}, ${deliveryDetails.address.state} ${deliveryDetails.address.zipCode}</p>
                <p><strong>Phone:</strong> ${deliveryDetails.contact.phone}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #666;">
                <p>Thank you for choosing Viva Pharmacy!</p>
                <p style="font-size: 0.9em;">Order ID: ${deliveryDetails.id}</p>
            </div>
        </div>
    `;
}; 