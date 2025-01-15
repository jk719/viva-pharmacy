import cloudinaryUrls from '@/data/cloudinaryUrls.json';

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

  // Helper function to safely format currency values
  const formatCurrency = (value) => {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(amount) ? '0.00' : amount.toFixed(2);
  };

  // Add these constants at the top
  const DEFAULT_IMAGE = '/images/placeholder.png';
  const STORE_NAME = 'Viva Pharmacy';
  const PRODUCT_IMAGES_PATH = '/images/products/';

  // Update validateImageUrl to use cloudinaryUrls
  const validateImageUrl = (url, productName) => {
    // Convert product name to match cloudinaryUrls format
    const normalizedName = productName?.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '.png';

    console.log('🖼️ Looking up image:', {
      productName,
      normalizedName,
      hasMapping: cloudinaryUrls[normalizedName],
      originalUrl: url
    });

    try {
      // If it's already a Cloudinary URL, use it
      if (url?.includes('cloudinary.com')) {
        return url;
      }

      // Try to find the Cloudinary URL from our mapping
      if (normalizedName && cloudinaryUrls[normalizedName]) {
        return cloudinaryUrls[normalizedName];
      }

      // Fallback to default image
      console.log('⚠️ No image found for:', normalizedName);
      return `${process.env.NEXT_PUBLIC_BASE_URL}${DEFAULT_IMAGE}`;
    } catch (e) {
      console.error('Error validating image URL:', e);
      return `${process.env.NEXT_PUBLIC_BASE_URL}${DEFAULT_IMAGE}`;
    }
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Viva Pharmacy</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1F2937;
            background-color: #F3F4F6;
            margin: 0;
            padding: 0;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 16px 16px 0 0;
          }
          
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: white;
          }
          
          .header p {
            margin: 10px 0 0;
            opacity: 0.9;
          }
          
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 16px 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          
          .greeting {
            font-size: 18px;
            margin-bottom: 25px;
          }
          
          .section {
            background: #F9FAFB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
          }
          
          .section-title {
            color: #4F46E5;
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 15px 0;
          }
          
          .item {
            display: flex;
            align-items: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          
          .item-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            margin-right: 15px;
          }
          
          .item-details {
            flex: 1;
          }
          
          .item-name {
            font-weight: 600;
            margin: 0 0 5px 0;
          }
          
          .item-meta {
            color: #6B7280;
            font-size: 14px;
          }
          
          .total-section {
            border-top: 2px dashed #E5E7EB;
            margin-top: 20px;
            padding-top: 20px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .total-row.final {
            font-weight: 600;
            font-size: 18px;
            color: #4F46E5;
            margin-top: 10px;
          }
          
          .rewards-section {
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
          }
          
          .rewards-title {
            font-size: 20px;
            font-weight: 600;
            margin: 0 0 10px 0;
          }
          
          .rewards-amount {
            font-size: 24px;
            font-weight: 700;
            margin: 10px 0;
          }
          
          .delivery-info {
            background: #F0F9FF;
            border-radius: 12px;
            padding: 20px;
          }
          
          .footer {
            text-align: center;
            color: #6B7280;
            font-size: 14px;
            margin-top: 30px;
          }
          
          .button {
            display: inline-block;
            background: #4F46E5;
            color: white !important;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 15px;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              padding: 10px;
            }
            
            .content {
              padding: 20px;
            }
            
            .item {
              flex-direction: column;
              text-align: center;
            }
            
            .item-image {
              margin: 0 0 10px 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Order! ��</h1>
            <p>Order #${orderNumber}</p>
          </div>

          <div class="content">
            <p class="greeting">Hi ${customerName},</p>
            <p>Your order has been confirmed and we're getting it ready! Here's what you ordered:</p>

            <div class="section">
              <h2 class="section-title">Order Summary</h2>
              ${items.map(item => {
                const imageUrl = validateImageUrl(item.image, item.name);
                console.log('📦 Processing order item:', {
                  name: item.name,
                  hasImage: !!item.image,
                  originalUrl: item.image,
                  processedUrl: imageUrl
                });
                
                return `
                  <div class="item">
                    <img 
                      src="${imageUrl}"
                      alt="${item.name || 'Product'}"
                      class="item-image"
                      style="width: 80px; height: 80px; object-fit: contain; background: white; border: 1px solid #E5E7EB;"
                      onerror="this.onerror=null; this.src='${process.env.NEXT_PUBLIC_BASE_URL}${DEFAULT_IMAGE}'; this.style.padding='8px';"
                    />
                    <div class="item-details">
                      <p class="item-name">${item.name || 'Product'}</p>
                      <p class="item-meta">
                        Quantity: ${item.quantity} × $${formatCurrency(item.price)}
                      </p>
                      <p class="item-meta">
                        Subtotal: $${formatCurrency(item.price * item.quantity)}
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
                  <p class="rewards-amount">
                    $${vivaBucksEarned.toFixed(2)} VivaBucks
                  </p>
                ` : ''}
                ${rewardPointsEarned ? `
                  <p class="rewards-amount">
                    ${rewardPointsEarned} Reward Points
                  </p>
                ` : ''}
                <p>Keep shopping to earn more rewards!</p>
              </div>
            ` : ''}

            <div class="section">
              <h2 class="section-title">${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'} Details</h2>
              <div class="delivery-info">
                ${deliveryMethod === 'delivery' ? `
                  <p><strong>Shipping Address:</strong></p>
                  <p>${shippingAddress.street}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}</p>
                ` : `
                  <p><strong>Pickup Location:</strong></p>
                  <p>Viva Pharmacy<br>
                  123 Main Street<br>
                  New York, NY 10001</p>
                `}
                <p><strong>Selected Time:</strong> ${selectedTime}</p>
              </div>
            </div>

            <div class="footer">
              <p>Questions about your order? Contact us at <a href="mailto:support@vivapharmacy.com" style="color: #4F46E5;">support@vivapharmacy.com</a></p>
              <a href="https://vivapharmacy.com/orders" class="button" style="color: white;">Track Your Order</a>
              <p style="margin-top: 20px;">© ${new Date().getFullYear()} Viva Pharmacy. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
} 