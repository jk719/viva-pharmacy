"use client";
import { useRef, useState } from 'react';
import { FiPrinter } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PrintOrder({ order }) {
  const printRef = useRef();
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    try {
      setLoading(true);
      const element = document.getElementById('order-print-content');
      
      // Make the element visible temporarily
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Hide the element again
      element.style.display = 'none';

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight
      );

      pdf.save(`order-${order.orderNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        <FiPrinter className="mr-2" />
        {loading ? 'Generating PDF...' : 'Print Order'}
      </button>

      <div 
        ref={printRef} 
        id="order-print-content" 
        className="hidden"
        style={{
          width: '800px',  // Set explicit width
          padding: '20px',
          backgroundColor: 'white'
        }}
      >
        <div className="p-8 bg-white">
          <h1 className="text-2xl font-bold mb-6">Order #{order.orderNumber}</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
            <p>Name: {order.userId?.name}</p>
            <p>Email: {order.userId?.email}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Order Details</h2>
            <p>Status: {order.status}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Total: ${order.total.toFixed(2)}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Items</h2>
            {order.items.map((item, index) => (
              <div key={index} className="mb-2">
                <p>{item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Delivery Information</h2>
            <p>Method: {order.deliveryMethod}</p>
            <p>Time: {order.selectedTime}</p>
            {order.deliveryMethod === 'delivery' && order.shippingAddress && (
              <div>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
