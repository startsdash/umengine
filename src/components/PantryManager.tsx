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
  Layers,
  Pencil,
  Plus,
  Trash2
} from 'lucide-react';

interface PantryManagerProps {
  pantryList: PantryIngredient[];
  onTogglePantryItem: (id: string) => void;
  onSaveCustomIngredient: (ing: PantryIngredient) => void;
  onDeleteCustomIngredient: (id: string) => void;
}

export const PantryManager: React.FC<PantryManagerProps> = ({
  pantryList,
  onTogglePantryItem,
  onSaveCustomIngredient,
  onDeleteCustomIngredient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItemDetail, setSelectedItemDetail] = useState<PantryIngredient | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm({
      id: 'custom_' + Date.now().toString(36),
      name: '', chineseName: '', category: 'sauces', defaultUnit: 'ml', density: 1.0,
      freeGlutamate: 0, imp: 0, gmp: 0, amp: 0,
      sodiumPercent: 0, sugarPercent: 0, acidityScore: 0, pungencyScore: 0, numbingScore: 0,
      gelatinStarchYield: 0, aromaTags: '', inPantry: true,
      description: '', scientificNotes: '', culinaryRole: '', dataSource: ''
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const openEdit = (item: PantryIngredient) => {
    setEditingId(item.id);
    setForm({ ...item, aromaTags: (item.aromaTags || []).join(', ') });
    setFormError(null);
    setEditorOpen(true);
  };

  const setF = (patch: any) => setForm((prev: any) => ({ ...prev, ...patch }));

  const saveForm = () => {
    if (!String(form.name || '').trim()) {
      setFormError('Название обязательно');
      return;
    }
    const num = (v: any) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? n : 0; };
    const ing: PantryIngredient = {
      id: String(editingId || form.id || 'custom_' + Date.now().toString(36)),
      name: String(form.name).trim(),
      chineseName: String(form.chineseName || ''),
      category: form.category || 'sauces',
      description: String(form.description || ''),
      defaultUnit: form.defaultUnit || 'ml',
      density: Number(form.density) || 1.0,
      freeGlutamate: Number(form.freeGlutamate) || 0,
      imp: Number(form.imp) || 0,
      gmp: Number(form.gmp) || 0,
      amp: Number(form.amp) || 0,
      sodiumPercent: Number(form.sodiumPercent) || 0,
      sugarPercent: Number(form.sugarPercent) || 0,
      acidityScore: Number(form.acidityScore) || 0,
      pungencyScore: Number(form.pungencyScore) || 0,
      numbingScore: Number(form.numbingScore) || 0,
      gelatinStarchYield: Number(form.gelatinStarchYield) || 0,
      aromaTags: String(form.aromaTags || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      inPantry: form.inPantry !== false,
      scientificNotes: String(form.scientificNotes || ''),
      culinaryRole: String(form.culinaryRole || ''),
      dataSource: String(form.dataSource || ''),
      custom: true
    };
    onSaveCustomIngredient(ing);
    setEditorOpen(false);
  };

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

      <div className="flex justify-end mb-1">
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              id: 'custom_' + Date.now().toString(36), name: '', chineseName: '', category: 'sauces',
              defaultUnit: 'ml', density: 1.0, freeGlutamate: 0, imp: 0, gmp: 0, amp: 0,
              sodiumPercent: 0, sugarPercent: 0, acidityScore: 0, pungencyScore: 0, numbingScore: 0,
              gelatinStarchYield: 0, aromaTags: '', inPantry: true,
              description: '', scientificNotes: '', culinaryRole: '', dataSource: ''
            });
            setFormError(null);
            setEditorOpen(true);
          }}
          className="px-3 py-1.5 rounded-lg bg-rose-600/15 border border-rose-500/30 text-rose-300 text-[11px] font-medium hover:bg-rose-600/25 transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить / Править ингредиент</span>
        </button>
      </div>

      {/* Ingredient Editor */}
      {editorOpen && (
        <div className="rounded-xl bg-white/[0.03] border border-rose-500/25 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
              {editingId ? `Правка: ${form.name || form.id}` : 'Новый ингредиент кладовой'}
            </span>
            <div className="flex items-center space-x-2">
              {editingId && editingId.startsWith('custom_') && (
                <button
                  onClick={() => { if (editingId) { onDeleteCustomIngredient(editingId); setEditorOpen(false); } }}
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] hover:bg-red-500/20 transition-all flex items-center space-x-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Удалить</span>
                </button>
              )}
              <button onClick={() => setEditorOpen(false)} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 text-[11px] hover:text-white transition-all">Отмена</button>
            </div>
          </div>

          {formError && <div className="text-[11px] text-red-400 font-mono">{formError}</div>}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Field label="Название *" value={form.name} onChange={(v: string) => setF({ name: v })} />
            <Field label="Китайское название" value={form.chineseName} onChange={(v: string) => setF({ chineseName: v })} />
            <Select label="Категория" value={form.category} onChange={(v: string) => setF({ category: v })}
              options={[['sauces','Соусы'],['boosters','Бустеры'],['dry','Специи'],['soy_seitan','Соя/Сейтан'],['aromatics','Ароматика'],['produce','Овощи']]} />
            <Select label="Ед. по умолчанию" value={form.defaultUnit} onChange={(v: string) => setF({ defaultUnit: v })}
              options={[['ml','ml'],['g','g'],['tsp','tsp'],['tbsp','tbsp'],['cloves','cloves'],['pcs','pcs']]} />
            <Field label="Плотность (г/мл)" type="number" value={form.density} onChange={(v: string) => setF({ density: v })} />
            <Field label="L-Глутамат, мг/100г" type="number" value={form.freeGlutamate} onChange={(v: string) => setF({ freeGlutamate: v })} />
            <Field label="IMP, мг/100г" type="number" value={form.imp} onChange={(v: string) => setF({ imp: v })} />
            <Field label="GMP, мг/100г" type="number" value={form.gmp} onChange={(v: string) => setForm({ ...form, gmp: v })} />
            <Field label="AMP, мг/100г" type="number" value={form.amp} onChange={(v: string) => setForm({ amp: v })} />
            <Field label="Соль, %" type="number" value={form.sodiumPercent} onChange={(v: string) => setForm({ sodiumPercent: v })} />
            <Field label="Сахара, %" type="number" value={form.sugarPercent} onChange={(v: string) => setForm({ sugarPercent: v })} />
            <Field label="Кислотность 0-10" type="number" value={form.acidityScore} onChange={(v: string) => setForm({ acidityScore: v })} />
            <Field label="Острота 0-10" type="number" value={form.pungencyScore} onChange={(v: string) => setF({ pungencyScore: v })} />
            <Field label="Ма (онемение) 0-10" type="number" value={form.numbingScore} onChange={(v: string) => setF({ numbingScore: v })} />
            <Field label="Клейстеризация %" type="number" value={form.gelatinStarchYield} onChange={(v: string) => setForm({ gelatinStarchYield: v })} />
            <Field label="Аромат-теги (через ,)" value={form.aromaTags} onChange={(v: string) => setF({ aromaTags: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Field label="Описание" value={form.description} onChange={(v: string) => setF({ description: v })} />
            <Field label="Источник данных" value={form.dataSource} onChange={(v: string) => setF({ dataSource: v })} placeholder="напр. Yamaguchi 2000 Table 1" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-zinc-300">
              <input type="checkbox" checked={form.inPantry !== false} onChange={e => setF({ inPantry: e.target.checked })} className="accent-rose-500" />
              <span>В наличии</span>
            </label>
            <button onClick={saveForm} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all">
              Сохранить в БД
            </button>
          </div>
          {editingId && editingId.startsWith('custom_') && (
            <button
              onClick={() => { onDeleteCustomIngredient(editingId); setEditorOpen(false); }}
              className="text-[11px] text-red-400 hover:text-red-300 underline underline-offset-2 flex items-center space-x-1"
            >
              <Trash2 className="w-3 h-3" /> Удалить этот кастомный ингредиент навсегда
            </button>
          )}
        </div>
      )}

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
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                    className="w-5 h-5 rounded-md flex items-center justify-center bg-white/[0.04] text-zinc-400 border border-white/[0.08] hover:text-rose-300 transition-colors"
                    title="Править значения"
                  >
                    <Pencil className="w-3 h-3" />
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

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1 bg-black/40 border border-white/[0.08] focus:border-rose-500/60 rounded-md text-[11px] text-white placeholder-zinc-600 focus:outline-none transition-colors"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][];
}) {
  return (
    <div>
      <label className="text-[10px] font-mono text-zinc-500 block mb-0.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 bg-black/40 border border-white/[0.08] focus:border-rose-500/60 rounded-md text-[11px] text-white focus:outline-none transition-colors"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-[#0E1015]">{l}</option>
        ))}
      </select>
    </div>
  );
}
