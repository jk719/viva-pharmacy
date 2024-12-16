import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    items: [{
        productId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        image: {
            type: String,
            default: null
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Completed'],
        default: 'Pending'
    },
    deliveryMethod: {
        type: String,
        enum: ['delivery', 'pickup'],
        required: true
    },
    selectedTime: {
        type: String,
        required: true
    },
    shippingAddress: {
        street: {
            type: String,
            required: function() { return this.deliveryMethod === 'delivery'; }
        },
        city: {
            type: String,
            required: function() { return this.deliveryMethod === 'delivery'; }
        },
        state: {
            type: String,
            required: function() { return this.deliveryMethod === 'delivery'; }
        },
        zipCode: {
            type: String,
            required: function() { return this.deliveryMethod === 'delivery'; }
        },
        country: {
            type: String,
            default: 'US'
        }
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentIntentId: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

OrderSchema.index({ createdAt: -1 });

OrderSchema.methods.getStatusColor = function() {
    const statusColors = {
        'Pending': 'gray',
        'Processing': 'blue',
        'Shipped': 'yellow',
        'Delivered': 'green',
        'Completed': 'green'
    };
    return statusColors[this.status] || 'gray';
};

OrderSchema.pre('save', function(next) {
    if (this.status) {
        this.status = this.status.charAt(0).toUpperCase() + this.status.slice(1).toLowerCase();
    }
    next();
});

OrderSchema.virtual('formattedDate').get(function() {
    return new Date(this.createdAt).toLocaleDateString();
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order; 