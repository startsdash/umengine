import { PantryIngredient, RecipeIngredient, TasteProfile } from '../types';
import { calculateTasteProfile } from './umamiCalculator';

export type ViscosityTarget = 'broth' | 'coating' | 'glaze' | 'clinging';

export interface OptimizationTargets {
  umami: number;
  salinity: number;
  acidity: number;
  heat: number;
  numbing: number;
  viscosity: ViscosityTarget;
}

export interface OptimizationResult {
  title: string;
  seedLabel: string;
  ingredients: RecipeIngredient[];
  profile: TasteProfile;
  loss: number;
  deltas: { label: string; text: string; ok: boolean }[];
}

interface Caps { max: number; step: number }

const CAPS: Record<string, Caps> = {
  salt: { max: 1.5, step: 0.125 },
  sugar: { max: 6, step: 0.25 },
  potato_starch: { max: 3, step: 0.25 },
  taitaile_jijing: { max: 2, step: 0.125 },
  american_chef_chicken: { max: 2, step: 0.125 },
  shiitake_powder: { max: 2, step: 0.125 },
  light_soy: { max: 45, step: 2.5 },
  dark_soy: { max: 20, step: 2.5 },
  oyster_sauce: { max: 2.5, step: 0.25 },
  black_vinegar: { max: 45, step: 2.5 },
  rice_vinegar: { max: 45, step: 2.5 },
  shaoxing_wine: { max: 45, step: 2.5 },
  water_stock: { max: 500, step: 10 },
  pickle_brine: { max: 120, step: 5 },
  sichuan_pepper: { max: 1.5, step: 0.125 },
  chili_flakes: { max: 3.5, step: 0.25 },
  white_pepper: { max: 1.5, step: 0.125 },
  lao_gan_ma: { max: 2, step: 0.25 },
  pixian_doubanjiang: { max: 2.5, step: 0.25 },
  haday_huangdoujiang: { max: 2.5, step: 0.25 },
  sesame_oil: { max: 2, step: 0.125 },
  garlic: { max: 6, step: 0.5 },
  ginger: { max: 25, step: 2.5 },
  scallion: { max: 40, step: 5 },
  pickled_cucumber: { max: 60, step: 5 },
  carrot: { max: 80, step: 5 },
  potato: { max: 200, step: 10 }
};

const CATEGORY_DEFAULT_CAPS: Record<string, Caps> = {
  sauces: { max: 45, step: 2.5 },
  boosters: { max: 2, step: 0.125 },
  dry: { max: 6, step: 0.25 },
  aromatics: { max: 30, step: 2 },
  produce: { max: 120, step: 5 },
  soy_seitan: { max: 300, step: 10 }
};

function capsFor(id: string, pantry: PantryIngredient[]): Caps {
  if (CAPS[id]) return CAPS[id];
  const ing = pantry.find(p => p.id === id);
  return CATEGORY_DEFAULT_CAPS[ing?.category || 'produce'] || { max: 50, step: 5 };
}

function roundAmount(v: number, unit: string): number {
  if (unit === 'tsp' || unit === 'tbsp') return Math.round(v * 4) / 4;
  if (unit === 'ml') return Math.max(2.5, Math.round(v / 2.5) * 2.5);
  if (unit === 'g') return Math.max(2.5, Math.round(v / 2.5) * 2.5);
  if (unit === 'cloves') return Math.round(v * 2) / 2;
  return Math.round(v * 10) / 10;
}

const VISCOSITY_BANDS: Record<ViscosityTarget, [number, number]> = {
  broth: [0, 0.8],
  coating: [0.8, 2.2],
  glaze: [2.2, 3.8],
  clinging: [3.8, 7]
};

export const VISCOSITY_LABELS: Record<ViscosityTarget, string> = {
  broth: 'Бульон (Жидкий)',
  coating: 'Шелковистый бархат (Coating)',
  glaze: 'Глянцевая глазурь (Glaze)',
  clinging: 'Плотный соус (Clinging)'
};

function stageFor(id: string): RecipeIngredient['stage'] {
  if (id === 'potato_starch') return 'slurry_gouqian';
  if (id === 'water_stock' || id === 'pickle_brine') return 'liquid_base';
  if (id === 'sesame_oil') return 'finish_mingyou';
  return 'seasoning_mix';
}

