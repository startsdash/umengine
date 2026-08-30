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
  CheckCircle2
} from 'lucide-react';

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

  const pantryMap = new Map<string, PantryIngredient>();
  pantryList.forEach(p => pantryMap.set(p.id, p));

  const proteins = [
    { id: 'seitan', name: 'Сейтан', desc: 'Пшеничный глютен, требует густого Wanzhi' },
    { id: 'doupi', name: 'Доупи', desc: 'Тофу-листы, мгновенно впитывают соус' },
    { id: 'fuzhu', name: 'Фучжу', desc: 'Соевая спаржа / Юба, глубокое томление' },
    { id: 'potato_carrot', name: 'Овощи', desc: 'Корнеплоды для тушения в рассоле' }
  ];

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
      {/* Target Protein Selector (Linear Pill Matrix) */}
      <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
            Матрица белка
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            {portions} порции
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {proteins.map(p => {
            const isSelected = selectedProtein === p.id;
            return (
              <button
                key={p.id}
                id={`protein-btn-${p.id}`}
                onClick={() => setSelectedProtein(p.id)}
                className={`text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/[0.22] text-white shadow-sm ring-1 ring-white/10'
                    : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{p.name}</span>
                  {isSelected && <Check className="w-3 h-3 text-rose-400" />}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">{p.desc}</p>
              </button>
            );
          })}
        </div>
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
                      className="bg-[#0C0E14] border border-white/[0.06] hover:border-white/[0.12] rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all group"
                    >
                      {/* Ingredient Info & Chemistry */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-white truncate">
                            {ing.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {ing.chineseName.split(' ')[0]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2.5 mt-1 text-[10px] text-zinc-400 font-mono">
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
                            <span className="text-zinc-500 italic truncate hidden md:inline">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls (Steppers & Slider) */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {/* Stepper with accessible touch targets */}
                        <div className="flex items-center bg-black/40 border border-white/[0.08] rounded-md p-0.5">
                          <button
                            onClick={() => updateAmount(item.ingredientId, -step)}
                            aria-label={`Уменьшить ${ing.name}`}
                            className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                          >
                            -
                          </button>
                          <div className="w-14 sm:w-16 text-center">
                            <span className="font-mono text-xs font-semibold text-white">
                              {scaledAmount}
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">
                              {item.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => updateAmount(item.ingredientId, step)}
                            aria-label={`Увеличить ${ing.name}`}
                            className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
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
                          className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Удалить компонент"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
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
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
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
                    className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Например: Сычуаньский чесночный глейз"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Иероглифы (опционально)</label>
                    <input
                      type="text"
                      value={saveChineseTitle}
                      onChange={(e) => setSaveChineseTitle(e.target.value)}
                      className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                      placeholder="蒜蓉豉汁"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Пиньинь (опционально)</label>
                    <input
                      type="text"
                      value={savePinyin}
                      onChange={(e) => setSavePinyin(e.target.value)}
                      className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                    className="w-full bg-[#141720] border border-white/[0.1] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
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
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]"
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
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm disabled:opacity-50"
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

