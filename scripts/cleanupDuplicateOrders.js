const dotenv = require('dotenv');
const mongoose = require('mongoose');
const dbConnect = require('../lib/dbConnect');
const readline = require('readline');

dotenv.config();

// Define the Order Schema
const OrderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    items: [{
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    total: Number,
    status: String,
    paymentIntentId: String,
    createdAt: Date
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

async function cleanupDuplicateOrders() {
    let rl;
    try {
        // Connect using your existing connection function
        console.log('Connecting to database...');
        await dbConnect();
        console.log('Connected to database');

        // Get all orders
        const orders = await Order.find().sort({ createdAt: 1 });
        console.log(`Found ${orders.length} total orders`);

        // Group orders by paymentIntentId
        const orderGroups = new Map();
        orders.forEach(order => {
            const paymentIntentId = order.paymentIntentId || 'unknown';
            if (!orderGroups.has(paymentIntentId)) {
                orderGroups.set(paymentIntentId, []);
            }
            orderGroups.get(paymentIntentId).push(order);
        });

        // Find duplicates
        let duplicateCount = 0;
        const duplicateIds = [];
        
        orderGroups.forEach((groupOrders, paymentIntentId) => {
            if (groupOrders.length > 1) {
                console.log(`\nFound ${groupOrders.length} duplicates for payment intent: ${paymentIntentId}`);
                
                // Keep the first order, mark others for deletion
                const [keep, ...duplicates] = groupOrders;
                console.log(`Keeping order: ${keep._id} (created: ${keep.createdAt})`);
                
                duplicates.forEach(dupe => {
                    console.log(`Will delete: ${dupe._id} (created: ${dupe.createdAt})`);
                    duplicateIds.push(dupe._id);
                });
                
                duplicateCount += duplicates.length;
            }
        });

        if (duplicateCount > 0) {
            console.log(`\nFound ${duplicateCount} duplicate orders`);
            
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('\nDo you want to delete these duplicates? (y/n) ', resolve);
            });

            if (answer.toLowerCase() === 'y') {
                const result = await Order.deleteMany({ _id: { $in: duplicateIds } });
                console.log(`Deleted ${result.deletedCount} orders`);
                
                const remainingOrders = await Order.countDocuments();
                console.log(`\nRemaining orders: ${remainingOrders}`);
            } else {
                console.log('Operation cancelled');
            }
        } else {
            console.log('\nNo duplicates found');
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exitCode = 1;
    } finally {
        if (rl) {
            rl.close();
        }
        try {
            await mongoose.disconnect();
            console.log('Database disconnected');
        } catch (error) {
            console.error('Error disconnecting from database:', error);
        }
        process.exit(process.exitCode || 0);
    }
}

cleanupDuplicateOrders(); 