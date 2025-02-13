import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function applyImageMappings() {
  try {
    // Read files
    const suggestionsPath = path.join(__dirname, '..', 'data', 'imageSuggestions.json');
    const originalMappingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrls.json');
    
    const suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));
    const originalMapping = JSON.parse(fs.readFileSync(originalMappingPath, 'utf8'));
    
    // Create new mapping
    const newMapping = { ...originalMapping };
    
    console.log('Reviewing suggested mappings...\n');
    
    for (const [product, matches] of Object.entries(suggestions)) {
      console.log(`\nProduct: ${product}`);
      console.log('Suggested matches:');
      
      matches.forEach((match, index) => {
        console.log(`${index + 1}. ${match.public_id}`);
      });
      
      const answer = await question(
        'Enter the number of the correct match (or 0 to skip): '
      );
      
      const choice = parseInt(answer);
      if (choice > 0 && choice <= matches.length) {
        const selected = matches[choice - 1];
        newMapping[product] = selected.url;
        console.log(`✅ Mapped: ${product} -> ${selected.public_id}`);
      } else {
        console.log(`⏭️  Skipped: ${product}`);
      }
    }
    
    // Save new mapping
    const newMappingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsUpdated.json');
    fs.writeFileSync(
      newMappingPath,
      JSON.stringify(newMapping, null, 2)
    );
    
    console.log('\nSummary:');
    console.log('Original mappings:', Object.keys(originalMapping).length);
    console.log('New mappings:', Object.keys(newMapping).length);
    console.log('Updated mapping saved to:', newMappingPath);
    
    rl.close();
    
  } catch (error) {
    console.error('Error:', error);
    rl.close();
  }
}

applyImageMappings(); 