interface LossCtx {
  pantry: PantryIngredient[];
  portions: number;
  targets: OptimizationTargets;
  canonical: Map<string, number>;
  regularization: number;
}

function signature(ings: RecipeIngredient[]): string {
  return ings.map(i => `${i.ingredientId}:${i.amount}`).sort().join('|');
}

function lossOf(ings: RecipeIngredient[], ctx: LossCtx, cache: Map<string, TasteProfile>): number {
  const t = ctx.targets;
  const sig = signature(ings);
  let profile = cache.get(sig);
  if (!profile) {
    profile = calculateTasteProfile(ings, ctx.pantry, ctx.portions);
    cache.set(sig, profile);
  }

  // Umami in log-space of equivalent MSG concentration (score saturates at 10, log-space does not)
  const eqTarget = Math.max(1e-4, (Math.pow(10, Math.min(t.umami, 9.99) / 5.2) - 1) / 25);
  const eqActual = Math.max(1e-4, profile.equivalentMsgConcentrationGPerDl);
  const umamiLoss = 1.2 * Math.abs(Math.log(eqActual / eqTarget));

  let L =
    umamiLoss +
    4.0 * Math.abs(profile.salinityPercent - t.salinity) +
    0.5 * Math.abs(profile.acidityIndex - t.acidity) +
    0.5 * Math.abs(profile.heatIndex - t.heat) +
    0.4 * Math.abs(profile.numbingIndex - t.numbing);

  const [lo, hi] = VISCOSITY_BANDS[t.viscosity];
  const sr = profile.starchRatioPercent;
  const viscPenalty = sr < lo ? (lo - sr) : sr > hi ? (sr - hi) : 0;
  L += viscPenalty * 1.5;

  L += ctx.regularization * ings.reduce((s, ri) => {
    const c = ctx.canonical.get(ri.ingredientId);
    if (c && c > 0) return s + Math.abs(ri.amount - c) / c;
    return s + ri.amount * 0.12;
  }, 0);

  L += ings.length * 0.045;
  return L;
}

function evalProfile(ings: RecipeIngredient[], ctx: LossCtx, cache: Map<string, TasteProfile>): TasteProfile {
  const sig = signature(ings);
  let p = cache.get(sig);
  if (!p) {
    p = calculateTasteProfile(ings, ctx.pantry, ctx.portions);
    cache.set(sig, p);
  }
  return p;
}

function cloneRecipe(ings: RecipeIngredient[]): RecipeIngredient[] {
  return ings.map(i => ({ ...i }));
}

function refineAmounts(seed: RecipeIngredient[], ctx: LossCtx, cache: Map<string, TasteProfile>, passes: number = 2): RecipeIngredient[] {
  let cur = cloneRecipe(seed);
  for (let pass = 0; pass < passes; pass++) {
    let improved = false;
    for (let i = 0; i < cur.length; i++) {
      const ing = cur[i];
      const cap = capsFor(ing.ingredientId, ctx.pantry);
      const base = Math.max(ing.amount, cap.step);
      let bestAmount = ing.amount;
      let bestLoss = lossOf(cur, ctx, cache);
      for (const m of [0, 0.6, 0.85, 1, 1.2, 1.5, 2]) {
        const cand = m === 0 ? 0 : roundAmount(Math.min(cap.max, base * m), ing.unit);
        const trial = cloneRecipe(cur);
        if (cand <= 0) trial.splice(i, 1); else trial[i] = { ...ing, amount: cand };
        const l = lossOf(trial, ctx, cache);
        if (l < bestLoss - 1e-4) { bestLoss = l; bestAmount = cand; }
      }
      if (bestAmount !== ing.amount) {
        if (bestAmount === 0) { cur.splice(i, 1); i--; } else { cur[i] = { ...ing, amount: bestAmount }; }
        improved = true;
      }
    }
    if (!improved) break;
  }
  return cur;
}

