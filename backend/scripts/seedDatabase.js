const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Drug = require('../models/Drug');
const { 
  generateEmbeddingsBatchChunked, 
  prepareDrugTextForEmbedding 
} = require('../services/embeddingService');

// Comprehensive drug data templates
const drugTemplates = [
  // Diabetes medications
  {
    therapeutic_class: 'Biguanides',
    drugs: [
      { name: 'Metformin', generic: 'metformin', brands: ['Glucophage', 'Fortamet', 'Glumetza'], dosages: ['500mg', '850mg', '1000mg'], tier: 1, cost: 12, keywords: ['diabetes', 'blood sugar', 'type 2 diabetes', 'insulin resistance'] },
      { name: 'Metformin ER', generic: 'metformin extended-release', brands: ['Glucophage XR'], dosages: ['500mg', '750mg'], tier: 1, cost: 18, keywords: ['diabetes', 'extended release', 'once daily'] }
    ],
    description: 'oral antidiabetic medication that decreases glucose production in the liver and improves insulin sensitivity',
    side_effects: ['nausea', 'diarrhea', 'stomach upset', 'vitamin B12 deficiency'],
    interactions: ['alcohol', 'contrast dye', 'cimetidine']
  },
  {
    therapeutic_class: 'Sulfonylureas',
    drugs: [
      { name: 'Glipizide', generic: 'glipizide', brands: ['Glucotrol'], dosages: ['5mg', '10mg'], tier: 1, cost: 15, keywords: ['diabetes', 'insulin secretion', 'blood sugar'] },
      { name: 'Glyburide', generic: 'glyburide', brands: ['DiaBeta', 'Glynase'], dosages: ['1.25mg', '2.5mg', '5mg'], tier: 1, cost: 14, keywords: ['diabetes', 'type 2 diabetes'] },
      { name: 'Glimepiride', generic: 'glimepiride', brands: ['Amaryl'], dosages: ['1mg', '2mg', '4mg'], tier: 1, cost: 16, keywords: ['diabetes', 'once daily'] }
    ],
    description: 'antidiabetic medication that stimulates pancreatic beta cells to release insulin',
    side_effects: ['hypoglycemia', 'weight gain', 'nausea'],
    interactions: ['alcohol', 'NSAIDs', 'beta blockers']
  },
  {
    therapeutic_class: 'GLP-1 Agonists',
    drugs: [
      { name: 'Semaglutide', generic: 'semaglutide', brands: ['Ozempic', 'Wegovy'], dosages: ['0.25mg', '0.5mg', '1mg'], tier: 4, cost: 450, keywords: ['diabetes', 'weight loss', 'GLP-1', 'injection'] },
      { name: 'Liraglutide', generic: 'liraglutide', brands: ['Victoza', 'Saxenda'], dosages: ['0.6mg', '1.2mg', '1.8mg'], tier: 4, cost: 420, keywords: ['diabetes', 'weight loss', 'daily injection'] },
      { name: 'Dulaglutide', generic: 'dulaglutide', brands: ['Trulicity'], dosages: ['0.75mg', '1.5mg'], tier: 4, cost: 435, keywords: ['diabetes', 'weekly injection'] }
    ],
    description: 'glucagon-like peptide-1 receptor agonist that enhances insulin secretion and reduces appetite',
    side_effects: ['nausea', 'vomiting', 'diarrhea', 'injection site reactions'],
    interactions: ['insulin', 'oral medications (delayed absorption)']
  },
  
  // Cardiovascular - Statins
  {
    therapeutic_class: 'HMG-CoA Reductase Inhibitors (Statins)',
    drugs: [
      { name: 'Atorvastatin', generic: 'atorvastatin', brands: ['Lipitor'], dosages: ['10mg', '20mg', '40mg', '80mg'], tier: 1, cost: 18, keywords: ['cholesterol', 'heart disease', 'lipid', 'statin'] },
      { name: 'Simvastatin', generic: 'simvastatin', brands: ['Zocor'], dosages: ['5mg', '10mg', '20mg', '40mg'], tier: 1, cost: 15, keywords: ['cholesterol', 'cardiovascular', 'lipid'] },
      { name: 'Rosuvastatin', generic: 'rosuvastatin', brands: ['Crestor'], dosages: ['5mg', '10mg', '20mg', '40mg'], tier: 2, cost: 35, keywords: ['cholesterol', 'high potency statin'] },
      { name: 'Pravastatin', generic: 'pravastatin', brands: ['Pravachol'], dosages: ['10mg', '20mg', '40mg'], tier: 1, cost: 16, keywords: ['cholesterol', 'cardiovascular'] },
      { name: 'Lovastatin', generic: 'lovastatin', brands: ['Mevacor'], dosages: ['10mg', '20mg', '40mg'], tier: 1, cost: 14, keywords: ['cholesterol', 'lipid lowering'] }
    ],
    description: 'cholesterol-lowering medication that inhibits HMG-CoA reductase enzyme to reduce LDL cholesterol and prevent cardiovascular disease',
    side_effects: ['muscle pain', 'liver enzyme elevation', 'headache', 'digestive problems'],
    interactions: ['grapefruit juice', 'fibrates', 'cyclosporine']
  },
  
  // Blood Pressure - ACE Inhibitors
  {
    therapeutic_class: 'ACE Inhibitors',
    drugs: [
      { name: 'Lisinopril', generic: 'lisinopril', brands: ['Prinivil', 'Zestril'], dosages: ['5mg', '10mg', '20mg', '40mg'], tier: 1, cost: 12, keywords: ['blood pressure', 'hypertension', 'heart failure', 'ACE inhibitor'] },
      { name: 'Enalapril', generic: 'enalapril', brands: ['Vasotec'], dosages: ['2.5mg', '5mg', '10mg', '20mg'], tier: 1, cost: 14, keywords: ['blood pressure', 'hypertension', 'heart failure'] },
      { name: 'Ramipril', generic: 'ramipril', brands: ['Altace'], dosages: ['1.25mg', '2.5mg', '5mg', '10mg'], tier: 1, cost: 16, keywords: ['blood pressure', 'cardiovascular protection'] },
      { name: 'Benazepril', generic: 'benazepril', brands: ['Lotensin'], dosages: ['5mg', '10mg', '20mg', '40mg'], tier: 1, cost: 15, keywords: ['blood pressure', 'hypertension'] }
    ],
    description: 'angiotensin-converting enzyme inhibitor that relaxes blood vessels and reduces blood pressure',
    side_effects: ['dry cough', 'dizziness', 'hyperkalemia', 'angioedema'],
    interactions: ['potassium supplements', 'NSAIDs', 'lithium']
  },
  
  // Blood Pressure - ARBs
  {
    therapeutic_class: 'Angiotensin II Receptor Blockers (ARBs)',
    drugs: [
      { name: 'Losartan', generic: 'losartan', brands: ['Cozaar'], dosages: ['25mg', '50mg', '100mg'], tier: 1, cost: 18, keywords: ['blood pressure', 'hypertension', 'ARB'] },
      { name: 'Valsartan', generic: 'valsartan', brands: ['Diovan'], dosages: ['40mg', '80mg', '160mg', '320mg'], tier: 2, cost: 32, keywords: ['blood pressure', 'heart failure'] },
      { name: 'Olmesartan', generic: 'olmesartan', brands: ['Benicar'], dosages: ['5mg', '20mg', '40mg'], tier: 2, cost: 35, keywords: ['blood pressure', 'hypertension'] },
      { name: 'Irbesartan', generic: 'irbesartan', brands: ['Avapro'], dosages: ['75mg', '150mg', '300mg'], tier: 2, cost: 30, keywords: ['blood pressure', 'diabetic nephropathy'] }
    ],
    description: 'angiotensin receptor blocker that prevents blood vessel constriction and lowers blood pressure',
    side_effects: ['dizziness', 'hyperkalemia', 'kidney problems'],
    interactions: ['potassium supplements', 'NSAIDs', 'lithium']
  },
  
  // Beta Blockers
  {
    therapeutic_class: 'Beta-Adrenergic Blockers',
    drugs: [
      { name: 'Metoprolol', generic: 'metoprolol', brands: ['Lopressor', 'Toprol-XL'], dosages: ['25mg', '50mg', '100mg'], tier: 1, cost: 14, keywords: ['blood pressure', 'heart rate', 'beta blocker', 'heart attack'] },
      { name: 'Atenolol', generic: 'atenolol', brands: ['Tenormin'], dosages: ['25mg', '50mg', '100mg'], tier: 1, cost: 12, keywords: ['blood pressure', 'angina', 'beta blocker'] },
      { name: 'Carvedilol', generic: 'carvedilol', brands: ['Coreg'], dosages: ['3.125mg', '6.25mg', '12.5mg', '25mg'], tier: 1, cost: 16, keywords: ['heart failure', 'blood pressure'] },
      { name: 'Propranolol', generic: 'propranolol', brands: ['Inderal'], dosages: ['10mg', '20mg', '40mg', '80mg'], tier: 1, cost: 13, keywords: ['blood pressure', 'anxiety', 'migraine prevention'] }
    ],
    description: 'beta-adrenergic blocking agent that slows heart rate and reduces blood pressure',
    side_effects: ['fatigue', 'cold extremities', 'bradycardia', 'dizziness'],
    interactions: ['calcium channel blockers', 'digoxin', 'insulin']
  },
  
  // Calcium Channel Blockers
  {
    therapeutic_class: 'Calcium Channel Blockers',
    drugs: [
      { name: 'Amlodipine', generic: 'amlodipine', brands: ['Norvasc'], dosages: ['2.5mg', '5mg', '10mg'], tier: 1, cost: 15, keywords: ['blood pressure', 'angina', 'calcium channel blocker'] },
      { name: 'Diltiazem', generic: 'diltiazem', brands: ['Cardizem'], dosages: ['120mg', '180mg', '240mg'], tier: 1, cost: 18, keywords: ['blood pressure', 'heart rate', 'angina'] },
      { name: 'Nifedipine', generic: 'nifedipine', brands: ['Procardia', 'Adalat'], dosages: ['30mg', '60mg', '90mg'], tier: 1, cost: 17, keywords: ['blood pressure', 'Raynauds'] }
    ],
    description: 'calcium channel blocker that relaxes blood vessels and reduces blood pressure',
    side_effects: ['ankle swelling', 'flushing', 'headache', 'dizziness'],
    interactions: ['grapefruit juice', 'simvastatin', 'digoxin']
  },
  
  // Diuretics
  {
    therapeutic_class: 'Thiazide Diuretics',
    drugs: [
      { name: 'Hydrochlorothiazide', generic: 'hydrochlorothiazide', brands: ['Microzide'], dosages: ['12.5mg', '25mg', '50mg'], tier: 1, cost: 10, keywords: ['blood pressure', 'diuretic', 'water pill', 'edema'] },
      { name: 'Chlorthalidone', generic: 'chlorthalidone', brands: ['Thalitone'], dosages: ['25mg', '50mg'], tier: 1, cost: 12, keywords: ['blood pressure', 'diuretic'] }
    ],
    description: 'thiazide diuretic that helps kidneys eliminate sodium and water to lower blood pressure',
    side_effects: ['frequent urination', 'low potassium', 'dizziness', 'increased blood sugar'],
    interactions: ['lithium', 'digoxin', 'NSAIDs']
  },
  
  // Pain medications - NSAIDs
  {
    therapeutic_class: 'Nonsteroidal Anti-Inflammatory Drugs (NSAIDs)',
    drugs: [
      { name: 'Ibuprofen', generic: 'ibuprofen', brands: ['Advil', 'Motrin'], dosages: ['200mg', '400mg', '600mg', '800mg'], tier: 1, cost: 8, keywords: ['pain', 'inflammation', 'fever', 'arthritis', 'NSAID'] },
      { name: 'Naproxen', generic: 'naproxen', brands: ['Aleve', 'Naprosyn'], dosages: ['220mg', '250mg', '375mg', '500mg'], tier: 1, cost: 10, keywords: ['pain', 'inflammation', 'arthritis'] },
      { name: 'Celecoxib', generic: 'celecoxib', brands: ['Celebrex'], dosages: ['100mg', '200mg'], tier: 2, cost: 45, keywords: ['pain', 'arthritis', 'COX-2 inhibitor'] },
      { name: 'Meloxicam', generic: 'meloxicam', brands: ['Mobic'], dosages: ['7.5mg', '15mg'], tier: 1, cost: 14, keywords: ['pain', 'arthritis', 'inflammation'] },
      { name: 'Diclofenac', generic: 'diclofenac', brands: ['Voltaren'], dosages: ['50mg', '75mg'], tier: 1, cost: 16, keywords: ['pain', 'arthritis', 'inflammation'] }
    ],
    description: 'nonsteroidal anti-inflammatory drug that reduces pain, fever, and inflammation by inhibiting prostaglandin synthesis',
    side_effects: ['stomach upset', 'heartburn', 'ulcers', 'kidney problems', 'cardiovascular risk'],
    interactions: ['blood thinners', 'corticosteroids', 'ACE inhibitors', 'lithium']
  },
  
  // Pain - Opioids
  {
    therapeutic_class: 'Opioid Analgesics',
    drugs: [
      { name: 'Hydrocodone/Acetaminophen', generic: 'hydrocodone-acetaminophen', brands: ['Vicodin', 'Norco'], dosages: ['5/325mg', '7.5/325mg', '10/325mg'], tier: 3, cost: 25, keywords: ['pain', 'opioid', 'narcotic', 'moderate to severe pain'] },
      { name: 'Oxycodone', generic: 'oxycodone', brands: ['OxyContin'], dosages: ['5mg', '10mg', '15mg', '20mg'], tier: 3, cost: 35, keywords: ['pain', 'opioid', 'severe pain'] },
      { name: 'Tramadol', generic: 'tramadol', brands: ['Ultram'], dosages: ['50mg', '100mg'], tier: 2, cost: 18, keywords: ['pain', 'moderate pain'] },
      { name: 'Morphine', generic: 'morphine', brands: ['MS Contin'], dosages: ['15mg', '30mg', '60mg'], tier: 3, cost: 40, keywords: ['pain', 'severe pain', 'opioid'] }
    ],
    description: 'opioid analgesic that binds to opioid receptors in the brain and spinal cord to relieve moderate to severe pain',
    side_effects: ['constipation', 'drowsiness', 'nausea', 'respiratory depression', 'addiction risk'],
    interactions: ['benzodiazepines', 'alcohol', 'muscle relaxants', 'sedatives']
  },
  
  // Antibiotics - Penicillins
  {
    therapeutic_class: 'Penicillin Antibiotics',
    drugs: [
      { name: 'Amoxicillin', generic: 'amoxicillin', brands: ['Amoxil'], dosages: ['250mg', '500mg', '875mg'], tier: 1, cost: 10, keywords: ['antibiotic', 'infection', 'bacterial', 'penicillin'] },
      { name: 'Amoxicillin/Clavulanate', generic: 'amoxicillin-clavulanate', brands: ['Augmentin'], dosages: ['500/125mg', '875/125mg'], tier: 1, cost: 20, keywords: ['antibiotic', 'infection', 'broad spectrum'] },
      { name: 'Penicillin VK', generic: 'penicillin v potassium', brands: [], dosages: ['250mg', '500mg'], tier: 1, cost: 12, keywords: ['antibiotic', 'strep throat', 'bacterial infection'] }
    ],
    description: 'beta-lactam antibiotic that kills bacteria by interfering with cell wall synthesis',
    side_effects: ['diarrhea', 'nausea', 'rash', 'allergic reactions'],
    interactions: ['oral contraceptives', 'methotrexate', 'probenecid']
  },
  
  // Antibiotics - Cephalosporins
  {
    therapeutic_class: 'Cephalosporin Antibiotics',
    drugs: [
      { name: 'Cephalexin', generic: 'cephalexin', brands: ['Keflex'], dosages: ['250mg', '500mg'], tier: 1, cost: 15, keywords: ['antibiotic', 'infection', 'skin infection', 'UTI'] },
      { name: 'Cefdinir', generic: 'cefdinir', brands: ['Omnicef'], dosages: ['300mg'], tier: 2, cost: 25, keywords: ['antibiotic', 'infection', 'respiratory'] },
      { name: 'Cefuroxime', generic: 'cefuroxime', brands: ['Ceftin'], dosages: ['250mg', '500mg'], tier: 2, cost: 28, keywords: ['antibiotic', 'infection', 'sinusitis'] }
    ],
    description: 'cephalosporin antibiotic that treats bacterial infections by disrupting bacterial cell wall formation',
    side_effects: ['diarrhea', 'nausea', 'vomiting', 'rash'],
    interactions: ['anticoagulants', 'probenecid']
  },
  
  // Antibiotics - Macrolides
  {
    therapeutic_class: 'Macrolide Antibiotics',
    drugs: [
      { name: 'Azithromycin', generic: 'azithromycin', brands: ['Zithromax', 'Z-Pak'], dosages: ['250mg', '500mg'], tier: 1, cost: 18, keywords: ['antibiotic', 'infection', 'respiratory', 'z-pack'] },
      { name: 'Clarithromycin', generic: 'clarithromycin', brands: ['Biaxin'], dosages: ['250mg', '500mg'], tier: 2, cost: 30, keywords: ['antibiotic', 'H. pylori', 'respiratory infection'] },
      { name: 'Erythromycin', generic: 'erythromycin', brands: [], dosages: ['250mg', '500mg'], tier: 1, cost: 16, keywords: ['antibiotic', 'penicillin alternative'] }
    ],
    description: 'macrolide antibiotic that inhibits bacterial protein synthesis to treat respiratory and skin infections',
    side_effects: ['nausea', 'diarrhea', 'abdominal pain', 'QT prolongation'],
    interactions: ['statins', 'warfarin', 'digoxin']
  },
  
  // Antibiotics - Fluoroquinolones
  {
    therapeutic_class: 'Fluoroquinolone Antibiotics',
    drugs: [
      { name: 'Ciprofloxacin', generic: 'ciprofloxacin', brands: ['Cipro'], dosages: ['250mg', '500mg', '750mg'], tier: 2, cost: 22, keywords: ['antibiotic', 'UTI', 'infection', 'fluoroquinolone'] },
      { name: 'Levofloxacin', generic: 'levofloxacin', brands: ['Levaquin'], dosages: ['250mg', '500mg', '750mg'], tier: 2, cost: 28, keywords: ['antibiotic', 'pneumonia', 'infection'] },
      { name: 'Moxifloxacin', generic: 'moxifloxacin', brands: ['Avelox'], dosages: ['400mg'], tier: 3, cost: 45, keywords: ['antibiotic', 'respiratory infection'] }
    ],
    description: 'fluoroquinolone antibiotic that inhibits bacterial DNA replication for treating various infections',
    side_effects: ['nausea', 'diarrhea', 'tendon rupture risk', 'QT prolongation', 'photosensitivity'],
    interactions: ['antacids', 'NSAIDs', 'corticosteroids']
  },
  
  // Anticoagulants
  {
    therapeutic_class: 'Anticoagulants',
    drugs: [
      { name: 'Warfarin', generic: 'warfarin', brands: ['Coumadin'], dosages: ['1mg', '2mg', '5mg', '10mg'], tier: 1, cost: 15, keywords: ['blood thinner', 'anticoagulant', 'stroke prevention', 'atrial fibrillation'] },
      { name: 'Apixaban', generic: 'apixaban', brands: ['Eliquis'], dosages: ['2.5mg', '5mg'], tier: 4, cost: 380, keywords: ['blood thinner', 'DOAC', 'stroke prevention'] },
      { name: 'Rivaroxaban', generic: 'rivaroxaban', brands: ['Xarelto'], dosages: ['10mg', '15mg', '20mg'], tier: 4, cost: 390, keywords: ['blood thinner', 'DVT prevention'] },
      { name: 'Dabigatran', generic: 'dabigatran', brands: ['Pradaxa'], dosages: ['75mg', '150mg'], tier: 4, cost: 375, keywords: ['blood thinner', 'stroke prevention'] }
    ],
    description: 'anticoagulant medication that prevents blood clot formation and reduces stroke risk',
    side_effects: ['bleeding', 'bruising', 'anemia'],
    interactions: ['aspirin', 'NSAIDs', 'antibiotics', 'antifungals']
  },
  
  // Antidepressants - SSRIs
  {
    therapeutic_class: 'Selective Serotonin Reuptake Inhibitors (SSRIs)',
    drugs: [
      { name: 'Sertraline', generic: 'sertraline', brands: ['Zoloft'], dosages: ['25mg', '50mg', '100mg'], tier: 1, cost: 16, keywords: ['depression', 'anxiety', 'SSRI', 'mental health'] },
      { name: 'Fluoxetine', generic: 'fluoxetine', brands: ['Prozac'], dosages: ['10mg', '20mg', '40mg'], tier: 1, cost: 15, keywords: ['depression', 'anxiety', 'OCD'] },
      { name: 'Escitalopram', generic: 'escitalopram', brands: ['Lexapro'], dosages: ['5mg', '10mg', '20mg'], tier: 2, cost: 25, keywords: ['depression', 'anxiety'] },
      { name: 'Citalopram', generic: 'citalopram', brands: ['Celexa'], dosages: ['10mg', '20mg', '40mg'], tier: 1, cost: 14, keywords: ['depression', 'anxiety'] },
      { name: 'Paroxetine', generic: 'paroxetine', brands: ['Paxil'], dosages: ['10mg', '20mg', '30mg', '40mg'], tier: 1, cost: 18, keywords: ['depression', 'anxiety', 'panic disorder'] }
    ],
    description: 'selective serotonin reuptake inhibitor that increases serotonin levels in the brain to treat depression and anxiety',
    side_effects: ['nausea', 'insomnia', 'sexual dysfunction', 'weight changes'],
    interactions: ['MAO inhibitors', 'NSAIDs', 'blood thinners', 'tramadol']
  },
  
  // Antidepressants - SNRIs
  {
    therapeutic_class: 'Serotonin-Norepinephrine Reuptake Inhibitors (SNRIs)',
    drugs: [
      { name: 'Duloxetine', generic: 'duloxetine', brands: ['Cymbalta'], dosages: ['20mg', '30mg', '60mg'], tier: 2, cost: 35, keywords: ['depression', 'anxiety', 'nerve pain', 'fibromyalgia'] },
      { name: 'Venlafaxine', generic: 'venlafaxine', brands: ['Effexor'], dosages: ['37.5mg', '75mg', '150mg'], tier: 2, cost: 28, keywords: ['depression', 'anxiety'] },
      { name: 'Desvenlafaxine', generic: 'desvenlafaxine', brands: ['Pristiq'], dosages: ['25mg', '50mg', '100mg'], tier: 3, cost: 55, keywords: ['depression'] }
    ],
    description: 'serotonin-norepinephrine reuptake inhibitor that increases both serotonin and norepinephrine to treat depression and pain',
    side_effects: ['nausea', 'dry mouth', 'increased blood pressure', 'insomnia'],
    interactions: ['MAO inhibitors', 'blood thinners', 'NSAIDs']
  },
  
  // Proton Pump Inhibitors
  {
    therapeutic_class: 'Proton Pump Inhibitors (PPIs)',
    drugs: [
      { name: 'Omeprazole', generic: 'omeprazole', brands: ['Prilosec'], dosages: ['10mg', '20mg', '40mg'], tier: 1, cost: 12, keywords: ['acid reflux', 'GERD', 'heartburn', 'ulcer', 'PPI'] },
      { name: 'Pantoprazole', generic: 'pantoprazole', brands: ['Protonix'], dosages: ['20mg', '40mg'], tier: 1, cost: 14, keywords: ['acid reflux', 'GERD', 'ulcer'] },
      { name: 'Esomeprazole', generic: 'esomeprazole', brands: ['Nexium'], dosages: ['20mg', '40mg'], tier: 2, cost: 28, keywords: ['acid reflux', 'GERD', 'heartburn'] },
      { name: 'Lansoprazole', generic: 'lansoprazole', brands: ['Prevacid'], dosages: ['15mg', '30mg'], tier: 2, cost: 25, keywords: ['acid reflux', 'ulcer'] }
    ],
    description: 'proton pump inhibitor that reduces stomach acid production to treat GERD and ulcers',
    side_effects: ['headache', 'diarrhea', 'vitamin B12 deficiency', 'increased fracture risk'],
    interactions: ['clopidogrel', 'warfarin', 'methotrexate']
  },
  
  // Asthma/COPD - Bronchodilators
  {
    therapeutic_class: 'Beta-2 Agonist Bronchodilators',
    drugs: [
      { name: 'Albuterol', generic: 'albuterol', brands: ['ProAir', 'Ventolin'], dosages: ['90mcg inhaler'], tier: 1, cost: 45, keywords: ['asthma', 'bronchodilator', 'rescue inhaler', 'wheezing'] },
      { name: 'Levalbuterol', generic: 'levalbuterol', brands: ['Xopenex'], dosages: ['45mcg inhaler'], tier: 2, cost: 65, keywords: ['asthma', 'bronchodilator'] }
    ],
    description: 'short-acting beta-2 agonist that relaxes airway muscles for quick relief of asthma symptoms',
    side_effects: ['tremor', 'nervousness', 'rapid heartbeat', 'headache'],
    interactions: ['beta blockers', 'diuretics', 'digoxin']
  },
  
  // Asthma - Inhaled Corticosteroids
  {
    therapeutic_class: 'Inhaled Corticosteroids',
    drugs: [
      { name: 'Fluticasone', generic: 'fluticasone', brands: ['Flovent'], dosages: ['44mcg', '110mcg', '220mcg'], tier: 2, cost: 85, keywords: ['asthma', 'inhaled steroid', 'controller medication', 'inflammation'] },
      { name: 'Budesonide', generic: 'budesonide', brands: ['Pulmicort'], dosages: ['90mcg', '180mcg'], tier: 2, cost: 95, keywords: ['asthma', 'COPD', 'inhaled steroid'] },
      { name: 'Beclomethasone', generic: 'beclomethasone', brands: ['QVAR'], dosages: ['40mcg', '80mcg'], tier: 2, cost: 90, keywords: ['asthma', 'inhaled steroid'] }
    ],
    description: 'inhaled corticosteroid that reduces airway inflammation to prevent asthma attacks',
    side_effects: ['oral thrush', 'hoarseness', 'cough'],
    interactions: ['ritonavir', 'ketoconazole']
  },
  
  // Thyroid medications
  {
    therapeutic_class: 'Thyroid Hormones',
    drugs: [
      { name: 'Levothyroxine', generic: 'levothyroxine', brands: ['Synthroid', 'Levoxyl'], dosages: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg'], tier: 1, cost: 14, keywords: ['hypothyroidism', 'thyroid', 'hormone replacement'] },
      { name: 'Liothyronine', generic: 'liothyronine', brands: ['Cytomel'], dosages: ['5mcg', '25mcg', '50mcg'], tier: 2, cost: 35, keywords: ['hypothyroidism', 'T3 hormone'] }
    ],
    description: 'synthetic thyroid hormone replacement for treating hypothyroidism',
    side_effects: ['palpitations', 'weight loss', 'insomnia', 'tremor'],
    interactions: ['calcium', 'iron', 'antacids', 'PPIs']
  },
  
  // Antihistamines
  {
    therapeutic_class: 'Antihistamines',
    drugs: [
      { name: 'Cetirizine', generic: 'cetirizine', brands: ['Zyrtec'], dosages: ['5mg', '10mg'], tier: 1, cost: 10, keywords: ['allergies', 'hay fever', 'antihistamine', 'hives'] },
      { name: 'Loratadine', generic: 'loratadine', brands: ['Claritin'], dosages: ['10mg'], tier: 1, cost: 12, keywords: ['allergies', 'hay fever', 'non-drowsy'] },
      { name: 'Fexofenadine', generic: 'fexofenadine', brands: ['Allegra'], dosages: ['60mg', '120mg', '180mg'], tier: 1, cost: 14, keywords: ['allergies', 'hay fever', 'non-drowsy'] },
      { name: 'Diphenhydramine', generic: 'diphenhydramine', brands: ['Benadryl'], dosages: ['25mg', '50mg'], tier: 1, cost: 8, keywords: ['allergies', 'sleep aid', 'antihistamine'] }
    ],
    description: 'antihistamine that blocks histamine receptors to relieve allergy symptoms',
    side_effects: ['drowsiness', 'dry mouth', 'dizziness'],
    interactions: ['alcohol', 'sedatives', 'MAO inhibitors']
  },
  
  // Osteoporosis
  {
    therapeutic_class: 'Bisphosphonates',
    drugs: [
      { name: 'Alendronate', generic: 'alendronate', brands: ['Fosamax'], dosages: ['5mg', '10mg', '70mg weekly'], tier: 1, cost: 20, keywords: ['osteoporosis', 'bone density', 'fracture prevention'] },
      { name: 'Risedronate', generic: 'risedronate', brands: ['Actonel'], dosages: ['5mg', '35mg weekly'], tier: 2, cost: 45, keywords: ['osteoporosis', 'bone health'] },
      { name: 'Ibandronate', generic: 'ibandronate', brands: ['Boniva'], dosages: ['150mg monthly'], tier: 2, cost: 55, keywords: ['osteoporosis', 'post-menopausal'] }
    ],
    description: 'bisphosphonate that strengthens bones and prevents fractures by inhibiting bone resorption',
    side_effects: ['esophageal irritation', 'muscle pain', 'jaw osteonecrosis risk'],
    interactions: ['calcium', 'antacids', 'NSAIDs']
  },
  
  // Benzodiazepines
  {
    therapeutic_class: 'Benzodiazepines',
    drugs: [
      { name: 'Alprazolam', generic: 'alprazolam', brands: ['Xanax'], dosages: ['0.25mg', '0.5mg', '1mg', '2mg'], tier: 2, cost: 18, keywords: ['anxiety', 'panic disorder', 'benzodiazepine'] },
      { name: 'Lorazepam', generic: 'lorazepam', brands: ['Ativan'], dosages: ['0.5mg', '1mg', '2mg'], tier: 2, cost: 16, keywords: ['anxiety', 'insomnia', 'sedation'] },
      { name: 'Clonazepam', generic: 'clonazepam', brands: ['Klonopin'], dosages: ['0.5mg', '1mg', '2mg'], tier: 2, cost: 20, keywords: ['anxiety', 'seizures', 'panic disorder'] },
      { name: 'Diazepam', generic: 'diazepam', brands: ['Valium'], dosages: ['2mg', '5mg', '10mg'], tier: 2, cost: 15, keywords: ['anxiety', 'muscle spasm', 'sedation'] }
    ],
    description: 'benzodiazepine that enhances GABA activity to reduce anxiety and promote sedation',
    side_effects: ['drowsiness', 'dizziness', 'memory impairment', 'dependence risk'],
    interactions: ['opioids', 'alcohol', 'sedatives']
  }
];

function generateDrugs() {
  const drugs = [];
  let drugId = 1;

  for (const template of drugTemplates) {
    for (const drug of template.drugs) {
      const drugData = {
        drug_name: drug.name,
        generic_name: drug.generic,
        brand_names: drug.brands,
        description: `${drug.name} is a ${template.therapeutic_class.toLowerCase()} medication. It is a ${template.description}.`,
        therapeutic_class: template.therapeutic_class,
        formulary_tier: drug.tier,
        average_cost: drug.cost,
        common_dosages: drug.dosages,
        interactions: template.interactions,
        side_effects: template.side_effects,
        keywords: drug.keywords,
        alternatives: [] // Will be populated after all drugs are created
      };
      
      drugs.push(drugData);
      drugId++;
    }
  }

  console.log(`Generated ${drugs.length} base drug records`);
  
  // Generate additional variations to reach 1000 drugs
  while (drugs.length < 1000) {
    const baseDrug = drugs[Math.floor(Math.random() * Math.min(drugs.length, 100))];
    const variations = ['XR', 'ER', 'CR', 'SR', 'ODT', 'IR'];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    
    const newDrug = {
      ...baseDrug,
      drug_name: `${baseDrug.drug_name} ${variation}`,
      description: `${baseDrug.drug_name} ${variation} is an extended or modified release formulation. ${baseDrug.description}`,
      average_cost: baseDrug.average_cost * (1 + Math.random() * 0.5),
      formulary_tier: Math.min(5, baseDrug.formulary_tier + Math.floor(Math.random() * 2))
    };
    
    drugs.push(newDrug);
  }

  console.log(`Total drugs generated: ${drugs.length}`);
  return drugs.slice(0, 1000);
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await connectDB();

    // Clear existing drugs
    console.log('🗑️  Clearing existing drug records...');
    await Drug.deleteMany({});
    console.log('✓ Existing records cleared\n');

    // Generate drug records
    console.log('📊 Generating drug records...');
    const drugRecords = generateDrugs();
    console.log(`✓ Generated ${drugRecords.length} drug records\n`);

    // Prepare texts for embedding
    console.log('📝 Preparing texts for embedding...');
    const textsForEmbedding = drugRecords.map(drug => 
      `${drug.description}. Therapeutic class: ${drug.therapeutic_class}. Used for: ${drug.keywords.join(', ')}.`
    );
    console.log(`✓ Prepared ${textsForEmbedding.length} texts\n`);

    // Generate embeddings
    console.log('🤖 Generating embeddings with VoyageAI (this may take a few minutes)...');
    const embeddings = await generateEmbeddingsBatchChunked(textsForEmbedding, 128);
    console.log(`✓ Generated ${embeddings.length} embeddings\n`);

    // Add embeddings to drug records
    console.log('💾 Preparing records for insertion...');
    const drugsWithEmbeddings = drugRecords.map((drug, index) => ({
      ...drug,
      description_embedding: embeddings[index]
    }));

    // Insert into MongoDB
    console.log('📥 Inserting drugs into MongoDB...');
    const insertedDrugs = await Drug.insertMany(drugsWithEmbeddings);
    console.log(`✓ Successfully inserted ${insertedDrugs.length} drugs\n`);

    // Update alternatives (linking similar drugs)
    console.log('🔗 Linking alternative medications...');
    let alternativesUpdated = 0;
    
    for (const drug of insertedDrugs) {
      const alternatives = insertedDrugs
        .filter(d => 
          d.therapeutic_class === drug.therapeutic_class && 
          d._id.toString() !== drug._id.toString()
        )
        .slice(0, 5)
        .map(d => d._id);
      
      if (alternatives.length > 0) {
        await Drug.findByIdAndUpdate(drug._id, { alternatives });
        alternativesUpdated++;
      }
    }
    console.log(`✓ Updated alternatives for ${alternativesUpdated} drugs\n`);

    // Display summary
    console.log('📈 Seeding Summary:');
    console.log('─────────────────────────────────');
    console.log(`Total Drugs:           ${insertedDrugs.length}`);
    console.log(`Therapeutic Classes:   ${new Set(drugRecords.map(d => d.therapeutic_class)).size}`);
    console.log(`Avg. Cost Range:       $${Math.min(...drugRecords.map(d => d.average_cost)).toFixed(2)} - $${Math.max(...drugRecords.map(d => d.average_cost)).toFixed(2)}`);
    console.log(`Embedding Dimensions:  512 (voyage-3.5-lite)`);
    console.log('─────────────────────────────────\n');

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📌 Next steps:');
    console.log('   1. Create vector search index in MongoDB Atlas');
    console.log('   2. Create full-text search index in MongoDB Atlas');
    console.log('   3. Start the API server: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();



