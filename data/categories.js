// Helper function to generate slugs
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const categories = [
  {
    name: "Medications",
    slug: "medications",
    icon: "MedicineIcon",
    featured: true,
    subcategories: [
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
      }
    ]
  },
  {
    name: "Children's Health",
    slug: "childrens-health",
    icon: "ChildIcon",
    featured: true,
    subcategories: [
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
      }
    ]
  },
  {
    name: "Health & Wellness",
    slug: generateSlug("Health & Wellness"),
    description: "Healthcare products and wellness essentials",
    subcategories: [
      {
        name: "Over-the-Counter Medications",
        slug: generateSlug("Over-the-Counter Medications"),
        items: [
          { name: "Pain Relief", slug: generateSlug("Pain Relief") },
          { name: "Cold, Flu, & Allergy", slug: generateSlug("Cold, Flu, & Allergy") },
          { name: "Cough & Throat", slug: generateSlug("Cough & Throat") },
          { name: "Digestive Health", slug: generateSlug("Digestive Health") },
          { name: "Sleep Aids", slug: generateSlug("Sleep Aids") },
          { name: "Eye Care", slug: generateSlug("Eye Care") },
          { name: "Ear Care", slug: generateSlug("Ear Care") },
          { name: "Smoking Cessation", slug: generateSlug("Smoking Cessation") }
        ]
      },
      {
        name: "Vitamins & Supplements",
        slug: generateSlug("Vitamins & Supplements"),
        items: [
          { name: "Multivitamins", slug: generateSlug("Multivitamins") },
          { name: "Prenatal Vitamins", slug: generateSlug("Prenatal Vitamins") },
          { name: "Immune Support", slug: generateSlug("Immune Support") },
          { name: "Joint Health", slug: generateSlug("Joint Health") },
          { name: "Specialty Supplements", slug: generateSlug("Specialty Supplements") }
        ]
      },
      {
        name: "First Aid",
        slug: generateSlug("First Aid"),
        items: [
          { name: "Bandages & Dressings", slug: generateSlug("Bandages & Dressings") },
          { name: "Antiseptics & Disinfectants", slug: generateSlug("Antiseptics & Disinfectants") },
          { name: "Medical Tape & Gauze", slug: generateSlug("Medical Tape & Gauze") },
          { name: "Thermometers", slug: generateSlug("Thermometers") }
        ]
      },
      {
        name: "Home Health Care",
        slug: generateSlug("Home Health Care"),
        items: [
          { name: "Diabetes Care", slug: generateSlug("Diabetes Care") },
          { name: "Blood Pressure Monitors", slug: generateSlug("Blood Pressure Monitors") },
          { name: "Compression Stockings", slug: generateSlug("Compression Stockings") },
          { name: "Braces & Supports", slug: generateSlug("Braces & Supports") }
        ]
      },
      {
        name: "Baby & Child Care",
        slug: generateSlug("Baby & Child Care"),
        items: [
          { name: "Diapers & Training Pants", slug: generateSlug("Diapers & Training Pants") },
          { name: "Wipes", slug: generateSlug("Wipes") },
          { name: "Baby Formula", slug: generateSlug("Baby Formula") },
          { name: "Baby Food & Snacks", slug: generateSlug("Baby Food & Snacks") },
          { name: "Children's Medications", slug: generateSlug("Children's Medications") }
        ]
      }
    ]
  },
  {
    name: "Beauty & Personal Care",
    slug: generateSlug("Beauty & Personal Care"),
    description: "Beauty products and personal care essentials",
    subcategories: [
      {
        name: "Makeup & Cosmetics",
        slug: generateSlug("Makeup & Cosmetics"),
        items: [
          { name: "Foundation", slug: generateSlug("Foundation") },
          { name: "Lipsticks & Lip Balms", slug: generateSlug("Lipsticks & Lip Balms") },
          { name: "Eyeliners & Mascara", slug: generateSlug("Eyeliners & Mascara") },
          { name: "Nail Polish & Nail Care", slug: generateSlug("Nail Polish & Nail Care") }
        ]
      },
      {
        name: "Skincare",
        slug: generateSlug("Skincare"),
        items: [
          { name: "Cleansers & Toners", slug: generateSlug("Cleansers & Toners") },
          { name: "Moisturizers & Serums", slug: generateSlug("Moisturizers & Serums") },
          { name: "Acne Treatments", slug: generateSlug("Acne Treatments") },
          { name: "Sunscreen", slug: generateSlug("Sunscreen") }
        ]
      },
      {
        name: "Hair Care",
        slug: generateSlug("Hair Care"),
        items: [
          { name: "Shampoo & Conditioner", slug: generateSlug("Shampoo & Conditioner") },
          { name: "Hair Treatments & Masks", slug: generateSlug("Hair Treatments & Masks") },
          { name: "Hair Color", slug: generateSlug("Hair Color") },
          { name: "Styling Products", slug: generateSlug("Styling Products") }
        ]
      },
      {
        name: "Bath & Body",
        slug: generateSlug("Bath & Body"),
        items: [
          { name: "Body Wash & Soap", slug: generateSlug("Body Wash & Soap") },
          { name: "Hand Soaps & Sanitizers", slug: generateSlug("Hand Soaps & Sanitizers") },
          { name: "Lotions & Body Creams", slug: generateSlug("Lotions & Body Creams") },
          { name: "Deodorants & Antiperspirants", slug: generateSlug("Deodorants & Antiperspirants") }
        ]
      },
      {
        name: "Oral Care",
        slug: generateSlug("Oral Care"),
        items: [
          { name: "Toothpaste & Toothbrushes", slug: generateSlug("Toothpaste & Toothbrushes") },
          { name: "Mouthwash", slug: generateSlug("Mouthwash") },
          { name: "Floss & Picks", slug: generateSlug("Floss & Picks") }
        ]
      },
      {
        name: "Men's Grooming",
        slug: generateSlug("Men's Grooming"),
        items: [
          { name: "Shaving Creams & Razors", slug: generateSlug("Shaving Creams & Razors") },
          { name: "Beard Care Products", slug: generateSlug("Beard Care Products") },
          { name: "Men's Skincare", slug: generateSlug("Men's Skincare") }
        ]
      },
      {
        name: "Feminine Care",
        slug: generateSlug("Feminine Care"),
        items: [
          { name: "Pads & Liners", slug: generateSlug("Pads & Liners") },
          { name: "Tampons", slug: generateSlug("Tampons") },
          { name: "Menstrual Cups", slug: generateSlug("Menstrual Cups") },
          { name: "Vaginal Health", slug: generateSlug("Vaginal Health") }
        ]
      },
      {
        name: "Fragrance",
        slug: generateSlug("Fragrance"),
        items: [
          { name: "Perfumes", slug: generateSlug("Perfumes") },
          { name: "Colognes", slug: generateSlug("Colognes") },
          { name: "Body Sprays", slug: generateSlug("Body Sprays") }
        ]
      }
    ]
  },
  {
    name: "Food & Beverages",
    slug: generateSlug("Food & Beverages"),
    description: "Food, drinks, and nutritional products",
    subcategories: [
      {
        name: "Snacks",
        slug: generateSlug("Snacks"),
        items: [
          { name: "Chips & Pretzels", slug: generateSlug("Chips & Pretzels") },
          { name: "Candy & Chocolate", slug: generateSlug("Candy & Chocolate") },
          { name: "Cookies & Crackers", slug: generateSlug("Cookies & Crackers") }
        ]
      },
      {
        name: "Beverages",
        slug: generateSlug("Beverages"),
        items: [
          { name: "Bottled Water", slug: generateSlug("Bottled Water") },
          { name: "Soft Drinks", slug: generateSlug("Soft Drinks") },
          { name: "Energy Drinks", slug: generateSlug("Energy Drinks") },
          { name: "Coffee & Tea", slug: generateSlug("Coffee & Tea") }
        ]
      },
      {
        name: "Pantry Staples",
        slug: generateSlug("Pantry Staples"),
        items: [
          { name: "Cereal & Granola Bars", slug: generateSlug("Cereal & Granola Bars") },
          { name: "Peanut Butter & Jams", slug: generateSlug("Peanut Butter & Jams") },
          { name: "Canned Foods", slug: generateSlug("Canned Foods") }
        ]
      },
      {
        name: "Frozen Foods",
        slug: generateSlug("Frozen Foods"),
        items: [
          { name: "Ice Cream", slug: generateSlug("Ice Cream") },
          { name: "Frozen Meals", slug: generateSlug("Frozen Meals") }
        ]
      },
      {
        name: "Nutrition & Weight Loss",
        slug: generateSlug("Nutrition & Weight Loss"),
        items: [
          { name: "Protein Powders", slug: generateSlug("Protein Powders") },
          { name: "Meal Replacement Bars", slug: generateSlug("Meal Replacement Bars") }
        ]
      }
    ]
  },
  {
    name: "Household & Everyday Essentials",
    slug: generateSlug("Household & Everyday Essentials"),
    description: "Essential household items and cleaning supplies",
    subcategories: [
      {
        name: "Cleaning Supplies",
        slug: generateSlug("Cleaning Supplies"),
        items: [
          { name: "Disinfectant Sprays & Wipes", slug: generateSlug("Disinfectant Sprays & Wipes") },
          { name: "Sponges & Brushes", slug: generateSlug("Sponges & Brushes") },
          { name: "Garbage Bags", slug: generateSlug("Garbage Bags") }
        ]
      },
      {
        name: "Laundry Care",
        slug: generateSlug("Laundry Care"),
        items: [
          { name: "Detergents", slug: generateSlug("Detergents") },
          { name: "Fabric Softeners", slug: generateSlug("Fabric Softeners") }
        ]
      },
      {
        name: "Paper Products",
        slug: generateSlug("Paper Products"),
        items: [
          { name: "Toilet Paper", slug: generateSlug("Toilet Paper") },
          { name: "Paper Towels", slug: generateSlug("Paper Towels") }
        ]
      },
      {
        name: "Pet Care",
        slug: generateSlug("Pet Care"),
        items: [
          { name: "Dog Food", slug: generateSlug("Dog Food") },
          { name: "Cat Food", slug: generateSlug("Cat Food") },
          { name: "Pet Grooming", slug: generateSlug("Pet Grooming") }
        ]
      },
      {
        name: "Batteries & Light Bulbs",
        slug: generateSlug("Batteries & Light Bulbs"),
        items: [
          { name: "Batteries", slug: generateSlug("Batteries") },
          { name: "LED Bulbs", slug: generateSlug("LED Bulbs") }
        ]
      }
    ]
  },
  {
    name: "Electronics & Accessories",
    slug: generateSlug("Electronics & Accessories"),
    description: "Electronic devices and accessories",
    subcategories: [
      {
        name: "Phone Accessories",
        slug: generateSlug("Phone Accessories"),
        items: [
          { name: "Chargers & Cables", slug: generateSlug("Chargers & Cables") },
          { name: "Power Banks", slug: generateSlug("Power Banks") },
          { name: "Phone Cases", slug: generateSlug("Phone Cases") }
        ]
      },
      {
        name: "Audio & Gadgets",
        slug: generateSlug("Audio & Gadgets"),
        items: [
          { name: "Earbuds & Headphones", slug: generateSlug("Earbuds & Headphones") },
          { name: "Portable Speakers", slug: generateSlug("Portable Speakers") }
        ]
      },
      {
        name: "Miscellaneous Electronics",
        slug: generateSlug("Miscellaneous Electronics"),
        items: [
          { name: "Cameras", slug: generateSlug("Cameras") },
          { name: "Fitness Trackers", slug: generateSlug("Fitness Trackers") }
        ]
      }
    ]
  },
  {
    name: "Seasonal Items",
    slug: generateSlug("Seasonal Items"),
    description: "Holiday and seasonal products",
    subcategories: [
      {
        name: "Holiday Decor",
        slug: generateSlug("Holiday Decor"),
        items: [
          { name: "Christmas Lights & Ornaments", slug: generateSlug("Christmas Lights & Ornaments") },
          { name: "Halloween Costumes & Candy", slug: generateSlug("Halloween Costumes & Candy") },
          { name: "Valentine's Day Cards", slug: generateSlug("Valentine's Day Cards") }
        ]
      },
      {
        name: "Outdoor & Garden",
        slug: generateSlug("Outdoor & Garden"),
        items: [
          { name: "Lawn Chairs", slug: generateSlug("Lawn Chairs") },
          { name: "Gardening Tools", slug: generateSlug("Gardening Tools") }
        ]
      }
    ]
  },
  {
    name: "Photo Printing",
    slug: generateSlug("Photo Printing"),
    description: "Photo printing services and products",
    subcategories: [
      {
        name: "Photo Services",
        slug: generateSlug("Photo Services"),
        items: [
          { name: "Prints", slug: generateSlug("Prints") },
          { name: "Custom Photo Gifts", slug: generateSlug("Custom Photo Gifts") }
        ]
      }
    ]
  },
  {
    name: "Travel Essentials",
    slug: generateSlug("Travel Essentials"),
    description: "Travel accessories and necessities",
    subcategories: [
      {
        name: "Travel Accessories",
        slug: generateSlug("Travel Accessories"),
        items: [
          { name: "Travel-Sized Toiletries", slug: generateSlug("Travel-Sized Toiletries") },
          { name: "Neck Pillows", slug: generateSlug("Neck Pillows") },
          { name: "Luggage Tags", slug: generateSlug("Luggage Tags") }
        ]
      }
    ]
  },
  {
    name: "Miscellaneous",
    slug: generateSlug("Miscellaneous"),
    description: "Other retail products and services",
    subcategories: [
      {
        name: "Gift Cards",
        slug: generateSlug("Gift Cards"),
        items: [
          { name: "Restaurants", slug: generateSlug("Restaurants") },
          { name: "Entertainment", slug: generateSlug("Entertainment") },
          { name: "Retail", slug: generateSlug("Retail") }
        ]
      },
      {
        name: "Books & Magazines",
        slug: generateSlug("Books & Magazines"),
        items: [
          { name: "Best Sellers", slug: generateSlug("Best Sellers") },
          { name: "Puzzle Books", slug: generateSlug("Puzzle Books") }
        ]
      }
    ]
  }
];