function defaultAmountFor(id: string, pantry: PantryIngredient[]): RecipeIngredient | null {
  const ing = pantry.find(p => p.id === id);
  if (!ing) return null;
  const unit = ing.defaultUnit;
  const amount = unit === 'ml' ? 15 : unit === 'g' ? 10 : unit === 'cloves' ? 2 : 0.5;
  return { ingredientId: id, amount, unit, stage: stageFor(id) };
}

function descend(seed: RecipeIngredient[], ctx: LossCtx, cache: Map<string, TasteProfile>): RecipeIngredient[] {
  let cur = cloneRecipe(seed);
  let curLoss = lossOf(cur, ctx, cache);
  const candidates = ctx.pantry.filter(p => p.inPantry);

  for (let pass = 0; pass < 8; pass++) {
    let improved = false;

    for (let i = 0; i < cur.length; i++) {
      const ing = cur[i];
      const cap = capsFor(ing.ingredientId, ctx.pantry);
      const base = Math.max(ing.amount, cap.step);
      const mults = [0, 0.5, 0.7, 0.85, 1, 1.2, 1.45, 1.8, 2.3];
      let bestAmount = ing.amount;
      let bestLoss = curLoss;

      for (const m of mults) {
        const cand = m === 0 ? 0 : roundAmount(Math.min(cap.max, base * m), ing.unit);
        if (cand > cap.max) continue;
        const trial = cloneRecipe(cur);
        if (cand <= 0) {
          trial.splice(i, 1);
        } else {
          trial[i] = { ...ing, amount: cand };
        }
        const l = lossOf(trial, ctx, cache);
        if (l < bestLoss - 1e-4) {
          bestLoss = l;
          bestAmount = cand;
        }
      }

      if (bestAmount !== ing.amount) {
        if (bestAmount === 0) {
          cur.splice(i, 1);
          i--;
        } else {
          cur[i] = { ...ing, amount: bestAmount };
        }
        curLoss = bestLoss;
        improved = true;
      }
    }

    for (let i = cur.length - 1; i >= 0; i--) {
      if (cur[i].amount === 0) { cur.splice(i, 1); continue; }
      const trial = cloneRecipe(cur);
      trial.splice(i, 1);
      const l = lossOf(trial, ctx, cache);
      if (l < curLoss - 0.01) {
        cur = trial;
        curLoss = l;
        improved = true;
      }
    }

    if (cur.length < 14) {
      let addedAny = false;
      for (const p of candidates) {
        if (cur.length >= 14) break;
        if (cur.some(c => c.ingredientId === p.id)) continue;
        if (p.category === 'soy_seitan') continue;
        const base = defaultAmountFor(p.id, ctx.pantry);
        if (!base) continue;
        const cap = capsFor(p.id, ctx.pantry);
        const amount = roundAmount(Math.min(cap.max, base.amount), base.unit);
        if (amount <= 0) continue;
        const trialRaw = cloneRecipe(cur).concat([{ ...base, amount }]);
        const lRaw = lossOf(trialRaw, ctx, cache);
        let accepted = false;
        if (lRaw < curLoss - 0.02) {
          accepted = true;
        } else if (lRaw < curLoss + 0.6) {
          // borderline (e.g. salt displacement needed): allow mini-refinement then re-judge
          const trialRef = refineAmounts(trialRaw, ctx, cache, 2);
          const lRef = lossOf(trialRef, ctx, cache);
          if (lRef < curLoss - 0.02) {
            cur = trialRef;
            curLoss = lRef;
            addedAny = true;
            improved = true;
            accepted = false;
          }
        }
        if (accepted) {
          cur = trialRaw;
          curLoss = lRaw;
          addedAny = true;
          improved = true;
        }
      }
      if (addedAny) { /* next pass refines amounts */ }
    }

    if (!improved) break;
  }

  return cur;
}

export interface OptimizeOptions {
  pantryList: PantryIngredient[];
  presets: { id: string; title: string; ingredients: RecipeIngredient[] }[];
  currentIngredients?: RecipeIngredient[];
  currentTitle?: string;
  targets: OptimizationTargets;
  portions: number;
}

