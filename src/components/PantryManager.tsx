import React, { useState } from 'react';
import { PantryIngredient, PantryCategory } from '../types';
import { 
  PackageCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  FlaskConical, 
  Info, 
  Layers 
} from 'lucide-react';

interface PantryManagerProps {
  pantryList: PantryIngredient[];
  onTogglePantryItem: (id: string) => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({
  pantryList,
  onTogglePantryItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItemDetail, setSelectedItemDetail] = useState<PantryIngredient | null>(null);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Все запасы' },
    { id: 'sauces', label: 'Ферментированное & Соусы' },
    { id: 'boosters', label: 'Умами-бустеры' },
    { id: 'dry', label: 'Бакалея & Специи' },
    { id: 'soy_seitan', label: 'Соя & Сейтан' },
    { id: 'aromatics', label: 'Свежая ароматика' },
    { id: 'produce', label: 'Овощи & Рассол' }
  ];

  const filteredItems = pantryList.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.chineseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const inStockCount = pantryList.filter(i => i.inPantry).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-2">
              <PackageCheck className="w-4 h-4" />
              <span>ИНВЕНТАРЬ И БИОХИМИЧЕСКИЙ РЕЕСТР</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Моя Кладовая Умами-Инженера
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Биохимические концентрации свободной глутаминовой кислоты (L-глутамат) и 5'-рибонуклеотидов (IMP, GMP, AMP).
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 self-start sm:self-center font-mono">
            <span className="text-xs text-zinc-400">В наличии:</span>
            <span className="text-sm font-bold text-emerald-400">{inStockCount} / {pantryList.length}</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Поиск по названию (напр. 'Доубанцзян', 'Цзицзин', 'Сейтан')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Pantry Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemDetail(item)}
              className={`bg-[#10151E] border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:border-zinc-700 hover:shadow-lg ${
                item.inPantry ? 'border-zinc-800/90' : 'border-zinc-900 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-xs text-white">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-mono text-rose-400/90 block mt-0.5">
                      {item.chineseName}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePantryItem(item.id);
                    }}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      item.inPantry
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                    }`}
                    title={item.inPantry ? 'Отметить как отсутствующий' : 'Отметить в наличии'}
                  >
                    {item.inPantry ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Chemical Badges */}
                <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5 flex flex-col">
                    <span className="text-zinc-500">L-Глутамат:</span>
                    <span className={`font-bold ${item.freeGlutamate > 500 ? 'text-rose-400' : 'text-zinc-300'}`}>
                      {item.freeGlutamate} мг/100г
                    </span>
                  </div>
                  <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-1.5 flex flex-col">
                    <span className="text-zinc-500">Нуклеотиды:</span>
                    <span className={`font-bold ${(item.imp + item.gmp + item.amp) > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {item.imp + item.gmp + item.amp} мг/100г
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Tags */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {item.aromaTags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {item.defaultUnit} · ρ={item.density}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10151E] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {selectedItemDetail.name}
                </h3>
                <span className="font-mono text-xs text-rose-400">
                  {selectedItemDetail.chineseName}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {selectedItemDetail.description}
            </p>

            {/* Chemical Matrix */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
              <span className="text-[11px] font-mono font-bold text-white block">
                БИОХИМИЧЕСКИЙ ПРОФИЛЬ (на 100г продукта):
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">L-Глутаминовая кислота:</span>
                  <span className="text-rose-400 font-bold">{selectedItemDetail.freeGlutamate} мг</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">5'-Инозинат (IMP):</span>
                  <span className="text-amber-400 font-bold">{selectedItemDetail.imp} мг</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">5'-Гуанилат (GMP):</span>
                  <span className="text-emerald-400 font-bold">{selectedItemDetail.gmp} мг</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">5'-Аденилат (AMP):</span>
                  <span className="text-cyan-400 font-bold">{selectedItemDetail.amp} мг</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">Соленость (NaCl):</span>
                  <span className="text-blue-400 font-bold">{selectedItemDetail.sodiumPercent}%</span>
                </div>
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800/60">
                  <span className="text-zinc-500 block text-[10px]">Сахара / Углеводы:</span>
                  <span className="text-yellow-400 font-bold">{selectedItemDetail.sugarPercent}%</span>
                </div>
              </div>
            </div>

            {/* Scientific Notes */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-zinc-200">Кулинарная роль:</span>
              <p className="text-zinc-400">{selectedItemDetail.culinaryRole}</p>
              
              <span className="font-semibold text-zinc-200 block pt-2">Научное обоснование:</span>
              <p className="text-zinc-400 italic bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                {selectedItemDetail.scientificNotes}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
