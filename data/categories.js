// Helper function to generate slugs
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const categories = [
  {
    name: "Pain & Fever",
    slug: "pain-fever",
    tagline: "Pain-Free Living",
    items: [
      { name: "Oral Pain Relief", slug: "oral-pain-relief" },
      { name: "Topical Pain Relief", slug: "topical-pain-relief" },
      { name: "Fever Reducers", slug: "fever-reducers" },
      { name: "Migraine Relief", slug: "migraine-relief" },
      { name: "Arthritis Pain Relief", slug: "arthritis-pain-relief" }
    ]
  },
  {
    name: "Digestive Health",
    slug: "digestive-health",
    tagline: "Happy Tummy",
    items: [
      { name: "Antacids", slug: "antacids" },
      { name: "Laxatives", slug: "laxatives" },
      { name: "Anti-Diarrheal", slug: "anti-diarrheal" },
      { name: "Probiotics", slug: "probiotics" },
      { name: "Digestive Enzymes", slug: "digestive-enzymes" }
    ]
  },
  {
    name: "Allergy Care",
    slug: "allergy-care",
    tagline: "Breathe Easy",
    items: [
      { name: "Antihistamines", slug: "antihistamines" },
      { name: "Nasal Sprays", slug: "nasal-sprays" },
      { name: "Eye Drops", slug: "eye-drops" },
      { name: "Allergy Testing Kits", slug: "allergy-testing-kits" },
      { name: "Air Purifiers", slug: "air-purifiers" }
    ]
  },
  {
    name: "Children's Medicine & Wellness",
    slug: "childrens-medicine-wellness",
    tagline: "Children's Care",
    items: [
      { name: "Cough & Cold Remedies", slug: "cough-cold-remedies" },
      { name: "Pain & Fever Relievers", slug: "pain-fever-relievers" },
      { name: "Allergy Relief", slug: "allergy-relief" },
      { name: "Children's Multivitamins", slug: "childrens-multivitamins" },
      { name: "Probiotics", slug: "probiotics" },
      { name: "Sleep Support", slug: "sleep-support" },
      { name: "Vitamins", slug: "vitamins" }
    ]
  },
  {
    name: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    tagline: "Daily Power Boost",
    items: [
      { name: "Multivitamins", slug: "multivitamins" },
      { name: "Prenatal Vitamins", slug: "prenatal-vitamins" },
      { name: "Immune Support", slug: "immune-support" },
      { name: "Omega-3 Supplements", slug: "omega-3-supplements" },
      { name: "Joint Health", slug: "joint-health" }
    ]
  },
  {
    name: "First Aid",
    slug: "first-aid",
    tagline: "Quick Relief & First Aid",
    items: [
      { name: "Bandages & Dressings", slug: "bandages-dressings" },
      { name: "Antiseptics & Disinfectants", slug: "antiseptics-disinfectants" },
      { name: "Medical Tape & Gauze", slug: "medical-tape-gauze" },
      { name: "Burn Relief Products", slug: "burn-relief-products" },
      { name: "Cold Packs", slug: "cold-packs" }
    ]
  },
  {
    name: "Home Health Care",
    slug: "home-health-care",
    tagline: "Wellness at Home",
    items: [
      { name: "Blood Pressure Monitors", slug: "blood-pressure-monitors" },
      { name: "Diabetes Care Supplies", slug: "diabetes-care-supplies" },
      { name: "Compression Stockings", slug: "compression-stockings" },
      { name: "Mobility Aids", slug: "mobility-aids" },
      { name: "Braces & Supports", slug: "braces-supports" }
    ]
  },
  {
    name: "Skincare",
    slug: "skincare",
    tagline: "Glow Up Essentials",
    items: [
      { name: "Cleansers", slug: "cleansers" },
      { name: "Moisturizers", slug: "moisturizers" },
      { name: "Serums", slug: "serums" },
      { name: "Sunscreens", slug: "sunscreens" },
      { name: "Exfoliators", slug: "exfoliators" }
    ]
  },
  {
    name: "Hair Care",
    slug: "hair-care",
    tagline: "Healthy Hair",
    items: [
      { name: "Shampoos", slug: "shampoos" },
      { name: "Conditioners", slug: "conditioners" },
      { name: "Hair Treatments", slug: "hair-treatments" },
      { name: "Styling Products", slug: "styling-products" },
      { name: "Hair Color", slug: "hair-color" }
    ]
  },
  {
    name: "Oral Care",
    slug: "oral-care",
    tagline: "Bright Smiles",
    items: [
      { name: "Toothpaste", slug: "toothpaste" },
      { name: "Toothbrushes", slug: "toothbrushes" },
      { name: "Mouthwash", slug: "mouthwash" },
      { name: "Floss & Picks", slug: "floss-picks" },
      { name: "Whitening Products", slug: "whitening-products" }
    ]
  },
  {
    name: "Men's Grooming",
    slug: "mens-grooming",
    tagline: "Effortless Essentials for Men",
    items: [
      { name: "Shaving Creams & Gels", slug: "shaving-creams-gels" },
      { name: "Razors & Blades", slug: "razors-blades" },
      { name: "Beard Care Products", slug: "beard-care-products" },
      { name: "Men's Skincare", slug: "mens-skincare" },
      { name: "Deodorants & Antiperspirants", slug: "deodorants-antiperspirants" }
    ]
  },
  {
    name: "Feminine Care",
    slug: "feminine-care",
    tagline: "Her Comfort Essentials",
    items: [
      { name: "Pads & Liners", slug: "pads-liners" },
      { name: "Tampons", slug: "tampons" },
      { name: "Menstrual Cups", slug: "menstrual-cups" },
      { name: "Feminine Wipes", slug: "feminine-wipes" },
      { name: "Vaginal Health Products", slug: "vaginal-health-products" }
    ]
  },
  {
    name: "Sleep Aids",
    slug: "sleep-aids",
    tagline: "Restful Nights",
    items: [
      { name: "Melatonin Supplements", slug: "melatonin-supplements" },
      { name: "Sleep Patches", slug: "sleep-patches" },
      { name: "Herbal Sleep Aids", slug: "herbal-sleep-aids" },
      { name: "OTC Sleep Tablets", slug: "otc-sleep-tablets" },
      { name: "Sleep Masks", slug: "sleep-masks" }
    ]
  },
  {
    name: "Smoking Cessation",
    slug: "smoking-cessation",
    tagline: "Quit Smarter",
    items: [
      { name: "Nicotine Gum", slug: "nicotine-gum" },
      { name: "Nicotine Patches", slug: "nicotine-patches" },
      { name: "Lozenges", slug: "lozenges" },
      { name: "Non-Nicotine Aids", slug: "non-nicotine-aids" },
      { name: "Behavioral Support Kits", slug: "behavioral-support-kits" }
    ]
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    tagline: "Healthy Vision",
    items: [
      { name: "Artificial Tears", slug: "artificial-tears" },
      { name: "Redness Relievers", slug: "redness-relievers" },
      { name: "Allergy Eye Drops", slug: "allergy-eye-drops" },
      { name: "Eye Vitamins", slug: "eye-vitamins" },
      { name: "Contact Lens Solutions", slug: "contact-lens-solutions" }
    ]
  },
  {
    name: "Foot Care",
    slug: "foot-care",
    tagline: "Happy Feet",
    items: [
      { name: "Antifungal Creams", slug: "antifungal-creams" },
      { name: "Cushioned Insoles", slug: "cushioned-insoles" },
      { name: "Corn & Callus Removers", slug: "corn-callus-removers" },
      { name: "Wart Removers", slug: "wart-removers" },
      { name: "Foot Sprays", slug: "foot-sprays" }
    ]
  },
  {
    name: "Weight Management",
    slug: "weight-management",
    tagline: "Shape & Strength",
    items: [
      { name: "Meal Replacements", slug: "meal-replacements" },
      { name: "Fat Burners", slug: "fat-burners" },
      { name: "Appetite Suppressants", slug: "appetite-suppressants" },
      { name: "Protein Powders", slug: "protein-powders" },
      { name: "Portion Control Tools", slug: "portion-control-tools" }
    ]
  },
  {
    name: "Testing Kits",
    slug: "testing-kits",
    tagline: "Stay Informed",
    items: [
      { name: "COVID-19 Test Kits", slug: "covid-19-test-kits" },
      { name: "Pregnancy Test Kits", slug: "pregnancy-test-kits" },
      { name: "Allergy Testing Kits", slug: "allergy-testing-kits" },
      { name: "Blood Glucose Test Kits", slug: "blood-glucose-test-kits" },
      { name: "Cholesterol Test Kits", slug: "cholesterol-test-kits" }
    ]
  }
];

// Updated helper functions
export function getCategoryBySlug(slug) {
  return categories.find(category => category.slug === slug);
}

export function getItemBySlug(categorySlug, itemSlug) {
  const category = getCategoryBySlug(categorySlug);
  return category?.items?.find(item => item.slug === itemSlug);
}

export const getAllCategories = () => {
  return categories.map(category => ({
    name: category.name,
    slug: category.slug
  }));
};

export const getAllItems = (categorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  return category?.items.map(item => ({
    name: item.name,
    slug: item.slug
  })) || [];
};

// Constants
export const DEFAULT_CATEGORY = 'all';

// Validation functions
export const isCategoryValid = (categorySlug) => {
  return !!getCategoryBySlug(categorySlug);
};

export const isItemValid = (categorySlug, itemSlug) => {
  return !!getItemBySlug(categorySlug, itemSlug);
};

export const getCategoryPath = (categorySlug, itemSlug) => {
  const parts = [categorySlug];
  if (itemSlug) parts.push(itemSlug);
  return parts.join('/');
};

export default categories; 