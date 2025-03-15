export const orderUpdateTemplate = ({
  orderNumber,
  status,
  message,
  items,
  total,
  deliveryMethod,
  shippingAddress
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Order Status Update</h2>
      <p>Order #${orderNumber}</p>
    </div>

    <div class="status">
      Status: ${status}
    </div>

    <div class="message">
      ${message}
    </div>

    <div class="items">
      <h3>Order Summary</h3>
      ${items.map(item => `
        <div class="item">
          <p>${item.name}</p>
          <p>Quantity: ${item.quantity} x $${item.price.toFixed(2)}</p>
        </div>
      `).join('')}
      <p><strong>Total: $${total.toFixed(2)}</strong></p>
    </div>

    <div class="delivery">
      <h3>Delivery Details</h3>
      ${deliveryMethod === 'delivery' ? `
        <p>Shipping Address:</p>
        <p>${shippingAddress.street}</p>
        <p>${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
        <p>${shippingAddress.country}</p>
      ` : `
        <p>Pickup at store</p>
      `}
    </div>

    <div class="footer">
      <p>Thank you for shopping with Viva Pharmacy!</p>
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
`; 