function boostSeed(ings: RecipeIngredient[], pantry: PantryIngredient[]): RecipeIngredient[] {
  const out = cloneRecipe(ings);
  const ensure = (id: string, amount: number, unit: RecipeIngredient['unit']) => {
    if (!out.some(i => i.ingredientId === id)) {
      const p = pantry.find(pp => pp.id === id);
      if (p && p.inPantry) out.push({ ingredientId: id, amount, unit, stage: stageFor(id) });
    }
  };
  ensure('shiitake_powder', 0.5, 'tsp');
  ensure('taitaile_jijing', 0.5, 'tsp');
  return out;
}

export function optimizeSauce(opts: OptimizeOptions): OptimizationResult[] {
  const { pantryList, presets, targets, portions } = opts;
  const cache = new Map<string, TasteProfile>();
  const seeds: { label: string; ings: RecipeIngredient[]; reg: number }[] = [];

  let bestPreset: { label: string; ings: RecipeIngredient[]; loss: number } | null = null;
  for (const p of presets) {
    const l = lossOf(p.ingredients, {
      pantry: pantryList, portions, targets,
      canonical: new Map(p.ingredients.map(i => [i.ingredientId, i.amount])),
      regularization: 0
    }, cache);
    if (!bestPreset || l < bestPreset.loss) {
      bestPreset = { label: p.title, ings: p.ingredients, loss: l };
    }
  }

  if (bestPreset) {
    seeds.push({ label: bestPreset.label, ings: bestPreset.ings, reg: 0.06 });
    seeds.push({ label: bestPreset.label + ' (усиленный)', ings: boostSeed(bestPreset.ings, pantryList), reg: 0.15 });
  }

  if (opts.currentIngredients && opts.currentIngredients.length > 0) {
    seeds.push({
      label: opts.currentTitle || 'Текущий соус конструктора',
      ings: opts.currentIngredients,
      reg: 0.06
    });
  }

  const results: OptimizationResult[] = [];
  const seen = new Set<string>();

  for (const seed of seeds) {
    const ctx: LossCtx = {
      pantry: pantryList,
      portions,
      targets,
      canonical: new Map(seed.ings.map(i => [i.ingredientId, i.amount])),
      regularization: seed.reg
    };

    const inPantry = seed.ings.filter(i => {
      const p = pantryList.find(pp => pp.id === i.ingredientId);
      return p && p.inPantry;
    });
    const ings = inPantry.length > 0 ? inPantry : seed.ings;

    const optimized = descend(ings, ctx, cache);
    const profile = evalProfile(optimized, ctx, cache);
    const loss = lossOf(optimized, ctx, cache);
    const sig = optimized.map(i => i.ingredientId).sort().join(',');
    if (seen.has(sig)) continue;
    seen.add(sig);

    results.push({
      title: `${seed.label.split('(')[0].trim()} · Оптимум`,
      seedLabel: seed.label,
      ingredients: optimized,
      profile,
      loss,
      deltas: buildDeltas(profile, targets)
    });
  }

  results.sort((a, b) => a.loss - b.loss);
  return results.slice(0, 3);
}

function buildDeltas(p: TasteProfile, t: OptimizationTargets): { label: string; text: string; ok: boolean }[] {
  const mk = (label: string, got: number, target: number, eps: number, unit: string = '', dec: number = 1) => ({
    label,
    text: `${got.toFixed(dec)}${unit} / цель ${target.toFixed(dec)}${unit}`,
    ok: Math.abs(got - target) <= eps
  });
  const [lo, hi] = VISCOSITY_BANDS[t.viscosity];
  const inBand = p.starchRatioPercent >= lo && p.starchRatioPercent <= hi;
  return [
    mk('Умами', p.umamiIntensityScore, t.umami, 0.7),
    mk('Соль', p.salinityPercent, t.salinity, 0.25, '%', 2),
    mk('Кислотность', p.acidityIndex, t.acidity, 1.2),
    mk('Острота', p.heatIndex, t.heat, 1.2),
    mk('Ма', p.numbingIndex, t.numbing, 1.0),
    {
      label: 'Вязкость',
      text: inBand ? VISCOSITY_LABELS[t.viscosity] : `${p.starchRatioPercent.toFixed(1)}% крахмала (цель ${lo}-${hi}%)`,
      ok: inBand
    }
  ];
}
