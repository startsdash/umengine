import React, { useEffect, useMemo, useState } from 'react';
import { PantryIngredient, RecipeIngredient, SauceArchetype, TasteProfile } from '../types';
import { SAUCE_PRESETS } from '../data/presets';
import { calculateTasteProfile } from '../utils/umamiCalculator';
import { NotebookPen, GitCompare, History, Loader2, Trash2, ArrowRightLeft, Star } from 'lucide-react';

interface TasteJournalProps {
  pantryList: PantryIngredient[];
  customSauces: (SauceArchetype & { createdAt?: string; updatedAt?: string; tasteProfile?: any })[];
  currentProfile: TasteProfile;
  currentIngredients: RecipeIngredient[];
  currentTitle: string;
  selectedProtein: string;
  onApplyRecipe: (ingredients: RecipeIngredient[], title: string) => void;
}

interface NoteItem {
  id: string;
  sauceId?: string;
  sauceTitle?: string;
  protein?: string;
  portions?: number;
  notes?: string;
  ratings?: Record<string, number>;
  tasteProfile?: any;
  createdAt?: string;
}

interface VersionItem {
  id: string;
  sauceId: string;
  version: number;
  title?: string;
  payload: { title?: string; ingredients?: RecipeIngredient[]; steps?: any[]; tasteProfile?: any; savedAt?: string };
  createdAt?: string;
}

type CompareItem = { key: string; label: string; ingredients: RecipeIngredient[] };

const AXES = [
  { key: 'umami', label: 'Умами', get: (p: TasteProfile) => p.umamiIntensityScore, max: 10 },
  { key: 'salt', label: 'Соль', get: (p: TasteProfile) => Math.min(10, p.salinityPercent * 2), max: 10 },
  { key: 'acid', label: 'Кислота', get: (p: TasteProfile) => p.acidityIndex, max: 10 },
  { key: 'heat', label: 'Острота', get: (p: TasteProfile) => p.heatIndex, max: 10 },
  { key: 'ma', label: 'Ма', get: (p: TasteProfile) => p.numbingIndex, max: 10 },
  { key: 'visc', label: 'Вязкость', get: (p: TasteProfile) => p.viscosityScore, max: 10 }
];

function polar(cx: number, cy: number, r: number, angle: number) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function OverlayRadar({ profileA, profileB, labelA, labelB }: {
  profileA: TasteProfile; profileB: TasteProfile; labelA: string; labelB: string;
}) {
  const size = 300, cx = size / 2, cy = size / 2, R = 110;
  const n = AXES.length;

  const points = (p: TasteProfile) => AXES.map((ax, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const v = Math.max(0, Math.min(1, ax.get(p) / ax.max));
    const [x, y] = polar(cx, cy, R * v, angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const gridRings = [0.25, 0.5, 0.75, 1.0].map(f =>
    AXES.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const [x, y] = polar(cx, cy, R * f, angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ')
  );

  const axisLabels = AXES.map((ax, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const [x, y] = polar(cx, cy, R + 18, angle);
    return { x, y, label: ax.label };
  });

  return (
    <svg width={size} height={size} className="mx-auto">
      {gridRings.map((ring, i) => (
        <polygon key={i} points={ring} fill="none" stroke="#3f3f46" strokeWidth="0.5" />
      ))}
      {AXES.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const [x, y] = polar(cx, cy, R, angle);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#3f3f46" strokeWidth="0.5" />;
      })}
      <polygon points={points(profileB)} fill="rgba(59,130,246,0.18)" stroke="#60a5fa" strokeWidth="1.5" />
      <polygon points={points(profileA)} fill="rgba(244,63,94,0.20)" stroke="#fb7185" strokeWidth="1.5" />
      {axisLabels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#a1a1aa" fontFamily="monospace">
          {l.label}
        </text>
      ))}
      <text x={cx} y={size - 8} textAnchor="middle" fontSize="9" fontFamily="monospace">
        <tspan fill="#fb7185">■ {labelA.slice(0, 22)}</tspan>
        <tspan fill="#60a5fa" dx="10">■ {labelB.slice(0, 22)}</tspan>
      </text>
    </svg>
  );
}

