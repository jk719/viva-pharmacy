"use client";
import { useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function RefundModal({ order, onClose, onRefund }) {
    const [selectedItems, setSelectedItems] = useState([]);
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleRefund = async () => {
        try {
            setProcessing(true);
            setError(null);

            const refundItems = selectedItems.map(itemId => {
                const item = order.items.find(i => i._id === itemId);
                return {
                    itemId,
                    quantity: item.quantity,
                    amount: item.price * item.quantity
                };
            });

            await onRefund({
                items: refundItems,
                reason
            });

            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Process Refund</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Select Items to Refund</h3>
                        {order.items.map((item) => (
                            <label key={item._id} className="flex items-center space-x-3 mb-2">
                                <input
                                    type="checkbox"
                                    checked={selectedItems.includes(item._id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedItems([...selectedItems, item._id]);
                                        } else {
                                            setSelectedItems(selectedItems.filter(id => id !== item._id));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span>{item.name} - ${item.price.toFixed(2)} × {item.quantity}</span>
                            </label>
                        ))}
                    </div>

                    <div>
                        <label className="block font-medium mb-2">Reason for Refund</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                            rows="3"
                            placeholder="Enter reason for refund..."
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRefund}
                            disabled={processing || selectedItems.length === 0 || !reason}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Process Refund'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 