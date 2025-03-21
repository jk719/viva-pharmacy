import mongoose from 'mongoose';

const prescriptionDeliverySchema = new mongoose.Schema({
    paymentIntentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for guest checkouts
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED'],
        default: 'PENDING'
    },
    deliverySpeed: {
        type: String,
        enum: ['NEXT_DAY', 'SAME_DAY', 'ONE_HOUR'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        street: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    contact: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    estimatedDelivery: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const PrescriptionDelivery = mongoose.models.PrescriptionDelivery || mongoose.model('PrescriptionDelivery', prescriptionDeliverySchema);
export default PrescriptionDelivery; 