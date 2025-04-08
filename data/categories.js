// Helper function to generate slugs
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Sort helper function
const sortByName = (a, b) => a.name.localeCompare(b.name);

// Define categories and sort them
export const categories = [
  {
    name: "Allergy Care",
    slug: "allergy-care",
    tagline: "Breathe Easy",
    items: [
      { name: "Air Purifiers", slug: "air-purifiers" },
      { name: "Allergy Eye Drops", slug: "eye-drops" },
      { name: "Allergy Testing Kits", slug: "allergy-testing-kits" },
      { name: "Antihistamines", slug: "antihistamines" },
      { name: "Nasal Sprays", slug: "nasal-sprays" }
    ].sort(sortByName)
  },
  {
    name: "Children's Medicine & Wellness",
    slug: "childrens-medicine-wellness",
    tagline: "Children's Care",
    items: [
      { name: "Allergy Relief", slug: "allergy-relief" },
      { name: "Children's Multivitamins", slug: "childrens-multivitamins" },
      { name: "Cough & Cold Remedies", slug: "cough-cold-remedies" },
      { name: "Pain & Fever Relievers", slug: "pain-fever-relievers" },
      { name: "Probiotics", slug: "probiotics" },
      { name: "Sleep Support", slug: "sleep-support" },
      { name: "Vitamins", slug: "vitamins" }
    ].sort(sortByName)
  },
  {
    name: "Digestive Health",
    slug: "digestive-health",
    tagline: "Happy Tummy",
    items: [
      { name: "Anti-Diarrheal", slug: "anti-diarrheal" },
      { name: "Antacids", slug: "antacids" },
      { name: "Digestive Enzymes", slug: "digestive-enzymes" },
      { name: "Laxatives", slug: "laxatives" },
      { name: "Probiotics", slug: "probiotics" }
    ].sort(sortByName)
  },
  {
    name: "Eye Care",
    slug: "eye-care",
    tagline: "Healthy Vision",
    items: [
      { name: "Allergy Eye Drops", slug: "allergy-eye-drops" },
      { name: "Artificial Tears", slug: "artificial-tears" },
      { name: "Contact Lens Solutions", slug: "contact-lens-solutions" },
      { name: "Eye Vitamins", slug: "eye-vitamins" },
      { name: "Redness Relievers", slug: "redness-relievers" }
    ].sort(sortByName)
  },
  {
    name: "Feminine Care",
    slug: "feminine-care",
    tagline: "Her Comfort Essentials",
    items: [
      { name: "Feminine Wipes", slug: "feminine-wipes" },
      { name: "Menstrual Cups", slug: "menstrual-cups" },
      { name: "Pads & Liners", slug: "pads-liners" },
      { name: "Tampons", slug: "tampons" },
      { name: "Vaginal Health Products", slug: "vaginal-health-products" }
    ].sort(sortByName)
  },
  {
    name: "First Aid",
    slug: "first-aid",
    tagline: "Quick Relief & First Aid",
    items: [
      { name: "Antiseptics & Disinfectants", slug: "antiseptics-disinfectants" },
      { name: "Bandages & Dressings", slug: "bandages-dressings" },
      { name: "Burn Relief Products", slug: "burn-relief-products" },
      { name: "Cold Packs", slug: "cold-packs" },
      { name: "Medical Tape & Gauze", slug: "medical-tape-gauze" }
    ].sort(sortByName)
  },
  {
    name: "Foot Care",
    slug: "foot-care",
    tagline: "Happy Feet",
    items: [
      { name: "Antifungal Creams", slug: "antifungal-creams" },
      { name: "Corn & Callus Removers", slug: "corn-callus-removers" },
      { name: "Cushioned Insoles", slug: "cushioned-insoles" },
      { name: "Foot Sprays", slug: "foot-sprays" },
      { name: "Wart Removers", slug: "wart-removers" }
    ].sort(sortByName)
  },
  {
    name: "Hair Care",
    slug: "hair-care",
    tagline: "Healthy Hair",
    items: [
      { name: "Conditioners", slug: "conditioners" },
      { name: "Hair Color", slug: "hair-color" },
      { name: "Hair Treatments", slug: "hair-treatments" },
      { name: "Shampoos", slug: "shampoos" },
      { name: "Styling Products", slug: "styling-products" }
    ].sort(sortByName)
  },
  {
    name: "Home Health Care",
    slug: "home-health-care",
    tagline: "Wellness at Home",
    items: [
      { name: "Blood Pressure Monitors", slug: "blood-pressure-monitors" },
      { name: "Braces & Supports", slug: "braces-supports" },
      { name: "Compression Stockings", slug: "compression-stockings" },
      { name: "Diabetes Care Supplies", slug: "diabetes-care-supplies" },
      { name: "Mobility Aids", slug: "mobility-aids" }
    ].sort(sortByName)
  },
  {
    name: "Men's Grooming",
    slug: "mens-grooming",
    tagline: "Effortless Essentials for Men",
    items: [
      { name: "Beard Care Products", slug: "beard-care-products" },
      { name: "Deodorants & Antiperspirants", slug: "deodorants-antiperspirants" },
      { name: "Men's Skincare", slug: "mens-skincare" },
      { name: "Razors & Blades", slug: "razors-blades" },
      { name: "Shaving Creams & Gels", slug: "shaving-creams-gels" }
    ].sort(sortByName)
  },
  {
    name: "Oral Care",
    slug: "oral-care",
    tagline: "Bright Smiles",
    items: [
      { name: "Floss & Picks", slug: "floss-picks" },
      { name: "Mouthwash", slug: "mouthwash" },
      { name: "Toothbrushes", slug: "toothbrushes" },
      { name: "Toothpaste", slug: "toothpaste" },
      { name: "Whitening Products", slug: "whitening-products" }
    ].sort(sortByName)
  },
  {
    name: "Pain & Fever",
    slug: "pain-fever",
    tagline: "Pain-Free Living",
    items: [
      { name: "Arthritis Pain Relief", slug: "arthritis-pain-relief" },
      { name: "Fever Reducers", slug: "fever-reducers" },
      { name: "Migraine Relief", slug: "migraine-relief" },
      { name: "Oral Pain Relief", slug: "oral-pain-relief", image: "/images/categories/oral-pain-relief.jpg" },
      { name: "Topical Pain Relief", slug: "topical-pain-relief", image: "/images/categories/topical-pain-relief.jpg" }
    ].sort(sortByName)
  },
  {
    name: "Skincare",
    slug: "skincare",
    tagline: "Glow Up Essentials",
    items: [
      { name: "Cleansers", slug: "cleansers" },
      { name: "Exfoliators", slug: "exfoliators" },
      { name: "Moisturizers", slug: "moisturizers" },
      { name: "Serums", slug: "serums" },
      { name: "Sunscreens", slug: "sunscreens" }
    ].sort(sortByName)
  },
  {
    name: "Sleep Aids",
    slug: "sleep-aids",
    tagline: "Restful Nights",
    items: [
      { name: "Herbal Sleep Aids", slug: "herbal-sleep-aids" },
      { name: "Melatonin Supplements", slug: "melatonin-supplements" },
      { name: "OTC Sleep Tablets", slug: "otc-sleep-tablets" },
      { name: "Sleep Masks", slug: "sleep-masks" },
      { name: "Sleep Patches", slug: "sleep-patches" }
    ].sort(sortByName)
  },
  {
    name: "Smoking Cessation",
    slug: "smoking-cessation",
    tagline: "Quit Smarter",
    items: [
      { name: "Behavioral Support Kits", slug: "behavioral-support-kits" },
      { name: "Lozenges", slug: "lozenges" },
      { name: "Nicotine Gum", slug: "nicotine-gum" },
      { name: "Nicotine Patches", slug: "nicotine-patches" },
      { name: "Non-Nicotine Aids", slug: "non-nicotine-aids" }
    ].sort(sortByName)
  },
  {
    name: "Testing Kits",
    slug: "testing-kits",
    tagline: "Stay Informed",
    items: [
      { name: "Allergy Testing Kits", slug: "allergy-testing-kits" },
      { name: "Blood Glucose Test Kits", slug: "blood-glucose-test-kits" },
      { name: "Cholesterol Test Kits", slug: "cholesterol-test-kits" },
      { name: "COVID-19 Test Kits", slug: "covid-19-test-kits" },
      { name: "Pregnancy Test Kits", slug: "pregnancy-test-kits" }
    ].sort(sortByName)
  },
  {
    name: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    tagline: "Daily Power Boost",
    items: [
      { name: "Immune Support", slug: "immune-support" },
      { name: "Joint Health", slug: "joint-health" },
      { name: "Multivitamins", slug: "multivitamins" },
      { name: "Omega-3 Supplements", slug: "omega-3-supplements" },
      { name: "Prenatal Vitamins", slug: "prenatal-vitamins" }
    ].sort(sortByName)
  },
  {
    name: "Weight Management",
    slug: "weight-management",
    tagline: "Shape & Strength",
    items: [
      { name: "Appetite Suppressants", slug: "appetite-suppressants" },
      { name: "Fat Burners", slug: "fat-burners" },
      { name: "Meal Replacements", slug: "meal-replacements" },
      { name: "Portion Control Tools", slug: "portion-control-tools" },
      { name: "Protein Powders", slug: "protein-powders" }
    ].sort(sortByName)
  }
].sort(sortByName);

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