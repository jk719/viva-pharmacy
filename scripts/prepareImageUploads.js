import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function prepareImageUploads() {
  try {
    // Read the unmapped products
    const unmappedPath = path.join(__dirname, '..', 'data', 'unmappedProducts.json');
    const unmappedProducts = JSON.parse(fs.readFileSync(unmappedPath, 'utf8'));
    
    // Read the current mappings
    const mappingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsUpdated.json');
    const currentMappings = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    
    // Products that need new images
    const needsUpload = [
      // Products that were incorrectly mapped
      'childrens-flonase-sensimist-60-sprays.png',
      'childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png',
      'childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape-4oz.png',
      'childrens-tylenol-pain-fever-160mg-acetaminophen-bubblegum-chewable-tablets-24ct.png',
      'zarbees-childrens-cough-mucus-day-syrup-4oz.png',
      'zarbees-childrens-cough-mucus-night-syrup-4oz.png',
      
      // Products that were never mapped
      'alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels-20ct.png',
      'bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png',
      'coricidin-hbp-chest-cold-flu-tablets-10ct.png',
      'coricidin-hbp-chest-congestion-cough-liquid-gels-20ct.png',
      'dayquil-cold-flu-liquicaps-24ct.png',
      'dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak-32oz.png',
      'flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png',
      'hyland-s-kids-cough-mucus-daytime-grape-liquid-4o.png',
      'hylands-kids-mucus-cough-nt-grp-liq-4oz.png',
      'mucinex-fast-max-nt-shft-cld-flu-6oz.png',
      'nature-made-fish-oil-1200mg-softgel-100ct.png',
      'pediasure-grow-gain-kids-nutritional-shake-chocolate.png',
      'pediasure-grow-gain-kids-nutritional-shake-vanilla.png',
      'pepto-bismol-5-symptom-relief-original-liquid-8oz.png',
      'pepto-bismol-liquid-cherry-8oz.png',
      'pepto-bismol-liquid-original-16oz.png',
      'sudafed-pe-pressure-pain-max-strength-caplets-24ct.png',
      'vicks-dayquil-cold-flu-multi-symptom-relief-24ct.png',
      'zyrtec-24-hour-allergy-relief-14ct.png'
    ];
    
    // Create clean mapping without incorrect mappings
    const cleanMapping = { ...currentMappings };
    needsUpload.forEach(product => {
      delete cleanMapping[product];
    });
    
    // Save clean mapping
    const cleanMappingPath = path.join(__dirname, '..', 'data', 'cloudinaryUrlsClean.json');
    fs.writeFileSync(
      cleanMappingPath,
      JSON.stringify(cleanMapping, null, 2)
    );
    
    // Save list of products needing upload
    const uploadListPath = path.join(__dirname, '..', 'data', 'productsNeedingUpload.json');
    fs.writeFileSync(
      uploadListPath,
      JSON.stringify(needsUpload, null, 2)
    );
    
    console.log('Clean mapping saved to:', cleanMappingPath);
    console.log('Products needing upload saved to:', uploadListPath);
    console.log('\nSummary:');
    console.log('Original mappings:', Object.keys(currentMappings).length);
    console.log('Clean mappings:', Object.keys(cleanMapping).length);
    console.log('Products needing upload:', needsUpload.length);
    
    console.log('\nNext steps:');
    console.log('1. Download product images for the following products:');
    needsUpload.forEach(product => console.log(`   - ${product}`));
    console.log('\n2. Upload these images to Cloudinary under viva-pharmacy/products/');
    console.log('3. Run the verification script again to check the mappings');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

prepareImageUploads(); 