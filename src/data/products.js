// src/data/products.js
const products = [
  { 
      id: 1, 
      name: 'Monistat 3 Vaginal Antifungal Prefilled Cream 3x5gm', 
      image: '/images/products/monistat-3-vaginal-antifungal-prefilled-cream-3x5gm.png', 
      price: 19.99, 
      description: 'Discover fast and effective relief with Monistat 3 Vaginal Antifungal Prefilled Cream 3x5gm. Treats and cures pesky yeast infections while soothing irritation and discomfort. Get back to feeling confident and comfortable with this trusted and convenient solution.', 
      category: 'Feminine Care', 
      isFeatured: true 
  },
  { 
      id: 2, 
      name: 'Monistat 7 Vaginal Antifungal Cream Combination Pack', 
      image: '/images/products/monistat-7-vaginal-antifungal-cream-combination-pack.png', 
      price: 24.99, 
      description: 'Get fast and effective relief with Monistat 7 Vaginal Antifungal Cream. This powerful combination pack includes a triple-strength cream and soothing wipes for a complete solution to yeast infections. Trust Monistat 7 to provide maximum strength and comfort in just 7 days.', 
      category: 'Feminine Care', 
      isFeatured: true 
  },
  { 
      id: 3, 
      name: 'NeilMed Sinus Rinse Complete Kit 1ct', 
      image: '/images/products/neilmed-sinus-rinse-complete-kit-1ct.png', 
      price: 14.99, 
      description: 'Cleansing your sinuses has never been easier with the NeilMed Sinus Rinse Complete Kit 1ct. This complete kit includes a uniquely designed squeeze bottle and pre-measured packets of pharmaceutical-grade, preservative-free mixture. Gently wash away nasal irritants and relieve congestion for better breathing and overall sinus health.', 
      category: 'Nasal Care', 
      isFeatured: true 
  },
  { 
      id: 4, 
      name: 'BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED 20CT', 
      image: '/images/products/band-aid-bandages-kids-hello-kitty-assorted-20ct.png', 
      price: 5.99, 
      description: 'Introducing BAND-AID BANDAGES KIDS HELLO KITTY ASSORTED in a pack of 20! Give your child\'s cuts and scrapes some love with the adorable Hello Kitty designs. Made with strong adhesive and breathable material for fast healing. Keep your little one smiling and protected while they play.', 
      category: 'First Aid', 
      isFeatured: true 
  },
  { 
      id: 5, 
      name: 'RICOLA BAG S/F SWISS HERB DRP 19CT', 
      image: '/images/products/ricola-bag-s-f-swiss-herb-drp-19ct.png', 
      price: 3.99, 
      description: 'Experience the soothing power and delicious taste of RICOLA BAG S/F SWISS HERB DRP 19CT. Each drop is packed with a blend of natural herbs that are carefully cultivated in the Swiss mountains for optimal freshness and potency. Let the unique mixture of herbs and menthol relieve your throat and refresh your senses.', 
      category: 'Cough & Throat Relief', 
      isFeatured: true 
  },
  { 
      id: 6, 
      name: 'Mucinex InstaSoothe Honey Echinacea Throat Drop 20ct', 
      image: '/images/products/mucinex-instasoothe-honey-echinacea-throat-drop-20ct.png', 
      price: 5.99, 
      description: 'Experience instant relief with Mucinex InstaSoothe Honey Echinacea Throat Drops! Made with natural honey and echinacea, these drops provide a soothing effect to your sore throat. Say goodbye to discomfort and hello to comfort and peace of mind.', 
      category: 'Throat Drops or Cough & Sore Throat Relief', 
      isFeatured: true 
  },
  { 
      id: 7, 
      name: 'PediaSure Grow & Gain Kids\' Nutritional Shake Vanilla', 
      image: '/images/products/pediasure-grow-gain-kids-nutritional-shake-vanilla.png', 
      price: 2.99, 
      description: 'PediaSure Grow &amp; Gain Kids\' Nutritional Shake in irresistible Vanilla flavor! Packed with essential nutrients to support growth and development. The perfect way to ensure your child gets the nutrition they need with a delicious taste they\'ll love!', 
      category: 'Nutritional Shakes', 
      isFeatured: true 
  },
  { 
      id: 8, 
      name: 'PediaSure Grow & Gain Kids\' Nutritional Shake Chocolate', 
      image: '/images/products/pediasure-grow-gain-kids-nutritional-shake-chocolate.png', 
      price: 2.99, 
      description: 'Fuel your child\'s growth with PediaSure Grow &amp; Gain Kids\' Nutritional Shake in delicious chocolate flavor. This shake provides essential nutrients for healthy development and supports immune function. Keep your child healthy and happy with PediaSure!', 
      category: 'Nutritional Shakes', 
      isFeatured: true 
  },
  { 
      id: 9, 
      name: 'Natrol Kids Melatonin Berry Gummies 90ct', 
      image: '/images/products/natrol-kids-melatonin-berry-gummies-90ct.png', 
      price: 14.99, 
      description: 'Feel confident sending your child off to dreamland with Natrol Kids Melatonin Berry Gummies. Our delicious gummies are made with the highest quality melatonin to help promote a peaceful and restful sleep. Say goodbye to bedtime struggles and hello to a well-rested child!', 
      category: 'Sleep Aid', 
      isFeatured: true 
  },
  { 
      id: 10, 
      name: 'Florastor Kids Probiotic Packets, 20 CT', 
      image: '/images/products/florastor-kids-probiotic-packets-20-ct.png', 
      price: 32.99, 
      description: 'Boost your child\'s immune system with Florastor Kids Daily Probiotic Supplement! These 250mg packets contain 30 doses of natural probiotics to promote healthy digestion and overall wellness. Give your child the best with Florastor\'s trusted, doctor-recommended formula.', 
      category: 'Probiotics', 
      isFeatured: true 
  },
  { 
      id: 11, 
      name: 'Flonase Sensimist 24HR Allergy Relief Scent Free Nasal Spray 0.34oz', 
      image: '/images/products/flonase-sensimist-24hr-allergy-relief-scent-free-nasal-spray-0.34oz.png', 
      price: 23.99, 
      description: 'Experience relief from your allergies with Flonase Sensimist 24HR Allergy Relief Nasal Spray. Scent-free and long-lasting, this spray provides gentle and effective relief for up to 24 hours. Breathe easy and enjoy the outdoors without the worry of pesky allergens.', 
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 12, 
      name: 'Children\'s Flonase Sensimist 60 Sprays', 
      image: '/images/products/childrens-flonase-sensimist-60-sprays.png', 
      price: 19.99, 
      description: 'Relieve your child\'s allergy symptoms with Children\'s Flonase Sensimist. With 60 sprays, this gentle formula provides long-lasting relief without harsh side effects. Perfect for outdoor playdates and school days, your little one can enjoy life to the fullest without worrying about allergies.', 
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 13, 
      name: 'Dr. Teal\'s Cooling Peppermint Pure Epsom Salt Foot Soak 32oz', 
      image: '/images/products/dr-teals-cooling-peppermint-pure-epsom-salt-foot-soak-32oz.png', 
      price: 6.99, 
      description: 'Revitalize and soothe tired feet with Dr. Teal\'s Cooling Peppermint Pure Epsom Salt Foot Soak. Made with natural Epsom salt and refreshing peppermint, this 32oz soak will leave your feet feeling invigorated and rejuvenated. Relax and reinvigorate your feet after a long day with the cooling and revitalizing power of Dr. Teal\'s.', 
      category: 'Foot Care', 
      isFeatured: true 
  },
  { 
      id: 14, 
      name: 'Zarbee\'s Children\'s Cough+Mucus Night Syrup 4oz', 
      image: '/images/products/zarbees-childrens-cough-mucus-night-syrup-4oz.png', 
      price: 11.99, 
      description: 'Get a peaceful night\'s rest for your child with Zarbee\'s Children\'s Cough+Mucus Night Syrup! Made with natural ingredients, this 4oz syrup soothes coughs and provides relief from mucus while they sleep. Give them the comfort and rest they deserve.', 
      category: 'Cough & Congestion Relief', 
      isFeatured: true 
  },
  { 
      id: 15, 
      name: 'Zarbee\'s Children\'s Cough+Mucus Day Syrup 4oz', 
      image: '/images/products/zarbees-childrens-cough-mucus-day-syrup-4oz.png', 
      price: 11.99, 
      description: 'Zarbee\'s Children\'s Cough+Mucus Day Syrup 4oz provides fast, effective relief for your child\'s cough and mucus. Our natural formula is free of dyes, alcohol, and drugs, making it safe and gentle for kids. Say goodbye to coughs and mucus with Zarbee\'s!', 
      category: 'Cough & Congestion Relief', 
      isFeatured: true 
  },
  { 
      id: 16, 
      name: 'HYLAND\'S KIDS MUCUS COUGH NT GRP LIQ 4OZ', 
      image: '/images/products/hylands-kids-mucus-cough-nt-grp-liq-4oz.png', 
      price: 13.99, 
      description: 'Relieve your child\'s cough and congestion with HYLAND\'S KIDS MUCUS COUGH NT GRP LIQ 4OZ. This liquid formula targets mucus and soothes coughing, providing fast and effective relief. Keep your little one comfortable and healthy without harsh chemicals or additives.', 
      category: 'Cough & Congestion Relief', 
      isFeatured: true 
  },
  { 
      id: 17, 
      name: 'Hyland’s Kids Cough & Mucus Daytime Grape Liquid 4o', 
      image: '/images/products/hyland-s-kids-cough-mucus-daytime-grape-liquid-4o.png', 
      price: 9.99, 
      description: 'Support your child\'s recovery with Hyland\'s Kids Cough &amp; Mucus Daytime Grape Liquid. Made with natural ingredients, this liquid formula helps relieve cough and congestion for a more comfortable day. With a delicious grape flavor, your child won\'t even know they\'re taking medicine! Try today for a happier, healthier child.', 
      category: 'Cough & Congestion Relief', 
      isFeatured: true 
  },
  { 
      id: 18, 
      name: 'Alka-Seltzer Plus Day & Night Multi-Symptom Cold & Flu Liquid Gels 20ct', 
      image: '/images/products/alka-seltzer-plus-day-night-multi-symptom-cold-flu-liquid-gels-20ct.png', 
      price: 9.99, 
      description: 'Get quick relief from your cold and flu symptoms with Alka-Seltzer Plus Day &amp; Night Multi-Symptom Cold &amp; Flu Liquid Gels 20ct. These liquid gels provide fast and effective relief for both day and night, tackling multiple symptoms at once. Say goodbye to stuffy nose, headache, and more with just one dose!', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 19, 
      name: 'MYLANTA ANTACID CLASSIC LIQ 12OZ', 
      image: '/images/products/mylanta-antacid-classic-liq-12oz.png', 
      price: 9.99, 
      description: 'This classic antacid liquid by Mylanta is a must-have for heartburn and indigestion relief. With its tried and trusted formula, it quickly neutralizes stomach acid, providing fast and effective relief. Keep this 12 oz bottle on hand for whenever you need quick relief from uncomfortable symptoms.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 20, 
      name: 'Phillips Milk of Magnesia Original Liquid 12oz', 
      image: '/images/products/phillips-milk-of-magnesia-original-liquid-12oz.png', 
      price: 7.99, 
      description: 'Experience fast relief from stomach discomfort with Phillips Milk of Magnesia Original Liquid! This 12oz bottle provides powerful relief from constipation, indigestion, and acid reflux. With its trusted formula, it\'s sure to bring you the comfort you need to get back to your day.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 21, 
      name: 'Coricidin HBP Chest Congestion & Cough Liquid Gels 20ct', 
      image: '/images/products/coricidin-hbp-chest-congestion-cough-liquid-gels-20ct.png', 
      price: 10.99, 
      description: 'Experience fast and effective relief from chest congestion and cough with Coricidin HBP Liquid Gels. Its powerful formula targets and alleviates symptoms with ease, allowing you to breathe easier. Perfect for those with high blood pressure. Get 20 liquid gels for long-lasting relief.', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 22, 
      name: 'Alka-Seltzer Extra Strength Effervescent Tablets 24ct', 
      image: '/images/products/alka-seltzer-extra-strength-effervescent-tablets-24ct.png', 
      price: 8.99, 
      description: 'Experience fast and effective relief with Alka-Seltzer Extra Strength Effervescent Tablets. This 24ct pack provides powerful relief from headaches, body aches, and heartburn in a convenient effervescent form. Trust in the trusted formula that has been providing relief for over 80 years.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 23, 
      name: 'Bayer Low Dose Aspirin 81mg Enteric Coated Tablets 32ct', 
      image: '/images/products/bayer-aspirin-low-dose-81mg-enteric-tablets-120ct.png', 
      price: 4.99, 
      description: 'Boost your heart health with Bayer Low Dose Aspirin. With 81mg of aspirin in enteric coated tablets, this 32ct pack provides effective pain relief while protecting your stomach. Take control of your well-being and choose Bayer Low Dose Aspirin for a healthier you!', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 24, 
      name: 'MUCINEX FAST-MAX NT SHFT CLD&FLU 6OZ', 
      image: '/images/products/mucinex-fast-max-nt-shft-cld-flu-6oz.png', 
      price: 17.99, 
      description: 'Relieve your cold and flu symptoms quickly with MUCINEX FAST-MAX NT SHFT CLD&amp;FLU 6OZ. With its fast acting formula, this 6 ounce medicine provides maximum strength relief. Say goodbye to your stuffy nose and sore throat and get back to feeling like yourself again!', 
      category: 'Cold & Flu Relief', 
      isFeatured: true
  },
  { 
      id: 25, 
      name: 'AFRIN ORIGINAL SPRAY 30ML', 
      image: '/images/products/afrin-original-spray-30ml.png', 
      price: 14.99, 
      description: 'Experience instant relief from nasal congestion with AFRIN ORIGINAL SPRAY 30ML. Breathe easier and feel refreshed with just one spray. Perfect for busy days or stuffy nights, this powerful formula provides fast and effective results. Say goodbye to congestion and hello to clear breathing with AFRIN ORIGINAL SPRAY 30ML!', 
      category: 'Nasal Decongestant', 
      isFeatured: true 
  },
  { 
      id: 26, 
      name: 'Coricidin HBP Maximum Strength Flu Tablets 24ct', 
      image: '/images/products/coricidin-hbp-maximum-strength-flu-tablets-24ct.png', 
      price: 12.99, 
      description: 'Get fast and effective relief from flu symptoms with Coricidin HBP Maximum Strength Flu Tablets! With 24 tablets in a pack, these powerful tablets are specially designed for individuals with high blood pressure. Say goodbye to aches, pains, fever, and congestion with our maximum strength formula. Trust Coricidin for maximum flu relief.', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 27, 
      name: 'Dramamine All Day Less Drowsy Motion Sickness Relief 8ct', 
      image: '/images/products/dramamine-all-day-less-drowsy-motion-sickness-relief-8ct.png', 
      price: 7.99, 
      description: 'Don\'t let motion sickness ruin your day! Dramamine All Day Less Drowsy provides long-lasting relief from nausea and dizziness, so you can enjoy your travels without feeling drowsy. This 8ct pack is perfect for on-the-go relief. Say goodbye to motion sickness and hello to a day full of adventure!', 
      category: 'Motion Sickness Relief', 
      isFeatured: true 
  },
  { 
      id: 28, 
      name: 'Coricidin HBP Chest Cold & Flu Tablets 10ct', 
      image: '/images/products/coricidin-hbp-chest-cold-flu-tablets-10ct.png', 
      price: 6.99, 
      description: 'Easily tackle your chest cold and flu symptoms with Coricidin HBP Chest Cold &amp; Flu Tablets. Specifically designed for those with high blood pressure, this 10ct pack provides fast and effective relief. No more struggling with multiple medications, now you can conquer your cold and flu with just one tablet.', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 29, 
      name: 'Children\'s Tylenol Pain + Fever 160mg Acetaminophen Bubblegum Chewable Tablets 24ct', 
      image: '/images/products/childrens-tylenol-pain-fever-160mg-acetaminophen-bubblegum-chewable-tablets-24ct.png', 
      price: 11.99, 
      description: 'Relieve your child\'s pain and fever with Children\'s Tylenol Bubblegum Chewable Tablets. With 160mg of acetaminophen, this 24-count pack offers fast-acting relief in a fun and delicious bubblegum flavor. Trust in the #1 pediatrician recommended brand to keep your child feeling their best!', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 30, 
      name: 'Children\'s Tylenol Cold + Cough + Runny Nose Oral Suspension Grape Flavor 4oz', 
      image: '/images/products/childrens-tylenol-cold-cough-runny-nose-oral-suspension-grape-4oz.png', 
      price: 11.99, 
      description: 'Stay ahead of your child\'s cold with Children\'s Tylenol Cold + Cough + Runny Nose Oral Suspension! This grape-flavored syrup not only relieves symptoms like coughing and runny nose, but also soothes sore throats and reduces fever. Give your little one fast and effective relief today!', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 31, 
      name: 'Pepto Bismol Maximum Strength Liquid 8oz', 
      image: '/images/products/pepto-bismol-5-symptom-relief-original-liquid-8oz.png', 
      price: 9.99, 
      description: 'Experience fast relief from stomach discomfort with Pepto Bismol Maximum Strength Liquid. Its powerful formula helps soothe nausea, heartburn, indigestion, and upset stomach. Keep this 8oz bottle on hand for quick and easy relief whenever you need it.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 32, 
      name: 'Voltaren Topical Gel 1% 50g', 
      image: '/images/products/voltaren-topical-gel-1-50g.png', 
      price: 14.99, 
      description: 'Get fast and effective pain relief with Voltaren Topical Gel. This 1% gel comes in a convenient 50g tube, making it perfect for on-the-go use. The powerful formula works to reduce inflammation and provide targeted relief, getting you back on your feet in no time. Say goodbye to aches and pains with Voltaren.', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 33, 
      name: 'Pepto Bismol Kids Gummies 24ct', 
      image: '/images/products/pepto-bismol-kids-gummies-24ct.png', 
      price: 11.99, 
      description: 'Take care of your child\'s upset stomach and digestive issues with Pepto-Bismol Kids Gummies. These 24ct gummies are specifically designed for children, providing fast and effective relief. Say goodbye to stomach aches and hello to happy kids with Pepto-Bismol!', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 34, 
      name: 'PEPCID MAX TABLET ORIGINAL 8CT', 
      image: '/images/products/pepcid-max-tablet-original-8ct.png', 
      price: 8.99, 
      description: 'Relieve heartburn and acid indigestion with PEPCID MAX TABLET ORIGINAL 8CT! Our powerful formula contains 20mg of famotidine, providing fast and effective relief. Keep these convenient tablets on hand for on-the-go relief so you can enjoy your favorite foods without discomfort. Try PEPCID MAX today for maximum relief!', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 35, 
      name: 'Xyzal 24HR Allergy 5mg Tablet 10ct', 
      image: '/images/products/xyzal-24hr-allergy-5mg-tablet-10ct.png', 
      price: 11.99, 
      description: 'Relieve your allergy symptoms with Xyzal 24HR Allergy 5mg Tablet 10ct. This powerful medication provides 24 hours of relief from sneezing, runny nose, and itchy eyes. Say goodbye to allergies and hello to clear, comfortable breathing. Trust Xyzal for all-day relief!', 
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 36, 
      name: 'Bengay Ultra Strength Cream 2oz', 
      image: '/images/products/bengay-ultra-strength-cream-2oz.png', 
      price: 7.99, 
      description: 'Feel the ultra strength of Bengay cream! Relieve your aches and pains with this powerful 2oz cream. Perfect for targeted pain relief, Bengay will help you continue your activities without the discomfort. Get back to doing what you love with Bengay Ultra Strength Cream!', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 37, 
      name: 'Cepacol Extra Strength Sore Throat Honey Lemon Lozenges 16ct', 
      image: '/images/products/cepacol-extra-strength-sore-throat-honey-lemon-lozenges-16ct.png', 
      price: 4.99, 
      description: 'Soothe your sore throat with Cepacol\'s Extra Strength Honey Lemon Lozenges. These powerful lozenges will provide fast and effective relief, while the delicious honey lemon flavor will soothe and comfort your throat. Say goodbye to aches and hello to relief with Cepacol.', 
      category: 'Sore Throat Relief', 
      isFeatured: true 
  },
  { 
      id: 38, 
      name: 'Prilosec OTC Heartburn Relief and Acid Reducer Tablets 14ct', 
      image: '/images/products/prilosec-otc-heartburn-relief-and-acid-reducer-tablets-14ct.png', 
      price: 17.99, 
      description: 'Prilosec OTC provides fast and effective relief from heartburn and acid reflux with just one tablet a day! Say goodbye to uncomfortable and disruptive symptoms, and hello to feeling comfortable and at ease after meals. Trust Prilosec OTC for all-day, all-night heartburn relief.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 39, 
      name: 'Unisom SleepTabs Doxylamine Succinate Tablets 16ct', 
      image: '/images/products/unisom-sleeptabs-doxylamine-succinate-tablets-16ct.png', 
      price: 8.99, 
      description: 'Enhance your sleep with Unisom SleepTabs! Our 16ct tablets contain Doxylamine Succinate, a powerful ingredient that helps you fall asleep faster and stay asleep longer. Wake up feeling refreshed and ready to take on the day. Get the rest you deserve with Unisom SleepTabs!', 
      category: 'OTC Medications', 
      isFeatured: true 
  },
  { 
      id: 40, 
      name: 'Benadryl Allergy Dye-Free Liquigels 24ct', 
      image: '/images/products/benadryl-allergy-dye-free-liquigels-24ct.png', 
      price: 10.99, 
      description: 'Experience fast-acting relief from your allergies with Benadryl Allergy Dye-Free Liquigels 24ct. These dye-free liquigels provide effective relief from common allergy symptoms such as sneezing, runny nose, and itchy eyes. With 24 liquigels per pack, you\'ll be ready to take on the day without worrying about allergies holding you back.', 
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 41, 
      name: 'Children\'s Mucinex Stuffy Nose & Chest Congestion Very Berry Flavor 4oz', 
      image: '/images/products/childrens-mucinex-stuffy-nose-chest-congestion-very-berry-flavor-4oz.png', 
      price: 15.99, 
      description: 'Relieve your child\'s worst stuffy nose and chest congestion with Children\'s Mucinex, now in a delicious Very Berry flavor. This 4oz bottle is specially formulated to provide fast and effective relief, so your little one can breathe easy and get back to being their active self. Trust in the power of Mucinex to keep your child healthy and happy.', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 42, 
      name: 'Vicks Vaporub Cough Suppressant Topical Ointment 50g', 
      image: '/images/products/vicks-vaporub-cough-suppressant-topical-ointment-50g.png', 
      price: 7.99, 
      description: 'Experience soothing relief from coughs and congestion with Vicks Vaporub. This topical ointment acts as a powerful cough suppressant while providing cooling relief to your chest and throat. With its blend of therapeutic ingredients, this 50g ointment is an essential addition to any medicine cabinet. Breathe easier and feel better with Vicks Vaporub.', 
      category: 'OTC Medications', 
      isFeatured: true 
  },
  { 
      id: 43, 
      name: 'Nature Made Multi Complete w/Iron Tablets 130ct', 
      image: '/images/products/nature-made-multi-complete-w-iron-tablets-130ct.png', 
      price: 12.49, 
      description: 'Boost your health with Nature Made Multi Complete w/Iron Tablets 130ct! This essential supplement provides a complete blend of vitamins and minerals, including iron, to support your overall well-being. With just one tablet a day, you can feel confident in meeting your daily nutrient needs. Don\'t wait, start nourishing your body today!', 
      category: 'Vitamins', 
      isFeatured: true 
  },
  { 
      id: 44, 
      name: 'Zicam Cold Remedy Rapidmelt Cherry Flavor Tablets 25ct', 
      image: '/images/products/zicam-cold-remedy-rapidmelt-cherry-flavor-tablets-25ct.png', 
      price: 13.99, 
      description: 'Conquer colds with Zicam Cold Remedy! Our Rapidmelt Cherry Flavor Tablets provide fast relief from cold symptoms. Experience the soothing effects of cherry while our powerful formula works to shorten your cold. With 25 tablets per pack, you\'ll be prepared to fight off any cold that comes your way!', 
      category: 'OTC Medications', 
      isFeatured: true 
  },
  { 
      id: 45, 
      name: 'MegaRed Omega-3 350mg Krill Oil Softgels 60ct', 
      image: '/images/products/megared-omega-3-350mg-krill-oil-softgels-60ct.png', 
      price: 28.99, 
      description: 'Boost your heart health with MegaRed Omega-3 350mg Krill Oil Softgels! Made with pure krill oil, each softgel provides powerful omega-3 fatty acids to support cardiovascular function. Experience the benefits of this premium supplement and feel confident in your heart health.', 
      category: 'Omega-3 Supplements', 
      isFeatured: true 
  },
  { 
      id: 46, 
      name: 'Move Free Advanced Plus Joint Health with MSM Tablets 120ct', 
      image: '/images/products/move-free-advanced-plus-joint-health-with-msm-tablets-120ct.png', 
      price: 29.99, 
      description: 'Boost your joint health and mobility with Move Free Advanced Plus Joint Health Tablets! Made with MSM, these 120ct tablets provide the essential nutrients your joints need for improved flexibility and range of motion. Trust in this advanced formula to keep you moving freely and living life to the fullest.', 
      category: 'Joint Health Supplements', 
      isFeatured: true 
  },
  { 
      id: 47, 
      name: 'Sudafed PE Pressure & Pain Max Strength Caplets 24ct', 
      image: '/images/products/sudafed-pe-pressure-pain-max-strength-caplets-24ct.png', 
      price: 11.49, 
      description: 'Experience fast and effective relief with Sudafed PE Pressure &amp; Pain Max Strength Caplets. This 24ct pack targets sinus pressure, congestion, and headaches, providing all-day relief. Trust in the power of Sudafed to tackle your toughest cold symptoms so you can get back to feeling your best!', 
      category: 'Sinus & Cold Relief', 
      isFeatured: true 
  },
  { 
      id: 48, 
      name: 'Vicks DayQuil Cold & flu Multi-Symptom Relief, 24 CT', 
      image: '/images/products/vicks-dayquil-cold-flu-multi-symptom-relief-24ct.png', 
      price: 12.99, 
      description: 'Fight back against cold and flu season with Vicks DayQuil. Our powerful formula provides multi-symptom relief, tackling nasal congestion, cough, headache, sore throat, and more. Get back to feeling your best with Vicks DayQuil, available in a convenient 24 CT package.', 
      category: 'Uncategorized', 
      isFeatured: true 
  },
  { 
      id: 49, 
      name: 'HALLS RELIEF HONEY LEMON COUGH DROPS', 
      image: '/images/products/halls-relief-honey-lemon-cough-drops-30ct.png', 
      price: 3.09, 
      description: 'Experience the soothing relief of HALLS RELIEF HONEY LEMON COUGH DROPS. Made with real honey and natural lemon flavor, these drops provide fast and effective cough relief. Say goodbye to pesky coughs and hello to a moment of sweet relief.', 
      category: 'Cough & Throat Relief', 
      isFeatured: true 
  },
  { 
      id: 50, 
      name: 'Zyrtec 24-Hour Allergy Relief', 
      image: '/images/products/zyrtec-24-hour-allergy-relief-14ct.png', 
      price: 15.99, 
      description: 'Say goodbye to sneezing and sniffles with Zyrtec 24-Hour Allergy Relief. Our fast-acting formula provides relief from indoor and outdoor allergies for a full day. Finally, you can enjoy the great outdoors without worrying about allergies. Take control of your allergies and live your life to the fullest with Zyrtec!', 
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 51, 
      name: 'Imodium Anti-Diarrheal Multi-Symptom Relief Caplets 18ct', 
      image: '/images/products/imodium-anti-diarrheal-multi-symptom-relief-caplets-18ct.png', 
      price: 17.49, 
      description: 'Easily find multi-symptom relief with Imodium Anti-Diarrheal Caplets. Each 18ct pack offers fast and effective relief from nausea, cramps, and diarrhea. Say goodbye to discomfort and hello to convenience with this trusted solution.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 52, 
      name: 'Tums Chewy Bites Extra Strength Assorted Berry Tablets 32ct', 
      image: '/images/products/tums-chewy-bites-extra-strength-assorted-berry-tablets-32ct.png', 
      price: 7.99, 
      description: 'Indulge in fast and effective relief with Tums Chewy Bites Extra Strength Assorted Berry Tablets. These chewable tablets provide soothing relief from heartburn, acid indigestion, and upset stomach in a delicious berry flavor. Take them on the go for on-the-spot relief. Trust in Tums to ease your discomfort and keep you feeling your best.', 
      category: 'Digestive Health', 
      isFeatured: true 
  },
  { 
      id: 53, 
      name: 'Theraflu Flu Relief Max Strength Daytime Packets 6ct', 
      image: '/images/products/theraflu-flu-relief-max-strength-daytime-packets-6ct.png', 
      price: 12.49, 
      description: 'Relieve your flu symptoms with Theraflu Flu Relief Max Strength Daytime Packets. This pack of 6 packets provides fast-acting relief for your cough, congestion, and body aches. Get back to your day with powerful, effective relief. Try it now!', 
      category: 'OTC Medications', 
      isFeatured: true 
  },
  { 
      id: 54, 
      name: 'Aleve Naproxen Sodium Tablets 220mg Pain Reliever/Fever Reducer Caplets 90ct', 
      image: '/images/products/aleve-naproxen-sodium-tablets-220mg-pain-reliever-fever-reducer-caplets-90ct.png', 
      price: 15.99, 
      description: 'Aleve Naproxen Sodium Tablets provide fast and effective relief from pain and reduce fever. With 220mg of Naproxen Sodium per caplet, this 90ct bottle is a reliable and convenient solution for everyday aches and pains. Trust in Aleve for expert relief.', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 55, 
      name: 'Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels 160ct', 
      image: '/images/products/advil-ibuprofen-pain-reliever-fever-reducer-liqui-gels-160ct.png', 
      price: 21.49, 
      description: 'Experience fast-acting relief with Advil Ibuprofen Pain Reliever/Fever Reducer Liqui-Gels. With 200mg of ibuprofen in each oral capsule, these 160ct liqui-gels provide effective pain and fever relief. Trust in the power of ibuprofen to alleviate your discomfort.', 
      category: 'Pain Relief', 
      isFeatured: true 
  },
  { 
      id: 56, 
      name: 'Band-Aid Brand Flexible Fabric Adhesive Bandages, 30 Count', 
      image: '/images/products/band-aid-brand-flexible-fabric-adhesive-bandages-30-count.png', 
      price: 5.49, 
      description: 'Experience reliable and comfortable wound protection with Band-Aid Brand Flexible Fabric Adhesive Bandages, now available in a 30 count pack. These bandages are designed to flex and move with your body for optimal coverage and protection while allowing for breathability. Perfect for those on-the-go, these bandages will stay in place while you live your life to the fullest!', 
      category: 'First Aid', 
      isFeatured: true 
  },
  { 
      id: 57, 
      name: 'Pepto Bismol 5 Symptoms Digestive Relief Liquid, Original, 16 Ounces', 
      image: '/images/products/pepto-bismol-liquid-original-16oz.png', 
      price: 8.99, 
      description: 'Help relieve your digestive symptoms with Pepto Bismol Digestive Relief Liquid! Made with a soothing, original formula, this 16-ounce bottle tackles five different symptoms, providing quick and effective relief. Trust Pepto Bismol to alleviate your discomfort and get you back to feeling your best.', 
      category: 'Digestive Relief', 
      isFeatured: true 
  },
  { 
      id: 58, 
      name: 'Nature Made Vitamin C 500mg Liquigel 60ct', 
      image: '/images/products/nature-made-vitamin-c-500mg-liquigel-60ct.png', 
      price: 15.49, 
      description: 'Boost your immune system and support your overall health with Nature Made Vitamin C 500mg Liquigel. With 60 easy-to-swallow capsules, this supplement provides a powerful dose of vitamin C to help ward off illness and promote wellness. Stay healthy all year round with Nature Made Vitamin C Liquigel.', 
      category: 'Vitamins', 
      isFeatured: true 
  },
  { 
      id: 59, 
      name: 'Claritin 24HR 10mg Tablets 30ct', 
      image: '/images/products/claritin-24hr-10mg-tablets-30ct.png', 
      price: 21.99, 
      description: "Experience 24 hours of non-drowsy allergy relief with Claritin 24HR 10mg Tablets! Perfect for those with allergies, these tablets provide fast-acting and long-lasting relief so you can feel your best. With 30 tablets per box, you'll be prepared for any seasonal allergies that come your way.",
      category: 'Allergy Relief', 
      isFeatured: true 
  },
  { 
      id: 60, 
      name: 'Tylenol Extra Strength 500mg Caplets 24ct', 
      image: '/images/products/tylenol-extra-strength-500mg-caplets-24ct.png', 
      price: 5.15, 
      description: "Boost your day with Tylenol Extra Strength Caplets! Each caplet contains 500mg of fast-acting pain relief to ease aches and pains. With a convenient 24 count, you can stay prepared for those unexpected moments. Trust Tylenol for powerful relief and get back to your day!",
      category: 'OTC Medications', 
      isFeatured: true 
  },
  { 
      id: 61, 
      name: 'MUCINEX FAST MAX CLD FLU SR THR CPL 20CT', 
      image: '/images/products/mucinex-fast-max-cld-flu-sr-thr-cpl-20ct.png', 
      price: 19.49, 
      description: 'Get quick and lasting relief from cold and flu symptoms with Mucinex Fast Max. This powerful formula targets cough, congestion, and body aches, allowing you to breathe easier and feel better. Conveniently packaged in a 20-count tablet form, Mucinex Fast Max is the perfect addition to any cold and flu medicine cabinet.', 
      category: 'Cold & Flu Relief', 
      isFeatured: true 
  },
  { 
      id: 62, 
      name: 'Robitussin Maximum Strength Cough+Chest Congestion DM 8oz', 
      image: '/images/products/robitussin-maximum-strength-cough-chest-congestion-dm-8oz.png', 
      price: 15.5, 
      description: 'Find relief from your worst cough and chest congestion with Robitussin Maximum Strength! Our powerful formula works to break up mucus and suppress your cough, so you can breathe easier and feel better. Suitable for adults and children ages 12 and up.Fast relief for cold and flu symptoms.', 
      category: 'Cough & Congestion Relief', 
      isFeatured: true 
  },
];
export default products;