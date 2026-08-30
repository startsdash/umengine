import React, { useState } from 'react';
import { PantryIngredient, RecipeIngredient, RecipeStage, TasteProfile } from '../types';
import { NucleotideSynergyWidget } from './NucleotideSynergyWidget';
import { 
  Plus, 
  Trash2, 
  Flame, 
  Droplets, 
  Scale, 
  Sparkles, 
  Layers, 
  Check, 
  ChevronRight,
  Info
} from 'lucide-react';

interface SauceConstructorProps {
  ingredients: RecipeIngredient[];
  setIngredients: React.Dispatch<React.SetStateAction<RecipeIngredient[]>>;
  pantryList: PantryIngredient[];
  tasteProfile: TasteProfile;
  selectedProtein: string;
  setSelectedProtein: (p: string) => void;
  portions: number;
}

export const SauceConstructor: React.FC<SauceConstructorProps> = ({
  ingredients,
  setIngredients,
  pantryList,
  tasteProfile,
  selectedProtein,
  setSelectedProtein,
  portions
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const pantryMap = new Map<string, PantryIngredient>();
  pantryList.forEach(p => pantryMap.set(p.id, p));

  const proteins = [
    { id: 'seitan', name: 'Сейтан (Пшеничный глютен)', desc: 'Высокая пористость, требует плотного глазирования' },
    { id: 'doupi', name: 'Доупи (Тофу-листы)', desc: 'Тонкая слоистая структура, впитывает Wanzhi' },
    { id: 'fuzhu', name: 'Фучжу (Соевая спаржа / Юба)', desc: 'Шелковистая упругость, любит доубанцзян и чеснок' },
    { id: 'potato_carrot', name: 'Овощи (Картофель & Морковь)', desc: 'Корнеплоды для тушения в рассоле и сое' }
  ];

  // Stage details
  const stageMeta: Record<RecipeStage, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    baoguo_aromatics: { 
      label: 'Фаза 1: Обжарка ароматики (Baoguo 爆锅)', 
      icon: <Flame className="w-4 h-4 text-orange-400" />, 
      color: 'border-orange-500/30 bg-orange-950/10',
      desc: 'Закладывается в горячее масло на 15-30 секунд для экстракции эфиров'
    },
    seasoning_mix: { 
      label: 'Фаза 2: Соусная чаша (Wanzhi 碗汁)', 
      icon: <Layers className="w-4 h-4 text-rose-400" />, 
      color: 'border-rose-500/30 bg-rose-950/10',
      desc: 'Смешивается заранее в миске со специями, глутаматом и вином'
    },
    liquid_base: { 
      label: 'Фаза 3: Жидкая среда / Бульон', 
      icon: <Droplets className="w-4 h-4 text-cyan-400" />, 
      color: 'border-cyan-500/30 bg-cyan-950/10',
      desc: 'Вода, бульон или рассол для растворения аминокислот'
    },
    slurry_gouqian: { 
      label: 'Фаза 4: Крахмальная суспензия (Gouqian 勾芡)', 
      icon: <Scale className="w-4 h-4 text-emerald-400" />, 
      color: 'border-emerald-500/30 bg-emerald-950/10',
      desc: 'Картофельный крахмал для клейстеризации и удержания соуса на белке'
    },
    finish_mingyou: { 
      label: 'Фаза 5: Финишное масло (Mingyou 明油)', 
      icon: <Sparkles className="w-4 h-4 text-amber-400" />, 
      color: 'border-amber-500/30 bg-amber-950/10',
      desc: 'Кунжутное масло после выключения огня для зеркального блеска'
    },
    main_protein: { 
      label: 'Белковая основа', 
      icon: <Layers className="w-4 h-4 text-purple-400" />, 
      color: 'border-purple-500/30 bg-purple-950/10',
      desc: 'Основной продукт'
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

  return (
    <div className="space-y-6">
      {/* Target Protein Selector */}
      <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-rose-400">МАТРИЦА БЕЛКА:</span>
            <span className="text-xs text-zinc-400">Выберите продукт под который калибруется соус</span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Порции: {portions}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {proteins.map(p => {
            const isSelected = selectedProtein === p.id;
            return (
              <button
                key={p.id}
                id={`protein-btn-${p.id}`}
                onClick={() => setSelectedProtein(p.id)}
                className={`text-left p-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{p.name.split(' ')[0]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
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

      {/* Main Ingredient Stage Modules */}
      <div className="space-y-4">
        {stages.map(stageKey => {
          const stageItems = ingredients.filter(i => i.stage === stageKey);
          const meta = stageMeta[stageKey];
          if (stageItems.length === 0) return null;

          return (
            <div 
              key={stageKey}
              className={`border rounded-2xl p-4 transition-all ${meta.color}`}
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center space-x-2">
                  {meta.icon}
                  <h4 className="font-display font-semibold text-xs text-white tracking-wide">
                    {meta.label}
                  </h4>
                </div>
                <span className="text-[11px] text-zinc-400 font-sans hidden sm:inline">
                  {meta.desc}
                </span>
              </div>

              <div className="space-y-2.5">
                {stageItems.map(item => {
                  const ing = pantryMap.get(item.ingredientId);
                  if (!ing) return null;

                  const step = item.unit === 'ml' ? 5 : item.unit === 'g' ? 5 : 0.25;
                  const scaledAmount = Math.round(item.amount * portions * 10) / 10;

                  return (
                    <div 
                      key={item.ingredientId}
                      className="bg-zinc-900/90 border border-zinc-800/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                    >
                      {/* Ingredient Name & Biochemical Tag */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-xs text-white truncate">
                            {ing.name}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400">
                            {ing.chineseName.split(' ')[0]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-zinc-400">
                          {ing.freeGlutamate > 500 && (
                            <span className="text-rose-400 font-mono">
                              Glu: {ing.freeGlutamate} мг
                            </span>
                          )}
                          {(ing.imp > 0 || ing.gmp > 0 || ing.amp > 0) && (
                            <span className="text-amber-400 font-mono">
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

                      {/* Controls */}
                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                          <button
                            onClick={() => updateAmount(item.ingredientId, -step)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            -
                          </button>
                          <div className="w-16 text-center">
                            <span className="font-mono text-xs font-bold text-white">
                              {scaledAmount}
                            </span>
                            <span className="text-[10px] text-zinc-400 ml-1">
                              {item.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => updateAmount(item.ingredientId, step)}
                            className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        {/* Slider for smooth dragging */}
                        <input 
                          type="range"
                          min="0"
                          max={item.unit === 'ml' ? 120 : item.unit === 'g' ? 100 : 5}
                          step={step}
                          value={item.amount}
                          onChange={(e) => setExactAmount(item.ingredientId, parseFloat(e.target.value))}
                          className="w-20 hidden lg:block accent-rose-500"
                        />

                        <button
                          onClick={() => removeIngredient(item.ingredientId)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Удалить из рецепта"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add Ingredient Button */}
        <button
          onClick={() => setShowAddModal(true)}
          id="add-pantry-item-to-recipe-btn"
          className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-rose-500/50 bg-zinc-900/40 hover:bg-rose-950/10 text-zinc-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить компонент из кладовой ({pantryList.length} доступно)</span>
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10151E] border border-zinc-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-rose-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  ДОБАВИТЬ ИЗ МОЕЙ КЛАДОВОЙ
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1 bg-zinc-800 rounded-lg"
              >
                Закрыть
              </button>
            </div>

            {/* Category Filter */}
            <div className="p-3 border-b border-zinc-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
              {['all', 'sauces', 'boosters', 'dry', 'soy_seitan', 'aromatics', 'produce'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                    selectedCategory === cat ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat === 'all' ? 'Все' : cat === 'sauces' ? 'Соусы' : cat === 'boosters' ? 'Умами-бустеры' : cat === 'dry' ? 'Специи/Крахмал' : cat === 'soy_seitan' ? 'Соя/Сейтан' : cat === 'aromatics' ? 'Ароматика' : 'Овощи'}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {pantryList
                .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                .map(item => {
                  const isAdded = ingredients.some(i => i.ingredientId === item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div className="pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-white">{item.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{item.chineseName}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{item.description}</p>
                      </div>

                      <button
                        onClick={() => addIngredientToRecipe(item)}
                        disabled={isAdded}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                          isAdded
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                        }`}
                      >
                        {isAdded ? 'Добавлен' : '+ В соус'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
