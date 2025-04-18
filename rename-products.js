const fs = require('fs');
const path = require('path');

// Define directory path
const PRODUCTS_DIR = path.join(__dirname, 'data', 'processed_products');

// Log initial message
console.log('Starting to rename product files according to their slugs...');

// Get all JSON files in the products directory
const productFiles = fs.readdirSync(PRODUCTS_DIR)
  .filter(file => file.endsWith('.json'));

console.log(`Found ${productFiles.length} product files to process.`);

// Track success and failure counts
let successCount = 0;
let failCount = 0;
const renamedFiles = [];

// Process each file
productFiles.forEach(filename => {
  try {
    // Read the JSON file
    const filePath = path.join(PRODUCTS_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const product = JSON.parse(fileContent);
    
    // Extract the slug
    const slug = product.slug;
    
    if (!slug) {
      console.log(`No slug found for file: ${filename}`);
      failCount++;
      return;
    }
    
    // Create new filename based on slug
    const newFilename = `${slug}.json`;
    const newFilePath = path.join(PRODUCTS_DIR, newFilename);
    
    // Check if new file already exists to avoid conflicts
    if (fs.existsSync(newFilePath) && filename !== newFilename) {
      console.log(`Cannot rename ${filename} - ${newFilename} already exists`);
      failCount++;
      return;
    }
    
    // Rename the file
    fs.renameSync(filePath, newFilePath);
    
    // Track renamed files
    renamedFiles.push({
      oldName: filename,
      newName: newFilename
    });
    
    successCount++;
    
    // Log progress every 10 files
    if (successCount % 10 === 0) {
      console.log(`Processed ${successCount} files...`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filename}: ${error.message}`);
    failCount++;
  }
});

// Write a log of all the renamed files
const logFilePath = path.join(__dirname, 'rename-log.json');
fs.writeFileSync(
  logFilePath,
  JSON.stringify(renamedFiles, null, 2),
  'utf8'
);

// Log results
console.log('\nRenaming complete!');
console.log(`Successfully renamed ${successCount} files.`);
if (failCount > 0) {
  console.log(`Failed to rename ${failCount} files.`);
}
console.log(`A log of all renamed files has been saved to ${logFilePath}`); 