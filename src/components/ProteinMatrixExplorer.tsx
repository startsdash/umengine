import React, { useState, useMemo } from 'react';
import { ProteinMatrixItem, ProteinCategory, AbsorptionArchetype } from '../types';
import { PROTEIN_MATRIX_ITEMS, PROTEIN_CATEGORIES } from '../data/proteinMatrixData';
import { 
  Layers, 
  Search, 
  Sparkles, 
  FlaskConical, 
  Flame, 
  Droplets, 
  ArrowRight, 
  Scale, 
  Check, 
  Info, 
  X, 
  SlidersHorizontal,
  ChefHat,
  Dna,
  Zap,
  Activity,
  Table,
  LayoutGrid
} from 'lucide-react';

interface ProteinMatrixExplorerProps {
  onSelectProteinForConstructor: (proteinId: string) => void;
}

export const ProteinMatrixExplorer: React.FC<ProteinMatrixExplorerProps> = ({
  onSelectProteinForConstructor
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeProteinModal, setActiveProteinModal] = useState<ProteinMatrixItem | null>(null);

  // Filter items
  const filteredProteins = useMemo(() => {
    return PROTEIN_MATRIX_ITEMS.filter(item => {
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesArch = selectedArchetype === 'all' || item.absorptionArchetype === selectedArchetype;
      const q = searchQuery.toLowerCase();
      const matchesQuery = searchQuery === '' ||
        item.name.toLowerCase().includes(q) ||
        item.chineseName.toLowerCase().includes(q) ||
        (item.pinyin && item.pinyin.toLowerCase().includes(q)) ||
        item.physicsDescription.toLowerCase().includes(q);
      return matchesCat && matchesArch && matchesQuery;
    });
  }, [selectedCategory, selectedArchetype, searchQuery]);

  // Archetype badge helpers
  const getArchetypeBadge = (arch: AbsorptionArchetype) => {
    switch (arch) {
      case 'sponge':
        return { label: '🧽 Губка (Высокое впитывание)', color: 'bg-blue-500/10 text-blue-300 border-blue-500/30' };
      case 'silk_coating':
        return { label: '✨ Шелк (Coating Глазурь)', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'fibrous':
        return { label: '🥩 Волокно (Бархатирование)', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'emulsion_oil':
        return { label: '🍳 Эмульсия (Масло & Яйца)', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' };
      case 'gel_cellular':
        return { label: '🍄 Гель / Клетка (Высокое умами)', color: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      default:
        return { label: 'Стандарт', color: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30' };
    }
  };

  const getCategoryIcon = (cat: ProteinCategory) => {
    switch (cat) {
      case 'meat': return '🥩';
      case 'poultry': return '🍗';
      case 'eggs': return '🍳';
      case 'seafood': return '🦐';
      case 'plant_soy_gluten': return '🌱';
      case 'fungi': return '🍄';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-100">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/30 via-rose-950/20 to-purple-950/20 border border-amber-500/20 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Биохимия твердой фазы
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {PROTEIN_MATRIX_ITEMS.length} белковых матриц
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Матрица белка & Физика вок-соуса
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold' 
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
              title="Сетка карточек"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Карточки</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl border text-xs flex items-center space-x-1.5 transition-colors ${
                viewMode === 'table' 
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold' 
                  : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
              title="Сравнительная биохимическая таблица"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline">Таблица умами</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed font-light">
          В китайской кулинарии соус не существует отдельно от белка. Плотная говядина требует обволакивающего крахмального слоя (Shang Jiang), 
          пористый тофу-пуф моментально впитывает жидкую базу соуса, а сушеные шиитаке и куриное филе сами вносят рекордный уровень нуклеотидов (IMP/GMP), 
          многократно умножая силу соевого глутамата по формуле Ямагути.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-white/[0.12] text-white border-white/[0.3] shadow-sm'
                : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
            }`}
          >
            Все категории ({PROTEIN_MATRIX_ITEMS.length})
          </button>
          {PROTEIN_CATEGORIES.map(cat => {
            const count = PROTEIN_MATRIX_ITEMS.filter(p => p.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/40 shadow-sm'
                    : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                <span>{cat.iconLabel}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Archetype Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, пиньиню, иероглифам или физике впитывания..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-amber-500/50 focus:outline-none text-xs text-white placeholder-zinc-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedArchetype}
              onChange={e => setSelectedArchetype(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0e131b] border border-white/[0.08] focus:border-amber-500/50 focus:outline-none text-xs text-zinc-300 transition-colors"
            >
              <option value="all">Все физические архетипы</option>
              <option value="sponge">🧽 Губка (Высокое впитывание)</option>
              <option value="silk_coating">✨ Шелк (Coating Глазурь)</option>
              <option value="fibrous">🥩 Волокно (Бархатирование)</option>
              <option value="emulsion_oil">🍳 Эмульсия (Масло & Яйца)</option>
              <option value="gel_cellular">🍄 Гель / Клетка (Умами)</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE: GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProteins.map(item => {
            const archBadge = getArchetypeBadge(item.absorptionArchetype);
            const totalNucleotides = item.baselineImpMg + item.baselineGmpMg;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0e131b] border border-white/[0.08] hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group relative overflow-hidden"
              >
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-xs text-amber-400/90 font-mono">
                        <span className="text-sm">{getCategoryIcon(item.category)}</span>
                        <span className="font-semibold">{item.chineseName}</span>
                        {item.pinyin && <span className="text-zinc-500">({item.pinyin})</span>}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                        {item.name}
                      </h3>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${archBadge.color}`}>
                      {archBadge.label.split(' ')[0]} {archBadge.label.split(' ')[1]}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-light">
                    {item.physicsDescription}
                  </p>
                </div>

                {/* Biochemical Precursor Bar */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-xs">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-zinc-400">Собственные умами-вещества:</span>
                    <span className="font-bold text-amber-300">
                      {item.baselineGlutamateMg} мг Glu
                      {totalNucleotides > 0 && ` + ${totalNucleotides} мг ${item.dominantNucleotide}`}
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden flex">
                    <div 
                      className="bg-rose-500 h-full" 
                      style={{ width: `${Math.min(100, (item.baselineGlutamateMg / 200) * 100)}%` }} 
                      title={`Глутамат: ${item.baselineGlutamateMg} мг`}
                    />
                    <div 
                      className="bg-amber-400 h-full" 
                      style={{ width: `${Math.min(100, (totalNucleotides / 250) * 100)}%` }} 
                      title={`Нуклеотиды: ${totalNucleotides} мг`}
                    />
                  </div>

                  {/* Technique Tag */}
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-zinc-400">
                    <span className="text-zinc-400">Техника вока:</span>
                    <span className="text-white truncate max-w-[170px]">{item.prepTechnique.chineseTerm} {item.prepTechnique.name.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Sauce Tuning Hint */}
                <div className="p-2.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-[11px] text-amber-200/90 leading-snug">
                  💡 <strong className="text-white">Соус:</strong> {item.sauceAdjustment.chefNotes.slice(0, 110)}...
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] gap-2">
                  <button
                    onClick={() => setActiveProteinModal(item)}
                    className="text-xs text-zinc-300 hover:text-white font-medium flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Биохимия & Протокол</span>
                  </button>

                  <button
                    id={`select-protein-constructor-${item.id}`}
                    onClick={() => onSelectProteinForConstructor(item.id)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-amber-950/30 group"
                  >
                    <FlaskConical className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    <span>В Конструктор</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE: TABLE (BIOCHEMICAL COMPARISON) */}
      {viewMode === 'table' && (
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0e131b]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03] text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Белок / Продукт</th>
                  <th className="p-3.5">Категория</th>
                  <th className="p-3.5">Физика абсорбции</th>
                  <th className="p-3.5 text-right">Глутамат (мг)</th>
                  <th className="p-3.5 text-right">IMP / GMP (мг)</th>
                  <th className="p-3.5">Влагоотдача</th>
                  <th className="p-3.5">Вок-техника</th>
                  <th className="p-3.5 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-200">
                {filteredProteins.map(item => {
                  const archBadge = getArchetypeBadge(item.absorptionArchetype);
                  const totalNuc = item.baselineImpMg + item.baselineGmpMg;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setActiveProteinModal(item)}
                    >
                      <td className="p-3.5 font-medium text-white">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryIcon(item.category)}</span>
                          <div>
                            <div>{item.name}</div>
                            <div className="text-[10px] text-amber-400 font-mono">{item.chineseName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-zinc-400 text-[11px]">
                        {PROTEIN_CATEGORIES.find(c => c.id === item.category)?.label}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${archBadge.color}`}>
                          {item.absorptionLabel.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-rose-300">
                        {item.baselineGlutamateMg}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-300">
                        {totalNuc} <span className="text-[9px] font-normal text-zinc-500">({item.dominantNucleotide})</span>
                      </td>
                      <td className="p-3.5 text-[11px] font-mono text-zinc-400">
                        {item.moistureTendency === 'releases_water' ? '💧 Отдает воду' :
                         item.moistureTendency === 'absorbs_liquid' ? '🧽 Впитывает' : 
                         item.moistureTendency === 'emulsifies' ? '🍳 Эмульсия' : '⚖️ Баланс'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-300">
                        {item.prepTechnique.chineseTerm}
                      </td>
                      <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectProteinForConstructor(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                        >
                          В соус
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAIL MODAL INSPECTOR */}
      {activeProteinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div 
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#0d121a] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-zinc-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-transparent flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider flex items-center space-x-1">
                    <span>{getCategoryIcon(activeProteinModal.category)}</span>
                    <span>{PROTEIN_CATEGORIES.find(c => c.id === activeProteinModal.category)?.label}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                    {activeProteinModal.absorptionLabel}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                  {activeProteinModal.name}
                </h2>

                <div className="flex items-center space-x-2 text-xs text-amber-400 font-mono">
                  <span className="text-sm font-semibold">{activeProteinModal.chineseName}</span>
                  {activeProteinModal.pinyin && <span className="text-zinc-400">({activeProteinModal.pinyin})</span>}
                </div>
              </div>

              <button
                onClick={() => setActiveProteinModal(null)}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 no-scrollbar">
              {/* Physics & Bio Background */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                  <Dna className="w-4 h-4 text-amber-400" />
                  <span>Физико-химический механизм взаимодействия с соусом</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light">
                  {activeProteinModal.physicsDescription}
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                  🔬 <strong className="text-zinc-200">Научная основа:</strong> {activeProteinModal.scientificNotes}
                </p>
              </div>

              {/* Natural Umami Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Глутамат (Glu)</span>
                  <div className="text-xl font-bold font-mono text-rose-300">
                    {activeProteinModal.baselineGlutamateMg} <span className="text-xs text-zinc-400">мг/100г</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Нуклеотид (IMP/GMP)</span>
                  <div className="text-xl font-bold font-mono text-amber-300">
                    {activeProteinModal.baselineImpMg + activeProteinModal.baselineGmpMg} <span className="text-xs text-zinc-400">мг/100г</span>
                  </div>
                  <span className="text-[9px] font-mono text-amber-400">
                    Доминанта: {activeProteinModal.dominantNucleotide}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Влагоотдача</span>
                  <div className="text-xs font-bold font-mono text-white pt-1">
                    {activeProteinModal.moistureTendency === 'releases_water' ? '💧 Выделяет сок' :
                     activeProteinModal.moistureTendency === 'absorbs_liquid' ? '🧽 Жадно впитывает' : 
                     activeProteinModal.moistureTendency === 'emulsifies' ? '🍳 Масляная эмульсия' : '⚖️ Стабильная'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Архетип соуса</span>
                  <div className="text-xs font-bold font-mono text-purple-300 pt-1">
                    {activeProteinModal.sauceAdjustment.recommendedSauceCategory}
                  </div>
                </div>
              </div>

              {/* Chinese Wok Prep Protocol */}
              <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    <ChefHat className="w-4 h-4 text-amber-400" />
                    <span>Китайский протокол подготовки: {activeProteinModal.prepTechnique.chineseTerm}</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    ⏱ {activeProteinModal.prepTechnique.thermalWokTime}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div>
                    <strong className="text-white">Метод: </strong>
                    <span className="text-zinc-200">{activeProteinModal.prepTechnique.name}</span>
                  </div>
                  <div>
                    <strong className="text-white">Маринад и запечатывание: </strong>
                    <span className="text-zinc-300">{activeProteinModal.prepTechnique.marinade}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] text-[11px] font-mono text-amber-200/90">
                    🎯 <strong className="text-white">Биохимическая цель:</strong> {activeProteinModal.prepTechnique.biochemicalGoal}
                  </div>
                </div>
              </div>

              {/* Sauce Tuning Recommendations */}
              <div className="p-4 rounded-2xl bg-rose-500/[0.05] border border-rose-500/20 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300 uppercase tracking-wider">
                  <FlaskConical className="w-4 h-4 text-rose-400" />
                  <span>Рекомендация по адаптации соуса под этот белок</span>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed">
                  {activeProteinModal.sauceAdjustment.chefNotes}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    Крахмал: <strong className="text-white">{activeProteinModal.sauceAdjustment.starchDeltaG > 0 ? `+${activeProteinModal.sauceAdjustment.starchDeltaG}` : activeProteinModal.sauceAdjustment.starchDeltaG} г</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                    Жидкость: <strong className="text-white">{activeProteinModal.sauceAdjustment.liquidDeltaMl > 0 ? `+${activeProteinModal.sauceAdjustment.liquidDeltaMl}` : activeProteinModal.sauceAdjustment.liquidDeltaMl} мл</strong>
                  </span>
                </div>
              </div>

              {/* Culinary Pairings */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Аутентичные гастрономические пары в воке:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProteinModal.culinaryPairings.map((pair, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300"
                    >
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0a0e14] flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveProteinModal(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
              >
                Закрыть
              </button>

              <button
                onClick={() => {
                  onSelectProteinForConstructor(activeProteinModal.id);
                  setActiveProteinModal(null);
                }}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-rose-500 hover:from-amber-500 hover:to-rose-400 text-white font-bold text-xs shadow-lg shadow-amber-950/50 border border-amber-400/40 transition-all group"
              >
                <FlaskConical className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>Собрать соус под {activeProteinModal.name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
