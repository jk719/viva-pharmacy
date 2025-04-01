export const smsTemplates = {
  orderStatus: ({ orderNumber, status }) => ({
    message: `VIVA Pharmacy: Order #${orderNumber} status updated to ${status}. Track your order at ${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}`
  }),

  prescriptionStatus: ({ prescriptionId, status, note }) => ({
    message: `VIVA Pharmacy: Your prescription #${prescriptionId} has been ${status}. ${note ? `Note: ${note}` : ''}`
  }),

  deliveryUpdate: ({ orderNumber, status, estimatedTime }) => ({
    message: `VIVA Pharmacy: Your delivery for order #${orderNumber} is ${status}. ${estimatedTime ? `ETA: ${estimatedTime}` : ''}`
  }),

  refundConfirmation: ({ orderNumber, amount }) => ({
    message: `VIVA Pharmacy: Refund of $${amount} for order #${orderNumber} has been processed. Allow 5-10 business days for processing.`
  })
}; 