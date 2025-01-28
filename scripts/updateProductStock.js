const mongoose = require('mongoose');
const dbConnect = require('../lib/dbConnect.js');

// Import the Product model directly
const Product = require('../models/Product.js');

async function updateProductStock() {
  try {
    // Connect to the database
    await dbConnect();

    // Update all products to have stock of 10
    const result = await Product.updateMany(
      {}, 
      { $set: { stock: 10 } }
    );

    console.log(`Successfully updated ${result.modifiedCount} products`);
    
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error updating product stock:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

updateProductStock(); 