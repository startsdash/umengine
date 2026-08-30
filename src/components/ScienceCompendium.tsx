import React, { useState } from 'react';
import { SCIENCE_DATA } from '../data/science';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossary';
import { 
  BookOpen, 
  Atom, 
  ExternalLink, 
  Table, 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  Layers,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Info,
  Zap,
  Activity,
  Dna,
  Scale,
  Flame,
  X,
  HelpCircle,
  FlaskConical,
  ChefHat
} from 'lucide-react';

export const ScienceCompendium: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('yamaguchi_2000');
  const [activeTab, setActiveTab] = useState<'papers' | 'glossary' | 'nucleotides'>('papers');
  
  // Interactive mini calculator for the Yamaguchi formula
  const [calcU, setCalcU] = useState<number>(0.05); // MSG g/dL
  const [calcV, setCalcV] = useState<number>(0.02); // IMP g/dL

  // Glossary state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTermId, setExpandedTermId] = useState<string | null>('nucleotide_synergy');
  const [activeModalTerm, setActiveModalTerm] = useState<GlossaryTerm | null>(null);

  const gamma = 1218;
  const calcY = calcU + (gamma * calcU * calcV);
  const calcMultiplier = calcU > 0 ? (calcY / calcU).toFixed(1) : '1.0';

  const activeSection = SCIENCE_DATA.find(s => s.id === activeSectionId) || SCIENCE_DATA[0];

  // Filter glossary terms
  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.latinOrAlias && item.latinOrAlias.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deepExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-2">
              <Atom className="w-4 h-4" />
              <span>НАУЧНО-ДОКАЗАТЕЛЬНАЯ БАЗА</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Наука об Умами & Молекулярный Синергизм
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Физиология восприятия, аллостерические рецепторы T1R1/T1R3, интерактивный глоссарий и исследования Yamaguchi & Ninomiya (2000).
            </p>
          </div>

          {/* Primary View Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'papers'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Статьи & Формулы</span>
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'glossary'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Интерактивный Глоссарий ({GLOSSARY_TERMS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('nucleotides')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'nucleotides'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Dna className="w-3.5 h-3.5 text-cyan-400" />
              <span>Нуклеотиды (IMP/GMP/AMP)</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-6 animate-fade-in">
          {/* Glossary Search & Filter Controls */}
          <div className="bg-[#10151E] border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск термина (синергия нуклеотидов, порог восприятия, IMP, глутамат, Gouqian...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'Все термины' },
                  { id: 'synergy_physiology', label: 'Синергия & Физиология' },
                  { id: 'nucleotides', label: 'Нуклеотиды & Молекулы' },
                  { id: 'glutamate', label: 'Глутамат & Концентрации' },
                  { id: 'culinary_physics', label: 'Кулинарная физика' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick-Jump Chips for Mandatory Terms */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                Ключевые темы:
              </span>
              {[
                { id: 'nucleotide_synergy', label: '⚡ Синергия нуклеотидов' },
                { id: 'glutamate_levels', label: '🧪 Уровни глутамата' },
                { id: 'umami_perception_threshold', label: '🎯 Порог восприятия умами' },
                { id: 'imp_nucleotide', label: '🥩 IMP (Инозинат)' },
                { id: 'gmp_nucleotide', label: '🍄 GMP (Гуанилат)' },
                { id: 'amp_nucleotide', label: '🦪 AMP (Аденилат)' },
                { id: 'disodium_ribonucleotides', label: '✨ I+G (Ribotide)' }
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    setExpandedTermId(chip.id);
                    const el = document.getElementById(`term-${chip.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/60 hover:border-rose-500/60 text-zinc-300 hover:text-white text-[11px] transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terms Grid / List */}
          <div className="space-y-4">
            {filteredTerms.length === 0 ? (
              <div className="p-12 text-center bg-[#10151E] border border-zinc-800 rounded-2xl">
                <HelpCircle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                <h4 className="text-white font-bold text-sm">Термины не найдены</h4>
                <p className="text-zinc-500 text-xs mt-1">Попробуйте изменить поисковый запрос или сбросить категорию.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-3 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-xl"
                >
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              filteredTerms.map(term => {
                const isExpanded = expandedTermId === term.id;
                return (
                  <div
                    key={term.id}
                    id={`term-${term.id}`}
                    className={`bg-[#10151E] border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isExpanded 
                        ? 'border-rose-500/60 shadow-xl ring-1 ring-rose-500/20' 
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Term Header Row */}
                    <div
                      onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                      className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none bg-gradient-to-r from-zinc-950/40 via-transparent to-zinc-950/40 hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-rose-300">
                            {term.term}
                          </h3>
                          {term.latinOrAlias && (
                            <span className="text-xs font-mono text-zinc-400">
                              / {term.latinOrAlias}
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-rose-300 border border-zinc-700">
                            {term.categoryLabel}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                          {term.shortDefinition}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 pt-1 sm:pt-0">
                        {term.formulaOrCode && (
                          <span className="hidden md:inline-block text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/60 px-2.5 py-1 rounded-lg">
                            {term.formulaOrCode}
                          </span>
                        )}
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
                          title={isExpanded ? 'Свернуть' : 'Развернуть подробное описание'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Term Expanded Deep-Dive Details */}
                    {isExpanded && (
                      <div className="p-5 pt-0 border-t border-zinc-800/80 space-y-5 text-xs bg-zinc-950/50">
                        {/* 1. Deep Explanation & Mechanism */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                            <div className="flex items-center space-x-2 text-white font-bold text-xs">
                              <BookOpen className="w-4 h-4 text-rose-400" />
                              <span>Подробное теоретическое описание</span>
                            </div>
                            <p className="text-zinc-300 leading-relaxed">
                              {term.deepExplanation}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                            <div className="flex items-center space-x-2 text-white font-bold text-xs">
                              <Atom className="w-4 h-4 text-cyan-400" />
                              <span>Биохимический механизм & Рецепторы</span>
                            </div>
                            <p className="text-zinc-300 leading-relaxed">
                              {term.biochemicalMechanism}
                            </p>
                          </div>
                        </div>

                        {/* 2. Thresholds and Empirical Values */}
                        {term.thresholdOrKeyValues.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-xs font-bold text-white">
                              <Scale className="w-4 h-4 text-amber-400" />
                              <span>Ключевые величины, пороговые значения & Константы</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                              {term.thresholdOrKeyValues.map((v, vIdx) => (
                                <div key={vIdx} className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/90 space-y-1">
                                  <div className="text-[11px] text-zinc-400 font-medium">{v.label}</div>
                                  <div className="font-mono text-xs font-bold text-amber-300">{v.value}</div>
                                  <div className="text-[10px] text-zinc-500 leading-tight">{v.interpretation}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Culinary Sources & Natural Occurrence */}
                        {term.culinarySources.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-xs font-bold text-white">
                              <Flame className="w-4 h-4 text-rose-400" />
                              <span>Природные концентрации в продуктах & Соусах</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {term.culinarySources.map((src, sIdx) => (
                                <div key={sIdx} className="p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800 text-[11px] flex flex-col justify-between">
                                  <div className="font-semibold text-zinc-200">{src.name}</div>
                                  <div className="font-mono text-rose-400 font-bold my-0.5">{src.concentration}</div>
                                  <div className="text-[10px] text-zinc-500">{src.note}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. Practical Culinary Chef's Application */}
                        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/40 flex items-start gap-2.5">
                          <ChefHat className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-bold text-rose-300 text-xs">Практическое применение в соусах и для белков (сейтан/доупи/фучжу):</span>
                            <p className="text-zinc-300 text-[11px] leading-relaxed">
                              {term.practicalApplication}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-mono text-zinc-500">Теги:</span>
                          {term.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: NUCLEOTIDES DEEP DIVE MATRIX */}
      {activeTab === 'nucleotides' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#10151E] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
                  <Dna className="w-4 h-4" />
                  <span>МОЛЕКУЛЯРНЫЕ ОПИСАНИЯ & АФФИННОСТЬ</span>
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  Сравнительный анализ 5'-рибонуклеотидов: IMP, GMP, AMP, I+G
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800 px-3 py-1 rounded-xl self-start">
                Аллостерический фактор связывания T1R1
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              $5'$-рибонуклеотиды представляют собой пуриновые соединения с эфирной связью фосфата в положении $5'$ рибозного кольца. Только $5'$-изомеры обладают вкусовым синергетическим эффектом (в отличие от биологически неактивных $2'$ или $3'$-нуклеотидов).
            </p>

            {/* Matrix Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IMP Card */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      E630 / E631 • Инозинат
                    </span>
                    <h4 className="font-display font-bold text-base text-white mt-1">
                      IMP (Инозин-5'-монофосфат)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400">1.0×</span>
                    <div className="text-[10px] text-zinc-500 font-mono">Базовый фактор</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div><strong className="text-white">Происхождение:</strong> Мышечные ткани, деградация АТФ после забоя (мясо, птица, тунец кацуобуси).</div>
                  <div><strong className="text-white">Вкусовой профиль:</strong> Глубокий, плотный, «мясной» базовый умами с длительным послевкусием.</div>
                  <div><strong className="text-white">Химическая формула:</strong> <code className="text-amber-300 font-mono">C10H13N4O8P</code> (348.2 г/моль).</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-200 block mb-1">Ключевые источники:</span>
                  Кацуобуси (600–1000 мг/100г), свежий тунец (286 мг), куриный бульон (201 мг), свинина (200 мг).
                </div>
              </div>

              {/* GMP Card */}
              <div className="bg-zinc-950/80 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg ring-1 ring-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      E626 / E627 • Супер-синергист
                    </span>
                    <h4 className="font-display font-bold text-base text-white mt-1">
                      GMP (Гуанозин-5'-монофосфат)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400">2.3×</span>
                    <div className="text-[10px] text-zinc-500 font-mono">Аффинность к T1R1</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div><strong className="text-white">Происхождение:</strong> Грибы (сушеные шиитаке, сморчки, белые грибы), ферментативный распад РНК.</div>
                  <div><strong className="text-white">Вкусовой профиль:</strong> Землистый, взрывной, лесной умами. Сильнейший природный усилитель вкуса.</div>
                  <div><strong className="text-white">Химическая формула:</strong> <code className="text-amber-300 font-mono">C10H14N5O8P</code> (363.2 г/моль).</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-200 block mb-1">Ключевые источники:</span>
                  Сушеные шиитаке (150–400 мг/100г), сморчки сушеные (40–90 мг), белые грибы порчини (10–30 мг).
                </div>
              </div>

              {/* AMP Card */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      E634 • Морской профиль
                    </span>
                    <h4 className="font-display font-bold text-base text-white mt-1">
                      AMP (Аденозин-5'-монофосфат)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400">0.8×</span>
                    <div className="text-[10px] text-zinc-500 font-mono">Мягкое сродство</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div><strong className="text-white">Происхождение:</strong> Моллюски, ракообразные, устричный экстракт, водоросли, томаты.</div>
                  <div><strong className="text-white">Вкусовой профиль:</strong> Сладковато-округлый, морской, маскирует горечь и сглаживает остроту.</div>
                  <div><strong className="text-white">Химическая формула:</strong> <code className="text-amber-300 font-mono">C10H14N5O7P</code> (347.2 г/моль).</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-200 block mb-1">Ключевые источники:</span>
                  Сушеные морские гребешки Ganbei (172–320 мг), кальмары (184 мг), устричный соус (60–140 мг).
                </div>
              </div>

              {/* I+G Card */}
              <div className="bg-zinc-950/80 border border-rose-500/40 rounded-2xl p-5 space-y-4 hover:border-rose-500/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                      E635 • Риботид (Ribotide)
                    </span>
                    <h4 className="font-display font-bold text-base text-white mt-1">
                      I+G (50% IMP + 50% GMP)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-rose-400">1.65×</span>
                    <div className="text-[10px] text-zinc-500 font-mono">Средневзвешенное</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div><strong className="text-white">Происхождение:</strong> Промышленный биотехнологический сплав для ресторанных бустеров.</div>
                  <div><strong className="text-white">Вкусовой профиль:</strong> Мгновенный взрыв умами, дает 4–8× кратное усиление при дозировке всего 1–2%.</div>
                  <div><strong className="text-white">Основа продукта:</strong> Китайский Цзицзин (鸡精), японский риботид, суповые основы рамэнов.</div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] text-zinc-400">
                  <span className="font-bold text-zinc-200 block mb-1">Рекомендуемая доза в Wanzhi:</span>
                  0.02 – 0.05% от массы соуса (1/4 ч. л. на миску соуса).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CLASSIC PAPERS & SIMULATOR */}
      {activeTab === 'papers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-paper selector buttons */}
          <div className="flex items-center space-x-2">
            {SCIENCE_DATA.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeSectionId === sec.id
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {sec.id === 'yamaguchi_2000' ? 'Yamaguchi & Ninomiya (2000)' : 'Chinese Cooking Demystified'}
              </button>
            ))}
          </div>

          {/* Interactive Synergism Simulator Widget */}
          <div className="bg-gradient-to-br from-zinc-900 via-[#111722] to-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-semibold text-sm text-white">
                  ИНТЕРАКТИВНЫЙ КАЛЬКУЛЯТОР ФОРМУЛЫ ЯМАГУЧИ
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400/90 font-bold">
                y = u + 1218 · u · v
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Slider U */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Глутамат (u, MSG):</span>
                  <span className="font-mono font-bold text-rose-400">{calcU.toFixed(3)} г/дл</span>
                </div>
                <input
                  type="range"
                  min="0.001"
                  max="0.2"
                  step="0.005"
                  value={calcU}
                  onChange={(e) => setCalcU(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-zinc-500 block">Соевый соус, паста, томаты, чистый глутамат</span>
              </div>

              {/* Slider V */}
              <div className="space-y-1.5 bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Нуклеотиды (v, IMP/GMP):</span>
                  <span className="font-mono font-bold text-amber-400">{calcV.toFixed(3)} г/дл</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.05"
                  step="0.002"
                  value={calcV}
                  onChange={(e) => setCalcV(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-zinc-500 block">Цзицзин, куриный порошок, сушеные шиитаке</span>
              </div>

              {/* Result Output */}
              <div className="bg-rose-950/20 border border-rose-500/40 p-3 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400">Эффективное восприятие:</span>
                <div className="flex items-baseline space-x-2 my-1">
                  <span className="text-2xl font-bold font-mono text-rose-300">
                    {calcY.toFixed(3)} г/дл
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ({calcMultiplier}×)
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400">
                  Эквивалентная сила вкуса относительно одного лишь MSG
                </span>
              </div>
            </div>
          </div>

          {/* Main Section Content */}
          <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <span className="text-xs font-mono text-rose-400">{activeSection.source}</span>
              <h3 className="font-display text-xl font-bold text-white mt-1">
                {activeSection.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">Автор: {activeSection.author}</p>

              <div className="mt-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                "{activeSection.abstract}"
              </div>
            </div>

            {/* Core Concepts */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-sm text-white">
                Ключевые научные принципы:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeSection.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white">{concept.term}</span>
                      {concept.formula && (
                        <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/30 border border-amber-800/60">
                          {concept.formula}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{concept.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Tables from Paper */}
            {activeSection.tables.map((table, tIdx) => (
              <div key={tIdx} className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
                  <Table className="w-4 h-4 text-rose-400" />
                  <span>{table.title}</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800 text-[11px]">
                      <tr>
                        {table.headers.map((h, hIdx) => (
                          <th key={hIdx} className="px-4 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-300">
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-zinc-900/40 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`px-4 py-2.5 ${cIdx === 0 ? 'text-zinc-400 font-sans' : cIdx === 2 ? 'text-rose-400 font-bold' : ''}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Comprehensive Formula Decoder Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h4 className="font-display font-bold text-base text-white">
                  Полный справочник математических формул и расшифровка всех переменных
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-4 text-xs">
                {/* 1. Yamaguchi Formula */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="font-bold text-sm text-amber-300">
                      1. Уравнение синергизма умами Ямагучи (Yamaguchi Synergism Equation)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400 font-bold">
                      y = u + 1218 · u · v
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Описывает нелинейное сверхэкспоненциальное возрастание воспринимаемой интенсивности вкуса при одновременном связывании L-глутамата и 5'-рибонуклеотидов с аллостерическим рецептором языка T1R1/T1R3.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                    <div className="space-y-1.5 text-zinc-300">
                      <div><span className="text-rose-400 font-bold">u</span> — концентрация свободного L-глутамата (MSG) в <span className="text-white">г/дл</span> (1 дл = 100 мл = 100 г воды).</div>
                      <div><span className="text-amber-400 font-bold">v</span> — эффективная концентрация 5'-рибонуклеотидов в <span className="text-white">г/дл</span> с учетом констант сродства: <code className="text-amber-300">v = (IMP + 2.3·GMP + 0.8·AMP) / (1000 · V_dl)</code>.</div>
                    </div>
                    <div className="space-y-1.5 text-zinc-300">
                      <div><span className="text-cyan-400 font-bold">γ = 1218</span> — фундаментальный эмпирический коэффициент синергии, выведенный в Токийском университете.</div>
                      <div><span className="text-emerald-400 font-bold">y</span> — эквивалентная воспринимаемая концентрация чистого глутамата натрия в <span className="text-white">г/дл</span>.</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-zinc-950/40 p-2 rounded border border-zinc-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Мультипликатор усиления:</strong> <code className="text-amber-300">Multi = y / u</code>. Показывает, во сколько раз смесь превосходит моноглутамат (обычно от 3× до 16×).</span>
                  </div>
                </div>

                {/* 2. Logarithmic Sensory Score */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-rose-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="font-bold text-sm text-rose-300">
                      2. Шкала сенсорной интенсивности Вебера-Фехнера (0 - 10)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400 font-bold">
                      Score = min(10, log10(1 + 25 · y) · 5.2)
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Человеческий мозг воспринимает интенсивность вкуса логарифмически, а не линейно. При превышении концентрации 0.8-1.0 г/дл наступает насыщение вкусовых почек.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px] bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                    <div className="text-zinc-400"><span className="text-white font-bold">0.0 - 3.0</span>: Легкий фон (супы, пресные бульоны).</div>
                    <div className="text-emerald-400"><span className="font-bold">4.0 - 7.5</span>: Идеальный баланс ресторанного вок-соуса.</div>
                    <div className="text-amber-400"><span className="font-bold">8.0 - 10.0</span>: Концентрированная глазурь (Dip / Glaze).</div>
                  </div>
                </div>

                {/* 3. Aftertaste Dynamics */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-cyan-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="font-bold text-sm text-cyan-300">
                      3. Кинетика послевкусия и период полувыведения (Yamaguchi & Kobori, 1993)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 font-bold">
                      I(t) = I0 · e^(-k · (t - 20)), k = 0.011 / (1 + 0.15·(Multi - 1))
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Показывает, почему умами сохраняется на корне языка до 180-240 секунд после проглатывания (в 4-6 раз дольше, чем соль NaCl или винная кислота). Синергетический комплекс блокирует диссоциацию молекул от рецептора.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                    <div><span className="text-cyan-400 font-bold">T1/2 (Полураспад):</span> время снижения интенсивности вкуса вдвое (~45-180 секунд).</div>
                    <div><span className="text-cyan-400 font-bold">NaCl замещение:</span> <code className="text-cyan-300">-%NaCl = min(38%, Score · 3.8%)</code> — снижение соли без потери привлекательности.</div>
                  </div>
                </div>

                {/* 4. Gouqian Viscosity */}
                <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                    <span className="font-bold text-sm text-emerald-300">
                      4. Клейстеризация крахмала и вязкость (Gouqian 勾芡)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold">
                      Starch% = (m_starch / V_sauce) · 100%
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    Расчет удержания соуса на пористой структуре белка (сейтана, доупи, фучжу) при нагреве до 65°C:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] bg-zinc-950/70 p-3 rounded-lg border border-zinc-800 text-center">
                    <div className="p-1 rounded bg-zinc-900"><span className="text-zinc-400">&lt; 0.8%</span><br /><span className="text-white text-[10px]">Бульон (Liquid)</span></div>
                    <div className="p-1 rounded bg-zinc-900"><span className="text-emerald-400">0.8 - 2.2%</span><br /><span className="text-white text-[10px]">Шелк (Coating)</span></div>
                    <div className="p-1 rounded bg-zinc-900"><span className="text-amber-400">2.2 - 3.8%</span><br /><span className="text-white text-[10px]">Глазурь (Glaze)</span></div>
                    <div className="p-1 rounded bg-zinc-900"><span className="text-rose-400">&ge; 3.8%</span><br /><span className="text-white text-[10px]">Плотный (Clinging)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conclusions */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="font-display font-bold text-xs text-white">Выводы и практическое применение:</h4>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                {activeSection.conclusions.map((conc, cIdx) => (
                  <li key={cIdx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{conc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

