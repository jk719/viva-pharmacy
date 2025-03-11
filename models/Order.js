import mongoose from 'mongoose';
import eventEmitter, { Events } from '@/lib/eventEmitter';

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

OrderSchema.index({ 
    orderNumber: 1,
    createdAt: -1,
    userId: 1,
    emailSent: 1
}, { 
    unique: true, 
    partialFilterExpression: { orderNumber: { $type: "string" } } 
});

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
    console.log('📦 Pre-save order hook:', {
        orderNumber: this.orderNumber,
        status: this.status,
        total: this.total
    });
    
    try {
        if (this.isNew) {
            // Emit order created event
            eventEmitter.emit(Events.ORDER_CREATED, {
                orderId: this._id,
                userId: this.userId,
                total: this.total,
                type: 'ORDER_CREATED',
                timestamp: new Date().toISOString()
            });
        }
        
        if (this.isModified('status') && this.status === 'Completed') {
            // Emit order completed event
            eventEmitter.emit(Events.ORDER_COMPLETED, {
                orderId: this._id,
                userId: this.userId,
                total: this.total,
                type: 'ORDER_COMPLETED',
                timestamp: new Date().toISOString()
            });
        }
        
        next();
    } catch (error) {
        console.error('❌ Order pre-save error:', error);
        next(error);
    }
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

let Order;
try {
    Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
} catch (error) {
    console.error('Error initializing Order model:', error);
    throw error;
}

if (process.env.NODE_ENV === 'production') {
    const createIndexes = async () => {
        try {
            await Order.syncIndexes();
            console.log('Order indexes synchronized successfully');
        } catch (err) {
            console.error('Error synchronizing Order indexes:', err);
            // Don't throw the error - log it and continue
        }
    };
    
    createIndexes();
}

export default Order; 