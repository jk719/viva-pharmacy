const fs = require('fs');
const path = require('path');

// Directory to clean
const DATA_DIR = path.join(__dirname, 'data');
// Backup directory
const BACKUP_DIR = path.join(__dirname, 'data-backup-' + new Date().toISOString().replace(/:/g, '-'));

// Create backup directory
console.log(`Creating backup directory: ${BACKUP_DIR}`);
fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Create subdirectories for processed and minimal products
fs.mkdirSync(path.join(BACKUP_DIR, 'processed_products'), { recursive: true });
fs.mkdirSync(path.join(BACKUP_DIR, 'minimal-products'), { recursive: true });

// Copy categories.js (important data file)
console.log('Backing up categories.js');
fs.copyFileSync(
  path.join(DATA_DIR, 'categories.js'),
  path.join(BACKUP_DIR, 'categories.js')
);

// Copy all JSON files from processed_products
console.log('Backing up processed product files...');
const processedDir = path.join(DATA_DIR, 'processed_products');
if (fs.existsSync(processedDir)) {
  const processedFiles = fs.readdirSync(processedDir)
    .filter(file => file.endsWith('.json'));
  
  processedFiles.forEach(file => {
    fs.copyFileSync(
      path.join(processedDir, file),
      path.join(BACKUP_DIR, 'processed_products', file)
    );
  });
  console.log(`Backed up ${processedFiles.length} processed product files`);
}

// Copy all JSON files from minimal-products
console.log('Backing up minimal product files...');
const minimalDir = path.join(DATA_DIR, 'minimal-products');
if (fs.existsSync(minimalDir)) {
  const minimalFiles = fs.readdirSync(minimalDir)
    .filter(file => file.endsWith('.json'));
  
  minimalFiles.forEach(file => {
    fs.copyFileSync(
      path.join(minimalDir, file),
      path.join(BACKUP_DIR, 'minimal-products', file)
    );
  });
  console.log(`Backed up ${minimalFiles.length} minimal product files`);
}

// Back up all JS files for reference
console.log('Backing up utility scripts...');
const jsFiles = fs.readdirSync(DATA_DIR)
  .filter(file => file.endsWith('.js') && file !== 'categories.js');

fs.mkdirSync(path.join(BACKUP_DIR, 'scripts'), { recursive: true });
jsFiles.forEach(file => {
  fs.copyFileSync(
    path.join(DATA_DIR, file),
    path.join(BACKUP_DIR, 'scripts', file)
  );
});
console.log(`Backed up ${jsFiles.length} utility scripts`);

// Clean up the data directory
console.log('\nCleaning up data directory...');

// First verify backup was successful
const backupSuccess = fs.existsSync(path.join(BACKUP_DIR, 'categories.js'));
if (!backupSuccess) {
  console.error('Backup appears to be incomplete. Aborting cleanup for safety.');
  process.exit(1);
}

// Remove all JS files except categories.js
jsFiles.forEach(file => {
  fs.unlinkSync(path.join(DATA_DIR, file));
  console.log(`Removed ${file}`);
});

console.log(`\nCleanup complete!`);
console.log(`Original files backed up to: ${BACKUP_DIR}`);
console.log(`Kept categories.js and product data files intact.`);
console.log(`\nIf you want to also remove the product JSON files, run:`);
console.log(`node -e "require('fs').rmSync('data/processed_products', {recursive: true, force: true}); require('fs').rmSync('data/minimal-products', {recursive: true, force: true})"`); 