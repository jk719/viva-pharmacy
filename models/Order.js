import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
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
        required: true,
        unique: true,
        index: true
    },
    emailSent: {
        type: Boolean,
        default: false,
        index: true
    },
    emailAttempts: {
        type: Number,
        default: 0
    },
    lastEmailAttempt: {
        type: Date,
        default: null
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
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });

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

OrderSchema.pre('save', async function(next) {
    if (this.status) {
        this.status = this.status.charAt(0).toUpperCase() + this.status.slice(1).toLowerCase();
    }
    
    if (!this.orderNumber) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderNumber = `ORD-${timestamp}-${random}`;
        
        try {
            const existingOrder = await mongoose.models.Order.findOne({ orderNumber: this.orderNumber });
            if (existingOrder) {
                return next(new Error('Order number already exists. Please try again.'));
            }
        } catch (err) {
            return next(err);
        }
    }
    
    next();
});

OrderSchema.virtual('formattedDate').get(function() {
    return new Date(this.createdAt).toLocaleDateString();
});

OrderSchema.virtual('summary').get(function() {
    return {
        id: this._id,
        total: this.total,
        status: this.status,
        date: this.formattedDate,
        itemCount: this.items.length
    };
});

OrderSchema.methods.canBeModified = function() {
    const nonModifiableStatuses = ['Delivered', 'Completed'];
    return !nonModifiableStatuses.includes(this.status);
};

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

if (process.env.NODE_ENV === 'production') {
    Order.createIndexes().catch(err => 
        console.error('Error creating Order indexes:', err)
    );
}

export default Order; 