// Helper functions
export const getCategoryBySlug = (slug) => {
  return categories.find(category => category.slug === slug);
};

export const getSubcategoryBySlug = (categorySlug, subcategorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories.find(sub => sub.slug === subcategorySlug);
};

export const getItemBySlug = (categorySlug, subcategorySlug, itemSlug) => {
  const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug);
  return subcategory?.items.find(item => item.slug === itemSlug);
};

export const getAllCategories = () => {
  return categories.map(category => ({
    name: category.name,
    slug: category.slug
  }));
};

export const getAllSubcategories = (categorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories.map(sub => ({
    name: sub.name,
    slug: sub.slug
  })) || [];
};

export const getAllItems = (categorySlug, subcategorySlug) => {
  const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug);
  return subcategory?.items.map(item => ({
    name: item.name,
    slug: item.slug
  })) || [];
};

// Constants
export const DEFAULT_CATEGORY = 'all';

// Utility functions
export const isCategoryValid = (categorySlug) => {
  return categories.some(cat => cat.slug === categorySlug);
};

export const isSubcategoryValid = (categorySlug, subcategorySlug) => {
  const category = getCategoryBySlug(categorySlug);
  return category?.subcategories.some(sub => sub.slug === subcategorySlug) || false;
};

export const isItemValid = (categorySlug, subcategorySlug, itemSlug) => {
  const subcategory = getSubcategoryBySlug(categorySlug, subcategorySlug);
  return subcategory?.items.some(item => item.slug === itemSlug) || false;
};

export const getCategoryPath = (categorySlug, subcategorySlug, itemSlug) => {
  const parts = [categorySlug];
  if (subcategorySlug) parts.push(subcategorySlug);
  if (itemSlug) parts.push(itemSlug);
  return parts.join('/');
};

export default categories; 