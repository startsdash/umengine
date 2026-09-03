import React, { useState } from 'react';
import { PantryIngredient, RecipeIngredient, RecipeStage, TasteProfile, SauceArchetype } from '../types';
import { NucleotideSynergyWidget } from './NucleotideSynergyWidget';
import { TemperatureProfileModal } from './TemperatureProfileModal';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Droplets, 
  Scale, 
  Sparkles, 
  Layers, 
  Check, 
  Search,
  X,
  Sliders,
  Sparkle,
  Thermometer,
  Activity,
  Database,
  Save,
  CheckCircle2,
  ChefHat,
  Dna,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PROTEIN_MATRIX_ITEMS, PROTEIN_CATEGORIES, getProteinById } from '../data/proteinMatrixData';

interface SauceConstructorProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
  pantryList: PantryIngredient[];
  tasteProfile: TasteProfile;
  selectedProtein: string;
  setSelectedProtein: (p: string) => void;
  portions: number;
  recipeTitle?: string;
  onSaveSauceToDb?: (sauce: Partial<SauceArchetype>) => Promise<boolean>;
}

export const SauceConstructor: React.FC<SauceConstructorProps> = ({
  ingredients,
  setIngredients,
  pantryList,
  tasteProfile,
  selectedProtein,
  setSelectedProtein,
  portions,
  recipeTitle = 'Мой кастомный умами-соус',
  onSaveSauceToDb
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTempProfile, setShowTempProfile] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState(recipeTitle);
  const [saveChineseTitle, setSaveChineseTitle] = useState('');
  const [savePinyin, setSavePinyin] = useState('');
  const [saveCategory, setSaveCategory] = useState<SauceArchetype['category']>('wanzhi_brown');
  const [saveSummary, setSaveSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [proteinCategory, setProteinCategory] = useState<string>('all');
  const [showProteinPrepDetails, setShowProteinPrepDetails] = useState<boolean>(false);
  const [adjustmentToast, setAdjustmentToast] = useState<string | null>(null);

  const pantryMap = new Map<string, PantryIngredient>();
  pantryList.forEach(p => pantryMap.set(p.id, p));

  // Resolve currently active protein from full database
  const activeProtein = getProteinById(selectedProtein) || 
    PROTEIN_MATRIX_ITEMS.find(p => p.id === selectedProtein || p.id.startsWith(selectedProtein)) ||
    PROTEIN_MATRIX_ITEMS[0];

  // Apply protein sauce adjustment formula (+starch, ±liquid)
  const handleApplyProteinSauceAdjustment = () => {
    if (!activeProtein) return;
    const { starchDeltaG, liquidDeltaMl } = activeProtein.sauceAdjustment;

    setIngredients(prev => {
      const next = [...prev];
      // Adjust Starch
      if (starchDeltaG !== 0) {
        const starchIdx = next.findIndex(i => i.ingredientId === 'potato_starch');
        if (starchIdx >= 0) {
          next[starchIdx] = {
            ...next[starchIdx],
            amount: Math.max(1, Math.round((next[starchIdx].amount + starchDeltaG) * 10) / 10)
          };
        } else if (starchDeltaG > 0) {
          next.push({
            ingredientId: 'potato_starch',
            amount: Math.max(2, starchDeltaG),
            unit: 'g',
            stage: 'slurry_gouqian'
          });
        }
      }
      // Adjust Liquid
      if (liquidDeltaMl !== 0) {
        const liquidIdx = next.findIndex(i => i.ingredientId === 'water_stock');
        if (liquidIdx >= 0) {
          next[liquidIdx] = {
            ...next[liquidIdx],
            amount: Math.max(10, Math.round((next[liquidIdx].amount + liquidDeltaMl) * 10) / 10)
          };
        } else if (liquidDeltaMl > 0) {
          next.push({
            ingredientId: 'water_stock',
            amount: liquidDeltaMl,
            unit: 'ml',
            stage: 'liquid_base'
          });
        }
      }
      return next;
    });

    const starchText = starchDeltaG !== 0 ? `крахмал ${starchDeltaG > 0 ? '+' : ''}${starchDeltaG} г` : '';
    const liquidText = liquidDeltaMl !== 0 ? `бульон ${liquidDeltaMl > 0 ? '+' : ''}${liquidDeltaMl} мл` : '';
    const details = [starchText, liquidText].filter(Boolean).join(', ');
    setAdjustmentToast(`Соус адаптирован под «${activeProtein.name}» (${details})`);
    setTimeout(() => setAdjustmentToast(null), 4000);
  };

  // Stage details in Linear styling
  const stageMeta: Record<RecipeStage, { label: string; icon: React.ReactNode; badge: string; desc: string }> = {
    baoguo_aromatics: { 
      label: 'Фаза 1: Обжарка ароматики (Baoguo 爆锅)', 
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />, 
      badge: 'Ароматика',
      desc: '15-30 сек в горячем масле'
    },
    seasoning_mix: { 
      label: 'Фаза 2: Соусная чаша (Wanzhi 碗汁)', 
      icon: <Layers className="w-3.5 h-3.5 text-rose-400" />, 
      badge: 'Соусная база',
      desc: 'Смешивается заранее в миске'
    },
    liquid_base: { 
      label: 'Фаза 3: Жидкая среда / Бульон', 
      icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" />, 
      badge: 'Жидкая фаза',
      desc: 'Растворение умами-кислот'
    },
    slurry_gouqian: { 
      label: 'Фаза 4: Крахмальная суспензия (Gouqian 勾芡)', 
      icon: <Scale className="w-3.5 h-3.5 text-emerald-400" />, 
      badge: 'Крахмал',
      desc: 'Клейстеризация и глянец'
    },
    finish_mingyou: { 
      label: 'Фаза 5: Финишное масло (Mingyou 明油)', 
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />, 
      badge: 'Глянец',
      desc: 'После выключения огня'
    },
    main_protein: { 
      label: 'Белковая основа', 
      icon: <Layers className="w-3.5 h-3.5 text-purple-400" />, 
      badge: 'Белок',
      desc: 'Основной компонент'
    }
  };

  const updateAmount = (ingredientId: string, delta: number) => {
    setIngredients(prev => prev.map(item => {
      if (item.ingredientId === ingredientId) {
        const nextAmount = Math.max(0.1, Math.round((item.amount + delta) * 10) / 10);
        return { ...item, amount: nextAmount };
      }
      return item;
    }));
  };

  const setExactAmount = (ingredientId: string, amount: number) => {
    setIngredients(prev => prev.map(item => {
      if (item.ingredientId === ingredientId) {
        return { ...item, amount: Math.max(0, amount) };
      }
      return item;
    }));
  };

  const removeIngredient = (ingredientId: string) => {
    setIngredients(prev => prev.filter(item => item.ingredientId !== ingredientId));
  };

  const addIngredientToRecipe = (ingredient: PantryIngredient) => {
    if (ingredients.some(i => i.ingredientId === ingredient.id)) return;
    
    // Auto-detect stage
    let defaultStage: RecipeStage = 'seasoning_mix';
    if (ingredient.category === 'aromatics' || ingredient.id === 'pixian_doubanjiang') {
      defaultStage = 'baoguo_aromatics';
    } else if (ingredient.id === 'potato_starch') {
      defaultStage = 'slurry_gouqian';
    } else if (ingredient.id === 'water_stock' || ingredient.id === 'pickle_brine') {
      defaultStage = 'liquid_base';
    } else if (ingredient.id === 'sesame_oil') {
      defaultStage = 'finish_mingyou';
    }

    const defaultAmount = ingredient.defaultUnit === 'ml' ? 15 : ingredient.defaultUnit === 'g' ? 10 : 1;

    setIngredients(prev => [
      ...prev,
      {
        ingredientId: ingredient.id,
        amount: defaultAmount,
        unit: ingredient.defaultUnit as any,
        stage: defaultStage
      }
    ]);
    setShowAddModal(false);
  };

  // Group current ingredients by stage
  const stages: RecipeStage[] = ['baoguo_aromatics', 'seasoning_mix', 'liquid_base', 'slurry_gouqian', 'finish_mingyou'];

  const filteredPantry = pantryList.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chineseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Target Protein Selector (Interactive Multi-Category Matrix) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <span>🥩</span>
              <span>Матрица белка & Физика соуса</span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ({PROTEIN_MATRIX_ITEMS.length} матриц)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-400">
            <span>{portions} порции</span>
          </div>
        </div>

        {/* Protein Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setProteinCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-all ${
              proteinCategory === 'all'
                ? 'bg-white/[0.1] text-white border-white/[0.25]'
                : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Все
          </button>
          {PROTEIN_CATEGORIES.map(cat => {
            const isSelected = proteinCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setProteinCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-all flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm'
                    : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                <span>{cat.iconLabel}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Protein Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {PROTEIN_MATRIX_ITEMS
            .filter(p => proteinCategory === 'all' || p.category === proteinCategory)
            .map(p => {
              const isSelected = activeProtein.id === p.id;
              return (
                <button
                  key={p.id}
                  id={`protein-btn-${p.id}`}
                  onClick={() => setSelectedProtein(p.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-sm ring-1 ring-amber-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-semibold text-xs text-white leading-tight">
                      {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                    </span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                        {p.chineseName.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mt-1.5 pt-1 border-t border-white/[0.04]">
                    <span>{p.dominantNucleotide !== 'none' ? `+${p.dominantNucleotide}` : 'Glu base'}</span>
                    <span className="text-amber-400/80">{p.absorptionLabel.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
        </div>

        {/* Dedicated Active Protein Interaction & Telemetry Box */}
        {activeProtein && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/20 via-black/40 to-rose-950/20 border border-amber-500/20 space-y-2.5 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-white text-xs">
                  Активный белок: {activeProtein.name}
                </span>
                <span className="font-mono text-amber-400 text-[11px]">
                  ({activeProtein.chineseName})
                </span>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-amber-200 border border-amber-500/30">
                {activeProtein.absorptionLabel}
              </span>
            </div>

            {/* Telemetry Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                <span className="text-zinc-500 block text-[9px]">Естественный Glu:</span>
                <strong className="text-rose-400">+{activeProtein.baselineGlutamateMg} мг/100г</strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                <span className="text-zinc-500 block text-[9px]">Инозинат/Гуанилат:</span>
                <strong className="text-amber-400">
                  +{activeProtein.baselineImpMg + activeProtein.baselineGmpMg} мг ({activeProtein.dominantNucleotide})
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                <span className="text-zinc-500 block text-[9px]">Поведение влаги:</span>
                <strong className="text-zinc-200">
                  {activeProtein.moistureTendency === 'releases_water' ? '💧 Отдает влагу' :
                   activeProtein.moistureTendency === 'absorbs_liquid' ? '🧽 Жадно впитывает' : 
                   activeProtein.moistureTendency === 'emulsifies' ? '🍳 Эмульгирует' : '⚖️ Стабильная'}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.06]">
                <span className="text-zinc-500 block text-[9px]">Архетип соуса:</span>
                <strong className="text-purple-300">{activeProtein.sauceAdjustment.recommendedSauceCategory}</strong>
              </div>
            </div>

            {/* Chef Tuning Advice & One-Click Apply */}
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="text-[11px] text-amber-200 leading-snug">
                💡 <strong className="text-white">Совет шефа: </strong>
                {activeProtein.sauceAdjustment.chefNotes}
              </div>

              {(activeProtein.sauceAdjustment.starchDeltaG !== 0 || activeProtein.sauceAdjustment.liquidDeltaMl !== 0) && (
                <button
                  type="button"
                  onClick={handleApplyProteinSauceAdjustment}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-[11px] shadow-sm transition-all shrink-0 flex items-center space-x-1.5 active:scale-95"
                  title="Автоматически скорректировать крахмал и бульон в текущем рецепте"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-200" />
                  <span>
                    Адаптировать соус ({activeProtein.sauceAdjustment.starchDeltaG > 0 ? `+${activeProtein.sauceAdjustment.starchDeltaG}г крахмал` : ''}{activeProtein.sauceAdjustment.liquidDeltaMl !== 0 ? `, ${activeProtein.sauceAdjustment.liquidDeltaMl > 0 ? '+' : ''}${activeProtein.sauceAdjustment.liquidDeltaMl}мл бульон` : ''})
                  </span>
                </button>
              )}
            </div>

            {/* Collapsible Wok Prep Instructions */}
            <div className="pt-1 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowProteinPrepDetails(!showProteinPrepDetails)}
                className="w-full flex items-center justify-between text-[11px] text-zinc-400 hover:text-white transition-colors py-1"
              >
                <div className="flex items-center space-x-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Китайская вок-подготовка: <strong className="text-zinc-200">{activeProtein.prepTechnique.chineseTerm} ({activeProtein.prepTechnique.name})</strong></span>
                </div>
                {showProteinPrepDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showProteinPrepDetails && (
                <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 text-[11px] leading-relaxed animate-fade-in">
                  <div>
                    <strong className="text-white">Маринад: </strong>
                    <span className="text-zinc-300">{activeProtein.prepTechnique.marinade}</span>
                  </div>
                  <div>
                    <strong className="text-white">Термодинамика вока: </strong>
                    <span className="text-amber-300 font-mono">{activeProtein.prepTechnique.thermalWokTime}</span>
                  </div>
                  <div className="text-zinc-400 pt-1 font-mono text-[10px]">
                    🎯 Цель: {activeProtein.prepTechnique.biochemicalGoal}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adjustment Toast Banner */}
        {adjustmentToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-medium flex items-center space-x-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{adjustmentToast}</span>
          </div>
        )}
      </div>

      {/* Real-time Nucleotide Synergy & Inhibition/Enhancement Widget */}
      <NucleotideSynergyWidget 
        tasteProfile={tasteProfile}
        ingredients={ingredients}
        pantryList={pantryList}
      />

      {/* Temperature Profile Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-white">
                Термодинамика & Вок-кинетика
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 hidden sm:inline">
                4°C — 250°C
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Моделирование синергии Ямагучи, реакции Майяра и клейстеризации крахмала по температурам
            </p>
          </div>
        </div>

        <button
          id="show-temperature-profile-btn"
          onClick={() => setShowTempProfile(true)}
          className="flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] text-white text-xs font-medium border border-white/[0.12] transition-all shadow-sm group shrink-0"
        >
          <Thermometer className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          <span>Показать температурный профиль</span>
        </button>
      </div>

      {/* Main Ingredient Stage Modules (Linear Stack) */}
      <div className="space-y-3">
        {stages.map(stageKey => {
          const stageItems = ingredients.filter(i => i.stage === stageKey);
          const meta = stageMeta[stageKey];
          if (stageItems.length === 0) return null;

          return (
            <div 
              key={stageKey}
              className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl space-y-2.5"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  {meta.icon}
                  <h4 className="font-semibold text-xs text-white">
                    {meta.label}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                  {meta.desc}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {stageItems.map(item => {
                  const ing = pantryMap.get(item.ingredientId);
                  if (!ing) return null;

                  const step = item.unit === 'ml' ? 5 : item.unit === 'g' ? 5 : 0.25;
                  const scaledAmount = Math.round(item.amount * portions * 10) / 10;

                  return (
                    <div 
                      key={item.ingredientId}
                      className="bg-[#0C0E14] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 transition-all group"
                    >
                      {/* Ingredient Info & Chemistry */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                          <span className="font-medium text-xs sm:text-sm text-white">
                            {ing.name}
                          </span>
                          <span className="text-[10px] sm:text-xs font-mono text-zinc-400">
                            {ing.chineseName.split(' ')[0]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-2.5 mt-1 text-[10px] text-zinc-400 font-mono flex-wrap gap-y-0.5">
                          {ing.freeGlutamate > 100 && (
                            <span className="text-rose-400">
                              Glu: {ing.freeGlutamate} мг
                            </span>
                          )}
                          {(ing.imp > 0 || ing.gmp > 0 || ing.amp > 0) && (
                            <span className="text-amber-400">
                              Нуклеотиды: {ing.imp + ing.gmp + ing.amp} мг
                            </span>
                          )}
                          {item.notes && (
                            <span className="text-zinc-500 italic truncate hidden sm:inline">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls (Steppers & Slider) */}
                      <div className="flex items-center justify-between sm:justify-end space-x-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        {/* Stepper with accessible touch targets */}
                        <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-lg p-0.5">
                          <button
                            onClick={() => updateAmount(item.ingredientId, -step)}
                            aria-label={`Уменьшить ${ing.name}`}
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors touch-manipulation"
                          >
                            -
                          </button>
                          <div className="w-14 sm:w-16 text-center">
                            <span className="font-mono text-xs sm:text-sm font-semibold text-white">
                              {scaledAmount}
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">
                              {item.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => updateAmount(item.ingredientId, step)}
                            aria-label={`Увеличить ${ing.name}`}
                            className="w-8 h-8 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors touch-manipulation"
                          >
                            +
                          </button>
                        </div>

                        {/* Drag Slider on Desktop */}
                        <input 
                          type="range"
                          min="0"
                          max={item.unit === 'ml' ? 120 : item.unit === 'g' ? 100 : 5}
                          step={step}
                          value={item.amount}
                          onChange={(e) => setExactAmount(item.ingredientId, parseFloat(e.target.value))}
                          className="w-16 hidden lg:block accent-rose-500 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                        />

                        {/* Delete Button */}
                        <button
                          onClick={() => removeIngredient(item.ingredientId)}
                          className="p-2 sm:p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors touch-manipulation"
                          title="Удалить компонент"
                          aria-label="Удалить"
                        >
                          <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Actions Grid: Add Ingredient & Save Formula to DB */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Add Ingredient Button */}
          <button
            onClick={() => setShowAddModal(true)}
            id="add-pantry-item-to-recipe-btn"
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-white/[0.12] hover:border-white/[0.24] bg-white/[0.02] hover:bg-white/[0.04] text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            <span>Добавить компонент ({pantryList.length})</span>
          </button>

          {/* Save to PostgreSQL Button */}
          {onSaveSauceToDb && (
            <button
              onClick={() => {
                setSaveTitle(recipeTitle || 'Мой умами-соус');
                setShowSaveModal(true);
              }}
              id="save-recipe-to-vps-btn"
              className="w-full py-2.5 px-3 rounded-xl border border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Сохранить формулу в VPS PostgreSQL</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Recipe to VPS PostgreSQL Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">
                    Сохранить в VPS PostgreSQL
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Таблица custom_sauces @ 2.26.86.122
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] touch-manipulation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-semibold text-white">Рецепт успешно сохранен в БД!</h4>
                <p className="text-xs text-zinc-400">
                  Формула синхронизирована с базой данных PostgreSQL на вашем сервере.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Название формулы</label>
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-xs sm:text-sm"
                    placeholder="Например: Сычуаньский чесночный глейз"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Иероглифы (опционально)</label>
                    <input
                      type="text"
                      value={saveChineseTitle}
                      onChange={(e) => setSaveChineseTitle(e.target.value)}
                      className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs sm:text-sm"
                      placeholder="蒜蓉豉汁"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Пиньинь (опционально)</label>
                    <input
                      type="text"
                      value={savePinyin}
                      onChange={(e) => setSavePinyin(e.target.value)}
                      className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs sm:text-sm"
                      placeholder="Suàn Róng Chǐ Zhī"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Краткое описание / Заметка</label>
                  <textarea
                    rows={2}
                    value={saveSummary}
                    onChange={(e) => setSaveSummary(e.target.value)}
                    className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none text-xs sm:text-sm"
                    placeholder="Идеален для обжарки сейтана или баклажанов в воке..."
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Ингредиентов в формуле:</span>
                    <span className="text-white font-mono">{ingredients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Интенсивность умами:</span>
                    <span className="text-rose-400 font-mono">{tasteProfile.umamiIntensityScore.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Синергетический индекс:</span>
                    <span className="text-amber-400 font-mono">x{tasteProfile.synergyMultiplier.toFixed(1)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] touch-manipulation"
                  >
                    Отмена
                  </button>
                  <button
                    disabled={isSaving || !saveTitle.trim()}
                    onClick={async () => {
                      if (!onSaveSauceToDb) return;
                      setIsSaving(true);
                      const ok = await onSaveSauceToDb({
                        title: saveTitle.trim(),
                        chineseTitle: saveChineseTitle.trim() || undefined,
                        pinyin: savePinyin.trim() || undefined,
                        category: saveCategory,
                        summary: saveSummary.trim() || `Кастомная умами-формула с синергией x${tasteProfile.synergyMultiplier.toFixed(1)}`,
                        ingredients,
                        steps: [],
                        targetProteins: [selectedProtein],
                        scientificBreakdown: `Глютамат: ${tasteProfile.glutamateMgTotal.toFixed(0)}мг, Нуклеотиды: ${tasteProfile.nucleotidesMgTotal.toFixed(0)}мг.`
                      });
                      setIsSaving(false);
                      if (ok) {
                        setSaveSuccess(true);
                        setTimeout(() => {
                          setSaveSuccess(false);
                          setShowSaveModal(false);
                        }, 1500);
                      }
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm disabled:opacity-50 touch-manipulation"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal (Linear Drawer / Overlay) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-white">
                  <Plus className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-white">
                  Добавить компонент в соус
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по названию или иероглифам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="px-3 py-2 border-b border-white/[0.06] flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
              {[
                { id: 'all', label: 'Все' },
                { id: 'sauces', label: 'Соусы' },
                { id: 'boosters', label: 'Умами-бустеры' },
                { id: 'dry', label: 'Специи/Крахмал' },
                { id: 'soy_seitan', label: 'Соя/Сейтан' },
                { id: 'aromatics', label: 'Ароматика' },
                { id: 'produce', label: 'Овощи' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap text-[11px] font-medium transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-white/[0.12] text-white border border-white/[0.16]' 
                      : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
              {filteredPantry.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  Компоненты не найдены
                </div>
              ) : (
                filteredPantry.map(item => {
                  const isAdded = ingredients.some(i => i.ingredientId === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
                    >
                      <div className="pr-3 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-white truncate">{item.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400">{item.chineseName}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>

                      <button
                        onClick={() => addIngredientToRecipe(item)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-all ${
                          isAdded
                            ? 'bg-white/[0.04] text-zinc-600 border border-transparent cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm border border-rose-500/40'
                        }`}
                      >
                        {isAdded ? 'Добавлен' : '+ В соус'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Temperature Profile Modal */}
      <TemperatureProfileModal 
        isOpen={showTempProfile}
        onClose={() => setShowTempProfile(false)}
        tasteProfile={tasteProfile}
        ingredients={ingredients}
        pantryList={pantryList}
      />
    </div>
  );
};

