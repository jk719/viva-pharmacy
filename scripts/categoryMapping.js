import RxNormAPI from './rxNormAPI.js';

class CategoryMapper {
  constructor() {
    this.rxnorm = new RxNormAPI();
    this.categoryMappings = {
      // Drug classes to categories
      'analgesic': 'pain-fever',
      'antihistamine': 'allergy-care',
      'antacid': 'digestive-health',
      'decongestant': 'childrens-medicine-wellness',
      'antipyretic': 'pain-fever',
      'antitussive': 'childrens-medicine-wellness',
      
      // Ingredients to categories
      'acetaminophen': 'pain-fever',
      'diphenhydramine': 'allergy-care',
      'bismuth': 'digestive-health',
      'ibuprofen': 'pain-fever',
      'loratadine': 'allergy-care'
    };
  }

  async mapProductToCategory(product) {
    try {
      console.log(`\nProcessing: ${product.name}`);
      
      // Step 1: Find RxNorm concept
      const concepts = await this.rxnorm.findByName(product.name);
      if (!concepts || concepts.length === 0) {
        console.log('No RxNorm concepts found, trying keyword mapping');
        return this.mapByKeywords(product);
      }

      // Log found concepts
      console.log('Found concepts:', concepts.map(c => c.name));

      // Step 2: Get the RXCUI from the first matching concept
      const rxcui = concepts[0]?.rxcui;
      if (!rxcui) {
        console.log('No RXCUI found, trying keyword mapping');
        return this.mapByKeywords(product);
      }

      // Step 3: Get both drug class and ingredients
      const [drugClass, ingredients] = await Promise.all([
        this.rxnorm.getDrugClass(rxcui),
        this.rxnorm.getIngredients(rxcui)
      ]);

      // Step 4: Try to map using drug class first, then ingredients
      let category = null;
      
      if (drugClass) {
        category = this.mapDrugClassToCategory(drugClass);
      }
      
      if (!category && ingredients) {
        category = this.mapIngredientsToCategory(ingredients);
      }

      if (!category) {
        console.log('No category mapping found, using keyword mapping');
        return this.mapByKeywords(product);
      }

      return {
        category: category,
        rxnormInfo: {
          rxcui: rxcui,
          conceptName: concepts[0].name,
          drugClass: drugClass,
          ingredients: ingredients
        }
      };
    } catch (error) {
      console.error(`Error mapping product ${product.name}:`, error);
      return this.mapByKeywords(product);
    }
  }

  mapDrugClassToCategory(drugClass) {
    if (!drugClass) return null;
    
    for (const classInfo of drugClass) {
      const className = classInfo.className.toLowerCase();
      for (const [key, value] of Object.entries(this.categoryMappings)) {
        if (className.includes(key)) {
          return value;
        }
      }
    }
    return null;
  }

  mapIngredientsToCategory(ingredients) {
    if (!ingredients) return null;
    
    for (const group of ingredients) {
      if (group.conceptProperties) {
        for (const ingredient of group.conceptProperties) {
          const ingredientName = ingredient.name.toLowerCase();
          for (const [key, value] of Object.entries(this.categoryMappings)) {
            if (ingredientName.includes(key)) {
              return value;
            }
          }
        }
      }
    }
    return null;
  }

  mapByKeywords(product) {
    const name = product.name.toLowerCase();
    
    // Simple keyword mapping as fallback
    const keywordMappings = {
      'tylenol': 'pain-fever',
      'benadryl': 'allergy-care',
      'pepto': 'digestive-health',
      'advil': 'pain-fever',
      'claritin': 'allergy-care',
      'tums': 'digestive-health'
    };

    for (const [keyword, category] of Object.entries(keywordMappings)) {
      if (name.includes(keyword)) {
        return {
          category: category,
          rxnormInfo: null,
          mappedBy: 'keyword'
        };
      }
    }

    return {
      category: 'childrens-medicine-wellness',
      rxnormInfo: null,
      mappedBy: 'default'
    };
  }
}

// Test function
async function testMapping() {
  const mapper = new CategoryMapper();
  
  const testProducts = [
    { name: 'Tylenol Extra Strength' },
    { name: 'Benadryl Allergy' },
    { name: 'Pepto-Bismol' },
    { name: 'Advil Liqui-Gels' },
    { name: 'Claritin 24 Hour' }
  ];

  console.log('Testing RxNorm-based category mapping...\n');

  for (const product of testProducts) {
    console.log(`\nMapping product: ${product.name}`);
    const mapping = await mapper.mapProductToCategory(product);
    console.log('Result:', JSON.stringify(mapping, null, 2));
    console.log('-------------------');
  }
}

// Run the test
testMapping().catch(console.error); 