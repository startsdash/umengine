import { INITIAL_PANTRY } from '../data/pantry';
import { PantryIngredient, RecipeIngredient, TasteProfile } from '../types';

// Convert units to grams and milliliters
export function convertToGrams(amount: number, unit: string, ingredient: PantryIngredient): number {
  switch (unit) {
    case 'g':
      return amount;
    case 'ml':
      return amount * ingredient.density;
    case 'tsp': // ~ 5 ml
      return amount * 5 * ingredient.density;
    case 'tbsp': // ~ 15 ml
      return amount * 15 * ingredient.density;
    case 'cloves': // ~ 4 g per garlic clove
      return amount * 4;
    case 'slices': // ~ 5 g per ginger slice
      return amount * 5;
    case 'stalks': // ~ 15 g per scallion
      return amount * 15;
    case 'pcs':
      return amount * 10;
    default:
      return amount * ingredient.density;
  }
}

export function convertToMl(amount: number, unit: string, ingredient: PantryIngredient): number {
  const grams = convertToGrams(amount, unit, ingredient);
  return grams / (ingredient.density || 1.0);
}

/**
 * Mathematical Engine based on Yamaguchi & Ninomiya (2000)
 * "Umami and Food Palatability", J. Nutr. 130: 921S-926S
 */
export function calculateTasteProfile(
  ingredients: RecipeIngredient[],
  pantryList: PantryIngredient[] = INITIAL_PANTRY,
  portions: number = 1
): TasteProfile {
  const pantryMap = new Map<string, PantryIngredient>();
  pantryList.forEach(p => pantryMap.set(p.id, p));

  let totalWeightG = 0;
  let totalVolumeMl = 0;

  let totalGlutamateMg = 0;
  let totalImpMg = 0;
  let totalGmpMg = 0;
  let totalAmpMg = 0;

  let totalSodiumG = 0;
  let totalSugarG = 0;
  let totalAcidityWeighted = 0;
  let totalPungencyWeighted = 0;
  let totalNumbingWeighted = 0;
  let totalStarchG = 0;

  for (const item of ingredients) {
    const ing = pantryMap.get(item.ingredientId);
    if (!ing) continue;

    // Apply portion multiplier
    const rawAmount = item.amount * portions;
    const weightG = convertToGrams(rawAmount, item.unit, ing);
    const volumeMl = convertToMl(rawAmount, item.unit, ing);

    totalWeightG += weightG;
    totalVolumeMl += volumeMl;

    // 100g basis
    const ratio = weightG / 100;
    totalGlutamateMg += ing.freeGlutamate * ratio;
    totalImpMg += ing.imp * ratio;
    totalGmpMg += ing.gmp * ratio;
    totalAmpMg += ing.amp * ratio;

    totalSodiumG += (weightG * (ing.sodiumPercent / 100));
    totalSugarG += (weightG * (ing.sugarPercent / 100));

    totalAcidityWeighted += ing.acidityScore * weightG;
    totalPungencyWeighted += ing.pungencyScore * weightG;
    totalNumbingWeighted += ing.numbingScore * weightG;

    if (ing.id === 'potato_starch' || ing.gelatinStarchYield > 0) {
      totalStarchG += (weightG * (ing.gelatinStarchYield > 0 ? ing.gelatinStarchYield / 10 : 1.0));
    }
  }

  // Ensure non-zero volume for concentrations
  const effectiveVolumeDl = Math.max(0.1, totalVolumeMl / 100); // 1 dL = 100 ml

  // u: MSG / Glutamate concentration in g/dL
  const u = (totalGlutamateMg / 1000) / effectiveVolumeDl;

  // v: 5'-Ribonucleotides concentration in g/dL (Guanylate GMP has 2.3x higher binding affinity than IMP)
  const effectiveGmpWeightMg = totalGmpMg * 2.3;
  const effectiveAmpWeightMg = totalAmpMg * 0.8;
  const totalEffectiveNucleotidesMg = totalImpMg + effectiveGmpWeightMg + effectiveAmpWeightMg;
  const v = (totalEffectiveNucleotidesMg / 1000) / effectiveVolumeDl;

  // Yamaguchi Synergism Equation: y = u + gamma * u * v, where gamma = 1218
  const gamma = 1218;
  let equivalentMsgConcentrationGPerDl = u;

  if (u > 0 && v > 0) {
    equivalentMsgConcentrationGPerDl = u + (gamma * u * v);
  } else if (u === 0 && v > 0) {
    // Human saliva contains ~1.5 ppm (0.00015 g/dL) glutamate baseline
    const salivaU = 0.00015;
    equivalentMsgConcentrationGPerDl = salivaU + (gamma * salivaU * v);
  }

  const rawNucleotidesMg = totalImpMg + totalGmpMg + totalAmpMg;
  const synergyMultiplier = u > 0.0001 
    ? Math.max(1, equivalentMsgConcentrationGPerDl / u)
    : (rawNucleotidesMg > 0 ? 3.5 : 1);

  // Normalized sensory score 0 - 10 (logarithmic perception)
  // Optimal restaurant savory sauce is ~ 0.4 - 0.9 g/dL equivalent MSG
  const umamiIntensityScore = Math.min(10, Math.max(0, Math.log10(1 + equivalentMsgConcentrationGPerDl * 25) * 5.2));

  // Nucleotide breakdown
  const impPercentOfNucleotides = rawNucleotidesMg > 0 ? (totalImpMg / rawNucleotidesMg) * 100 : 0;
  const gmpPercentOfNucleotides = rawNucleotidesMg > 0 ? (totalGmpMg / rawNucleotidesMg) * 100 : 0;
  const ampPercentOfNucleotides = rawNucleotidesMg > 0 ? (totalAmpMg / rawNucleotidesMg) * 100 : 0;
  const nucleotideToGlutamateRatio = totalGlutamateMg > 0 ? rawNucleotidesMg / totalGlutamateMg : 0;

  // Salinity %
  const salinityPercent = totalWeightG > 0 ? (totalSodiumG / totalWeightG) * 100 : 0;
  // Salt reduction bonus: Umami synergy enables ~ 30-40% lower salt without loss of hedonic acceptance
  const saltReductionBonusPercent = Math.min(38, Math.round(umamiIntensityScore * 3.8));

  // Brix / Sweetness approx
  const sweetnessBrix = totalWeightG > 0 ? (totalSugarG / totalWeightG) * 100 : 0;

  // Balance indices (0 - 10)
  const acidityIndex = totalWeightG > 0 ? Math.min(10, (totalAcidityWeighted / totalWeightG) * 1.3) : 0;
  const heatIndex = totalWeightG > 0 ? Math.min(10, (totalPungencyWeighted / totalWeightG) * 1.5) : 0;
  const numbingIndex = totalWeightG > 0 ? Math.min(10, (totalNumbingWeighted / totalWeightG) * 2.0) : 0;

  // Starch & Viscosity
  const starchRatioPercent = totalVolumeMl > 0 ? (totalStarchG / totalVolumeMl) * 100 : 0;
  let viscosityScore = Math.min(10, starchRatioPercent * 2.2);
  let viscosityLabel: TasteProfile['viscosityLabel'] = 'Бульон (Жидкий)';

  if (starchRatioPercent >= 3.8) {
    viscosityLabel = 'Плотный соус (Clinging)';
  } else if (starchRatioPercent >= 2.2) {
    viscosityLabel = 'Глянцевая глазурь (Glaze)';
  } else if (starchRatioPercent >= 0.8) {
    viscosityLabel = 'Шелковистый бархат (Coating)';
  } else {
    viscosityLabel = 'Бульон (Жидкий)';
  }

  // Temporal Aftertaste Dynamics (Figure 3 in Yamaguchi 2000)
  // Higher synergistic factor significantly prolongs lingual papillae receptor activation
  const baseAftertasteSec = 45;
  const synergyAftertasteBonus = Math.min(135, (synergyMultiplier - 1) * 15 + umamiIntensityScore * 8);
  const aftertasteHalfLifeSeconds = Math.round(baseAftertasteSec + synergyAftertasteBonus);

  return {
    totalWeightG: Math.round(totalWeightG * 10) / 10,
    totalVolumeMl: Math.round(totalVolumeMl * 10) / 10,
    glutamateMgTotal: Math.round(totalGlutamateMg),
    nucleotidesMgTotal: Math.round(rawNucleotidesMg),
    glutamateConcentrationPercent: Math.round(u * 1000) / 1000,
    nucleotideConcentrationPercent: Math.round(v * 1000) / 1000,
    synergyMultiplier: Math.round(synergyMultiplier * 10) / 10,
    equivalentMsgConcentrationGPerDl: Math.round(equivalentMsgConcentrationGPerDl * 1000) / 1000,
    umamiIntensityScore: Math.round(umamiIntensityScore * 10) / 10,
    impPercentOfNucleotides: Math.round(impPercentOfNucleotides),
    gmpPercentOfNucleotides: Math.round(gmpPercentOfNucleotides),
    ampPercentOfNucleotides: Math.round(ampPercentOfNucleotides),
    nucleotideToGlutamateRatio: Math.round(nucleotideToGlutamateRatio * 100) / 100,
    salinityPercent: Math.round(salinityPercent * 100) / 100,
    saltReductionBonusPercent,
    sweetnessBrix: Math.round(sweetnessBrix * 10) / 10,
    acidityIndex: Math.round(acidityIndex * 10) / 10,
    heatIndex: Math.round(heatIndex * 10) / 10,
    numbingIndex: Math.round(numbingIndex * 10) / 10,
    viscosityScore: Math.round(viscosityScore * 10) / 10,
    viscosityLabel,
    starchRatioPercent: Math.round(starchRatioPercent * 10) / 10,
    aftertasteHalfLifeSeconds
  };
}