export const TasteJournal: React.FC<TasteJournalProps> = ({
  pantryList,
  customSauces,
  currentProfile,
  currentIngredients,
  currentTitle,
  selectedProtein,
  onApplyRecipe
}) => {
  const [section, setSection] = useState<'compare' | 'notes' | 'versions'>('compare');

  // ===== Compare =====
  const compareOptions: CompareItem[] = useMemo(() => {
    const items: CompareItem[] = [
      { key: '__current__', label: '◆ ' + (currentTitle || 'Текущий соус'), ingredients: currentIngredients }
    ];
    for (const s of customSauces) items.push({ key: 'db_' + s.id, label: s.title, ingredients: s.ingredients || [] });
    for (const p of SAUCE_PRESETS) items.push({ key: 'preset_' + p.id, label: p.title.split('(')[0].trim(), ingredients: p.ingredients });
    return items;
  }, [customSauces, currentIngredients, currentTitle]);

  const [keyA, setKeyA] = useState('__current__');
  const [keyB, setKeyB] = useState('__current__');

  const profileCache = useMemo(() => {
    const m = new Map<string, TasteProfile>();
    for (const it of compareOptions) {
      m.set(it.key, calculateTasteProfile(it.ingredients, pantryList, 2));
    }
    return m;
  }, [compareOptions, pantryList]);

  const profileA = profileCache.get(keyA) || currentProfile;
  const profileB = profileCache.get(keyB) || currentProfile;
  const labelA = compareOptions.find(o => o.key === keyA)?.label || 'A';
  const labelB = compareOptions.find(o => o.key === keyB)?.label || 'B';

  // ===== Notes =====
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteSauce, setNoteSauce] = useState('__current__');
  const [noteRatings, setNoteRatings] = useState<Record<string, number>>({ umami: 5, salt: 5, sour: 0, heat: 0, viscosity: 5 });
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const res = await fetch('/api/db/notes');
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data.notes) ? data.notes : []);
      }
    } catch (e) {
      console.warn('Notes load failed:', e);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => { loadNotes(); }, []);

  const saveNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      const opt = compareOptions.find(o => o.key === noteSauce);
      const res = await fetch('/api/db/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sauceId: noteSauce === '__current__' ? null : noteSauce.replace(/^db_/, ''),
          sauceTitle: opt?.label || currentTitle,
          protein: selectedProtein,
          portions: 2,
          notes: noteText,
          ratings: noteRatings,
          tasteProfile: profileCache.get(noteSauce) || currentProfile
        })
      });
      if (res.ok) {
        setNoteText('');
        await loadNotes();
      }
    } finally {
      setNoteSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/db/notes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // ===== Versions =====
  const dbSauces = customSauces;
  const [verSauceId, setVerSauceId] = useState<string>('');
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [verLoading, setVerLoading] = useState(false);

  const loadVersions = async (sauceId: string) => {
    if (!sauceId) { setVersions([]); return; }
    setVerLoading(true);
    try {
      const res = await fetch(`/api/db/versions?sauceId=${encodeURIComponent(sauceId)}`);
      if (res.ok) {
        const data = await res.json();
        setVersions(Array.isArray(data.versions) ? data.versions : []);
      }
    } finally {
      setVerLoading(false);
    }
  };

  const fmtDate = (d?: string) => d ? new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <NotebookPen className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">Дневник Повара</h2>
          <p className="text-xs text-zinc-400 font-mono">Дегустации · сравнение профилей · история версий соусов</p>
        </div>
      </div>

      <div className="flex space-x-1.5">
        {([['compare', 'Сравнение', <GitCompare className="w-3.5 h-3.5" />], ['notes', 'Дегустации', <Star className="w-3.5 h-3.5" />], ['versions', 'Версии', <History className="w-3.5 h-3.5" />]] as const).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setSection(id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
              section === id ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/[0.03] border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {icon}<span>{label}</span>
          </button>
        ))}
      </div>

      {/* ===== COMPARE ===== */}
      {section === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div>
              <div className="text-[11px] font-mono text-rose-400 mb-1">Соус A</div>
              <select value={keyA} onChange={e => setKeyA(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] focus:border-rose-500/60 rounded-lg text-xs text-white focus:outline-none">
                {compareOptions.map(o => <option key={o.key} value={o.key} className="bg-[#0E1015]">{o.label}</option>)}
              </select>
            </div>
            <div>
              <div className="text-[11px] font-mono text-sky-400 mb-1">Соус B</div>
              <select value={keyB} onChange={e => setKeyB(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] focus:border-sky-500/60 rounded-lg text-xs text-white focus:outline-none">
                {compareOptions.map(o => <option key={o.key} value={o.key} className="bg-[#0E1015]">{o.label}</option>)}
              </select>
            </div>
            <OverlayRadar profileA={profileA} profileB={profileB} labelA={labelA} labelB={labelB} />
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-2">
            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">Числовые дельты (A → B)</div>
            {AXES.map(ax => {
              const va = ax.get(profileA), vb = ax.get(profileB);
              const d = vb - va;
              return (
                <div key={ax.key} className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-800/50 last:border-0">
                  <span className="text-zinc-300">{ax.label}</span>
                  <span className="font-mono text-zinc-500">
                    {va.toFixed(1)} → {vb.toFixed(1)}
                    <span className={`ml-2 font-semibold ${Math.abs(d) < 0.15 ? 'text-zinc-500' : d > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {d >= 0 ? '+' : ''}{d.toFixed(1)}
                    </span>
                  </span>
                </div>
              );
            })}
            <div className="text-[10px] text-zinc-600 font-mono pt-2">
              Синергия: {profileA.synergyMultiplier}x → {profileB.synergyMultiplier}x · Экв. MSG: {profileA.equivalentMsgConcentrationGPerDl} → {profileB.equivalentMsgConcentrationGPerDl} г/дл
            </div>
          </div>
        </div>
      )}

      {/* ===== NOTES ===== */}
      {section === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">Новая дегустация</div>
            <div>
              <label className="text-[10px] font-mono text-zinc-500 block mb-1">Соус</label>
              <select value={noteSauce} onChange={e => setNoteSauce(e.target.value)} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none">
                {compareOptions.map(o => <option key={o.key} value={o.key} className="bg-[#0E1015]">{o.label}</option>)}
              </select>
            </div>
            {(['umami', 'salt', 'sour', 'heat', 'viscosity'] as const).map(k => (
              <div key={k}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-zinc-300 capitalize">{k === 'umami' ? 'Умами как в жизни' : k === 'salt' ? 'Соленость' : k === 'sour' ? 'Кислотность' : k === 'heat' ? 'Острота' : 'Вязкость/тело'}</span>
                  <span className="text-xs font-mono text-emerald-300">{noteRatings[k]}/10</span>
                </div>
                <input type="range" min={0} max={10} step={0.5} value={noteRatings[k]}
                  onChange={e => setNoteRatings(prev => ({ ...prev, [k]: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 accent-emerald-400 cursor-pointer" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-mono text-zinc-500 block mb-1">Заметки: что почувствовал, что изменить</label>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4}
                placeholder="Например: умами в правду взрывное, но соль чуть выше цели — в след. раз минус 2 мл светлого..."
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] focus:border-emerald-500/60 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none resize-none" />
            </div>
            <button onClick={saveNote} disabled={noteSaving || !noteText.trim()}
              className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/[0.04] disabled:text-zinc-600 text-white text-xs font-medium transition-all flex items-center justify-center space-x-2">
              {noteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
              <span>Записать в дневник (со снапшотом профиля)</span>
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {notesLoading && <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-600 mx-auto" /></div>}
            {!notesLoading && notes.length === 0 && (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 text-center text-sm text-zinc-500">
                Пока пусто. После готовки запиши, что получилось — это данные для калибровки модели.
              </div>
            )}
            {notes.map(n => (
              <div key={n.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-white">{n.sauceTitle}</span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-2">{fmtDate(n.createdAt)}</span>
                  </div>
                  <button onClick={() => deleteNote(n.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(n.ratings || {}).map(([k, v]) => (
                    <span key={k} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
                      {k === 'umami' ? 'умами' : k === 'salt' ? 'соль' : k === 'sour' ? 'кислота' : k === 'heat' ? 'острота' : 'тело'}: {v}
                    </span>
                  ))}
                  {n.tasteProfile?.synergyMultiplier && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">x{n.tasteProfile.synergyMultiplier}</span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed whitespace-pre-wrap">{n.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== VERSIONS ===== */}
      {section === 'versions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">История версий</div>
            {dbSauces.length === 0 ? (
              <p className="text-xs text-zinc-500">Нет сохранённых кастомных соусов. Сохрани соус из конструктора — каждая пересохранённая версия попадёт сюда.</p>
            ) : (
              <select
                value={verSauceId}
                onChange={e => { setVerSauceId(e.target.value); loadVersions(e.target.value); }}
                className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-lg text-xs text-white focus:outline-none"
              >
                <option value="" className="bg-[#0E1015]">— выбери соус —</option>
                {dbSauces.map(s => <option key={s.id} value={s.id} className="bg-[#0E1015]">{s.title}</option>)}
              </select>
            )}
            {verLoading && <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin text-zinc-600 mx-auto" /></div>}
            <div className="space-y-2">
              {versions.map(v => (
                <div key={v.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
                  <div>
                    <span className="text-xs text-zinc-200 font-mono">v{v.version}</span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-2">{fmtDate(v.createdAt)}</span>
                    {v.payload?.tasteProfile?.umamiIntensityScore != null && (
                      <span className="text-[10px] font-mono text-amber-300 ml-2">умами {v.payload.tasteProfile.umamiIntensityScore}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onApplyRecipe(v.payload?.ingredients || [], `${v.payload?.title || v.title} (v${v.version})`)}
                    className="px-2.5 py-1 rounded-lg bg-sky-600/20 border border-sky-500/30 text-sky-300 text-[10px] hover:bg-sky-600/30 transition-all flex items-center space-x-1"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>В конструктор</span>
                  </button>
                </div>
              ))}
              {!verLoading && verSauceId && versions.length === 0 && (
                <p className="text-xs text-zinc-500">Версий пока нет. Пересохрани соус — появится v1, v2...</p>
              )}
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 text-xs text-zinc-500 leading-relaxed">
            <p className="text-emerald-400 font-mono text-[11px] uppercase mb-2">Как это работает</p>
            <p>• Каждое «Сохранить в БД» из конструктора пишет неизменяемый снапшот v1, v2, v3... с расчётным профилем Ямагучи.</p>
            <p>• Экспериментируй смело: старую композицию всегда можно вернуть в конструктор одним кликом.</p>
            <p>• Дегустационные заметки хранят расчётный профиль на момент варки — со временем это данные для калибровки модели под твой вкус.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasteJournal;
