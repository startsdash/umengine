/**
 * Scientific types for Umami Engineer culinary biochem modeling
 */

export type PantryCategory = 
  | 'sauces' 
  | 'boosters' 
  | 'dry' 
  | 'soy_seitan' 
  | 'aromatics' 
  | 'produce';

export interface PantryIngredient {
  id: string;
  name: string;
  chineseName: string;
  pinyin?: string;
  category: PantryCategory;
  description: string;
  defaultUnit: 'g' | 'ml' | 'tsp' | 'tbsp' | 'pcs' | 'cloves';
  density: number; // g per ml
  // Free Amino Acids (mg/100g)
  freeGlutamate: number; 
  // 5'-Ribonucleotides (mg/100g)
  imp: number; // Inosine 5'-monophosphate
  gmp: number; // Guanylate 5'-monophosphate
  amp: number; // Adenylate 5'-monophosphate
  // Nutritional & Sensory constants
  sodiumPercent: number; // salt % by weight
  sugarPercent: number; // sucrose/maltose % by weight
  acidityScore: number; // 0-10 acetic/lactic/succinic acid presence
  pungencyScore: number; // 0-10 capsaicin/piperine
  numbingScore: number; // 0-10 hydroxy-alpha-sanshool
  gelatinStarchYield: number; // % binding capacity
  aromaTags: string[];
  inPantry: boolean;
  scientificNotes: string;
  culinaryRole: string;
}

export type RecipeStage = 
  | 'baoguo_aromatics' // Обжарка ароматики на масле (Garlic, Ginger, Doubanjiang)
  | 'seasoning_mix'    // Соусная основа (Соевые соусы, вино, сахар, умами)
  | 'liquid_base'      // Бульон / вода / рассол (Gao Tang, Water, Brine)
  | 'slurry_gouqian'   // Крахмальная суспензия (Potato starch slurry)
  | 'finish_mingyou'   // Финишное ароматическое масло (Sesame oil sheen)
  | 'main_protein';    // Основной продукт для тушения/покрытия (Doupi, Fuzhu, Seitan)

export interface RecipeIngredient {
  ingredientId: string;
  amount: number; // In defaultUnit or selected unit
  unit: 'g' | 'ml' | 'tsp' | 'tbsp' | 'pcs' | 'cloves' | 'stalks';
  stage: RecipeStage;
  notes?: string;
}

export interface TasteProfile {
  totalWeightG: number;
  totalVolumeMl: number;
  // Raw biochemical concentrations
  glutamateMgTotal: number;
  nucleotidesMgTotal: number; // IMP + GMP + AMP
  glutamateConcentrationPercent: number; // u in g/dL
  nucleotideConcentrationPercent: number; // v in g/dL
  // Yamaguchi Synergism Calculation
  // Formula: y = u + 1218 * u * v
  synergyMultiplier: number; // Ratio of effective perception vs isolated MSG
  equivalentMsgConcentrationGPerDl: number; // Effective perceptual MSG g/dL
  umamiIntensityScore: number; // 0 - 10 normalized sensory score
  // Synergistic Nucleotide Breakdown
  impPercentOfNucleotides: number;
  gmpPercentOfNucleotides: number;
  ampPercentOfNucleotides: number;
  nucleotideToGlutamateRatio: number; // Ideal ~ 1:1 or 0.1-0.5 for culinary balance
  // Balance parameters
  salinityPercent: number; // % NaCl in final solution (ideal ~ 1.0 - 1.8% for sauces)
  saltReductionBonusPercent: number; // Calculated sodium savings due to umami
  sweetnessBrix: number; // Approx dissolved solids/sugars %
  acidityIndex: number; // 0-10 scale (pH 3.5 to 6.5)
  heatIndex: number; // 0-10 scale
  numbingIndex: number; // 0-10 scale
  viscosityScore: number; // 0-10 scale
  viscosityLabel: 'Бульон (Жидкий)' | 'Шелковистый бархат (Coating)' | 'Глянцевая глазурь (Glaze)' | 'Плотный соус (Clinging)';
  starchRatioPercent: number; // % of potato starch in total volume
  // Temporal Dynamics
  aftertasteHalfLifeSeconds: number; // Time persistence on foliate/circumvallate papillae
}

export interface CulinaryStep {
  stepNumber: number;
  title: string;
  chineseTerm?: string;
  tempLevel: 'cold' | 'low_warm' | 'medium_gentle' | 'high_wok_blast' | 'off_heat';
  duration: string;
  instruction: string;
  biochemicalAction: string;
}

export interface SauceArchetype {
  id: string;
  title: string;
  chineseTitle: string;
  pinyin: string;
  category: 'wanzhi_brown' | 'sichuan_spicy' | 'superior_broth' | 'sweet_sour' | 'braising_glaze' | 'pickle_fermented' | 'velvet_white';
  subtitle: string;
  summary: string;
  scientificBreakdown: string;
  targetProteins: string[];
  defaultPortions: number;
  ingredients: RecipeIngredient[];
  steps: CulinaryStep[];
  proTips: string[];
  literatureReference: string;
}

export interface PlaygroundArticle {
  id: string;
  title: string;
  subtitle?: string;
  sourceName: string;
  sourceUrl: string;
  author: string;
  readTimeMinutes: number;
  publishedDate?: string;
  tags: string[];
  summary: string;
  markdownContent: string;
  keyBiochemicalTakeaways: string[];
  isCustomScraped?: boolean;
}

export interface PlaygroundRecipe {
  id: string;
  title: string;
  chineseTitle?: string;
  pinyin?: string;
  sourceName: string;
  sourceUrl: string;
  author?: string;
  category: string;
  summary: string;
  ingredientsText: string[];
  parsedIngredients: RecipeIngredient[];
  steps: string[];
  notes?: string;
  synergyEstimate?: string;
  isCustomScraped?: boolean;
}

export type ActiveTab = 'constructor' | 'library' | 'pantry' | 'science' | 'ai_synthesizer' | 'protocol' | 'playground';
