export function generateOrderConfirmationEmail({ 
  orderNumber,
  customerName,
  items,
  subtotal,
  tax,
  total,
  shippingAddress,
  deliveryMethod,
  selectedTime
}) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Viva Pharmacy</title>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background-color: #003366;
            color: white;
            border-radius: 8px;
          }
          .order-details {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .item {
            padding: 15px 0;
            border-bottom: 1px solid #eee;
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: contain;
            border-radius: 4px;
            background-color: #f8f9fa;
          }
          .item-details {
            flex: 1;
          }
          .total {
            margin-top: 20px;
            text-align: right;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Thank You for Your Order!</h1>
          <p>Order #${orderNumber}</p>
        </div>

        <p>Dear ${customerName},</p>
        <p>Thank you for shopping with Viva Pharmacy. We've received your order and will process it right away.</p>

        <div class="order-details">
          <h2>Order Details</h2>
          <div class="items">
            ${items.map(item => `
              <div class="item">
                ${item.image ? `
                  <img 
                    src="${item.image}" 
                    alt="${item.name}"
                    class="item-image"
                  />
                ` : ''}
                <div class="item-details">
                  <p style="margin: 0 0 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 0 0 5px 0;">Quantity: ${item.quantity}</p>
                  <p style="margin: 0;">Price: $${(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="total">
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>Tax: $${tax.toFixed(2)}</p>
            <p><strong>Total: $${total.toFixed(2)}</strong></p>
          </div>
        </div>

        <div class="order-details">
          <h2>${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Information</h2>
          ${deliveryMethod === 'delivery' ? `
            <p><strong>Shipping Address:</strong></p>
            <p>${shippingAddress.street}</p>
            <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
          ` : `
            <p><strong>Pickup Location:</strong></p>
            <p>Viva Pharmacy</p>
            <p>123 Main Street</p>
            <p>New York, NY 10001</p>
          `}
          <p><strong>Selected Time:</strong> ${selectedTime}</p>
        </div>

        <div class="footer">
          <p>If you have any questions about your order, please contact us at support@vivapharmacy.com</p>
          <p>© ${new Date().getFullYear()} Viva Pharmacy. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
} 