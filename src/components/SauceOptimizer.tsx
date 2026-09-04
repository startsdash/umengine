import React, { useMemo, useState } from 'react';
import { PantryIngredient, RecipeIngredient, TasteProfile } from '../types';
import { SAUCE_PRESETS } from '../data/presets';
import {
  optimizeSauce,
  OptimizationTargets,
  OptimizationResult,
  ViscosityTarget,
  VISCOSITY_LABELS
} from '../utils/sauceOptimizer';
import { Calculator, Wand2, Check, X, Loader2, Target, ArrowRightLeft } from 'lucide-react';

interface SauceOptimizerProps {
  pantryList: PantryIngredient[];
  currentProfile: TasteProfile;
  currentIngredients: RecipeIngredient[];
  currentTitle: string;
  selectedProtein: string;
  onApplyRecipe: (ingredients: RecipeIngredient[], title: string) => void;
}

const QUICK_TARGETS: { label: string; targets: OptimizationTargets }[] = [
  { label: 'Классический Wanzhi', targets: { umami: 7.5, salinity: 1.6, acidity: 1.5, heat: 0.5, numbing: 0, viscosity: 'coating' } },
  { label: 'Супер-умами', targets: { umami: 9.5, salinity: 1.4, acidity: 1.2, heat: 0.5, numbing: 0, viscosity: 'coating' } },
  { label: 'Сычуань Мала', targets: { umami: 8.0, salinity: 1.8, acidity: 2.0, heat: 2.8, numbing: 0.3, viscosity: 'glaze' } },
  { label: 'Танцу (кисло-сладкий)', targets: { umami: 7.0, salinity: 1.5, acidity: 6.0, heat: 0.5, numbing: 0, viscosity: 'clinging' } },
  { label: 'Лёгкий бульон', targets: { umami: 6.5, salinity: 1.0, acidity: 1.0, heat: 0.3, numbing: 0, viscosity: 'broth' } }
];

