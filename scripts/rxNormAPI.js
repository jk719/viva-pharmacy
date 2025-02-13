import axios from 'axios';

class RxNormAPI {
  constructor() {
    this.baseURL = 'https://rxnav.nlm.nih.gov/REST';
    this.client = axios.create({ baseURL: this.baseURL });
  }

  // Find RxNorm concepts by product name using getDrugs endpoint
  async findByName(name) {
    try {
      // Use getDrugs endpoint which is specifically for drug names
      const response = await this.client.get('/drugs', {
        params: {
          name: name
        }
      });

      if (response.data.drugGroup?.conceptGroup) {
        // Filter for brand names (BN) and precise ingredients (PIN)
        const relevantGroups = response.data.drugGroup.conceptGroup
          .filter(group => ['BN', 'PIN', 'SBD', 'SCD'].includes(group.tty));

        const concepts = relevantGroups
          .filter(group => group.conceptProperties)
          .flatMap(group => group.conceptProperties);

        if (concepts.length > 0) {
          return concepts.map(concept => ({
            rxcui: concept.rxcui,
            name: concept.name,
            tty: concept.tty,
            synonym: concept.synonym,
            ageGroup: this.analyzeAgeGroup(concept)
          }));
        }
      }

      // If no results, try getApproximateMatch
      const approxResponse = await this.client.get('/approximateTerm', {
        params: {
          term: name,
          maxEntries: 5
        }
      });

      if (approxResponse.data.approximateGroup?.candidate) {
        return approxResponse.data.approximateGroup.candidate;
      }

      return null;
    } catch (error) {
      console.error(`Error finding RxNorm concept for ${name}:`, error.message);
      return null;
    }
  }

  // Get drug properties using getRxConceptProperties endpoint
  async getDrugDetails(rxcui) {
    try {
      const response = await this.client.get(`/rxcui/${rxcui}/properties`);
      return response.data.properties;
    } catch (error) {
      console.error(`Error getting drug details for RXCUI ${rxcui}:`, error.message);
      return null;
    }
  }

  // Get related concepts by type using getRelatedByType endpoint
  async getIngredients(rxcui) {
    try {
      const response = await this.client.get(`/rxcui/${rxcui}/related`, {
        params: {
          tty: 'IN' // Get ingredients
        }
      });
      
      if (response.data.relatedGroup?.conceptGroup) {
        return response.data.relatedGroup.conceptGroup
          .filter(group => group.tty === 'IN')
          .flatMap(group => group.conceptProperties || []);
      }
      return null;
    } catch (error) {
      console.error(`Error getting ingredients for RXCUI ${rxcui}:`, error.message);
      return null;
    }
  }

  // Get NDCs using getNDCs endpoint
  async getNDCs(rxcui) {
    try {
      const response = await this.client.get(`/rxcui/${rxcui}/ndcs`);
      return response.data.ndcGroup?.ndcList?.ndc || null;
    } catch (error) {
      console.error(`Error getting NDCs for RXCUI ${rxcui}:`, error.message);
      return null;
    }
  }

  // Get all related information using getAllRelatedInfo endpoint
  async getAllRelated(rxcui) {
    try {
      const response = await this.client.get(`/rxcui/${rxcui}/allrelated`);
      return response.data.relatedGroup?.conceptGroup || null;
    } catch (error) {
      console.error(`Error getting all related info for RXCUI ${rxcui}:`, error.message);
      return null;
    }
  }

  // Add new method to analyze if product is for children
  analyzeAgeGroup(concept) {
    const name = concept.name.toLowerCase();
    const strength = this.extractStrength(concept.name);
    
    // Indicators that suggest a children's product
    const childrenIndicators = {
      keywords: ['children', 'child', 'pediatric', 'kids', 'junior'],
      formulations: ['chewable', 'suspension', 'liquid', 'drops', 'disintegrating'],
      // Common pediatric strengths (in mg) for common medications
      strengths: {
        'ibuprofen': [50, 100], // Children's Advil/Motrin
        'acetaminophen': [80, 160], // Children's Tylenol
        'loratadine': [5], // Children's Claritin
        'diphenhydramine': [12.5], // Children's Benadryl
      }
    };

    // Check for explicit children's keywords
    if (childrenIndicators.keywords.some(keyword => name.includes(keyword))) {
      return 'children';
    }

    // Check formulation
    if (childrenIndicators.formulations.some(form => name.includes(form))) {
      // Additional check for explicit "adult" keyword
      if (name.includes('adult')) {
        return 'adult';
      }
      return 'likely_children';
    }

    // Check strength against known pediatric doses
    if (strength) {
      const ingredient = this.extractIngredient(concept.name).toLowerCase();
      const pediatricStrengths = childrenIndicators.strengths[ingredient];
      if (pediatricStrengths && pediatricStrengths.includes(strength)) {
        return 'likely_children';
      }
    }

    return 'likely_adult';
  }

  // Helper method to extract strength from product name
  extractStrength(name) {
    const strengthMatch = name.match(/(\d+)\s*MG/i);
    return strengthMatch ? parseInt(strengthMatch[1]) : null;
  }

  // Helper method to extract main ingredient from product name
  extractIngredient(name) {
    // Extract ingredient name before the first number
    const ingredientMatch = name.match(/^([^0-9]+)/);
    return ingredientMatch ? ingredientMatch[1].trim().toLowerCase() : '';
  }
}

// Test function
async function testRxNormLookup() {
  const rxnorm = new RxNormAPI();
  const testProducts = [
    "Children's Tylenol",
    "Tylenol Extra Strength",
    "Children's Benadryl",
    "Benadryl Allergy",
    "Children's Advil",
    "Advil",
    "Children's Claritin",
    "Claritin 24 Hour"
  ];

  console.log('RxNorm API Test with Age Group Analysis\n');

  for (const productName of testProducts) {
    console.log(`\nLooking up: ${productName}`);
    
    const concepts = await rxnorm.findByName(productName);
    if (concepts && concepts.length > 0) {
      console.log('\nFound concepts:');
      concepts.forEach(concept => {
        console.log(`- ${concept.name}`);
        console.log(`  Age Group: ${concept.ageGroup}`);
        console.log(`  TTY: ${concept.tty}`);
        console.log('');
      });

      const rxcui = concepts[0].rxcui;
      console.log(`\nUsing RXCUI: ${rxcui}`);

      // Get additional information
      const [details, ingredients, ndcs] = await Promise.all([
        rxnorm.getDrugDetails(rxcui),
        rxnorm.getIngredients(rxcui),
        rxnorm.getNDCs(rxcui)
      ]);

      console.log('\nDrug Details:', JSON.stringify(details, null, 2));
      console.log('\nIngredients:', JSON.stringify(ingredients, null, 2));
      console.log('\nNDCs:', JSON.stringify(ndcs, null, 2));
      console.log('\n-------------------');
    } else {
      console.log('No concepts found');
      console.log('-------------------');
    }
  }
}

// Run test if this file is run directly
if (process.argv[1].endsWith('rxNormAPI.js')) {
  testRxNormLookup().catch(console.error);
}

export default RxNormAPI; 