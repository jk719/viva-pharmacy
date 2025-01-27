import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to safely format currency values
const formatCurrency = (value) => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(amount) ? '0.00' : amount.toFixed(2);
};

// Use a base URL for images instead of reading from file
const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dv3cd1aoy/image/upload/v1/products/';
const DEFAULT_IMAGE = '/images/placeholder.png';

// Simplified image URL validation
const validateImageUrl = (url, productName) => {
    try {
        if (url?.includes('cloudinary.com')) return url;
        if (url?.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_BASE_URL}${DEFAULT_IMAGE}`;
    } catch (e) {
        console.error('Error validating image URL:', e);
        return `${process.env.NEXT_PUBLIC_BASE_URL}${DEFAULT_IMAGE}`;
    }
};

export function generateOrderConfirmationEmail({ 
    orderNumber,
    customerName,
    items,
    subtotal,
    tax,
    total,
    shippingAddress,
    deliveryMethod,
    selectedTime,
    vivaBucksEarned = 0,
    rewardPointsEarned = 0
}) {
    // Add debug logging for incoming data
    console.log('📧 Generating email template with:', {
        orderNumber,
        itemsCount: items?.length,
        items: items?.map(item => ({
            name: item.name,
            hasImage: !!item.image,
            imageUrl: item.image,
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Constants
    const STORE_NAME = 'Viva Pharmacy';

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Viva Pharmacy</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #FF9F43;
            color: white;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .content {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .section {
            margin: 20px 0;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 6px;
          }
          .section-title {
            color: #FF9F43;
            margin-bottom: 15px;
          }
          .item {
            display: flex;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
          }
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 4px;
            margin-right: 15px;
          }
          .item-details {
            flex: 1;
          }
          .item-name {
            font-weight: bold;
            margin: 0 0 5px 0;
          }
          .item-meta {
            color: #666;
            font-size: 0.9em;
            margin: 0;
          }
          .total-section {
            margin-top: 20px;
            border-top: 2px solid #eee;
            padding-top: 15px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total-row.final {
            font-weight: bold;
            font-size: 1.1em;
            margin-top: 10px;
            border-top: 1px solid #eee;
            padding-top: 10px;
          }
          .rewards-section {
            background: #FFF5E6;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: center;
          }
          .rewards-title {
            color: #FF9F43;
            margin: 0 0 10px 0;
          }
          .rewards-amount {
            font-size: 1.2em;
            font-weight: bold;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Order! 🎉</h1>
            <p>Order #${orderNumber}</p>
          </div>

          <div class="content">
            <p class="greeting">Hi ${customerName},</p>
            <p>Your order has been confirmed and we're getting it ready!</p>

            <div class="section">
              <h2 class="section-title">Order Summary</h2>
              ${items.map(item => {
                const imageUrl = validateImageUrl(item.image, item.name);
                return `
                  <div class="item">
                    <img src="${imageUrl}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                      <p class="item-name">${item.name}</p>
                      <p class="item-meta">
                        Quantity: ${item.quantity} × $${formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}

              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal</span>
                  <span>$${formatCurrency(subtotal)}</span>
                </div>
                <div class="total-row">
                  <span>Tax</span>
                  <span>$${formatCurrency(tax)}</span>
                </div>
                <div class="total-row final">
                  <span>Total</span>
                  <span>$${formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            ${(vivaBucksEarned || rewardPointsEarned) ? `
              <div class="rewards-section">
                <h3 class="rewards-title">Rewards Earned! 🌟</h3>
                ${vivaBucksEarned ? `
                  <p class="rewards-amount">$${formatCurrency(vivaBucksEarned)} VivaBucks</p>
                ` : ''}
                ${rewardPointsEarned ? `
                  <p class="rewards-amount">${rewardPointsEarned} Reward Points</p>
                ` : ''}
              </div>
            ` : ''}

            <div class="section">
              <h2 class="section-title">${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Details</h2>
              ${deliveryMethod === 'delivery' ? `
                <p><strong>Shipping Address:</strong><br>
                ${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
              ` : `
                <p><strong>Pickup Location:</strong><br>
                Viva Pharmacy<br>
                123 Main Street<br>
                New York, NY 10001</p>
              `}
              <p><strong>Selected Time:</strong> ${selectedTime}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
} 