export const SauceOptimizer: React.FC<SauceOptimizerProps> = ({
  pantryList,
  currentProfile,
  currentIngredients,
  currentTitle,
  selectedProtein,
  onApplyRecipe
}) => {
  const [targets, setTargets] = useState<OptimizationTargets>(QUICK_TARGETS[0].targets);
  const [portions, setPortions] = useState(2);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<OptimizationResult[] | null>(null);
  const [ranAt, setRanAt] = useState<number | null>(null);

  const availableCount = useMemo(() => pantryList.filter(p => p.inPantry).length, [pantryList]);

  const runOptimization = () => {
    setRunning(true);
    setTimeout(() => {
      try {
        const results = optimizeSauce({
          pantryList,
          presets: SAUCE_PRESETS.map(p => ({ id: p.id, title: p.title, ingredients: p.ingredients })),
          currentIngredients,
          currentTitle,
          targets,
          portions
        });
        setResults(results);
        setRanAt(Date.now());
      } finally {
        setRunning(false);
      }
    }, 30);
  };

  const setT = (patch: Partial<OptimizationTargets>) => setTargets(prev => ({ ...prev, ...patch }));

  const ingName = (id: string) => pantryList.find(p => p.id === id)?.name || id;

  const currentVsTargets = useMemo(() => ([
    { label: 'Умами сейчас', value: currentProfile.umamiIntensityScore.toFixed(1) },
    { label: 'Соль сейчас', value: currentProfile.salinityPercent.toFixed(2) + '%' }
  ]), [currentProfile]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Target className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">Оптимизатор Суперсоуса</h2>
          <p className="text-xs text-zinc-400 font-mono">
            Инверсная задача движка Yamaguchi: задай цель — решигатель найдёт состав
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Targets panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">Целевой профиль</span>
              <span className="text-[11px] font-mono text-zinc-500">{availableCount} ингредиентов в кладовой</span>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TARGETS.map(q => {
                const active = JSON.stringify(q.targets) === JSON.stringify(targets);
                return (
                  <button
                    key={q.label}
                    onClick={() => setTargets({ ...q.targets })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                      active
                        ? 'bg-rose-600/20 border-rose-500/40 text-rose-300'
                        : 'bg-white/[0.03] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>

            <Slider label="Умами" value={targets.umami} min={0} max={10} step={0.5} onChange={v => setT({ umami: v })} />
            <Slider label="Соленость" value={targets.salinity} min={0} max={4} step={0.1} unit="%" onChange={v => setT({ salinity: v })} />
            <Slider label="Кислотность" value={targets.acidity} min={0} max={10} step={0.5} onChange={v => setT({ acidity: v })} />
            <Slider label="Острота" value={targets.heat} min={0} max={10} step={0.5} onChange={v => setT({ heat: v })} />
            <Slider label="Ма (онемение)" value={targets.numbing} min={0} max={10} step={0.5} onChange={v => setT({ numbing: v })} />

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-zinc-300">Вязкость</span>
                <span className="text-xs font-mono text-amber-300">{VISCOSITY_LABELS[targets.viscosity]}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(VISCOSITY_LABELS) as ViscosityTarget[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setT({ viscosity: v })}
                    className={`px-2 py-1.5 rounded-lg text-[11px] transition-all border ${
                      targets.viscosity === v
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-white/[0.03] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {VISCOSITY_LABELS[v]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-300">Порций</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setPortions(p => Math.max(1, p - 1))} className="w-7 h-7 rounded-lg bg-white/[0.05] text-zinc-300 hover:bg-white/[0.08]">−</button>
                <span className="font-mono text-sm text-white w-6 text-center">{portions}</span>
                <button onClick={() => setPortions(p => Math.min(12, p + 1))} className="w-7 h-7 rounded-lg bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]">+</button>
              </div>
            </div>

            <button
              onClick={runOptimization}
              disabled={running}
              className="w-full px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-white/[0.04] disabled:text-zinc-600 text-black font-bold text-sm flex items-center justify-center space-x-2 transition-all"
            >
              {running ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Расчёт...</span></>
              ) : (
                <><Wand2 className="w-4 h-4" /><span>Оптимизировать соус</span></>
              )}
            </button>

            <div className="text-[10px] text-zinc-600 font-mono leading-relaxed">
              Решатель: координатный спуск по calculateTasteProfile, 3 старта (ближайший канон-пресет / усиленный / текущий), регуляризация к классическим пропорциям.
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 space-y-4">
          {!results && !running && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-10 text-center">
              <Calculator className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">Задай целевой профиль и запусти решатель</p>
              <p className="text-[11px] text-zinc-600 font-mono mt-1">
                {currentVsTargets.map(v => `${v.label}: ${v.value}`).join(' · ')}
              </p>
            </div>
          )}

          {running && (
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-10 text-center">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-400 font-mono">Перебор составов по формуле Ямагучи...</p>
            </div>
          )}

          {results && !running && results.map((r, idx) => (
            <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[10px]">Вариант {idx + 1}</span>
                    {idx === 0 && <span className="px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-300 font-mono text-[10px]">Лучший</span>}
                  </div>
                  <h3 className="font-display text-sm font-bold text-white mt-1.5">{r.title}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono">база: {r.seedLabel}</p>
                </div>
                <button
                  onClick={() => onApplyRecipe(r.ingredients, r.title)}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center space-x-1.5 shrink-0 transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Применить</span>
                </button>
              </div>

              {/* Delta chips */}
              <div className="flex flex-wrap gap-1.5">
                {r.deltas.map(d => (
                  <span
                    key={d.label}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono border ${
                      d.ok ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    }`}
                  >
                    <Check className="w-3 h-3 inline mr-1 -mt-0.5" />
                    {d.label}: {d.text}
                  </span>
                ))}
              </div>

              {/* Ingredients */}
              <div className="space-y-1">
                {r.ingredients.map((ing, i) => (
                  <div key={`${ing.ingredientId}-${i}`} className="flex items-center justify-between text-xs py-1 border-b border-zinc-800/50 last:border-0">
                    <span className="text-zinc-300">{ingName(ing.ingredientId)}</span>
                    <span className="font-mono text-zinc-500">
                      {ing.amount} {ing.unit}
                      {ing.stage === 'baoguo_aromatics' && <span className="text-rose-400/60 ml-1.5">· Baoguo</span>}
                      {ing.stage === 'slurry_gouqian' && <span className="text-sky-400/60 ml-1.5">· Gouqian</span>}
                      {ing.stage === 'finish_mingyou' && <span className="text-amber-400/60 ml-1.5">· Mingyou</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function Slider({ label, value, min, max, step, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-zinc-300">{label}</span>
        <span className="text-xs font-mono text-amber-300">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 accent-amber-400 cursor-pointer"
      />
    </div>
  );
}

export default SauceOptimizer;