/**
 * Generates data points for the Yamaguchi Time-Intensity Curve (0 to 240 seconds)
 */
export function generateAftertasteCurve(profile: TasteProfile) {
  const points = [];
  const peakIntensity = profile.umamiIntensityScore;
  const synergy = profile.synergyMultiplier;

  for (let t = 0; t <= 240; t += 10) {
    let intensity = 0;
    if (t <= 20) {
      // In mouth stimulation
      intensity = (t / 20) * peakIntensity;
    } else {
      // Post-expectoration / swallowing curve
      // For umami with synergy, curve peaks around 30-40s and slowly lingers
      const timePost = t - 20;
      const decayConstant = 0.011 / (1 + (synergy - 1) * 0.15);
      intensity = (peakIntensity * 1.05) * Math.exp(-decayConstant * timePost);
    }

    // Comparison with pure salt (NaCl) and pure acid (Tartaric)
    const saltCurve = t <= 20 ? (t / 20) * 7.5 : Math.max(0, 7.5 * Math.exp(-0.035 * (t - 20)));
    const acidCurve = t <= 20 ? (t / 20) * 8.0 : Math.max(0, 8.0 * Math.exp(-0.08 * (t - 20)));

    points.push({
      time: t,
      umami: Math.max(0, Math.min(10, Math.round(intensity * 10) / 10)),
      salt: Math.max(0, Math.min(10, Math.round(saltCurve * 10) / 10)),
      acid: Math.max(0, Math.min(10, Math.round(acidCurve * 10) / 10))
    });
  }

  return points;
}
