// src/data/products.js
const products = [
    { 
        id: 1, 
        name: 'Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels 160ct', 
        image: '/images/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct.png', 
        price: 18.99, 
        description: 'Effective pain relief and fever reducer.', 
        category: 'Pain Relief', 
        isFeatured: true 
      },
      { 
        id: 2, 
        name: 'AFRIN ORIGINAL SPRAY 30ML', 
        image: '/images/products/afrin-original-spray-30ml.png', 
        price: 11.99, 
        description: 'Nasal decongestant for relief of nasal congestion.', 
        category: 'Nasal Decongestant', 
        isFeatured: false 
      },
      { 
        id: 3, 
        name: 'Aleve Naproxen Sodium Tablets 220mg Pain Reliever/Fever Reducer Caplets 90ct', 
        image: '/images/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct.png', 
        price: 14.99, 
        description: 'Long-lasting pain relief with naproxen sodium.', 
        category: 'Pain Relief', 
        isFeatured: true 
      },
      { 
        id: 4, 
        name: 'Alka-Seltzer Extra Strength Effervescent Tablets 24ct', 
        image: '/images/products/alka-seltzer-extra-strength-effervescent-tablets-24ct.png', 
        price: 9.99, 
        description: 'Fast-acting relief for digestive issues.', 
        category: 'Digestive Relief', 
        isFeatured: false 
      },
      { 
        id: 5, 
        name: 'Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct', 
        image: '/images/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels-20ct.png', 
        price: 12.99, 
        description: 'Relief for cold and flu symptoms.', 
        category: 'Cold & Flu Relief', 
        isFeatured: true 
      },
      { 
        id: 6, 
        name: 'BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED 20CT', 
        image: '/images/products/band-aid-bandages-kids-hello-kitty-assorted-20ct.png', 
        price: 5.99, 
        description: 'Fun Hello Kitty-themed bandages for kids.', 
        category: 'First Aid', 
        isFeatured: true 
      },
      { 
        id: 7, 
        name: 'Band-Aid Brand Flexible Fabric Adhesive Bandages, 30 Count', 
        image: '/images/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count.png', 
        price: 4.99, 
        description: 'Flexible fabric bandages for comfortable protection.', 
        category: 'First Aid', 
        isFeatured: false 
      },
      { 
        id: 8, 
        name: 'Bayer Aspirin Low Dose 81mg Enteric Tablets 120ct', 
        image: '/images/products/bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png', 
        price: 7.99, 
        description: 'Low-dose aspirin for heart health.', 
        category: 'Pain Relief', 
        isFeatured: false 
      },
      { 
        id: 9, 
        name: 'Benadryl Allergy Dye-Free Liquigels 24ct', 
        image: '/images/products/benadryl-allergy-dye-free-liquigels-24ct.png', 
        price: 8.99, 
        description: 'Allergy relief in dye-free liquigels.', 
        category: 'Allergy Relief', 
        isFeatured: false 
      },
      { 
        id: 10, 
        name: 'Bengay Ultra Strength Cream 2oz', 
        image: '/images/products/bengay-ultra-strength-cream-2oz.png', 
        price: 6.99, 
        description: 'Ultra-strength cream for muscle and joint pain relief.', 
        category: 'Pain Relief', 
        isFeatured: true 
      },
      { 
        id: 11, 
        name: 'Cepacol Extra Strength Sore Throat Honey Lemon Lozenges 16ct', 
        image: '/images/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct.png', 
        price: 6.49, 
        description: 'Extra strength lozenges for sore throat relief.', 
        category: 'Sore Throat Relief', 
        isFeatured: false 
      },
      { 
        id: 12, 
        name: "Children's Flonase Sensimist 60 Sprays", 
        image: '/images/products/childrens-flonase-sensimist-60-sprays.png', 
        price: 14.99, 
        description: 'Gentle allergy relief for children.', 
        category: 'Allergy Relief', 
        isFeatured: true 
      },
      { 
        id: 13, 
        name: "Children's Mucinex Stuffy Nose & Chest Congestion Very Berry Flavor 4oz", 
        image: '/images/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png', 
        price: 10.99, 
        description: 'Berry-flavored congestion relief for children.', 
        category: 'Cold & Flu Relief', 
        isFeatured: true 
      },
      { 
        id: 14, 
        name: "Children's Tylenol Pain + Fever 160mg Acetaminophen Bubblegum Chewable Tablets 24ct", 
        image: '/images/products/childrens-tylenol-pain-fever-160mg-acetaminophen-bubblegum-chewable-tablets-24ct.png', 
        price: 7.99, 
        description: 'Pain and fever relief in chewable tablets for children.', 
        category: 'Pain Relief', 
        isFeatured: false 
      },
      { 
        id: 15, 
        name: 'Claritin 24HR 10mg Tablets 30ct', 
        image: '/images/products/claritin-24hr-10mg-tablets-30ct.png', 
        price: 13.99, 
        description: 'Non-drowsy allergy relief that lasts 24 hours.', 
        category: 'Allergy Relief', 
        isFeatured: true 
      },
      { 
        id: 16, 
        name: 'Coricidin HBP Chest Cold & Flu Tablets 10ct', 
        image: '/images/products/coricidin-hbp-chest-cold-flu-tablets-10ct.png', 
        price: 8.99, 
        description: 'Cold and flu relief for people with high blood pressure.', 
        category: 'Cold & Flu Relief', 
        isFeatured: false 
      },
      { 
        id: 17, 
        name: 'DayQuil Cold Flu Liquicaps 24ct', 
        image: '/images/products/dayquil-cold-flu-liquicaps-24ct.png', 
        price: 9.99, 
        description: 'Daytime cold and flu relief in convenient liquicaps.', 
        category: 'Cold & Flu Relief', 
        isFeatured: true 
      },
      { 
        id: 18, 
        name: 'Flonase Sensimist 24HR Allergy Relief Scent Free Nasal Spray 0.34oz', 
        image: '/images/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png', 
        price: 15.99, 
        description: 'All-day allergy relief without a scent.', 
        category: 'Allergy Relief', 
        isFeatured: true 
      },
      { 
        id: 19, 
        name: 'Pepto Bismol Maximum Strength Liquid 8oz', 
        image: '/images/products/pepto-bismol-maximum-strength-liquid-8oz.png', 
        price: 8.99, 
        description: 'Maximum strength digestive relief in liquid form.', 
        category: 'Digestive Relief', 
        isFeatured: true 
      },
      { 
        id: 20, 
        name: 'Nature Made Fish Oil 1200mg Softgel 100ct', 
        image: '/images/products/nature-made-fish-oil-1200mg-softgel-100ct.png', 
        price: 10.99, 
        description: 'Omega-3 supplement for heart health.', 
        category: 'Vitamins & Supplements', 
        isFeatured: true 
      }    ];
  
  export default products;
  