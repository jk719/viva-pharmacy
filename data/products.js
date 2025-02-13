// src/data/products.js
const products = [
  {
    name: "BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED 20CT",
    shortDescription: "Fun and colorful Hello Kitty bandages for kids' minor cuts and scrapes.",
    description: "Introducing BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED in a pack of 20! Give your child a smile with these fun and colorful bandages featuring their favorite Hello Kitty designs.",
    price: 5.99,

    imageKey: "/images/products/band-aid-bandages-kids-hello-kitty-assorted-20ct.png",
    category: "First Aid",
    subcategoryIndex: 0, // Bandages & Dressings
    item: "Bandages & Dressings",
    itemSlug: "bandages-dressings",
    tagline: "Quick Relief & First Aid",

    dosageForm: "Other",
    stock: 100,
    isFeatured: true,
    keywords: ["bandages", "Hello Kitty", "kids first aid", "wound care"],
    sku: "FIR0001",

    seo: {
      metaTitle: "Hello Kitty Band-Aid Kids Bandages - 20 Count | First Aid",
      metaDescription: "Make healing fun with BAND-AID Hello Kitty bandages for kids. 20-count pack, ideal for minor cuts, scrapes, and everyday first aid.",
      metaKeywords: ["Hello Kitty bandages", "kids first aid", "wound care", "adhesive bandages"],
      canonical: "/products/band-aid-hello-kitty",
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED 20CT",
        "description": "Introducing BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED in a pack of 20! Give your child a smile with these fun and colorful bandages.",
        "image": "https://yourwebsite.com/images/products/band-aid-bandages-kids-hello-kitty-assorted-20ct.png",
        "brand": { "@type": "Brand", "name": "Band-Aid" },
        "sku": "FIR0001",
        "offers": {
          "@type": "Offer",
          "url": "https://yourwebsite.com/products/band-aid-hello-kitty",
          "priceCurrency": "USD",
          "price": "5.99",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "First Aid", url: "/categories/first-aid" },
        { name: "Bandages & Dressings", url: "/categories/first-aid/bandages-dressings" }
      ]
    }
  },
  {
    name: "Florastor Kids Probiotic Packets, 20 CT",
    shortDescription: "Supports children's digestive health with natural probiotics.",
    description: "Boost your child's digestive health with Florastor Kids Probiotic Packets. These easy-to-use packets contain beneficial probiotics that support immune system function and maintain healthy digestion.",
    price: 32.99,

    imageKey: "/images/products/florastor-kids-probiotic-packets-20-ct.png",
    category: "Children's Medicine & Wellness",
    subcategoryIndex: 4, // Probiotics
    item: "Probiotics",
    itemSlug: "probiotics",
    tagline: "Children's Care",

    dosageForm: "Powder",
    stock: 75,
    isFeatured: true,
    keywords: ["kids probiotics", "digestive health", "gut health", "children probiotics"],
    sku: "CHD0001",

    seo: {
      metaTitle: "Florastor Kids Probiotic Packets - 20 Count | Children's Gut Health",
      metaDescription: "Support your child's digestive health with Florastor Kids Probiotic Packets. 20 sachets packed with powerful probiotics for a balanced gut.",
      metaKeywords: ["kids probiotics", "gut health", "digestive support", "childrens probiotics"],
      canonical: "/products/florastor-kids-probiotic",
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": "Florastor Kids Probiotic Packets, 20 CT",
        "description": "Boost your child's digestive health with Florastor Kids Probiotic Packets. Supports immune system function and maintains healthy digestion.",
        "image": "https://yourwebsite.com/images/products/florastor-kids-probiotic-packets-20-ct.png",
        "brand": { "@type": "Brand", "name": "Florastor" },
        "sku": "CHD0001",
        "offers": {
          "@type": "Offer",
          "url": "https://yourwebsite.com/products/florastor-kids-probiotic",
          "priceCurrency": "USD",
          "price": "32.99",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        }
      },
      breadcrumbs: [
        { name: "Home", url: "/" },
        { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
        { name: "Probiotics", url: "/categories/childrens-medicine-wellness/probiotics" }
      ]
    }
  },

  {
  name: "Monistat 3 Vaginal Antifungal Prefilled Cream 3x5gm",
  shortDescription: "Fast and effective relief from yeast infections with a soothing cream.",
  description: "Discover fast and effective relief with Monistat 3 Vaginal Antifungal Prefilled Cream 3x5gm. Treats and cures pesky yeast infections while soothing irritation and discomfort. Get back to feeling confident and comfortable with this trusted and convenient solution.",
  price: 19.99,

  imageKey: "/images/products/monistat-3-vaginal-antifungal-prefilled-cream-3x5gm.png",
  category: "Feminine Care",
  subcategoryIndex: 4, // Vaginal Health Products
  item: "Vaginal Health Products",
  itemSlug: "vaginal-health-products",
  tagline: "Her Comfort Essentials",

  dosageForm: "Cream",
  stock: 50,
  isFeatured: false,
  keywords: ["Monistat 3", "yeast infection treatment", "vaginal antifungal cream", "fast relief"],
  sku: "FEM0001",

  seo: {
    metaTitle: "Monistat 3 - Fast Yeast Infection Relief | Antifungal Treatment",
    metaDescription: "Monistat 3 Antifungal Cream provides fast, doctor-recommended yeast infection relief in just 3 days. Buy online for quick, soothing treatment.",
    metaKeywords: ["Monistat 3", "yeast infection treatment", "antifungal cream", "fast relief"],
    canonical: "/products/monistat-3-antifungal-cream",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Monistat 3 Vaginal Antifungal Prefilled Cream 3x5gm",
      "description": "Discover fast and effective relief with Monistat 3 Vaginal Antifungal Prefilled Cream. Treats and cures pesky yeast infections while soothing irritation and discomfort.",
      "image": "https://yourwebsite.com/images/products/monistat-3-vaginal-antifungal-prefilled-cream-3x5gm.png",
      "brand": { "@type": "Brand", "name": "Monistat" },
      "sku": "FEM0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/monistat-3-antifungal-cream",
        "priceCurrency": "USD",
        "price": "19.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Feminine Care", url: "/categories/feminine-care" },
      { name: "Vaginal Health Products", url: "/categories/feminine-care/vaginal-health-products" }
    ]
  }
},
{
  name: "Monistat 7 Vaginal Antifungal Cream Combination Pack",
  shortDescription: "Complete 7-day treatment for yeast infections with added soothing wipes.",
  description: "Get fast and effective relief with Monistat 7 Vaginal Antifungal Cream. This powerful combination pack includes a triple-strength cream and soothing wipes for a complete solution to yeast infections.",
  price: 24.99,

  imageKey: "/images/products/monistat-7-vaginal-antifungal-cream-combination-pack.png",
  category: "Feminine Care",
  subcategoryIndex: 4, // Vaginal Health Products
  item: "Vaginal Health Products",
  itemSlug: "vaginal-health-products",
  tagline: "Her Comfort Essentials",

  dosageForm: "Cream",
  stock: 40,
  isFeatured: false,
  keywords: ["Monistat 7", "yeast infection treatment", "vaginal antifungal cream", "7-day treatment"],
  sku: "FEM0002",

  seo: {
    metaTitle: "Monistat 7 - 7-Day Yeast Infection Treatment | Complete Relief",
    metaDescription: "Monistat 7 Antifungal Cream offers a full 7-day treatment for yeast infections. Complete combination pack for effective relief and comfort.",
    metaKeywords: ["Monistat 7", "yeast infection treatment", "antifungal cream", "7-day treatment"],
    canonical: "/products/monistat-7-antifungal-cream",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Monistat 7 Vaginal Antifungal Cream Combination Pack",
      "description": "Get fast and effective relief with Monistat 7 Vaginal Antifungal Cream. This powerful combination pack includes a triple-strength cream and soothing wipes for a complete solution to yeast infections.",
      "image": "https://yourwebsite.com/images/products/monistat-7-vaginal-antifungal-cream-combination-pack.png",
      "brand": { "@type": "Brand", "name": "Monistat" },
      "sku": "FEM0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/monistat-7-antifungal-cream",
        "priceCurrency": "USD",
        "price": "24.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Feminine Care", url: "/categories/feminine-care" },
      { name: "Vaginal Health Products", url: "/categories/feminine-care/vaginal-health-products" }
    ]
  }
},
{
  name: "NeilMed Sinus Rinse Complete Kit 1ct",
  shortDescription: "Gently cleanse sinuses and relieve nasal congestion with this complete kit.",
  description: "Cleansing your sinuses has never been easier with the NeilMed Sinus Rinse Complete Kit 1ct. This complete kit includes a uniquely designed squeeze bottle and pre-measured packets of pharmaceutical-grade, preservative-free mixture. Gently wash away nasal irritants and relieve congestion for better breathing and overall sinus health.",
  price: 14.99,
  imageKey: "/images/products/neilmed-sinus-rinse-complete-kit-1ct.png",
  category: "Allergy Care",
  subcategoryIndex: 1,
  item: "Nasal Sprays",
  itemSlug: "nasal-sprays",
  tagline: "Breathe Easy",
  dosageForm: "Liquid",
  stock: 60,
  isFeatured: true,
  keywords: ["sinus rinse", "nasal congestion relief", "NeilMed", "sinus health"],
  sku: "ALL0001",
  seo: {
    metaTitle: "NeilMed Sinus Rinse - Allergy & Congestion Relief | 1 Kit",
    metaDescription: "NeilMed Sinus Rinse provides natural relief from nasal congestion, sinus pressure, and allergies. Complete kit with pre-measured packets.",
    metaKeywords: ["sinus rinse", "nasal congestion relief", "NeilMed sinus kit", "sinus health"],
    canonical: "/products/neilmed-sinus-rinse-kit",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "NeilMed Sinus Rinse Complete Kit 1ct",
      "description": "Gently cleanse sinuses and relieve nasal congestion with the NeilMed Sinus Rinse Complete Kit.",
      "image": "https://yourwebsite.com/images/products/neilmed-sinus-rinse-complete-kit-1ct.png",
      "brand": { "@type": "Brand", "name": "NeilMed" },
      "sku": "ALL0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/neilmed-sinus-rinse-kit",
        "priceCurrency": "USD",
        "price": "14.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Nasal Sprays", url: "/categories/allergy-care/nasal-sprays" }
    ]
  }
},
{
  name: "Ricola Sugar-Free Swiss Herb Drops 19ct",
  shortDescription: "Experience the soothing power of Swiss herbs with these sugar-free drops.",
  description: "Ricola Sugar-Free Swiss Herb Drops provide a natural, refreshing relief for sore throats and coughs. Made with a blend of Swiss herbs cultivated in the Alps, these drops are a perfect choice for long-lasting throat relief.",
  price: 3.99,
  imageKey: "/images/products/ricola-bag-s-f-swiss-herb-drp-19ct.png",
  category: "Cough & Throat Relief",
  subcategoryIndex: 0,
  item: "Cough Drops",
  itemSlug: "cough-drops",
  tagline: "Soothing Throat Relief",
  dosageForm: "Gummies",
  stock: 120,
  isFeatured: true,
  keywords: ["Ricola", "cough drops", "sugar-free lozenges", "Swiss herb throat relief"],
  sku: "COU0001",
  seo: {
    metaTitle: "Ricola Sugar-Free Herb Cough Drops - 19ct | Soothing Relief",
    metaDescription: "Ricola Sugar-Free Swiss Herb Drops offer natural, soothing relief for sore throats. Made with 13 Swiss herbs for a refreshing taste.",
    metaKeywords: ["Ricola cough drops", "sore throat relief", "sugar-free lozenges", "Swiss herbs"],
    canonical: "/products/ricola-sugar-free-herb-drops",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Ricola Sugar-Free Swiss Herb Drops 19ct",
      "description": "Experience the soothing power of Swiss herbs with Ricola Sugar-Free Swiss Herb Drops. Ideal for sore throat relief.",
      "image": "https://yourwebsite.com/images/products/ricola-bag-s-f-swiss-herb-drp-19ct.png",
      "brand": { "@type": "Brand", "name": "Ricola" },
      "sku": "COU0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/ricola-sugar-free-herb-drops",
        "priceCurrency": "USD",
        "price": "3.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cough & Throat Relief", url: "/categories/cough-throat-relief" },
      { name: "Cough Drops", url: "/categories/cough-throat-relief/cough-drops" }
    ]
  }
},
{
  name: "Mucinex InstaSoothe Honey Echinacea Throat Drops 20ct",
  shortDescription: "Instant relief for sore throats with natural honey and echinacea.",
  description: "Mucinex InstaSoothe Honey Echinacea Throat Drops provide fast relief for sore throats. Made with natural honey and echinacea, these drops help soothe irritation and discomfort, promoting overall throat wellness.",
  price: 5.99,
  imageKey: "/images/products/mucinex-instasoothe-honey-echinacea-throat-drop-20ct.png",
  category: "Cough & Throat Relief",
  subcategoryIndex: 0,
  item: "Cough Drops",
  itemSlug: "cough-drops",
  tagline: "Soothing Throat Relief",
  dosageForm: "Gummies",
  stock: 90,
  isFeatured: true,
  keywords: ["Mucinex throat drops", "honey echinacea lozenges", "soothing sore throat relief"],
  sku: "COU0002",
  seo: {
    metaTitle: "Mucinex InstaSoothe Honey Echinacea Throat Drops - 20ct | Soothing Relief",
    metaDescription: "Mucinex InstaSoothe Honey Echinacea Throat Drops provide fast relief for sore throats. Made with natural honey and echinacea, these drops help soothe irritation and discomfort, promoting overall throat wellness.",
    metaKeywords: ["Mucinex throat drops", "honey echinacea lozenges", "soothing sore throat relief"],
    canonical: "/products/mucinex-instasoothe-honey-echinacea-throat-drops",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Mucinex InstaSoothe Honey Echinacea Throat Drops 20ct",
      "description": "Mucinex InstaSoothe Honey Echinacea Throat Drops provide fast relief for sore throats. Made with natural honey and echinacea, these drops help soothe irritation and discomfort, promoting overall throat wellness.",
      "image": "https://yourwebsite.com/images/products/mucinex-instasoothe-honey-echinacea-throat-drop-20ct.png",
      "brand": { "@type": "Brand", "name": "Mucinex" },
      "sku": "COU0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/mucinex-instasoothe-honey-echinacea-throat-drops",
        "priceCurrency": "USD",
        "price": "5.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cough & Throat Relief", url: "/categories/cough-throat-relief" },
      { name: "Cough Drops", url: "/categories/cough-throat-relief/cough-drops" }
    ]
  }
},
{
  name: "PediaSure Grow & Gain Kids Nutritional Shake Vanilla",
  shortDescription: "Complete, balanced nutrition for kids in a delicious vanilla shake.",
  description: "PediaSure Grow & Gain Kids Nutritional Shake is specially designed to help kids grow and gain weight. Packed with protein, vitamins, and minerals in a delicious vanilla flavor to support healthy development.",
  price: 2.99,
  imageKey: "/images/products/pediasure-grow-gain-kids-nutritional-shake-vanilla.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 3,
  item: "Children's Multivitamins",
  itemSlug: "childrens-multivitamins",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 80,
  isFeatured: true,
  keywords: ["PediaSure", "kids nutritional shake", "vanilla meal supplement", "children's vitamins"],
  sku: "CHD0002",
  seo: {
    metaTitle: "PediaSure Grow & Gain Kids Nutritional Shake Vanilla - 1 Serving | Children's Care",
    metaDescription: "PediaSure Grow & Gain Kids Nutritional Shake is specially designed to help kids grow and gain weight. Packed with protein, vitamins, and minerals in a delicious vanilla flavor to support healthy development.",
    metaKeywords: ["PediaSure", "kids nutritional shake", "vanilla meal supplement", "children's vitamins"],
    canonical: "/products/pediasure-grow-gain-kids-nutritional-shake-vanilla",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "PediaSure Grow & Gain Kids Nutritional Shake Vanilla",
      "description": "PediaSure Grow & Gain Kids Nutritional Shake is specially designed to help kids grow and gain weight. Packed with protein, vitamins, and minerals in a delicious vanilla flavor to support healthy development.",
      "image": "https://yourwebsite.com/images/products/pediasure-grow-gain-kids-nutritional-shake-vanilla.png",
      "brand": { "@type": "Brand", "name": "PediaSure" },
      "sku": "CHD0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pediasure-grow-gain-kids-nutritional-shake-vanilla",
        "priceCurrency": "USD",
        "price": "2.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Children's Multivitamins", url: "/categories/childrens-medicine-wellness/childrens-multivitamins" }
    ]
  }
},
{
  name: "PediaSure Grow & Gain Kids Nutritional Shake Chocolate",
  shortDescription: "Complete, balanced nutrition for kids in a tasty chocolate shake.",
  description: "Fuel your child's growth with PediaSure Grow & Gain Kids Nutritional Shake in delicious chocolate flavor. Each serving provides complete, balanced nutrition to support healthy development and weight gain.",
  price: 2.99,
  imageKey: "/images/products/pediasure-grow-gain-kids-nutritional-shake-chocolate.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 3,
  item: "Children's Multivitamins",
  itemSlug: "childrens-multivitamins",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 75,
  isFeatured: true,
  keywords: ["PediaSure chocolate", "kids nutritional shake", "meal replacement for children", "children's vitamins"],
  sku: "CHD0003",
  seo: {
    metaTitle: "PediaSure Grow & Gain Kids Nutritional Shake Chocolate - 1 Serving | Children's Care",
    metaDescription: "Fuel your child's growth with PediaSure Grow & Gain Kids Nutritional Shake in delicious chocolate flavor. Each serving provides complete, balanced nutrition to support healthy development and weight gain.",
    metaKeywords: ["PediaSure chocolate", "kids nutritional shake", "meal replacement for children", "children's vitamins"],
    canonical: "/products/pediasure-grow-gain-kids-nutritional-shake-chocolate",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "PediaSure Grow & Gain Kids Nutritional Shake Chocolate",
      "description": "Fuel your child's growth with PediaSure Grow & Gain Kids Nutritional Shake in delicious chocolate flavor. Each serving provides complete, balanced nutrition to support healthy development and weight gain.",
      "image": "https://yourwebsite.com/images/products/pediasure-grow-gain-kids-nutritional-shake-chocolate.png",
      "brand": { "@type": "Brand", "name": "PediaSure" },
      "sku": "CHD0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pediasure-grow-gain-kids-nutritional-shake-chocolate",
        "priceCurrency": "USD",
        "price": "2.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Children's Multivitamins", url: "/categories/childrens-medicine-wellness/childrens-multivitamins" }
    ]
  }
},
{
  name: "Natrol Kids Melatonin Berry Gummies 90ct",
  shortDescription: "Natural melatonin gummies to support restful sleep for children.",
  description: "Feel confident sending your child off to dreamland with Natrol Kids Melatonin Berry Gummies. Our delicious gummies are made with the highest quality melatonin to help promote a peaceful and restful sleep. Say goodbye to bedtime struggles and hello to a well-rested child!",
  price: 14.99,
  imageKey: "/images/products/natrol-kids-melatonin-berry-gummies-90ct.png",
  category: "Sleep Aids",
  subcategoryIndex: 0,
  item: "Melatonin Supplements",
  itemSlug: "melatonin-supplements",
  tagline: "Restful Nights",
  dosageForm: "Gummies",
  stock: 65,
  isFeatured: true,
  keywords: ["Natrol kids melatonin", "sleep aid for children", "melatonin gummies", "kids sleep support"],
  sku: "SLE0001",
  seo: {
    metaTitle: "Natrol Kids Melatonin Berry Gummies - 90ct | Restful Nights",
    metaDescription: "Feel confident sending your child off to dreamland with Natrol Kids Melatonin Berry Gummies. Our delicious gummies are made with the highest quality melatonin to help promote a peaceful and restful sleep. Say goodbye to bedtime struggles and hello to a well-rested child!",
    metaKeywords: ["Natrol kids melatonin", "sleep aid for children", "melatonin gummies", "kids sleep support"],
    canonical: "/products/natrol-kids-melatonin-berry-gummies",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Natrol Kids Melatonin Berry Gummies 90ct",
      "description": "Feel confident sending your child off to dreamland with Natrol Kids Melatonin Berry Gummies. Our delicious gummies are made with the highest quality melatonin to help promote a peaceful and restful sleep. Say goodbye to bedtime struggles and hello to a well-rested child!",
      "image": "https://yourwebsite.com/images/products/natrol-kids-melatonin-berry-gummies-90ct.png",
      "brand": { "@type": "Brand", "name": "Natrol" },
      "sku": "SLE0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/natrol-kids-melatonin-berry-gummies",
        "priceCurrency": "USD",
        "price": "14.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Sleep Aids", url: "/categories/sleep-aids" },
      { name: "Melatonin Supplements", url: "/categories/sleep-aids/melatonin-supplements" }
    ]
  }
},
{
  name: "Flonase Sensimist 24HR Allergy Relief Scent-Free Nasal Spray 0.34oz",
  shortDescription: "Gentle, scent-free allergy relief for up to 24 hours.",
  description: "Experience relief from your allergies with Flonase Sensimist 24HR Allergy Relief Nasal Spray. Scent-free and long-lasting, this spray provides gentle and effective relief for up to 24 hours. Breathe easy and enjoy the outdoors without the worry of pesky allergens.",
  price: 23.99,
  imageKey: "/images/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png",
  category: "Allergy Care",
  subcategoryIndex: 1,
  item: "Nasal Sprays",
  itemSlug: "nasal-sprays",
  tagline: "Breathe Easy",
  dosageForm: "Spray",
  stock: 50,
  isFeatured: true,
  keywords: ["Flonase Sensimist", "allergy nasal spray", "scent-free allergy relief", "24-hour nasal spray"],
  sku: "ALL0002",
  seo: {
    metaTitle: "Flonase Sensimist 24HR Allergy Relief Scent-Free Nasal Spray - 0.34oz | Allergy Care",
    metaDescription: "Experience relief from your allergies with Flonase Sensimist 24HR Allergy Relief Nasal Spray. Scent-free and long-lasting, this spray provides gentle and effective relief for up to 24 hours. Breathe easy and enjoy the outdoors without the worry of pesky allergens.",
    metaKeywords: ["Flonase Sensimist", "allergy nasal spray", "scent-free allergy relief", "24-hour nasal spray"],
    canonical: "/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Flonase Sensimist 24HR Allergy Relief Scent-Free Nasal Spray 0.34oz",
      "description": "Experience relief from your allergies with Flonase Sensimist 24HR Allergy Relief Nasal Spray. Scent-free and long-lasting, this spray provides gentle and effective relief for up to 24 hours. Breathe easy and enjoy the outdoors without the worry of pesky allergens.",
      "image": "https://yourwebsite.com/images/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png",
      "brand": { "@type": "Brand", "name": "Flonase" },
      "sku": "ALL0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray",
        "priceCurrency": "USD",
        "price": "23.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Nasal Sprays", url: "/categories/allergy-care/nasal-sprays" }
    ]
  }
},
{
  name: "Children's Flonase Sensimist 60 Sprays",
  shortDescription: "Gentle allergy relief for kids with scent-free formula.",
  description: "Relieve your child's allergy symptoms with Children's Flonase Sensimist. This gentle, scent-free nasal spray provides 24-hour relief from indoor and outdoor allergies, helping kids breathe easier and feel comfortable throughout the day.",
  price: 19.99,
  imageKey: "/images/products/childrens-flonase-sensimist-60-sprays.png",
  category: "Allergy Care",
  subcategoryIndex: 1,
  item: "Nasal Sprays",
  itemSlug: "nasal-sprays",
  tagline: "Breathe Easy",
  dosageForm: "Spray",
  stock: 40,
  isFeatured: true,
  keywords: ["Children's Flonase", "kids allergy relief", "Flonase Sensimist for children", "nasal spray for kids"],
  sku: "ALL0003",
  seo: {
    metaTitle: "Children's Flonase Sensimist 60 Sprays - Allergy Relief | Children's Care",
    metaDescription: "Relieve your child's allergy symptoms with Children's Flonase Sensimist. This gentle, scent-free nasal spray provides 24-hour relief from indoor and outdoor allergies, helping kids breathe easier and feel comfortable throughout the day.",
    metaKeywords: ["Children's Flonase", "kids allergy relief", "Flonase Sensimist for children", "nasal spray for kids"],
    canonical: "/products/childrens-flonase-sensimist-60-sprays",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Children's Flonase Sensimist 60 Sprays",
      "description": "Relieve your child's allergy symptoms with Children's Flonase Sensimist. This gentle, scent-free nasal spray provides 24-hour relief from indoor and outdoor allergies, helping kids breathe easier and feel comfortable throughout the day.",
      "image": "https://yourwebsite.com/images/products/childrens-flonase-sensimist-60-sprays.png",
      "brand": { "@type": "Brand", "name": "Flonase" },
      "sku": "ALL0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/childrens-flonase-sensimist-60-sprays",
        "priceCurrency": "USD",
        "price": "19.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Nasal Sprays", url: "/categories/allergy-care/nasal-sprays" }
    ]
  }
},
{
  name: "Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak",
  shortDescription: "Revitalize tired feet with peppermint-infused Epsom salt soak.",
  description: "Revitalize and soothe tired feet with Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak. This refreshing blend combines pure Epsom salt with peppermint essential oil for the ultimate foot care experience. Helps reduce swelling, soothe sore muscles, and refresh your feet.",
  price: 6.99,
  imageKey: "/images/products/dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak-32oz.png",
  category: "Foot Care",
  subcategoryIndex: 0,
  item: "Antifungal Creams",
  itemSlug: "antifungal-creams",
  tagline: "Happy Feet",
  dosageForm: "Powder",
  stock: 55,
  isFeatured: true,
  keywords: ["Dr. Teal's foot soak", "Epsom salt soak", "peppermint foot care", "cooling foot soak"],
  sku: "FOO0001",
  seo: {
    metaTitle: "Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak - 32oz | Foot Care",
    metaDescription: "Revitalize and soothe tired feet with Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak. This refreshing blend combines pure Epsom salt with peppermint essential oil for the ultimate foot care experience. Helps reduce swelling, soothe sore muscles, and refresh your feet.",
    metaKeywords: ["Dr. Teal's foot soak", "Epsom salt soak", "peppermint foot care", "cooling foot soak"],
    canonical: "/products/dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak 32oz",
      "description": "Revitalize and soothe tired feet with Dr. Teal's Cooling Peppermint Pure Epsom Salt Foot Soak. This refreshing blend combines pure Epsom salt with peppermint essential oil for the ultimate foot care experience. Helps reduce swelling, soothe sore muscles, and refresh your feet.",
      "image": "https://yourwebsite.com/images/products/dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak-32oz.png",
      "brand": { "@type": "Brand", "name": "Dr. Teal's" },
      "sku": "FOO0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak",
        "priceCurrency": "USD",
        "price": "6.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Foot Care", url: "/categories/foot-care" },
      { name: "Antifungal Creams", url: "/categories/foot-care/antifungal-creams" }
    ]
  }
},
{
  name: "Zarbee's Children's Cough & Mucus Night Syrup",
  shortDescription: "Natural nighttime relief for children's cough and mucus buildup.",
  description: "Get a peaceful night's sleep with Zarbee's Children's Cough & Mucus Night Syrup. Made with natural ingredients like honey and elderberry, this syrup helps relieve nighttime cough and congestion, so your child can rest comfortably.",
  price: 11.99,
  imageKey: "/images/products/zarbees-childrens-cough-mucus-night-syrup-4oz.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 60,
  isFeatured: true,
  keywords: ["Zarbee's night syrup", "kids cough relief", "natural cough syrup", "honey elderberry syrup"],
  sku: "CHD0004",
  seo: {
    metaTitle: "Zarbee's Children's Cough & Mucus Night Syrup - 4oz | Children's Care",
    metaDescription: "Get a peaceful night's sleep with Zarbee's Children's Cough & Mucus Night Syrup. Made with natural ingredients like honey and elderberry, this syrup helps relieve nighttime cough and congestion, so your child can rest comfortably.",
    metaKeywords: ["Zarbee's night syrup", "kids cough relief", "natural cough syrup", "honey elderberry syrup"],
    canonical: "/products/zarbees-childrens-cough-mucus-night-syrup",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Zarbee's Children's Cough & Mucus Night Syrup 4oz",
      "description": "Get a peaceful night's sleep with Zarbee's Children's Cough & Mucus Night Syrup. Made with natural ingredients like honey and elderberry, this syrup helps relieve nighttime cough and congestion, so your child can rest comfortably.",
      "image": "https://yourwebsite.com/images/products/zarbees-childrens-cough-mucus-night-syrup-4oz.png",
      "brand": { "@type": "Brand", "name": "Zarbee's" },
      "sku": "CHD0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/zarbees-childrens-cough-mucus-night-syrup",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Cough & Cold Remedies", url: "/categories/childrens-medicine-wellness/cough-cold-remedies" }
    ]
  }
},
{
  name: "Zarbee's Children's Cough & Mucus Day Syrup",
  shortDescription: "Natural daytime relief for children's cough and congestion.",
  description: "Zarbee's Children's Cough & Mucus Day Syrup is a delicious and effective way to soothe your child's cough and congestion. Made with natural ingredients like honey and ivy leaf extract, this syrup helps relieve daytime cough and mucus buildup without artificial additives.",
  price: 11.99,
  imageKey: "/images/products/zarbees-childrens-cough-mucus-day-syrup-4oz.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 55,
  isFeatured: true,
  keywords: ["Zarbee's daytime syrup", "kids cough relief", "natural cough syrup", "honey ivy leaf extract"],
  sku: "CHD0005",
  seo: {
    metaTitle: "Zarbee's Children's Cough & Mucus Day Syrup - 4oz | Children's Care",
    metaDescription: "Zarbee's Children's Cough & Mucus Day Syrup is a delicious and effective way to soothe your child's cough and congestion. Made with natural ingredients like honey and ivy leaf extract, this syrup helps relieve daytime cough and mucus buildup without artificial additives.",
    metaKeywords: ["Zarbee's daytime syrup", "kids cough relief", "natural cough syrup", "honey ivy leaf extract"],
    canonical: "/products/zarbees-childrens-cough-mucus-day-syrup",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Zarbee's Children's Cough & Mucus Day Syrup 4oz",
      "description": "Zarbee's Children's Cough & Mucus Day Syrup is a delicious and effective way to soothe your child's cough and congestion. Made with natural ingredients like honey and ivy leaf extract, this syrup helps relieve daytime cough and mucus buildup without artificial additives.",
      "image": "https://yourwebsite.com/images/products/zarbees-childrens-cough-mucus-day-syrup-4oz.png",
      "brand": { "@type": "Brand", "name": "Zarbee's" },
      "sku": "CHD0005",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/zarbees-childrens-cough-mucus-day-syrup",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Cough & Cold Remedies", url: "/categories/childrens-medicine-wellness/cough-cold-remedies" }
    ]
  }
},
{
  name: "Hyland's Kids Mucus Cough Nighttime Grape Liquid 4oz",
  shortDescription: "Gentle, homeopathic relief for nighttime cough and mucus buildup.",
  description: "Relieve your child's cough and congestion with Hyland's Kids Mucus Cough Nighttime Grape Liquid. This homeopathic formula is specially designed to help kids sleep better by reducing nighttime cough and mucus buildup naturally.",
  price: 13.99,
  imageKey: "/images/products/hylands-kids-mucus-cough-nt-grp-liq-4oz.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 45,
  isFeatured: true,
  keywords: ["Hyland's kids cough syrup", "homeopathic cough relief", "grape cough syrup", "natural nighttime relief"],
  sku: "CHD0006",
  seo: {
    metaTitle: "Hyland's Kids Mucus Cough Nighttime Grape Liquid - 4oz | Children's Care",
    metaDescription: "Relieve your child's cough and congestion with Hyland's Kids Mucus Cough Nighttime Grape Liquid. This homeopathic formula is specially designed to help kids sleep better by reducing nighttime cough and mucus buildup naturally.",
    metaKeywords: ["Hyland's kids cough syrup", "homeopathic cough relief", "grape cough syrup", "natural nighttime relief"],
    canonical: "/products/hylands-kids-mucus-cough-nighttime-grape-liquid",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Hyland's Kids Mucus Cough Nighttime Grape Liquid 4oz",
      "description": "Relieve your child's cough and congestion with Hyland's Kids Mucus Cough Nighttime Grape Liquid. This homeopathic formula is specially designed to help kids sleep better by reducing nighttime cough and mucus buildup naturally.",
      "image": "https://yourwebsite.com/images/products/hylands-kids-mucus-cough-nt-grp-liq-4oz.png",
      "brand": { "@type": "Brand", "name": "Hyland's" },
      "sku": "CHD0006",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/hylands-kids-mucus-cough-nighttime-grape-liquid",
        "priceCurrency": "USD",
        "price": "13.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Cough & Cold Remedies", url: "/categories/childrens-medicine-wellness/cough-cold-remedies" }
    ]
  }
},
{
  name: "Hyland's Kids Cough & Mucus Daytime Grape Liquid 4oz",
  shortDescription: "Natural daytime relief for kids' cough and congestion.",
  description: "Support your child's respiratory health with Hyland's Kids Cough & Mucus Daytime Grape Liquid. This homeopathic formula helps relieve cough and mucus buildup naturally, so your child can feel better and breathe easier throughout the day.",
  price: 9.99,
  imageKey: "/images/products/hyland-s-kids-cough-mucus-daytime-grape-liquid-4o.png",
  category: "Children's Medicine & Wellness",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Children's Care",
  dosageForm: "Liquid",
  stock: 50,
  isFeatured: true,
  keywords: ["Hyland's kids cough syrup", "daytime cough relief", "natural cough medicine", "homeopathic grape syrup"],
  sku: "CHD0007",
  seo: {
    metaTitle: "Hyland's Kids Cough & Mucus Daytime Grape Liquid - 4oz | Children's Care",
    metaDescription: "Support your child's respiratory health with Hyland's Kids Cough & Mucus Daytime Grape Liquid. This homeopathic formula helps relieve cough and mucus buildup naturally, so your child can feel better and breathe easier throughout the day.",
    metaKeywords: ["Hyland's kids cough syrup", "daytime cough relief", "natural cough medicine", "homeopathic grape syrup"],
    canonical: "/products/hylands-kids-cough-mucus-daytime-grape-liquid",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Hyland's Kids Cough & Mucus Daytime Grape Liquid 4oz",
      "description": "Support your child's respiratory health with Hyland's Kids Cough & Mucus Daytime Grape Liquid. This homeopathic formula helps relieve cough and mucus buildup naturally, so your child can feel better and breathe easier throughout the day.",
      "image": "https://yourwebsite.com/images/products/hyland-s-kids-cough-mucus-daytime-grape-liquid-4o.png",
      "brand": { "@type": "Brand", "name": "Hyland's" },
      "sku": "CHD0007",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/hylands-kids-cough-mucus-daytime-grape-liquid",
        "priceCurrency": "USD",
        "price": "9.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Children's Medicine & Wellness", url: "/categories/childrens-medicine-wellness" },
      { name: "Cough & Cold Remedies", url: "/categories/childrens-medicine-wellness/cough-cold-remedies" }
    ]
  }
},
{
  name: "Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct",
  shortDescription: "Fast relief from cold and flu symptoms, day and night.",
  description: "Get quick relief from your cold and flu symptoms with Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct. These liquid gels provide fast and effective relief for both day and night, tackling multiple symptoms at once.",
  price: 9.99,
  imageKey: "/images/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels-20ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Capsule",
  stock: 65,
  isFeatured: true,
  keywords: ["Alka-Seltzer Plus", "cold and flu relief", "day and night medicine", "multi-symptom relief"],
  sku: "CFL0001",
  seo: {
    metaTitle: "Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels - 20ct | Cold & Flu Relief",
    metaDescription: "Get quick relief from your cold and flu symptoms with Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct. These liquid gels provide fast and effective relief for both day and night, tackling multiple symptoms at once.",
    metaKeywords: ["Alka-Seltzer Plus", "cold and flu relief", "day and night medicine", "multi-symptom relief"],
    canonical: "/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct",
      "description": "Get quick relief from your cold and flu symptoms with Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct. These liquid gels provide fast and effective relief for both day and night, tackling multiple symptoms at once.",
      "image": "https://yourwebsite.com/images/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels-20ct.png",
      "brand": { "@type": "Brand", "name": "Alka-Seltzer Plus" },
      "sku": "CFL0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels",
        "priceCurrency": "USD",
        "price": "9.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Mylanta Antacid Classic Liquid 12oz",
  shortDescription: "Fast relief from heartburn and indigestion.",
  description: "This classic antacid liquid by Mylanta is a must-have for heartburn and indigestion relief. With its tried and trusted formula, it quickly neutralizes stomach acid, providing fast and effective relief.",
  price: 9.99,
  imageKey: "/images/products/mylanta-antacid-classic-liq-12oz.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Liquid",
  stock: 70,
  isFeatured: true,
  keywords: ["Mylanta", "antacid liquid", "heartburn relief", "indigestion remedy"],
  sku: "DIG0002",
  seo: {
    metaTitle: "Mylanta Antacid Classic Liquid - 12oz | Digestive Health",
    metaDescription: "This classic antacid liquid by Mylanta is a must-have for heartburn and indigestion relief. With its tried and trusted formula, it quickly neutralizes stomach acid, providing fast and effective relief.",
    metaKeywords: ["Mylanta", "antacid liquid", "heartburn relief", "indigestion remedy"],
    canonical: "/products/mylanta-antacid-classic-liquid",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Mylanta Antacid Classic Liquid 12oz",
      "description": "This classic antacid liquid by Mylanta is a must-have for heartburn and indigestion relief. With its tried and trusted formula, it quickly neutralizes stomach acid, providing fast and effective relief.",
      "image": "https://yourwebsite.com/images/products/mylanta-antacid-classic-liq-12oz.png",
      "brand": { "@type": "Brand", "name": "Mylanta" },
      "sku": "DIG0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/mylanta-antacid-classic-liquid",
        "priceCurrency": "USD",
        "price": "9.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Phillips Milk of Magnesia Original Liquid 12oz",
  shortDescription: "Gentle and effective relief from occasional constipation.",
  description: "Experience fast relief from stomach discomfort with Phillips Milk of Magnesia Original Liquid! This 12oz bottle provides powerful relief from constipation, indigestion, and acid reflux. With its trusted formula, it's the perfect choice for quick and effective relief whenever you need it.",
  price: 7.99,
  imageKey: "/images/products/phillips-milk-of-magnesia-original-liquid-12oz.png",
  category: "Digestive Health",
  subcategoryIndex: 1,
  item: "Laxatives",
  itemSlug: "laxatives",
  tagline: "Happy Tummy",
  dosageForm: "Liquid",
  stock: 60,
  isFeatured: true,
  keywords: ["Phillips Milk of Magnesia", "constipation relief", "stomach discomfort", "laxative liquid"],
  sku: "DIG0003",
  seo: {
    metaTitle: "Phillips Milk of Magnesia Original Liquid - 12oz | Digestive Health",
    metaDescription: "Experience fast relief from stomach discomfort with Phillips Milk of Magnesia Original Liquid! This 12oz bottle provides powerful relief from constipation, indigestion, and acid reflux. With its trusted formula, it's the perfect choice for quick and effective relief whenever you need it.",
    metaKeywords: ["Phillips Milk of Magnesia", "constipation relief", "stomach discomfort", "laxative liquid"],
    canonical: "/products/phillips-milk-of-magnesia-original-liquid",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Phillips Milk of Magnesia Original Liquid 12oz",
      "description": "Experience fast relief from stomach discomfort with Phillips Milk of Magnesia Original Liquid! This 12oz bottle provides powerful relief from constipation, indigestion, and acid reflux. With its trusted formula, it's the perfect choice for quick and effective relief whenever you need it.",
      "image": "https://yourwebsite.com/images/products/phillips-milk-of-magnesia-original-liquid-12oz.png",
      "brand": { "@type": "Brand", "name": "Phillips" },
      "sku": "DIG0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/phillips-milk-of-magnesia-original-liquid",
        "priceCurrency": "USD",
        "price": "7.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Laxatives", url: "/categories/digestive-health/laxatives" }
    ]
  }
},
{
  name: "Coricidin HBP Chest Congestion & Cough Liquid Gels 20ct",
  shortDescription: "Effective relief from chest congestion and cough, safe for high blood pressure.",
  description: "Experience fast and effective relief from chest congestion and cough with Coricidin HBP Liquid Gels. Its powerful formula targets and alleviates symptoms with ease, allowing you to breathe easier. Perfect for those with high blood pressure. Get 20 liquid gels for long-lasting relief.",
  price: 10.99,
  imageKey: "/images/products/coricidin-hbp-chest-congestion-cough-liquid-gels-20ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Capsule",
  stock: 55,
  isFeatured: true,
  keywords: ["Coricidin HBP", "cold and flu relief", "cough medicine for high blood pressure", "chest congestion relief"],
  sku: "CFL0002",
  seo: {
    metaTitle: "Coricidin HBP Chest Congestion & Cough Liquid Gels - 20ct | Cold & Flu Relief",
    metaDescription: "Experience fast and effective relief from chest congestion and cough with Coricidin HBP Liquid Gels. Its powerful formula targets and alleviates symptoms with ease, allowing you to breathe easier. Perfect for those with high blood pressure.",
    metaKeywords: ["Coricidin HBP", "cold and flu relief", "cough medicine for high blood pressure", "chest congestion relief"],
    canonical: "/products/coricidin-hbp-chest-congestion-cough-liquid-gels",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Coricidin HBP Chest Congestion & Cough Liquid Gels 20ct",
      "description": "Experience fast and effective relief from chest congestion and cough with Coricidin HBP Liquid Gels. Its powerful formula targets and alleviates symptoms with ease, allowing you to breathe easier. Perfect for those with high blood pressure.",
      "image": "https://yourwebsite.com/images/products/coricidin-hbp-chest-congestion-cough-liquid-gels-20ct.png",
      "brand": { "@type": "Brand", "name": "Coricidin HBP" },
      "sku": "CFL0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/coricidin-hbp-chest-congestion-cough-liquid-gels",
        "priceCurrency": "USD",
        "price": "10.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Alka-Seltzer Extra Strength Effervescent Tablets 24ct",
  shortDescription: "Fast relief for heartburn, indigestion, and upset stomach.",
  description: "Experience fast and effective relief with Alka-Seltzer Extra Strength Effervescent Tablets. This 24ct pack provides powerful relief from headaches, body aches, and heartburn in a convenient effervescent form. Trusted for over 80 years.",
  price: 8.99,
  imageKey: "/images/products/alka-seltzer-extra-strength-effervescent-tablets-24ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Tablet",
  stock: 70,
  isFeatured: true,
  keywords: ["Alka-Seltzer", "effervescent tablets", "heartburn relief", "indigestion remedy"],
  sku: "DIG0004",
  seo: {
    metaTitle: "Alka-Seltzer Extra Strength Effervescent Tablets - 24ct | Digestive Health",
    metaDescription: "Experience fast and effective relief with Alka-Seltzer Extra Strength Effervescent Tablets. This 24ct pack provides powerful relief from headaches, body aches, and heartburn in a convenient effervescent form. Trusted for over 80 years.",
    metaKeywords: ["Alka-Seltzer", "effervescent tablets", "heartburn relief", "indigestion remedy"],
    canonical: "/products/alka-seltzer-extra-strength-effervescent-tablets",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Alka-Seltzer Extra Strength Effervescent Tablets 24ct",
      "description": "Experience fast and effective relief with Alka-Seltzer Extra Strength Effervescent Tablets. This 24ct pack provides powerful relief from headaches, body aches, and heartburn in a convenient effervescent form. Trusted for over 80 years.",
      "image": "https://yourwebsite.com/images/products/alka-seltzer-extra-strength-effervescent-tablets-24ct.png",
      "brand": { "@type": "Brand", "name": "Alka-Seltzer" },
      "sku": "DIG0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/alka-seltzer-extra-strength-effervescent-tablets",
        "priceCurrency": "USD",
        "price": "8.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Bayer Low Dose Aspirin 81mg Enteric Coated Tablets 32ct",
  shortDescription: "Helps support heart health and provides pain relief.",
  description: "Boost your heart health with Bayer Low Dose Aspirin. With 81mg of aspirin in enteric coated tablets, this 32ct pack provides effective pain relief while protecting your stomach. Trusted by doctors for cardiovascular support.",
  price: 4.99,
  imageKey: "/images/products/bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png",
  category: "Pain & Fever",
  subcategoryIndex: 0,
  item: "Oral Pain Relief",
  itemSlug: "oral-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Tablet",
  stock: 90,
  isFeatured: true,
  keywords: ["Bayer aspirin", "low dose aspirin", "heart health", "pain relief"],
  sku: "PAF0001",
  seo: {
    metaTitle: "Bayer Low Dose Aspirin - 32ct | Pain & Fever",
    metaDescription: "Boost your heart health with Bayer Low Dose Aspirin. With 81mg of aspirin in enteric coated tablets, this 32ct pack provides effective pain relief while protecting your stomach. Trusted by doctors for cardiovascular support.",
    metaKeywords: ["Bayer aspirin", "low dose aspirin", "heart health", "pain relief"],
    canonical: "/products/bayer-aspirin-low-dose-81mg-enteric-tablets",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Bayer Low Dose Aspirin 81mg Enteric Coated Tablets 32ct",
      "description": "Boost your heart health with Bayer Low Dose Aspirin. With 81mg of aspirin in enteric coated tablets, this 32ct pack provides effective pain relief while protecting your stomach. Trusted by doctors for cardiovascular support.",
      "image": "https://yourwebsite.com/images/products/bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png",
      "brand": { "@type": "Brand", "name": "Bayer" },
      "sku": "PAF0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/bayer-aspirin-low-dose-81mg-enteric-tablets",
        "priceCurrency": "USD",
        "price": "4.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Oral Pain Relief", url: "/categories/pain-fever/oral-pain-relief" }
    ]
  }
},
{
  name: "Mucinex Fast-Max Cold & Flu Severe 6oz",
  shortDescription: "Powerful relief for severe cold & flu symptoms.",
  description: "Relieve your cold and flu symptoms quickly with Mucinex Fast-Max Cold & Flu Severe. This fast-acting formula provides powerful relief from congestion, cough, body aches, sore throat, and fever.",
  price: 17.99,
  imageKey: "/images/products/mucinex-fast-max-nt-shft-cld-flu-6oz.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Liquid",
  stock: 50,
  isFeatured: true,
  keywords: ["Mucinex Fast-Max", "cold and flu relief", "severe cold medicine", "multi-symptom relief"],
  sku: "CFL0003",
  seo: {
    metaTitle: "Mucinex Fast-Max Cold & Flu Severe - 6oz | Cold & Flu Relief",
    metaDescription: "Relieve your cold and flu symptoms quickly with Mucinex Fast-Max Cold & Flu Severe. This fast-acting formula provides powerful relief from congestion, cough, body aches, sore throat, and fever.",
    metaKeywords: ["Mucinex Fast-Max", "cold and flu relief", "severe cold medicine", "multi-symptom relief"],
    canonical: "/products/mucinex-fast-max-cold-flu-severe",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Mucinex Fast-Max Cold & Flu Severe 6oz",
      "description": "Relieve your cold and flu symptoms quickly with Mucinex Fast-Max Cold & Flu Severe. This fast-acting formula provides powerful relief from congestion, cough, body aches, sore throat, and fever.",
      "image": "https://yourwebsite.com/images/products/mucinex-fast-max-nt-shft-cld-flu-6oz.png",
      "brand": { "@type": "Brand", "name": "Mucinex" },
      "sku": "CFL0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/mucinex-fast-max-cold-flu-severe",
        "priceCurrency": "USD",
        "price": "17.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Afrin Original Spray 30ml",
  shortDescription: "Instant relief from nasal congestion with long-lasting effects.",
  description: "Experience instant relief from nasal congestion with Afrin Original Spray 30ml. This powerful formula provides up to 12 hours of relief, allowing you to breathe freely day and night. Perfect for busy days or stuffy nights.",
  price: 14.99,
  imageKey: "/images/products/afrin-original-spray-30ml.png",
  category: "Nasal Care",
  subcategoryIndex: 1,
  item: "Nasal Sprays",
  itemSlug: "nasal-sprays",
  tagline: "Breathe Easy",
  dosageForm: "Spray",
  stock: 55,
  isFeatured: true,
  keywords: ["Afrin nasal spray", "nasal congestion relief", "Afrin Original", "fast congestion relief"],
  sku: "NAS0001",
  seo: {
    metaTitle: "Afrin Original Spray - 30ml | Nasal Care",
    metaDescription: "Experience instant relief from nasal congestion with Afrin Original Spray 30ml. This powerful formula provides up to 12 hours of relief, allowing you to breathe freely day and night. Perfect for busy days or stuffy nights.",
    metaKeywords: ["Afrin nasal spray", "nasal congestion relief", "Afrin Original", "fast congestion relief"],
    canonical: "/products/afrin-original-spray",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Afrin Original Spray 30ml",
      "description": "Experience instant relief from nasal congestion with Afrin Original Spray 30ml. This powerful formula provides up to 12 hours of relief, allowing you to breathe freely day and night. Perfect for busy days or stuffy nights.",
      "image": "https://yourwebsite.com/images/products/afrin-original-spray-30ml.png",
      "brand": { "@type": "Brand", "name": "Afrin" },
      "sku": "NAS0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/afrin-original-spray",
        "priceCurrency": "USD",
        "price": "14.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Nasal Care", url: "/categories/nasal-care" },
      { name: "Nasal Sprays", url: "/categories/nasal-care/nasal-sprays" }
    ]
  }
},
{
  name: "Coricidin HBP Maximum Strength Flu Tablets 24ct",
  shortDescription: "Fast and effective flu relief, safe for high blood pressure.",
  description: "Get fast and effective relief from flu symptoms with Coricidin HBP Maximum Strength Flu Tablets! Specially designed for individuals with high blood pressure, this 24-count pack relieves aches, fever, and congestion without affecting blood pressure.",
  price: 12.99,
  imageKey: "/images/products/coricidin-hbp-maximum-strength-flu-tablets-24ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Tablet",
  stock: 45,
  isFeatured: true,
  keywords: ["Coricidin HBP", "flu relief", "cold medicine for high blood pressure", "multi-symptom flu relief"],
  sku: "CFL0004",
  seo: {
    metaTitle: "Coricidin HBP Maximum Strength Flu Tablets - 24ct | Cold & Flu Relief",
    metaDescription: "Get fast and effective relief from flu symptoms with Coricidin HBP Maximum Strength Flu Tablets! Specially designed for individuals with high blood pressure, this 24-count pack relieves aches, fever, and congestion without affecting blood pressure.",
    metaKeywords: ["Coricidin HBP", "flu relief", "cold medicine for high blood pressure", "multi-symptom flu relief"],
    canonical: "/products/coricidin-hbp-maximum-strength-flu-tablets",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Coricidin HBP Maximum Strength Flu Tablets 24ct",
      "description": "Get fast and effective relief from flu symptoms with Coricidin HBP Maximum Strength Flu Tablets! Specially designed for individuals with high blood pressure, this 24-count pack relieves aches, fever, and congestion without affecting blood pressure.",
      "image": "https://yourwebsite.com/images/products/coricidin-hbp-maximum-strength-flu-tablets-24ct.png",
      "brand": { "@type": "Brand", "name": "Coricidin HBP" },
      "sku": "CFL0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/coricidin-hbp-maximum-strength-flu-tablets",
        "priceCurrency": "USD",
        "price": "12.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Dramamine All Day Less Drowsy Motion Sickness Relief 8ct",
  shortDescription: "Effective motion sickness relief with less drowsiness.",
  description: "Don't let motion sickness ruin your day! Dramamine All Day Less Drowsy Motion Sickness Relief 8ct provides effective relief from nausea and dizziness, helping you stay comfortable and focused throughout your journey.",
  price: 7.99,
  imageKey: "/images/products/dramamine-all-day-less-drowsy-motion-sickness-relief-8ct.png",
  category: "Motion Sickness Relief",
  subcategoryIndex: 0,
  item: "Motion Sickness Remedies",
  itemSlug: "motion-sickness-remedies",
  tagline: "Stay Comfortable",
  dosageForm: "Tablet",
  stock: 65,
  isFeatured: true,
  keywords: ["Dramamine", "motion sickness relief", "nausea relief", "less drowsy travel medicine"],
  sku: "MSR0001",
  seo: {
    metaTitle: "Dramamine All Day Less Drowsy Motion Sickness Relief - 8ct | Motion Sickness Relief",
    metaDescription: "Don't let motion sickness ruin your day! Dramamine All Day Less Drowsy Motion Sickness Relief 8ct provides effective relief from nausea and dizziness, helping you stay comfortable and focused throughout your journey.",
    metaKeywords: ["Dramamine", "motion sickness relief", "nausea relief", "less drowsy travel medicine"],
    canonical: "/products/dramamine-all-day-less-drowsy-motion-sickness-relief",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Dramamine All Day Less Drowsy Motion Sickness Relief 8ct",
      "description": "Don't let motion sickness ruin your day! Dramamine All Day Less Drowsy Motion Sickness Relief 8ct provides effective relief from nausea and dizziness, helping you stay comfortable and focused throughout your journey.",
      "image": "https://yourwebsite.com/images/products/dramamine-all-day-less-drowsy-motion-sickness-relief-8ct.png",
      "brand": { "@type": "Brand", "name": "Dramamine" },
      "sku": "MSR0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/dramamine-all-day-less-drowsy-motion-sickness-relief",
        "priceCurrency": "USD",
        "price": "7.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Motion Sickness Relief", url: "/categories/motion-sickness-relief" },
      { name: "Motion Sickness Remedies", url: "/categories/motion-sickness-relief/motion-sickness-remedies" }
    ]
  }
},
{
  name: "Coricidin HBP Chest Cold & Flu Tablets 10ct",
  shortDescription: "Safe cold and flu relief for individuals with high blood pressure.",
  description: "Easily tackle your chest cold and flu symptoms with Coricidin HBP Chest Cold & Flu Tablets. Specifically designed for those with high blood pressure, this 10-count pack provides fast and effective relief without affecting blood pressure levels.",
  price: 6.99,
  imageKey: "/images/products/coricidin-hbp-chest-cold-flu-tablets-10ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Tablet",
  stock: 50,
  isFeatured: true,
  keywords: ["Coricidin HBP", "chest cold relief", "flu relief", "cold medicine for high blood pressure"],
  sku: "CFL0005",
  seo: {
    metaTitle: "Coricidin HBP Chest Cold & Flu Tablets - 10ct | Cold & Flu Relief",
    metaDescription: "Easily tackle your chest cold and flu symptoms with Coricidin HBP Chest Cold & Flu Tablets. Specifically designed for those with high blood pressure, this 10-count pack provides fast and effective relief without affecting blood pressure levels.",
    metaKeywords: ["Coricidin HBP", "chest cold relief", "flu relief", "cold medicine for high blood pressure"],
    canonical: "/products/coricidin-hbp-chest-cold-flu-tablets",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Coricidin HBP Chest Cold & Flu Tablets 10ct",
      "description": "Easily tackle your chest cold and flu symptoms with Coricidin HBP Chest Cold & Flu Tablets. Specifically designed for those with high blood pressure, this 10-count pack provides fast and effective relief without affecting blood pressure levels.",
      "image": "https://yourwebsite.com/images/products/coricidin-hbp-chest-cold-flu-tablets-10ct.png",
      "brand": { "@type": "Brand", "name": "Coricidin HBP" },
      "sku": "CFL0005",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/coricidin-hbp-chest-cold-flu-tablets",
        "priceCurrency": "USD",
        "price": "6.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Children's Tylenol Pain & Fever 160mg Acetaminophen Bubblegum Chewable Tablets 24ct",
  shortDescription: "Bubblegum-flavored chewable tablets for kids' pain and fever relief.",
  description: "Relieve your child's pain and fever with Children's Tylenol 160mg Acetaminophen Bubblegum Chewable Tablets. Specially designed for kids, these chewable tablets offer fast, effective relief with a great bubblegum taste.",
  price: 11.99,
  imageKey: "/images/products/childrens-tylenol-pain-fever-160mg-acetaminophen-bubblegum-chewable-tablets-24ct.png",
  category: "Pain & Fever",
  subcategoryIndex: 1,
  item: "Pain & Fever Relievers",
  itemSlug: "pain-fever-relievers",
  tagline: "Pain-Free Living",
  dosageForm: "Tablet",
  stock: 70,
  isFeatured: true,
  keywords: ["Children's Tylenol", "kids pain relief", "acetaminophen chewable tablets", "fever reducer for children"],
  sku: "PAF0002",
  seo: {
    metaTitle: "Children's Tylenol Pain & Fever - 24ct | Pain & Fever Relief",
    metaDescription: "Relieve your child's pain and fever with Children's Tylenol 160mg Acetaminophen Bubblegum Chewable Tablets. Specially designed for kids, these chewable tablets offer fast, effective relief with a great bubblegum taste.",
    metaKeywords: ["Children's Tylenol", "kids pain relief", "acetaminophen chewable tablets", "fever reducer for children"],
    canonical: "/products/childrens-tylenol-pain-fever",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Children's Tylenol Pain & Fever 160mg Acetaminophen Bubblegum Chewable Tablets 24ct",
      "description": "Relieve your child's pain and fever with Children's Tylenol 160mg Acetaminophen Bubblegum Chewable Tablets. Specially designed for kids, these chewable tablets offer fast, effective relief with a great bubblegum taste.",
      "image": "https://yourwebsite.com/images/products/childrens-tylenol-pain-fever-160mg-acetaminophen-bubblegum-chewable-tablets-24ct.png",
      "brand": { "@type": "Brand", "name": "Children's Tylenol" },
      "sku": "PAF0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/childrens-tylenol-pain-fever",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Pain & Fever Relievers", url: "/categories/pain-fever/pain-fever-relievers" }
    ]
  }
},
{
  name: "Children's Tylenol Cold & Cough Runny Nose Oral Suspension Grape 4oz",
  shortDescription: "Grape-flavored cold and cough relief for kids.",
  description: "Stay ahead of your child's cold and cough symptoms with Children's Tylenol Cold & Cough Runny Nose Oral Suspension Grape. This effective formula provides relief from sneezing, congestion, and cough in a great-tasting grape flavor.",
  price: 11.99,
  imageKey: "/images/products/childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape-4oz.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Fast-Acting Relief",
  dosageForm: "Liquid",
  stock: 65,
  isFeatured: true,
  keywords: ["Children's Tylenol cold & cough", "kids cold medicine", "grape oral suspension", "runny nose relief"],
  sku: "CFL0006",
  seo: {
    metaTitle: "Children's Tylenol Cold & Cough - 4oz | Cold & Flu Relief",
    metaDescription: "Stay ahead of your child's cold and cough symptoms with Children's Tylenol Cold & Cough Runny Nose Oral Suspension Grape. This effective formula provides relief from sneezing, congestion, and cough in a great-tasting grape flavor.",
    metaKeywords: ["Children's Tylenol cold & cough", "kids cold medicine", "grape oral suspension", "runny nose relief"],
    canonical: "/products/childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Children's Tylenol Cold & Cough Runny Nose Oral Suspension Grape 4oz",
      "description": "Stay ahead of your child's cold and cough symptoms with Children's Tylenol Cold & Cough Runny Nose Oral Suspension Grape. This effective formula provides relief from sneezing, congestion, and cough in a great-tasting grape flavor.",
      "image": "https://yourwebsite.com/images/products/childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape-4oz.png",
      "brand": { "@type": "Brand", "name": "Children's Tylenol" },
      "sku": "CFL0006",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Cough & Cold Remedies", url: "/categories/cold-flu-relief/cough-cold-remedies" }
    ]
  }
},
{
  name: "Pepto Bismol Maximum Strength Liquid 8oz",
  shortDescription: "Fast relief for nausea, heartburn, indigestion, and upset stomach.",
  description: "Experience fast relief from stomach discomfort with Pepto Bismol Maximum Strength Liquid. Its powerful formula helps soothe nausea, heartburn, indigestion, and upset stomach, providing multi-symptom digestive relief.",
  price: 9.99,
  imageKey: "/images/products/pepto-bismol-5-symptom-relief-original-liquid-8oz.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Liquid",
  stock: 75,
  isFeatured: true,
  keywords: ["Pepto Bismol", "stomach relief", "nausea relief", "digestive aid"],
  sku: "DIG0005",
  seo: {
    metaTitle: "Pepto Bismol Maximum Strength Liquid - 8oz | Digestive Health",
    metaDescription: "Experience fast relief from stomach discomfort with Pepto Bismol Maximum Strength Liquid. Its powerful formula helps soothe nausea, heartburn, indigestion, and upset stomach, providing multi-symptom digestive relief.",
    metaKeywords: ["Pepto Bismol", "stomach relief", "nausea relief", "digestive aid"],
    canonical: "/products/pepto-bismol-5-symptom-relief-original-liquid",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Pepto Bismol Maximum Strength Liquid 8oz",
      "description": "Experience fast relief from stomach discomfort with Pepto Bismol Maximum Strength Liquid. Its powerful formula helps soothe nausea, heartburn, indigestion, and upset stomach, providing multi-symptom digestive relief.",
      "image": "https://yourwebsite.com/images/products/pepto-bismol-5-symptom-relief-original-liquid-8oz.png",
      "brand": { "@type": "Brand", "name": "Pepto Bismol" },
      "sku": "DIG0005",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pepto-bismol-5-symptom-relief-original-liquid",
        "priceCurrency": "USD",
        "price": "9.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Voltaren Topical Gel 1% 50g",
  shortDescription: "Powerful topical gel for arthritis and joint pain relief.",
  description: "Get fast and effective pain relief with Voltaren Topical Gel. This 1% gel comes in a convenient 50g tube, making it perfect for on-the-go use. The powerful formula works to reduce inflammation and provide targeted relief, getting you back on your feet in no time.",
  price: 14.99,
  imageKey: "/images/products/voltaren-topical-gel-1-50g.png",
  category: "Pain & Fever",
  subcategoryIndex: 1,
  item: "Topical Pain Relief",
  itemSlug: "topical-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Gel",
  stock: 60,
  isFeatured: true,
  keywords: ["Voltaren gel", "arthritis pain relief", "topical pain relief", "joint pain gel"],
  sku: "PAF0003",
  seo: {
    metaTitle: "Voltaren Topical Gel - 50g | Pain & Fever",
    metaDescription: "Get fast and effective pain relief with Voltaren Topical Gel. This 1% gel comes in a convenient 50g tube, making it perfect for on-the-go use. The powerful formula works to reduce inflammation and provide targeted relief, getting you back on your feet in no time.",
    metaKeywords: ["Voltaren gel", "arthritis pain relief", "topical pain relief", "joint pain gel"],
    canonical: "/products/voltaren-topical-gel-1-50g",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Voltaren Topical Gel 1% 50g",
      "description": "Get fast and effective pain relief with Voltaren Topical Gel. This 1% gel comes in a convenient 50g tube, making it perfect for on-the-go use. The powerful formula works to reduce inflammation and provide targeted relief, getting you back on your feet in no time.",
      "image": "https://yourwebsite.com/images/products/voltaren-topical-gel-1-50g.png",
      "brand": { "@type": "Brand", "name": "Voltaren" },
      "sku": "PAF0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/voltaren-topical-gel-1-50g",
        "priceCurrency": "USD",
        "price": "14.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Topical Pain Relief", url: "/categories/pain-fever/topical-pain-relief" }
    ]
  }
},
{
  name: "Pepto Bismol Kids Gummies 24ct",
  shortDescription: "Gentle digestive relief for kids in a tasty gummy form.",
  description: "Take care of your child's digestive health with Pepto Bismol Kids Gummies. These easy-to-use gummies are made with the highest quality ingredients to provide effective relief from stomach discomfort, nausea, and indigestion in a kid-friendly taste.",
  price: 11.99,
  imageKey: "/images/products/pepto-bismol-kids-gummies-24ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Gummies",
  stock: 55,
  isFeatured: true,
  keywords: ["Pepto Bismol Kids", "digestive relief for kids", "kids nausea relief", "stomach discomfort remedy"],
  sku: "DIG0006",
  seo: {
    metaTitle: "Pepto Bismol Kids Gummies - 24ct | Digestive Health",
    metaDescription: "Take care of your child's digestive health with Pepto Bismol Kids Gummies. These easy-to-use gummies are made with the highest quality ingredients to provide effective relief from stomach discomfort, nausea, and indigestion in a kid-friendly taste.",
    metaKeywords: ["Pepto Bismol Kids", "digestive relief for kids", "kids nausea relief", "stomach discomfort remedy"],
    canonical: "/products/pepto-bismol-kids-gummies-24ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Pepto Bismol Kids Gummies 24ct",
      "description": "Take care of your child's digestive health with Pepto Bismol Kids Gummies. These easy-to-use gummies are made with the highest quality ingredients to provide effective relief from stomach discomfort, nausea, and indigestion in a kid-friendly taste.",
      "image": "https://yourwebsite.com/images/products/pepto-bismol-kids-gummies-24ct.png",
      "brand": { "@type": "Brand", "name": "Pepto Bismol" },
      "sku": "DIG0006",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pepto-bismol-kids-gummies-24ct",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Pepcid Max Tablet Original 8ct",
  shortDescription: "Maximum strength heartburn relief in an easy-to-swallow tablet.",
  description: "Relieve heartburn and acid indigestion with Pepcid Max Tablet Original 8ct! Our powerful formula contains 20mg of famotidine, providing fast and effective relief. Keep these convenient tablets on hand for on-the-go relief so you can enjoy your favorite foods without discomfort.",
  price: 8.99,
  imageKey: "/images/products/pepcid-max-tablet-original-8ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Tablet",
  stock: 70,
  isFeatured: true,
  keywords: ["Pepcid Max", "heartburn relief", "acid indigestion remedy", "famotidine tablets"],
  sku: "DIG0007",
  seo: {
    metaTitle: "Pepcid Max Tablet - 8ct | Digestive Health",
    metaDescription: "Relieve heartburn and acid indigestion with Pepcid Max Tablet Original 8ct! Our powerful formula contains 20mg of famotidine, providing fast and effective relief. Keep these convenient tablets on hand for on-the-go relief so you can enjoy your favorite foods without discomfort.",
    metaKeywords: ["Pepcid Max", "heartburn relief", "acid indigestion remedy", "famotidine tablets"],
    canonical: "/products/pepcid-max-tablet-original-8ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Pepcid Max Tablet Original 8ct",
      "description": "Relieve heartburn and acid indigestion with Pepcid Max Tablet Original 8ct! Our powerful formula contains 20mg of famotidine, providing fast and effective relief. Keep these convenient tablets on hand for on-the-go relief so you can enjoy your favorite foods without discomfort.",
      "image": "https://yourwebsite.com/images/products/pepcid-max-tablet-original-8ct.png",
      "brand": { "@type": "Brand", "name": "Pepcid Max" },
      "sku": "DIG0007",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pepcid-max-tablet-original-8ct",
        "priceCurrency": "USD",
        "price": "8.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Xyzal 24HR Allergy 5mg Tablet 10ct",
  shortDescription: "Powerful 24-hour allergy relief with just one tablet.",
  description: "Relieve your allergy symptoms with Xyzal 24HR Allergy 5mg Tablet 10ct. This powerful medication provides 24 hours of relief from sneezing, runny nose, and itchy eyes. Say goodbye to allergies and hello to clear, comfortable breathing.",
  price: 11.99,
  imageKey: "/images/products/xyzal-24hr-allergy-5mg-tablet-10ct.png",
  category: "Allergy Care",
  subcategoryIndex: 0,
  item: "Antihistamines",
  itemSlug: "antihistamines",
  tagline: "Breathe Easy",
  dosageForm: "Tablet",
  stock: 65,
  isFeatured: true,
  keywords: ["Xyzal allergy tablets", "24-hour allergy relief", "antihistamine tablets", "Xyzal 5mg"],
  sku: "ALL0004",
  seo: {
    metaTitle: "Xyzal 24HR Allergy - 10ct | Allergy Care",
    metaDescription: "Relieve your allergy symptoms with Xyzal 24HR Allergy 5mg Tablet 10ct. This powerful medication provides 24 hours of relief from sneezing, runny nose, and itchy eyes. Say goodbye to allergies and hello to clear, comfortable breathing.",
    metaKeywords: ["Xyzal allergy tablets", "24-hour allergy relief", "antihistamine tablets", "Xyzal 5mg"],
    canonical: "/products/xyzal-24hr-allergy-5mg-tablet-10ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Xyzal 24HR Allergy 5mg Tablet 10ct",
      "description": "Relieve your allergy symptoms with Xyzal 24HR Allergy 5mg Tablet 10ct. This powerful medication provides 24 hours of relief from sneezing, runny nose, and itchy eyes. Say goodbye to allergies and hello to clear, comfortable breathing.",
      "image": "https://yourwebsite.com/images/products/xyzal-24hr-allergy-5mg-tablet-10ct.png",
      "brand": { "@type": "Brand", "name": "Xyzal" },
      "sku": "ALL0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/xyzal-24hr-allergy-5mg-tablet-10ct",
        "priceCurrency": "USD",
        "price": "11.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Antihistamines", url: "/categories/allergy-care/antihistamines" }
    ]
  }
},
{
  name: "Bengay Ultra Strength Cream 2oz",
  shortDescription: "Ultra-strength pain relief for sore muscles and joints.",
  description: "Feel the ultra strength of Bengay cream! Relieve your aches and pains with this powerful 2oz cream. Perfect for targeted pain relief, Bengay will help you continue your activities without discomfort. Get back to doing what you love with Bengay Ultra Strength Cream.",
  price: 7.99,
  imageKey: "/images/products/bengay-ultra-strength-cream-2oz.png",
  category: "Pain & Fever",
  subcategoryIndex: 1,
  item: "Topical Pain Relief",
  itemSlug: "topical-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Cream",
  stock: 80,
  isFeatured: true,
  keywords: ["Bengay Ultra Strength", "pain relief cream", "muscle relief", "joint pain cream"],
  sku: "PAF0004",
  seo: {
    metaTitle: "Bengay Ultra Strength Cream - 2oz | Pain & Fever",
    metaDescription: "Feel the ultra strength of Bengay cream! Relieve your aches and pains with this powerful 2oz cream. Perfect for targeted pain relief, Bengay will help you continue your activities without discomfort. Get back to doing what you love with Bengay Ultra Strength Cream.",
    metaKeywords: ["Bengay Ultra Strength", "pain relief cream", "muscle relief", "joint pain cream"],
    canonical: "/products/bengay-ultra-strength-cream-2oz",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Bengay Ultra Strength Cream 2oz",
      "description": "Feel the ultra strength of Bengay cream! Relieve your aches and pains with this powerful 2oz cream. Perfect for targeted pain relief, Bengay will help you continue your activities without discomfort. Get back to doing what you love with Bengay Ultra Strength Cream.",
      "image": "https://yourwebsite.com/images/products/bengay-ultra-strength-cream-2oz.png",
      "brand": { "@type": "Brand", "name": "Bengay" },
      "sku": "PAF0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/bengay-ultra-strength-cream-2oz",
        "priceCurrency": "USD",
        "price": "7.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Topical Pain Relief", url: "/categories/pain-fever/topical-pain-relief" }
    ]
  }
},
{
  name: "Cepacol Extra Strength Sore Throat Honey Lemon Lozenges 16ct",
  shortDescription: "Extra strength lozenges for soothing sore throat pain.",
  description: "Soothe your sore throat with Cepacol Extra Strength Sore Throat Honey Lemon Lozenges. These lozenges are made with pure honey and natural lemon flavor to provide fast and effective relief from sore throat symptoms.",
  price: 4.99,
  imageKey: "/images/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct.png",
  category: "Cough & Throat Relief",
  subcategoryIndex: 0,
  item: "Sore Throat Relief",
  itemSlug: "sore-throat-relief",
  tagline: "Soothing Relief",
  dosageForm: "Gummies",
  stock: 85,
  isFeatured: true,
  keywords: ["Cepacol lozenges", "sore throat relief", "honey lemon lozenges", "Cepacol extra strength"],
  sku: "CTR0001",
  seo: {
    metaTitle: "Cepacol Extra Strength Sore Throat Honey Lemon Lozenges - 16ct | Cough & Throat Relief",
    metaDescription: "Soothe your sore throat with Cepacol Extra Strength Sore Throat Honey Lemon Lozenges. These lozenges are made with pure honey and natural lemon flavor to provide fast and effective relief from sore throat symptoms.",
    metaKeywords: ["Cepacol lozenges", "sore throat relief", "honey lemon lozenges", "Cepacol extra strength"],
    canonical: "/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Cepacol Extra Strength Sore Throat Honey Lemon Lozenges 16ct",
      "description": "Soothe your sore throat with Cepacol Extra Strength Sore Throat Honey Lemon Lozenges. These lozenges are made with pure honey and natural lemon flavor to provide fast and effective relief from sore throat symptoms.",
      "image": "https://yourwebsite.com/images/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct.png",
      "brand": { "@type": "Brand", "name": "Cepacol" },
      "sku": "CTR0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct",
        "priceCurrency": "USD",
        "price": "4.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cough & Throat Relief", url: "/categories/cough-throat-relief" },
      { name: "Sore Throat Relief", url: "/categories/cough-throat-relief/sore-throat-relief" }
    ]
  }
},
{
  name: "Prilosec OTC Heartburn Relief and Acid Reducer Tablets 14ct",
  shortDescription: "24-hour heartburn relief with just one tablet a day.",
  description: "Prilosec OTC provides fast and effective relief from heartburn and acid reflux with just one tablet a day. Say goodbye to uncomfortable and disruptive symptoms, and hello to feeling comfortable and at ease after meals.",
  price: 17.99,
  imageKey: "/images/products/prilosec-otc-heartburn-relief-and-acid-reducer-tablets-14ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Tablet",
  stock: 60,
  isFeatured: true,
  keywords: ["Prilosec OTC", "heartburn relief", "acid reflux treatment", "Prilosec 14ct"],
  sku: "DIG0008",
  seo: {
    metaTitle: "Prilosec OTC Heartburn Relief and Acid Reducer Tablets - 14ct | Digestive Health",
    metaDescription: "Prilosec OTC provides fast and effective relief from heartburn and acid reflux with just one tablet a day. Say goodbye to uncomfortable and disruptive symptoms, and hello to feeling comfortable and at ease after meals.",
    metaKeywords: ["Prilosec OTC", "heartburn relief", "acid reflux treatment", "Prilosec 14ct"],
    canonical: "/products/prilosec-otc-heartburn-relief-and-acid-reducer-tablets-14ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Prilosec OTC Heartburn Relief and Acid Reducer Tablets 14ct",
      "description": "Prilosec OTC provides fast and effective relief from heartburn and acid reflux with just one tablet a day. Say goodbye to uncomfortable and disruptive symptoms, and hello to feeling comfortable and at ease after meals.",
      "image": "https://yourwebsite.com/images/products/prilosec-otc-heartburn-relief-and-acid-reducer-tablets-14ct.png",
      "brand": { "@type": "Brand", "name": "Prilosec OTC" },
      "sku": "DIG0008",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/prilosec-otc-heartburn-relief-and-acid-reducer-tablets-14ct",
        "priceCurrency": "USD",
        "price": "17.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Unisom SleepTabs Doxylamine Succinate Tablets 16ct",
  shortDescription: "Helps you fall asleep fast and wake up refreshed.",
  description: "Enhance your sleep with Unisom SleepTabs! Our 16ct tablets contain Doxylamine Succinate, a powerful ingredient that helps you fall asleep faster and stay asleep longer. Wake up feeling refreshed and ready to take on the day.",
  price: 8.99,
  imageKey: "/images/products/unisom-sleeptabs-doxylamine-succinate-tablets-16ct.png",
  category: "Sleep Aids",
  subcategoryIndex: 0,
  item: "OTC Sleep Tablets",
  itemSlug: "otc-sleep-tablets",
  tagline: "Restful Nights",
  dosageForm: "Tablet",
  stock: 65,
  isFeatured: true,
  keywords: ["Unisom SleepTabs", "sleep aid", "doxylamine succinate", "OTC sleep tablets"],
  sku: "SLE0002",
  seo: {
    metaTitle: "Unisom SleepTabs Doxylamine Succinate Tablets - 16ct | Sleep Aids",
    metaDescription: "Enhance your sleep with Unisom SleepTabs! Our 16ct tablets contain Doxylamine Succinate, a powerful ingredient that helps you fall asleep faster and stay asleep longer. Wake up feeling refreshed and ready to take on the day.",
    metaKeywords: ["Unisom SleepTabs", "sleep aid", "doxylamine succinate", "OTC sleep tablets"],
    canonical: "/products/unisom-sleeptabs-doxylamine-succinate-tablets-16ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Unisom SleepTabs Doxylamine Succinate Tablets 16ct",
      "description": "Enhance your sleep with Unisom SleepTabs! Our 16ct tablets contain Doxylamine Succinate, a powerful ingredient that helps you fall asleep faster and stay asleep longer. Wake up feeling refreshed and ready to take on the day.",
      "image": "https://yourwebsite.com/images/products/unisom-sleeptabs-doxylamine-succinate-tablets-16ct.png",
      "brand": { "@type": "Brand", "name": "Unisom" },
      "sku": "SLE0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/unisom-sleeptabs-doxylamine-succinate-tablets-16ct",
        "priceCurrency": "USD",
        "price": "8.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Sleep Aids", url: "/categories/sleep-aids" },
      { name: "OTC Sleep Tablets", url: "/categories/sleep-aids/otc-sleep-tablets" }
    ]
  }
},
{
  name: "Benadryl Allergy Dye-Free LiquiGels 24ct",
  shortDescription: "Fast-acting allergy relief in a dye-free liqui-gel formula.",
  description: "Experience fast-acting relief from your allergies with Benadryl Allergy Dye-Free LiquiGels 24ct. These dye-free liqui-gels provide effective relief from common allergy symptoms such as sneezing, runny nose, and itchy eyes.",
  price: 10.99,
  imageKey: "/images/products/benadryl-allergy-dye-free-liquigels-24ct.png",
  category: "Allergy Care",
  subcategoryIndex: 0,
  item: "Antihistamines",
  itemSlug: "antihistamines",
  tagline: "Breathe Easy",
  dosageForm: "Capsule",
  stock: 60,
  isFeatured: true,
  keywords: ["Benadryl Allergy", "dye-free liquigels", "fast allergy relief", "antihistamine capsules"],
  sku: "ALL0005",
  seo: {
    metaTitle: "Benadryl Allergy Dye-Free LiquiGels - 24ct | Allergy Care",
    metaDescription: "Experience fast-acting relief from your allergies with Benadryl Allergy Dye-Free LiquiGels 24ct. These dye-free liqui-gels provide effective relief from common allergy symptoms such as sneezing, runny nose, and itchy eyes.",
    metaKeywords: ["Benadryl Allergy", "dye-free liquigels", "fast allergy relief", "antihistamine capsules"],
    canonical: "/products/benadryl-allergy-dye-free-liquigels-24ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Benadryl Allergy Dye-Free LiquiGels 24ct",
      "description": "Experience fast-acting relief from your allergies with Benadryl Allergy Dye-Free LiquiGels 24ct. These dye-free liqui-gels provide effective relief from common allergy symptoms such as sneezing, runny nose, and itchy eyes.",
      "image": "https://yourwebsite.com/images/products/benadryl-allergy-dye-free-liquigels-24ct.png",
      "brand": { "@type": "Brand", "name": "Benadryl" },
      "sku": "ALL0005",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/benadryl-allergy-dye-free-liquigels-24ct",
        "priceCurrency": "USD",
        "price": "10.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Antihistamines", url: "/categories/allergy-care/antihistamines" }
    ]
  }
},
{
  name: "Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor 4oz",
  shortDescription: "Relieves chest congestion and stuffy nose in children.",
  description: "Relieve your child's cold and flu symptoms with Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor. This liquid medicine is specially formulated to help break up mucus and clear nasal congestion, providing comfort for easier breathing.",
  price: 15.99,
  imageKey: "/images/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Fast-Acting Relief",
  dosageForm: "Liquid",
  stock: 55,
  isFeatured: true,
  keywords: ["Children's Mucinex", "kids cold medicine", "chest congestion relief", "stuffy nose treatment"],
  sku: "CFL0007",
  seo: {
    metaTitle: "Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor - 4oz | Cold & Flu Relief",
    metaDescription: "Relieve your child's cold and flu symptoms with Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor. This liquid medicine is specially formulated to help break up mucus and clear nasal congestion, providing comfort for easier breathing.",
    metaKeywords: ["Children's Mucinex", "kids cold medicine", "chest congestion relief", "stuffy nose treatment"],
    canonical: "/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor 4oz",
      "description": "Relieve your child's cold and flu symptoms with Children's Mucinex Stuffy Nose Chest Congestion Very Berry Flavor. This liquid medicine is specially formulated to help break up mucus and clear nasal congestion, providing comfort for easier breathing.",
      "image": "https://yourwebsite.com/images/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png",
      "brand": { "@type": "Brand", "name": "Children's Mucinex" },
      "sku": "CFL0007",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz",
        "priceCurrency": "USD",
        "price": "15.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Cough & Cold Remedies", url: "/categories/cold-flu-relief/cough-cold-remedies" }
    ]
  }
},
{
  name: "Vicks VapoRub Cough Suppressant Topical Ointment 50g",
  shortDescription: "Soothing cough and congestion relief with a menthol formula.",
  description: "Experience soothing relief from coughs and congestion with Vicks VapoRub. This topical ointment acts as a powerful cough suppressant while providing cooling relief to your chest and throat. With its blend of therapeutic ingredients, this 50g ointment is an essential addition to any medicine cabinet.",
  price: 7.99,
  imageKey: "/images/products/vicks-vaporub-cough-suppressant-topical-ointment-50g.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Fast-Acting Relief",
  dosageForm: "Ointment",
  stock: 75,
  isFeatured: true,
  keywords: ["Vicks VapoRub", "cough suppressant", "congestion relief", "menthol ointment"],
  sku: "CFL0008",
  seo: {
    metaTitle: "Vicks VapoRub Cough Suppressant Topical Ointment - 50g | Cold & Flu Relief",
    metaDescription: "Experience soothing relief from coughs and congestion with Vicks VapoRub. This topical ointment acts as a powerful cough suppressant while providing cooling relief to your chest and throat. With its blend of therapeutic ingredients, this 50g ointment is an essential addition to any medicine cabinet.",
    metaKeywords: ["Vicks VapoRub", "cough suppressant", "congestion relief", "menthol ointment"],
    canonical: "/products/vicks-vaporub-cough-suppressant-topical-ointment-50g",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Vicks VapoRub Cough Suppressant Topical Ointment 50g",
      "description": "Experience soothing relief from coughs and congestion with Vicks VapoRub. This topical ointment acts as a powerful cough suppressant while providing cooling relief to your chest and throat. With its blend of therapeutic ingredients, this 50g ointment is an essential addition to any medicine cabinet.",
      "image": "https://yourwebsite.com/images/products/vicks-vaporub-cough-suppressant-topical-ointment-50g.png",
      "brand": { "@type": "Brand", "name": "Vicks" },
      "sku": "CFL0008",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/vicks-vaporub-cough-suppressant-topical-ointment-50g",
        "priceCurrency": "USD",
        "price": "7.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Cough & Cold Remedies", url: "/categories/cold-flu-relief/cough-cold-remedies" }
    ]
  }
},
{
  name: "Nature Made Multi Complete w/Iron Tablets 130ct",
  shortDescription: "Daily multivitamin with iron for overall health support.",
  description: "Boost your health with Nature Made Multi Complete w/Iron Tablets! This essential supplement provides a complete blend of vitamins and minerals, including iron, to support your overall well-being. With just one tablet a day, you can feel confident in meeting your daily nutrient needs.",
  price: 12.49,
  imageKey: "/images/products/nature-made-multi-complete-w-iron-tablets-130ct.png",
  category: "Vitamins & Supplements",
  subcategoryIndex: 0,
  item: "Multivitamins",
  itemSlug: "multivitamins",
  tagline: "Daily Power Boost",
  dosageForm: "Tablet",
  stock: 65,
  isFeatured: true,
  keywords: ["Nature Made multivitamin", "vitamins with iron", "daily health supplement", "multivitamin tablets"],
  sku: "VIT0001",
  seo: {
    metaTitle: "Nature Made Multi Complete w/Iron Tablets - 130ct | Vitamins & Supplements",
    metaDescription: "Boost your health with Nature Made Multi Complete w/Iron Tablets! This essential supplement provides a complete blend of vitamins and minerals, including iron, to support your overall well-being. With just one tablet a day, you can feel confident in meeting your daily nutrient needs.",
    metaKeywords: ["Nature Made multivitamin", "vitamins with iron", "daily health supplement", "multivitamin tablets"],
    canonical: "/products/nature-made-multi-complete-w-iron-tablets-130ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Nature Made Multi Complete w/Iron Tablets 130ct",
      "description": "Boost your health with Nature Made Multi Complete w/Iron Tablets! This essential supplement provides a complete blend of vitamins and minerals, including iron, to support your overall well-being. With just one tablet a day, you can feel confident in meeting your daily nutrient needs.",
      "image": "https://yourwebsite.com/images/products/nature-made-multi-complete-w-iron-tablets-130ct.png",
      "brand": { "@type": "Brand", "name": "Nature Made" },
      "sku": "VIT0001",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/nature-made-multi-complete-w-iron-tablets-130ct",
        "priceCurrency": "USD",
        "price": "12.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Vitamins & Supplements", url: "/categories/vitamins-supplements" },
      { name: "Multivitamins", url: "/categories/vitamins-supplements/multivitamins" }
    ]
  }
},
{
  name: "Zicam Cold Remedy RapidMelt Cherry Flavor Tablets 25ct",
  shortDescription: "Shorten colds with fast-dissolving cherry-flavored tablets.",
  description: "Conquer colds with Zicam Cold Remedy! Our RapidMelt Cherry Flavor Tablets provide fast relief from cold symptoms. Experience the soothing effects of cherry while our powerful formula works to shorten your cold.",
  price: 13.99,
  imageKey: "/images/products/zicam-cold-remedy-rapidmelt-cherry-flavor-tablets-25ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Fast-Acting Relief",
  dosageForm: "Tablet",
  stock: 55,
  isFeatured: true,
  keywords: ["Zicam cold remedy", "RapidMelt cherry tablets", "shorten colds", "cold symptom relief"],
  sku: "CFL0009",
  seo: {
    metaTitle: "Zicam Cold Remedy RapidMelt Cherry Flavor Tablets - 25ct | Cold & Flu Relief",
    metaDescription: "Conquer colds with Zicam Cold Remedy! Our RapidMelt Cherry Flavor Tablets provide fast relief from cold symptoms. Experience the soothing effects of cherry while our powerful formula works to shorten your cold.",
    metaKeywords: ["Zicam cold remedy", "RapidMelt cherry tablets", "shorten colds", "cold symptom relief"],
    canonical: "/products/zicam-cold-remedy-rapidmelt-cherry-flavor-tablets-25ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Zicam Cold Remedy RapidMelt Cherry Flavor Tablets 25ct",
      "description": "Conquer colds with Zicam Cold Remedy! Our RapidMelt Cherry Flavor Tablets provide fast relief from cold symptoms. Experience the soothing effects of cherry while our powerful formula works to shorten your cold.",
      "image": "https://yourwebsite.com/images/products/zicam-cold-remedy-rapidmelt-cherry-flavor-tablets-25ct.png",
      "brand": { "@type": "Brand", "name": "Zicam" },
      "sku": "CFL0009",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/zicam-cold-remedy-rapidmelt-cherry-flavor-tablets-25ct",
        "priceCurrency": "USD",
        "price": "13.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Cough & Cold Remedies", url: "/categories/cold-flu-relief/cough-cold-remedies" }
    ]
  }
},
{
  name: "MegaRed Omega-3 350mg Krill Oil Softgels 60ct",
  shortDescription: "Supports heart health with high-absorption Omega-3 krill oil.",
  description: "Boost your heart health with MegaRed Omega-3 350mg Krill Oil Softgels! Made with pure krill oil, each softgel provides powerful omega-3 fatty acids to support cardiovascular function. Experience the benefits of this premium supplement and feel confident in your heart health.",
  price: 28.99,
  imageKey: "/images/products/megared-omega-3-350mg-krill-oil-softgels-60ct.png",
  category: "Vitamins & Supplements",
  subcategoryIndex: 3,
  item: "Omega-3 Supplements",
  itemSlug: "omega-3-supplements",
  tagline: "Daily Power Boost",
  dosageForm: "Capsule",
  stock: 40,
  isFeatured: true,
  keywords: ["MegaRed Omega-3", "krill oil softgels", "heart health supplement", "omega-3 fatty acids"],
  sku: "VIT0002",
  seo: {
    metaTitle: "MegaRed Omega-3 350mg Krill Oil Softgels - 60ct | Vitamins & Supplements",
    metaDescription: "Boost your heart health with MegaRed Omega-3 350mg Krill Oil Softgels! Made with pure krill oil, each softgel provides powerful omega-3 fatty acids to support cardiovascular function. Experience the benefits of this premium supplement and feel confident in your heart health.",
    metaKeywords: ["MegaRed Omega-3", "krill oil softgels", "heart health supplement", "omega-3 fatty acids"],
    canonical: "/products/megared-omega-3-350mg-krill-oil-softgels-60ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "MegaRed Omega-3 350mg Krill Oil Softgels 60ct",
      "description": "Boost your heart health with MegaRed Omega-3 350mg Krill Oil Softgels! Made with pure krill oil, each softgel provides powerful omega-3 fatty acids to support cardiovascular function. Experience the benefits of this premium supplement and feel confident in your heart health.",
      "image": "https://yourwebsite.com/images/products/megared-omega-3-350mg-krill-oil-softgels-60ct.png",
      "brand": { "@type": "Brand", "name": "MegaRed" },
      "sku": "VIT0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/megared-omega-3-350mg-krill-oil-softgels-60ct",
        "priceCurrency": "USD",
        "price": "28.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Vitamins & Supplements", url: "/categories/vitamins-supplements" },
      { name: "Omega-3 Supplements", url: "/categories/vitamins-supplements/omega-3-supplements" }
    ]
  }
},
{
  name: "Move Free Advanced Plus Joint Health with MSM Tablets 120ct",
  shortDescription: "Supports joint health, mobility, and flexibility with MSM.",
  description: "Boost your joint health and mobility with Move Free Advanced Plus Joint Health Tablets! Made with MSM, these 120ct tablets provide the essential nutrients your joints need for improved flexibility and range of motion.",
  price: 29.99,
  imageKey: "/images/products/move-free-advanced-plus-joint-health-with-msm-tablets-120ct.png",
  category: "Vitamins & Supplements",
  subcategoryIndex: 4,
  item: "Joint Health",
  itemSlug: "joint-health",
  tagline: "Daily Power Boost",
  dosageForm: "Tablet",
  stock: 50,
  isFeatured: true,
  keywords: ["Move Free Advanced", "joint health supplement", "MSM tablets", "mobility support"],
  sku: "VIT0003",
  seo: {
    metaTitle: "Move Free Advanced Plus Joint Health with MSM Tablets - 120ct | Vitamins & Supplements",
    metaDescription: "Boost your joint health and mobility with Move Free Advanced Plus Joint Health Tablets! Made with MSM, these 120ct tablets provide the essential nutrients your joints need for improved flexibility and range of motion.",
    metaKeywords: ["Move Free Advanced", "joint health supplement", "MSM tablets", "mobility support"],
    canonical: "/products/move-free-advanced-plus-joint-health-with-msm-tablets-120ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Move Free Advanced Plus Joint Health with MSM Tablets 120ct",
      "description": "Boost your joint health and mobility with Move Free Advanced Plus Joint Health Tablets! Made with MSM, these 120ct tablets provide the essential nutrients your joints need for improved flexibility and range of motion.",
      "image": "https://yourwebsite.com/images/products/move-free-advanced-plus-joint-health-with-msm-tablets-120ct.png",
      "brand": { "@type": "Brand", "name": "Move Free Advanced" },
      "sku": "VIT0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/move-free-advanced-plus-joint-health-with-msm-tablets-120ct",
        "priceCurrency": "USD",
        "price": "29.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Vitamins & Supplements", url: "/categories/vitamins-supplements" },
      { name: "Joint Health", url: "/categories/vitamins-supplements/joint-health" }
    ]
  }
},
{
  name: "Sudafed PE Pressure & Pain Max Strength Caplets 24ct",
  shortDescription: "Fast relief for sinus pressure, congestion, and headaches.",
  description: "Experience fast and effective relief with Sudafed PE Pressure & Pain Max Strength Caplets. This 24ct pack targets sinus pressure, congestion, and headaches, providing all-day relief.",
  price: 11.49,
  imageKey: "/images/products/sudafed-pe-pressure-pain-max-strength-caplets-24ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 1,
  item: "Sinus & Cold Relief",
  itemSlug: "sinus-cold-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Caplet",
  stock: 45,
  isFeatured: true,
  keywords: ["Sudafed PE", "sinus congestion relief", "pain reliever", "cold medicine"],
  sku: "CFL0010",
  seo: {
    metaTitle: "Sudafed PE Pressure & Pain Max Strength Caplets - 24ct | Cold & Flu Relief",
    metaDescription: "Experience fast and effective relief with Sudafed PE Pressure & Pain Max Strength Caplets. This 24ct pack targets sinus pressure, congestion, and headaches, providing all-day relief.",
    metaKeywords: ["Sudafed PE", "sinus congestion relief", "pain reliever", "cold medicine"],
    canonical: "/products/sudafed-pe-pressure-pain-max-strength-caplets-24ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Sudafed PE Pressure & Pain Max Strength Caplets 24ct",
      "description": "Experience fast and effective relief with Sudafed PE Pressure & Pain Max Strength Caplets. This 24ct pack targets sinus pressure, congestion, and headaches, providing all-day relief.",
      "image": "https://yourwebsite.com/images/products/sudafed-pe-pressure-pain-max-strength-caplets-24ct.png",
      "brand": { "@type": "Brand", "name": "Sudafed PE" },
      "sku": "CFL0010",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/sudafed-pe-pressure-pain-max-strength-caplets-24ct",
        "priceCurrency": "USD",
        "price": "11.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Sinus & Cold Relief", url: "/categories/cold-flu-relief/sinus-cold-relief" }
    ]
  }
},
{
  name: "Vicks DayQuil Cold & Flu Multi-Symptom Relief, 24 CT",
  shortDescription: "Non-drowsy cold and flu symptom relief for daytime use.",
  description: "Fight back against cold and flu season with Vicks DayQuil. Our powerful formula provides multi-symptom relief, tackling nasal congestion, cough, headache, sore throat, and more. Get back to feeling your best with Vicks DayQuil, available in a convenient 24 CT package.",
  price: 12.99,
  imageKey: "/images/products/vicks-dayquil-cold-flu-multi-symptom-relief-24ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Capsule",
  stock: 55,
  isFeatured: true,
  keywords: ["Vicks DayQuil", "cold & flu relief", "multi-symptom medicine", "non-drowsy cold relief"],
  sku: "CFL0011",
  seo: {
    metaTitle: "Vicks DayQuil Cold & Flu Multi-Symptom Relief - 24ct | Cold & Flu Relief",
    metaDescription: "Fight back against cold and flu season with Vicks DayQuil. Our powerful formula provides multi-symptom relief, tackling nasal congestion, cough, headache, sore throat, and more. Get back to feeling your best with Vicks DayQuil, available in a convenient 24 CT package.",
    metaKeywords: ["Vicks DayQuil", "cold & flu relief", "multi-symptom medicine", "non-drowsy cold relief"],
    canonical: "/products/vicks-dayquil-cold-flu-multi-symptom-relief-24ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Vicks DayQuil Cold & Flu Multi-Symptom Relief 24ct",
      "description": "Fight back against cold and flu season with Vicks DayQuil. Our powerful formula provides multi-symptom relief, tackling nasal congestion, cough, headache, sore throat, and more. Get back to feeling your best with Vicks DayQuil, available in a convenient 24 CT package.",
      "image": "https://yourwebsite.com/images/products/vicks-dayquil-cold-flu-multi-symptom-relief-24ct.png",
      "brand": { "@type": "Brand", "name": "Vicks" },
      "sku": "CFL0011",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/vicks-dayquil-cold-flu-multi-symptom-relief-24ct",
        "priceCurrency": "USD",
        "price": "12.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "HALLS Relief Honey Lemon Cough Drops 30ct",
  shortDescription: "Soothing honey lemon drops for fast cough relief.",
  description: "Experience the soothing relief of HALLS Relief Honey Lemon Cough Drops. Made with real honey and natural lemon flavor, these drops provide fast and effective cough relief while soothing your throat.",
  price: 3.09,
  imageKey: "/images/products/halls-relief-honey-lemon-cough-drops-30ct.png",
  category: "Cough & Throat Relief",
  subcategoryIndex: 0,
  item: "Cough Drops",
  itemSlug: "cough-drops",
  tagline: "Soothing Relief",
  dosageForm: "Gummies",
  stock: 85,
  isFeatured: true,
  keywords: ["HALLS cough drops", "honey lemon throat drops", "cough relief", "soothing throat drops"],
  sku: "CTR0002",
  seo: {
    metaTitle: "HALLS Relief Honey Lemon Cough Drops - 30ct | Cough & Throat Relief",
    metaDescription: "Experience the soothing relief of HALLS Relief Honey Lemon Cough Drops. Made with real honey and natural lemon flavor, these drops provide fast and effective cough relief while soothing your throat.",
    metaKeywords: ["HALLS cough drops", "honey lemon throat drops", "cough relief", "soothing throat drops"],
    canonical: "/products/halls-relief-honey-lemon-cough-drops-30ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "HALLS Relief Honey Lemon Cough Drops 30ct",
      "description": "Experience the soothing relief of HALLS Relief Honey Lemon Cough Drops. Made with real honey and natural lemon flavor, these drops provide fast and effective cough relief while soothing your throat.",
      "image": "https://yourwebsite.com/images/products/halls-relief-honey-lemon-cough-drops-30ct.png",
      "brand": { "@type": "Brand", "name": "HALLS" },
      "sku": "CTR0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/halls-relief-honey-lemon-cough-drops-30ct",
        "priceCurrency": "USD",
        "price": "3.09",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cough & Throat Relief", url: "/categories/cough-throat-relief" },
      { name: "Cough Drops", url: "/categories/cough-throat-relief/cough-drops" }
    ]
  }
},
{
  name: "Zyrtec 24-Hour Allergy Relief 14ct",
  shortDescription: "Fast-acting 24-hour allergy relief from sneezing and itchy eyes.",
  description: "Say goodbye to sneezing and sniffles with Zyrtec 24-Hour Allergy Relief. Our fast-acting formula provides relief from indoor and outdoor allergies for a full day, helping you enjoy your day without allergy symptoms.",
  price: 15.99,
  imageKey: "/images/products/zyrtec-24-hour-allergy-relief-14ct.png",
  category: "Allergy Care",
  subcategoryIndex: 0,
  item: "Antihistamines",
  itemSlug: "antihistamines",
  tagline: "Breathe Easy",
  dosageForm: "Tablet",
  stock: 55,
  isFeatured: true,
  keywords: ["Zyrtec allergy relief", "24-hour antihistamine", "Zyrtec tablets", "fast allergy relief"],
  sku: "ALL0006",
  seo: {
    metaTitle: "Zyrtec 24-Hour Allergy Relief - 14ct | Allergy Care",
    metaDescription: "Say goodbye to sneezing and sniffles with Zyrtec 24-Hour Allergy Relief. Our fast-acting formula provides relief from indoor and outdoor allergies for a full day, helping you enjoy your day without allergy symptoms.",
    metaKeywords: ["Zyrtec allergy relief", "24-hour antihistamine", "Zyrtec tablets", "fast allergy relief"],
    canonical: "/products/zyrtec-24-hour-allergy-relief-14ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Zyrtec 24-Hour Allergy Relief 14ct",
      "description": "Say goodbye to sneezing and sniffles with Zyrtec 24-Hour Allergy Relief. Our fast-acting formula provides relief from indoor and outdoor allergies for a full day, helping you enjoy your day without allergy symptoms.",
      "image": "https://yourwebsite.com/images/products/zyrtec-24-hour-allergy-relief-14ct.png",
      "brand": { "@type": "Brand", "name": "Zyrtec" },
      "sku": "ALL0006",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/zyrtec-24-hour-allergy-relief-14ct",
        "priceCurrency": "USD",
        "price": "15.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Antihistamines", url: "/categories/allergy-care/antihistamines" }
    ]
  }
},
{
  name: "Imodium Anti-Diarrheal Multi-Symptom Relief Caplets 18ct",
  shortDescription: "Fast relief from diarrhea, cramps, and gas.",
  description: "Easily find multi-symptom relief with Imodium Anti-Diarrheal Caplets. Each 18ct pack offers fast and effective relief from nausea, cramps, and diarrhea, allowing you to get back to your daily routine with comfort.",
  price: 17.49,
  imageKey: "/images/products/imodium-anti-diarrheal-multi-symptom-relief-caplets-18ct.png",
  category: "Digestive Health",
  subcategoryIndex: 2,
  item: "Anti-Diarrheal",
  itemSlug: "anti-diarrheal",
  tagline: "Happy Tummy",
  dosageForm: "Caplet",
  stock: 50,
  isFeatured: true,
  keywords: ["Imodium anti-diarrheal", "diarrhea relief", "stomach cramp relief", "multi-symptom digestive relief"],
  sku: "DIG0009",
  seo: {
    metaTitle: "Imodium Anti-Diarrheal Multi-Symptom Relief Caplets - 18ct | Digestive Health",
    metaDescription: "Easily find multi-symptom relief with Imodium Anti-Diarrheal Caplets. Each 18ct pack offers fast and effective relief from nausea, cramps, and diarrhea, allowing you to get back to your daily routine with comfort.",
    metaKeywords: ["Imodium anti-diarrheal", "diarrhea relief", "stomach cramp relief", "multi-symptom digestive relief"],
    canonical: "/products/imodium-anti-diarrheal-multi-symptom-relief-caplets-18ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Imodium Anti-Diarrheal Multi-Symptom Relief Caplets 18ct",
      "description": "Easily find multi-symptom relief with Imodium Anti-Diarrheal Caplets. Each 18ct pack offers fast and effective relief from nausea, cramps, and diarrhea, allowing you to get back to your daily routine with comfort.",
      "image": "https://yourwebsite.com/images/products/imodium-anti-diarrheal-multi-symptom-relief-caplets-18ct.png",
      "brand": { "@type": "Brand", "name": "Imodium" },
      "sku": "DIG0009",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/imodium-anti-diarrheal-multi-symptom-relief-caplets-18ct",
        "priceCurrency": "USD",
        "price": "17.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Anti-Diarrheal", url: "/categories/digestive-health/anti-diarrheal" }
    ]
  }
},
{
  name: "Tums Chewy Bites Extra Strength Assorted Berry Tablets 32ct",
  shortDescription: "Fast-acting, extra strength relief for heartburn and acid indigestion.",
  description: "Indulge in fast and effective relief with Tums Chewy Bites Extra Strength Assorted Berry Tablets. These chewable tablets provide soothing relief from heartburn, acid indigestion, and upset stomach in a delicious berry flavor.",
  price: 7.99,
  imageKey: "/images/products/tums-chewy-bites-extra-strength-assorted-berry-tablets-32ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Tablet",
  stock: 80,
  isFeatured: true,
  keywords: ["Tums Chewy Bites", "extra strength antacid", "heartburn relief", "acid indigestion remedy"],
  sku: "DIG0010",
  seo: {
    metaTitle: "Tums Chewy Bites Extra Strength Assorted Berry Tablets - 32ct | Digestive Health",
    metaDescription: "Indulge in fast and effective relief with Tums Chewy Bites Extra Strength Assorted Berry Tablets. These chewable tablets provide soothing relief from heartburn, acid indigestion, and upset stomach in a delicious berry flavor.",
    metaKeywords: ["Tums Chewy Bites", "extra strength antacid", "heartburn relief", "acid indigestion remedy"],
    canonical: "/products/tums-chewy-bites-extra-strength-assorted-berry-tablets-32ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Tums Chewy Bites Extra Strength Assorted Berry Tablets 32ct",
      "description": "Indulge in fast and effective relief with Tums Chewy Bites Extra Strength Assorted Berry Tablets. These chewable tablets provide soothing relief from heartburn, acid indigestion, and upset stomach in a delicious berry flavor.",
      "image": "https://yourwebsite.com/images/products/tums-chewy-bites-extra-strength-assorted-berry-tablets-32ct.png",
      "brand": { "@type": "Brand", "name": "Tums" },
      "sku": "DIG0010",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/tums-chewy-bites-extra-strength-assorted-berry-tablets-32ct",
        "priceCurrency": "USD",
        "price": "7.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Theraflu Flu Relief Max Strength Daytime Packets 6ct",
  shortDescription: "Powerful flu relief in convenient hot drink packets.",
  description: "Relieve your flu symptoms with Theraflu Flu Relief Max Strength Daytime Packets. This pack of 6 provides fast-acting relief for your cough, congestion, and body aches while warming you with a soothing hot drink.",
  price: 12.49,
  imageKey: "/images/products/theraflu-flu-relief-max-strength-daytime-packets-6ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Powder",
  stock: 50,
  isFeatured: true,
  keywords: ["Theraflu Max Strength", "flu relief", "daytime flu medicine", "multi-symptom cold relief"],
  sku: "CFL0012",
  seo: {
    metaTitle: "Theraflu Flu Relief Max Strength Daytime Packets - 6ct | Cold & Flu Relief",
    metaDescription: "Relieve your flu symptoms with Theraflu Flu Relief Max Strength Daytime Packets. This pack of 6 provides fast-acting relief for your cough, congestion, and body aches while warming you with a soothing hot drink.",
    metaKeywords: ["Theraflu Max Strength", "flu relief", "daytime flu medicine", "multi-symptom cold relief"],
    canonical: "/products/theraflu-flu-relief-max-strength-daytime-packets-6ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Theraflu Flu Relief Max Strength Daytime Packets 6ct",
      "description": "Relieve your flu symptoms with Theraflu Flu Relief Max Strength Daytime Packets. This pack of 6 provides fast-acting relief for your cough, congestion, and body aches while warming you with a soothing hot drink.",
      "image": "https://yourwebsite.com/images/products/theraflu-flu-relief-max-strength-daytime-packets-6ct.png",
      "brand": { "@type": "Brand", "name": "Theraflu" },
      "sku": "CFL0012",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/theraflu-flu-relief-max-strength-daytime-packets-6ct",
        "priceCurrency": "USD",
        "price": "12.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Cold & Flu Relief", url: "/categories/cold-flu-relief" },
      { name: "Multi-Symptom Relief", url: "/categories/cold-flu-relief/multi-symptom-relief" }
    ]
  }
},
{
  name: "Aleve Naproxen Sodium Tablets 220mg Pain Reliever/Fever Reducer Caplets 90ct",
  shortDescription: "Long-lasting pain relief with just two pills a day.",
  description: "Aleve Naproxen Sodium Tablets provide fast and effective relief from pain and reduce fever. With 220mg of Naproxen Sodium per caplet, this 90ct bottle is a reliable and convenient solution for everyday aches and pains.",
  price: 15.99,
  imageKey: "/images/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct.png",
  category: "Pain & Fever",
  subcategoryIndex: 0,
  item: "Oral Pain Relief",
  itemSlug: "oral-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Caplet",
  stock: 65,
  isFeatured: true,
  keywords: ["Aleve pain relief", "naproxen sodium", "fever reducer", "long-lasting pain reliever"],
  sku: "PAF0005",
  seo: {
    metaTitle: "Aleve Naproxen Sodium Tablets - 90ct | Pain & Fever",
    metaDescription: "Aleve Naproxen Sodium Tablets provide fast and effective relief from pain and reduce fever. With 220mg of Naproxen Sodium per caplet, this 90ct bottle is a reliable and convenient solution for everyday aches and pains.",
    metaKeywords: ["Aleve pain relief", "naproxen sodium", "fever reducer", "long-lasting pain reliever"],
    canonical: "/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Aleve Naproxen Sodium Tablets 220mg Pain Reliever/Fever Reducer Caplets 90ct",
      "description": "Aleve Naproxen Sodium Tablets provide fast and effective relief from pain and reduce fever. With 220mg of Naproxen Sodium per caplet, this 90ct bottle is a reliable and convenient solution for everyday aches and pains.",
      "image": "https://yourwebsite.com/images/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct.png",
      "brand": { "@type": "Brand", "name": "Aleve" },
      "sku": "PAF0005",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct",
        "priceCurrency": "USD",
        "price": "15.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Oral Pain Relief", url: "/categories/pain-fever/oral-pain-relief" }
    ]
  }
},
{
  name: "Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels 160ct",
  shortDescription: "Fast-acting ibuprofen pain relief in liquid-filled capsules.",
  description: "Experience fast-acting relief with Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels. With 200mg of ibuprofen in each oral capsule, these 160ct liqui-gels provide effective pain and fever relief.",
  price: 21.49,
  imageKey: "/images/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct.png",
  category: "Pain & Fever",
  subcategoryIndex: 0,
  item: "Oral Pain Relief",
  itemSlug: "oral-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Capsule",
  stock: 60,
  isFeatured: true,
  keywords: ["Advil Liqui-Gels", "ibuprofen pain relief", "fever reducer", "fast-acting pain medicine"],
  sku: "PAF0006",
  seo: {
    metaTitle: "Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels - 160ct | Pain & Fever",
    metaDescription: "Experience fast-acting relief with Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels. With 200mg of ibuprofen in each oral capsule, these 160ct liqui-gels provide effective pain and fever relief.",
    metaKeywords: ["Advil Liqui-Gels", "ibuprofen pain relief", "fever reducer", "fast-acting pain medicine"],
    canonical: "/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels 160ct",
      "description": "Experience fast-acting relief with Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels. With 200mg of ibuprofen in each oral capsule, these 160ct liqui-gels provide effective pain and fever relief.",
      "image": "https://yourwebsite.com/images/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct.png",
      "brand": { "@type": "Brand", "name": "Advil" },
      "sku": "PAF0006",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct",
        "priceCurrency": "USD",
        "price": "21.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Oral Pain Relief", url: "/categories/pain-fever/oral-pain-relief" }
    ]
  }
},
{
  name: "Band-Aid Brand Flexible Fabric Adhesive Bandages, 30 Count",
  shortDescription: "Durable, flexible bandages that stay in place while moving.",
  description: "Experience reliable and comfortable wound protection with Band-Aid Brand Flexible Fabric Adhesive Bandages, now available in a 30-count pack. These bandages are designed to flex and move with your body for optimal coverage and protection while allowing for breathability.",
  price: 5.49,
  imageKey: "/images/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count.png",
  category: "First Aid",
  subcategoryIndex: 0,
  item: "Bandages & Dressings",
  itemSlug: "bandages-dressings",
  tagline: "Quick Relief & First Aid",
  dosageForm: "Other",
  stock: 80,
  isFeatured: true,
  keywords: ["Band-Aid fabric bandages", "flexible adhesive bandages", "wound protection", "first aid bandages"],
  sku: "FIR0002",
  seo: {
    metaTitle: "Band-Aid Brand Flexible Fabric Adhesive Bandages - 30 Count | First Aid",
    metaDescription: "Experience reliable and comfortable wound protection with Band-Aid Brand Flexible Fabric Adhesive Bandages, now available in a 30-count pack. These bandages are designed to flex and move with your body for optimal coverage and protection while allowing for breathability.",
    metaKeywords: ["Band-Aid fabric bandages", "flexible adhesive bandages", "wound protection", "first aid bandages"],
    canonical: "/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Band-Aid Brand Flexible Fabric Adhesive Bandages 30 Count",
      "description": "Experience reliable and comfortable wound protection with Band-Aid Brand Flexible Fabric Adhesive Bandages, now available in a 30-count pack. These bandages are designed to flex and move with your body for optimal coverage and protection while allowing for breathability.",
      "image": "https://yourwebsite.com/images/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count.png",
      "brand": { "@type": "Brand", "name": "Band-Aid" },
      "sku": "FIR0002",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count",
        "priceCurrency": "USD",
        "price": "5.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "First Aid", url: "/categories/first-aid" },
      { name: "Bandages & Dressings", url: "/categories/first-aid/bandages-dressings" }
    ]
  }
},
{
  name: "Pepto Bismol 5 Symptoms Digestive Relief Liquid, Original, 16 Ounces",
  shortDescription: "Fast relief for nausea, heartburn, indigestion, upset stomach, and diarrhea.",
  description: "Help relieve your digestive symptoms with Pepto Bismol Digestive Relief Liquid! Made with a soothing, original formula, this 16-ounce bottle tackles five different symptoms, providing quick and effective relief.",
  price: 8.99,
  imageKey: "/images/products/pepto-bismol-liquid-original-16oz.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Liquid",
  stock: 60,
  isFeatured: true,
  keywords: ["Pepto Bismol liquid", "digestive relief", "nausea treatment", "upset stomach remedy"],
  sku: "DIG0011",
  seo: {
    metaTitle: "Pepto Bismol 5 Symptoms Digestive Relief Liquid - 16 Ounces | Digestive Health",
    metaDescription: "Help relieve your digestive symptoms with Pepto Bismol Digestive Relief Liquid! Made with a soothing, original formula, this 16-ounce bottle tackles five different symptoms, providing quick and effective relief.",
    metaKeywords: ["Pepto Bismol liquid", "digestive relief", "nausea treatment", "upset stomach remedy"],
    canonical: "/products/pepto-bismol-5-symptoms-digestive-relief-liquid-original-16oz",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Pepto Bismol 5 Symptoms Digestive Relief Liquid 16 Ounces",
      "description": "Help relieve your digestive symptoms with Pepto Bismol Digestive Relief Liquid! Made with a soothing, original formula, this 16-ounce bottle tackles five different symptoms, providing quick and effective relief.",
      "image": "https://yourwebsite.com/images/products/pepto-bismol-liquid-original-16oz.png",
      "brand": { "@type": "Brand", "name": "Pepto Bismol" },
      "sku": "DIG0011",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/pepto-bismol-5-symptoms-digestive-relief-liquid-original-16oz",
        "priceCurrency": "USD",
        "price": "8.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Digestive Health", url: "/categories/digestive-health" },
      { name: "Antacids", url: "/categories/digestive-health/antacids" }
    ]
  }
},
{
  name: "Nature Made Vitamin C 500mg Liquigel 60ct",
  shortDescription: "Supports immune health with antioxidant Vitamin C.",
  description: "Boost your immune system and support your overall health with Nature Made Vitamin C 500mg Liquigel. With 60 easy-to-swallow capsules, this supplement provides a powerful dose of vitamin C to help ward off illness and promote wellness.",
  price: 15.49,
  imageKey: "/images/products/nature-made-vitamin-c-500mg-liquigel-60ct.png",
  category: "Vitamins & Supplements",
  subcategoryIndex: 2,
  item: "Immune Support",
  itemSlug: "immune-support",
  tagline: "Daily Power Boost",
  dosageForm: "Capsule",
  stock: 50,
  isFeatured: true,
  keywords: ["Nature Made Vitamin C", "immune support", "antioxidant supplement", "vitamin C 500mg"],
  sku: "VIT0004",
  seo: {
    metaTitle: "Nature Made Vitamin C 500mg Liquigel - 60ct | Vitamins & Supplements",
    metaDescription: "Boost your immune system and support your overall health with Nature Made Vitamin C 500mg Liquigel. With 60 easy-to-swallow capsules, this supplement provides a powerful dose of vitamin C to help ward off illness and promote wellness.",
    metaKeywords: ["Nature Made Vitamin C", "immune support", "antioxidant supplement", "vitamin C 500mg"],
    canonical: "/products/nature-made-vitamin-c-500mg-liquigel-60ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Nature Made Vitamin C 500mg Liquigel 60ct",
      "description": "Boost your immune system and support your overall health with Nature Made Vitamin C 500mg Liquigel. With 60 easy-to-swallow capsules, this supplement provides a powerful dose of vitamin C to help ward off illness and promote wellness.",
      "image": "https://yourwebsite.com/images/products/nature-made-vitamin-c-500mg-liquigel-60ct.png",
      "brand": { "@type": "Brand", "name": "Nature Made" },
      "sku": "VIT0004",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/nature-made-vitamin-c-500mg-liquigel-60ct",
        "priceCurrency": "USD",
        "price": "15.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Vitamins & Supplements", url: "/categories/vitamins-supplements" },
      { name: "Immune Support", url: "/categories/vitamins-supplements/immune-support" }
    ]
  }
},
{
  name: "Claritin 24HR 10mg Tablets 30ct",
  shortDescription: "Non-drowsy 24-hour relief from seasonal allergies.",
  description: "Get all-day relief from allergy symptoms with Claritin 24HR 10mg Tablets. These non-drowsy tablets help relieve sneezing, runny nose, itchy eyes, and throat irritation, so you can enjoy your day without allergy discomfort.",
  price: 21.99,
  imageKey: "/images/products/claritin-24hr-10mg-tablets-30ct.png",
  category: "Allergy Care",
  subcategoryIndex: 0,
  item: "Antihistamines",
  itemSlug: "antihistamines",
  tagline: "Breathe Easy",
  dosageForm: "Tablet",
  stock: 55,
  isFeatured: true,
  keywords: ["Claritin allergy tablets", "24-hour antihistamine", "non-drowsy allergy relief", "seasonal allergy medicine"],
  sku: "ALL0007",
  seo: {
    metaTitle: "Claritin 24HR 10mg Tablets - 30ct | Allergy Care",
    metaDescription: "Get all-day relief from allergy symptoms with Claritin 24HR 10mg Tablets. These non-drowsy tablets help relieve sneezing, runny nose, itchy eyes, and throat irritation, so you can enjoy your day without allergy discomfort.",
    metaKeywords: ["Claritin allergy tablets", "24-hour antihistamine", "non-drowsy allergy relief", "seasonal allergy medicine"],
    canonical: "/products/claritin-24hr-10mg-tablets-30ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Claritin 24HR 10mg Tablets 30ct",
      "description": "Get all-day relief from allergy symptoms with Claritin 24HR 10mg Tablets. These non-drowsy tablets help relieve sneezing, runny nose, itchy eyes, and throat irritation, so you can enjoy your day without allergy discomfort.",
      "image": "https://yourwebsite.com/images/products/claritin-24hr-10mg-tablets-30ct.png",
      "brand": { "@type": "Brand", "name": "Claritin" },
      "sku": "ALL0007",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/claritin-24hr-10mg-tablets-30ct",
        "priceCurrency": "USD",
        "price": "21.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Allergy Care", url: "/categories/allergy-care" },
      { name: "Antihistamines", url: "/categories/allergy-care/antihistamines" }
    ]
  }
},
{
  name: "Tylenol Extra Strength 500mg Caplets 24ct",
  shortDescription: "Fast relief from headaches, body aches, and fever.",
  description: "Get effective relief from pain and fever with Tylenol Extra Strength 500mg Caplets. Each caplet contains acetaminophen for powerful pain relief, making it ideal for headaches, muscle aches, and more.",
  price: 5.15,
  imageKey: "/images/products/tylenol-extra-strength-500mg-caplets-24ct.png",
  category: "Pain & Fever",
  subcategoryIndex: 0,
  item: "Oral Pain Relief",
  itemSlug: "oral-pain-relief",
  tagline: "Pain-Free Living",
  dosageForm: "Caplet",
  stock: 70,
  isFeatured: true,
  keywords: ["Tylenol Extra Strength", "pain relief caplets", "acetaminophen 500mg", "headache relief"],
  sku: "PAF0007",
  seo: {
    metaTitle: "Tylenol Extra Strength 500mg Caplets - 24ct | Pain & Fever",
    metaDescription: "Get effective relief from pain and fever with Tylenol Extra Strength 500mg Caplets. Each caplet contains acetaminophen for powerful pain relief, making it ideal for headaches, muscle aches, and more.",
    metaKeywords: ["Tylenol Extra Strength", "pain relief caplets", "acetaminophen 500mg", "headache relief"],
    canonical: "/products/tylenol-extra-strength-500mg-caplets-24ct",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Tylenol Extra Strength 500mg Caplets 24ct",
      "description": "Get effective relief from pain and fever with Tylenol Extra Strength 500mg Caplets. Each caplet contains acetaminophen for powerful pain relief, making it ideal for headaches, muscle aches, and more.",
      "image": "https://yourwebsite.com/images/products/tylenol-extra-strength-500mg-caplets-24ct.png",
      "brand": { "@type": "Brand", "name": "Tylenol" },
      "sku": "PAF0007",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/tylenol-extra-strength-500mg-caplets-24ct",
        "priceCurrency": "USD",
        "price": "5.15",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Pain & Fever", url: "/categories/pain-fever" },
      { name: "Oral Pain Relief", url: "/categories/pain-fever/oral-pain-relief" }
    ]
  }
},
{
  name: "Mucinex Fast-Max Cold & Flu Severe Caplets 20ct",
  shortDescription: "Powerful relief from severe cold and flu symptoms.",
  description: "Get quick and lasting relief from cold and flu symptoms with Mucinex Fast-Max Severe Caplets. This powerful formula targets cough, congestion, and body aches, allowing you to breathe easier and feel better. Conveniently packaged in a 20-count tablet form.",
  price: 19.49,
  imageKey: "/images/products/mucinex-fast-max-cld-flu-sr-thr-cpl-20ct.png",
  category: "Cold & Flu Relief",
  subcategoryIndex: 0,
  item: "Multi-Symptom Relief",
  itemSlug: "multi-symptom-relief",
  tagline: "Fast-Acting Relief",
  dosageForm: "Caplet",
  stock: 50,
  isFeatured: true,
  keywords: ["Mucinex Fast-Max", "severe cold relief", "flu symptom relief", "multi-symptom medicine"],
  sku: "CFL0013",
  seo: {
    metaTitle: "Mucinex Fast-Max Severe Cold & Flu - 20ct | Powerful Multi-Symptom Relief",
    metaDescription: "Mucinex Fast-Max Severe Caplets provide fast relief from congestion, cough, sore throat, and body aches. 20-count pack.",
    metaKeywords: ["Mucinex Fast-Max", "cold & flu medicine", "multi-symptom relief", "severe cold treatment"],
    canonical: "/products/mucinex-fast-max-severe",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Mucinex Fast-Max Cold & Flu Severe Caplets 20ct",
      "description": "Mucinex Fast-Max Severe Caplets provide powerful relief from severe cold and flu symptoms, including cough, congestion, and body aches.",
      "image": "https://yourwebsite.com/images/products/mucinex-fast-max-cld-flu-sr-thr-cpl-20ct.png",
      "brand": { "@type": "Brand", "name": "Mucinex" },
      "sku": "CFL0013",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/mucinex-fast-max-severe",
        "priceCurrency": "USD",
        "price": "19.49",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    }
  }
},
{
  name: "Robitussin Maximum Strength Cough + Chest Congestion DM 8oz",
  shortDescription: "Fast relief for cough and chest congestion.",
  description: "Find relief from your worst cough and chest congestion with Robitussin Maximum Strength! Our powerful formula works to break up mucus and suppress your cough, so you can breathe easier and feel better. Suitable for adults and children ages 12 and up.",
  price: 15.50,
  imageKey: "/images/products/robitussin-maximum-strength-cough-chest-congestion-dm-8oz.png",
  category: "Cough & Throat Relief",
  subcategoryIndex: 0,
  item: "Cough & Cold Remedies",
  itemSlug: "cough-cold-remedies",
  tagline: "Fast-Acting Relief",
  dosageForm: "Liquid",
  stock: 55,
  isFeatured: true,
  keywords: ["Robitussin DM", "cough suppressant", "chest congestion relief", "maximum strength Robitussin"],
  sku: "CTR0003",
  seo: {
    metaTitle: "Robitussin Maximum Strength Cough & Chest Congestion - 8oz | DM Formula",
    metaDescription: "Robitussin DM provides fast relief from cough and chest congestion with a powerful maximum strength formula. 8oz bottle.",
    metaKeywords: ["Robitussin DM", "cough suppressant", "chest congestion relief", "maximum strength cough medicine"],
    canonical: "/products/robitussin-maximum-strength-cough",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Robitussin Maximum Strength Cough + Chest Congestion DM 8oz",
      "description": "Robitussin DM Maximum Strength provides powerful relief from cough and chest congestion, breaking up mucus for easier breathing.",
      "image": "https://yourwebsite.com/images/products/robitussin-maximum-strength-cough-chest-congestion-dm-8oz.png",
      "brand": { "@type": "Brand", "name": "Robitussin" },
      "sku": "CTR0003",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/robitussin-maximum-strength-cough",
        "priceCurrency": "USD",
        "price": "15.50",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    }
  }
},
{
  name: "Tums Smoothies Extra Strength Antacid Tablets Assorted Fruit 60ct",
  shortDescription: "Smooth, fast-acting relief for heartburn and indigestion.",
  description: "Enjoy smooth, extra strength relief from heartburn and acid indigestion with Tums Smoothies. These chewable tablets dissolve easily and come in a delicious assorted fruit flavor for a pleasant experience.",
  price: 6.99,
  imageKey: "/images/products/tums-smoothies-extra-strength-antacid-tablets-assorted-fruit-60ct.png",
  category: "Digestive Health",
  subcategoryIndex: 0,
  item: "Antacids",
  itemSlug: "antacids",
  tagline: "Happy Tummy",
  dosageForm: "Tablet",
  stock: 65,
  isFeatured: true,
  keywords: ["Tums Smoothies", "extra strength antacid", "heartburn relief", "chewable antacid tablets"],
  sku: "DIG0012",
  seo: {
    metaTitle: "Tums Smoothies Extra Strength - 60ct | Fast Heartburn Relief",
    metaDescription: "Tums Smoothies Extra Strength Tablets provide fast relief from heartburn and indigestion with a smooth, chewable formula.",
    metaKeywords: ["Tums Smoothies", "heartburn relief", "extra strength antacid", "chewable antacid tablets"],
    canonical: "/products/tums-smoothies-extra-strength",
    structuredData: {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Tums Smoothies Extra Strength Antacid Tablets Assorted Fruit 60ct",
      "description": "Tums Smoothies Extra Strength Antacid Tablets provide smooth, fast relief from heartburn and acid indigestion in assorted fruit flavors.",
      "image": "https://yourwebsite.com/images/products/tums-smoothies-extra-strength-antacid-tablets-assorted-fruit-60ct.png",
      "brand": { "@type": "Brand", "name": "Tums" },
      "sku": "DIG0012",
      "offers": {
        "@type": "Offer",
        "url": "https://yourwebsite.com/products/tums-smoothies-extra-strength",
        "priceCurrency": "USD",
        "price": "6.99",
        "itemCondition": "https://schema.org/NewCondition",
        "availability": "https://schema.org/InStock"
      }
    }
  }
}
];
export { products };