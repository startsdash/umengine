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
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-1.5">
              <PackageCheck className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[10px]">Инвентарь и биохимический реестр</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Кладовая Умами-Инженера
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Концентрации L-глутамата и 5'-рибонуклеотидов (IMP, GMP, AMP) в исходных продуктах.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1 self-start sm:self-center font-mono">
            <span className="text-[11px] text-zinc-400">В наличии:</span>
            <span className="text-xs font-semibold text-emerald-400">{inStockCount} / {pantryList.length}</span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Поиск (напр. 'Доубанцзян', 'Цзицзин', 'Сейтан')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/[0.08] focus:border-rose-500/60 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-white/[0.14] text-white border border-white/[0.18]'
                    : 'bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Pantry Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredItems.map(item => {
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItemDetail(item)}
              className={`rounded-xl bg-white/[0.02] border p-3.5 flex flex-col justify-between cursor-pointer transition-all backdrop-blur-xl ${
                item.inPantry 
                  ? 'border-white/[0.08] hover:border-white/[0.16]' 
                  : 'border-white/[0.04] opacity-50 hover:opacity-75'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-xs text-white">
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
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      item.inPantry
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.08]'
                    }`}
                    title={item.inPantry ? 'Отметить как отсутствующий' : 'Отметить в наличии'}
                  >
                    {item.inPantry ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Chemical Badges */}
                <div className="mt-2.5 grid grid-cols-2 gap-1 text-[10px] font-mono">
                  <div className="bg-[#0C0E14] border border-white/[0.06] rounded-md p-1.5 flex flex-col">
                    <span className="text-zinc-500 text-[9px]">L-Глутамат:</span>
                    <span className={`font-semibold ${item.freeGlutamate > 500 ? 'text-rose-400' : 'text-zinc-300'}`}>
                      {item.freeGlutamate} мг
                    </span>
                  </div>
                  <div className="bg-[#0C0E14] border border-white/[0.06] rounded-md p-1.5 flex flex-col">
                    <span className="text-zinc-500 text-[9px]">Нуклеотиды:</span>
                    <span className={`font-semibold ${(item.imp + item.gmp + item.amp) > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {item.imp + item.gmp + item.amp} мг
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Tags */}
              <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {item.aromaTags.slice(0, 2).map((tag, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-zinc-500">
                  {item.defaultUnit} · ρ={item.density}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0E1015] border border-white/[0.12] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-3.5 backdrop-blur-2xl">
            <div className="flex items-start justify-between border-b border-white/[0.06] pb-2.5">
              <div>
                <h3 className="font-semibold text-sm text-white">
                  {selectedItemDetail.name}
                </h3>
                <span className="font-mono text-xs text-rose-400">
                  {selectedItemDetail.chineseName}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-1 rounded-md bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              {selectedItemDetail.description}
            </p>

            {/* Chemical Matrix */}
            <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase block">
                Биохимический профиль (на 100г продукта):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">L-Глутаминовая кислота:</span>
                  <span className="text-rose-400 font-semibold">{selectedItemDetail.freeGlutamate} мг</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">5'-Инозинат (IMP):</span>
                  <span className="text-amber-400 font-semibold">{selectedItemDetail.imp} мг</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">5'-Гуанилат (GMP):</span>
                  <span className="text-emerald-400 font-semibold">{selectedItemDetail.gmp} мг</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">5'-Аденилат (AMP):</span>
                  <span className="text-cyan-400 font-semibold">{selectedItemDetail.amp} мг</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">Соленость (NaCl):</span>
                  <span className="text-blue-400 font-semibold">{selectedItemDetail.sodiumPercent}%</span>
                </div>
                <div className="p-1.5 bg-black/40 rounded-md border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[9px]">Сахара / Углеводы:</span>
                  <span className="text-yellow-400 font-semibold">{selectedItemDetail.sugarPercent}%</span>
                </div>
              </div>
            </div>

            {/* Scientific Notes */}
            <div className="space-y-1.5 text-xs">
              <span className="font-medium text-zinc-200">Кулинарная роль:</span>
              <p className="text-zinc-400 text-[11px]">{selectedItemDetail.culinaryRole}</p>
              
              <span className="font-medium text-zinc-200 block pt-1.5">Научное обоснование:</span>
              <p className="text-zinc-400 text-[11px] bg-[#0C0E14] p-2 rounded-lg border border-white/[0.06]">
                {selectedItemDetail.scientificNotes}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="px-3 py-1 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.1]"
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
