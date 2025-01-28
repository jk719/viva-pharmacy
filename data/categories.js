// Helper function to generate slugs
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const categories = [
  {
    name: "Cold & Flu",
    slug: "cold-flu",
    items: [
      { name: "Cough Medicines", slug: "cough-medicines" },
      { name: "Nasal Sprays", slug: "nasal-sprays" },
      { name: "Multi-Symptom Relief", slug: "multi-symptom" }
    ]
  },
  {
    name: "Pain & Fever",
    slug: "pain-fever",
    items: [
      { name: "Oral Pain Relief", slug: "oral-pain" },
      { name: "Topical Pain Relief", slug: "topical-pain" }
    ]
  },
  {
    name: "Digestive Health",
    slug: "digestive",
    items: [
      { name: "Antacids", slug: "antacids" },
      { name: "Laxatives", slug: "laxatives" },
      { name: "Anti-Diarrheal", slug: "anti-diarrheal" }
    ]
  },
  {
    name: "Allergy Relief",
    slug: "allergy",
    items: [
      { name: "Antihistamines", slug: "antihistamines" },
      { name: "Nasal Allergy", slug: "nasal-allergy" }
    ]
  },
  {
    name: "Children's Medicine",
    slug: "childrens-medicine",
    items: [
      { name: "Cough & Cold", slug: "cough-cold" },
      { name: "Pain & Fever", slug: "pain-fever" },
      { name: "Allergy", slug: "allergy" }
    ]
  },
  {
    name: "Children's Wellness",
    slug: "childrens-wellness",
    items: [
      { name: "Vitamins", slug: "vitamins" },
      { name: "Probiotics", slug: "probiotics" },
      { name: "Sleep Support", slug: "sleep-support" }
    ]
  },
  {
    name: "Vitamins & Supplements",
    slug: "vitamins-supplements",
    items: [
      { name: "Multivitamins", slug: "multivitamins" },
      { name: "Prenatal Vitamins", slug: "prenatal-vitamins" },
      { name: "Immune Support", slug: "immune-support" },
      { name: "Joint Health", slug: "joint-health" },
      { name: "Specialty Supplements", slug: "specialty-supplements" }
    ]
  },
  {
    name: "First Aid",
    slug: "first-aid",
    items: [
      { name: "Bandages & Dressings", slug: "bandages-dressings" },
      { name: "Antiseptics & Disinfectants", slug: "antiseptics-disinfectants" },
      { name: "Medical Tape & Gauze", slug: "medical-tape-gauze" },
      { name: "Thermometers", slug: "thermometers" }
    ]
  },
  {
    name: "Home Health Care",
    slug: "home-health-care",
    items: [
      { name: "Diabetes Care", slug: "diabetes-care" },
      { name: "Blood Pressure Monitors", slug: "blood-pressure-monitors" },
      { name: "Compression Stockings", slug: "compression-stockings" },
      { name: "Braces & Supports", slug: "braces-supports" }
    ]
  },
  {
    name: "Skincare",
    slug: "skincare",
    items: [
      { name: "Cleansers & Toners", slug: "cleansers-toners" },
      { name: "Moisturizers & Serums", slug: "moisturizers-serums" },
      { name: "Acne Treatments", slug: "acne-treatments" },
      { name: "Sunscreen", slug: "sunscreen" }
    ]
  },
  {
    name: "Hair Care",
    slug: "hair-care",
    items: [
      { name: "Shampoo & Conditioner", slug: "shampoo-conditioner" },
      { name: "Hair Treatments", slug: "hair-treatments" },
      { name: "Hair Color", slug: "hair-color" },
      { name: "Styling Products", slug: "styling-products" }
    ]
  },
  {
    name: "Oral Care",
    slug: "oral-care",
    items: [
      { name: "Toothpaste & Toothbrushes", slug: "toothpaste-toothbrushes" },
      { name: "Mouthwash", slug: "mouthwash" },
      { name: "Floss & Picks", slug: "floss-picks" }
    ]
  },
  {
    name: "Men's Grooming",
    slug: "mens-grooming",
    items: [
      { name: "Shaving & Razors", slug: "shaving-razors" },
      { name: "Beard Care", slug: "beard-care" },
      { name: "Men's Skincare", slug: "mens-skincare" }
    ]
  },
  {
    name: "Feminine Care",
    slug: "feminine-care",
    items: [
      { name: "Pads & Liners", slug: "pads-liners" },
      { name: "Tampons", slug: "tampons" },
      { name: "Menstrual Cups", slug: "menstrual-cups" },
      { name: "Vaginal Health", slug: "vaginal-health" }
    ]
  }
];

// Updated helper functions
export const getCategoryBySlug = (slug) => {
  const category = categories.find(category => 
    category.slug === slug || category.name.toLowerCase() === slug?.toLowerCase()
  );
  return category;
};

export const getItemBySlug = (categorySlug, itemSlug) => {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return null;
  
  const item = category.items.find(item => 
    item.slug === itemSlug || item.name.toLowerCase() === itemSlug?.toLowerCase()
  );
  return item;
};

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