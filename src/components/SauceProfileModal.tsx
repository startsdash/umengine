import React, { useState } from 'react';
import { 
  SauceArchetype, 
  RecipeIngredient, 
  PantryIngredient, 
  TasteProfile 
} from '../types';
import { calculateTasteProfile } from '../utils/umamiCalculator';
import { 
  FlaskConical, 
  Sparkles, 
  X, 
  ArrowRight, 
  Database, 
  Check, 
  Copy, 
  ChefHat, 
  Flame, 
  Layers, 
  Activity, 
  Info,
  Scale,
  Clock,
  ExternalLink
} from 'lucide-react';

interface SauceProfileModalProps {
  sauce: SauceArchetype;
  pantryList: PantryIngredient[];
  onClose: () => void;
  onLoadToConstructor: (ingredients: RecipeIngredient[], title: string) => void;
  onSaveToDb?: (sauce: Partial<SauceArchetype>) => Promise<boolean>;
}

export const SauceProfileModal: React.FC<SauceProfileModalProps> = ({
  sauce,
  pantryList,
  onClose,
  onLoadToConstructor,
  onSaveToDb
}) => {
  const [portions, setPortions] = useState<number>(sauce.defaultPortions || 2);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate live biochemical taste profile
  const tasteProfile: TasteProfile = React.useMemo(() => {
    return calculateTasteProfile(sauce.ingredients, pantryList, portions);
  }, [sauce.ingredients, pantryList, portions]);

  // Stage mapping helper
  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'baoguo_aromatics':
        return { label: '🔥 Baoguo (Обжарка)', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'seasoning_mix':
        return { label: '🥣 Wanzhi (Основа соуса)', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      case 'liquid_base':
        return { label: '💧 Жидкая база / Бульон', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'slurry_gouqian':
        return { label: '✨ Gouqian (Крахмал)', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'finish_mingyou':
        return { label: '🌿 Mingyou (Финиш)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Смесь', color: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' };
    }
  };

  const getPantryName = (ingredientId: string): string => {
    const item = pantryList.find(p => p.id === ingredientId);
    return item ? `${item.name} (${item.chineseName || ''})` : ingredientId;
  };

  const handleSave = async () => {
    if (!onSaveToDb) return;
    setIsSaving(true);
    try {
      const ok = await onSaveToDb(sauce);
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyFormula = () => {
    const lines = [
      `🧪 ПРОФИЛЬ СОУСА: ${sauce.title} ${sauce.chineseTitle ? `(${sauce.chineseTitle})` : ''}`,
      `Категория: ${sauce.category}`,
      `Умами-интенсивность: ${tasteProfile.umamiIntensityScore.toFixed(1)}/10 (Синергия Ямагути x${tasteProfile.synergyMultiplier.toFixed(1)})`,
      `Соленость: ${tasteProfile.salinityPercent.toFixed(2)}% | Сладость: ${tasteProfile.sweetnessBrix.toFixed(1)}°Bx | Вязкость: ${tasteProfile.viscosityLabel}`,
      '',
      '--- ИНГРЕДИЕНТЫ ---',
      ...sauce.ingredients.map(ing => {
        const name = getPantryName(ing.ingredientId);
        return `• ${name}: ${ing.amount} ${ing.unit} [${ing.stage}] ${ing.notes ? `(${ing.notes})` : ''}`;
      }),
      '',
      '--- ПРОТОКОЛ ПРИГОТОВЛЕНИЯ В ВОКЕ ---',
      ...(sauce.steps || []).map((s, i) => `${i + 1}. ${s.title}: ${s.instruction}`)
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0d121a] border border-rose-500/30 rounded-3xl shadow-2xl shadow-rose-950/50 overflow-hidden text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-transparent flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wider flex items-center space-x-1">
                <FlaskConical className="w-3 h-3 text-rose-400" />
                <span>Биохимический профиль соуса</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.05] text-zinc-300 border border-white/[0.08]">
                {sauce.category}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
              {sauce.title}
            </h2>

            {sauce.chineseTitle && (
              <div className="flex items-center space-x-2 text-xs text-rose-400 font-mono">
                <span className="text-sm font-semibold">{sauce.chineseTitle}</span>
                {sauce.pinyin && <span className="text-zinc-400">({sauce.pinyin})</span>}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08] transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 no-scrollbar">
          {/* Summary & Scientific Breakdown Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] space-y-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Кулинарно-биохимическое обоснование</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-light">
              {sauce.summary}
            </p>
            {sauce.scientificBreakdown && (
              <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 text-xs text-rose-200/90 leading-relaxed font-mono">
                💡 <strong className="text-white">Механизм синергии:</strong> {sauce.scientificBreakdown}
              </div>
            )}
          </div>

          {/* Biochemical Metrics Grid (Yamaguchi synergy, Glutamates, Salinity, Viscosity) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Umami & Synergy */}
            <div className="p-3.5 rounded-xl bg-gradient-to-b from-rose-500/15 to-transparent border border-rose-500/30 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Умами-интенсивность</span>
              <div className="text-xl font-bold font-mono text-rose-300 flex items-baseline space-x-1">
                <span>{tasteProfile.umamiIntensityScore.toFixed(1)}</span>
                <span className="text-xs text-zinc-400">/ 10</span>
              </div>
              <span className="text-[10px] font-mono text-rose-400 block">
                Синергия: x{tasteProfile.synergyMultiplier.toFixed(1)}
              </span>
            </div>

            {/* Glutamate & Nucleotides */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Аминокислоты</span>
              <div className="text-lg font-bold font-mono text-white">
                {tasteProfile.glutamateMgTotal.toFixed(0)} <span className="text-xs font-normal text-zinc-400">мг Glu</span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 block">
                + {tasteProfile.nucleotidesMgTotal.toFixed(0)} мг IMP/GMP
              </span>
            </div>

            {/* Salinity & Brix */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Соль / Сахар</span>
              <div className="text-lg font-bold font-mono text-white">
                {tasteProfile.salinityPercent.toFixed(2)}% <span className="text-xs font-normal text-zinc-400">NaCl</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 block">
                {tasteProfile.sweetnessBrix.toFixed(1)}° Brix
              </span>
            </div>

            {/* Viscosity & Starch */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Вязкость (Gouqian)</span>
              <div className="text-sm font-bold font-mono text-purple-300 truncate">
                {tasteProfile.viscosityLabel}
              </div>
              <span className="text-[10px] font-mono text-purple-400 block">
                {tasteProfile.starchRatioPercent.toFixed(1)}% крахмала
              </span>
            </div>
          </div>

          {/* Formula Ingredients Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Ингредиентный состав соуса ({sauce.ingredients.length})
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Вес соуса: ~{tasteProfile.totalWeightG.toFixed(0)} г ({tasteProfile.totalVolumeMl.toFixed(0)} мл)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sauce.ingredients.map((ing, idx) => {
                const badge = getStageBadge(ing.stage);
                const pName = getPantryName(ing.ingredientId);
                return (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {pName}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                        {ing.notes && (
                          <span className="text-[10px] text-zinc-500 truncate max-w-[130px]">
                            {ing.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold font-mono text-rose-300">
                        {ing.amount} {ing.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Protocol Steps */}
          {sauce.steps && sauce.steps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Пошаговый протокол приготовления в воке
                </h3>
              </div>

              <div className="space-y-2">
                {sauce.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepNumber || idx + 1}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          {step.title} {step.chineseTerm ? <span className="text-rose-400 font-mono font-normal">({step.chineseTerm})</span> : null}
                        </span>
                        {step.duration && (
                          <span className="text-[10px] font-mono text-zinc-500 flex items-center space-x-1 shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{step.duration}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {step.instruction}
                      </p>
                      {step.biochemicalAction && (
                        <div className="text-[10px] font-mono text-zinc-400 pt-0.5">
                          🔬 <span className="text-zinc-300">{step.biochemicalAction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tips */}
          {sauce.proTips && sauce.proTips.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Советы шефа по вок-технике</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                {sauce.proTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0a0e14] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyFormula}
              className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
              title="Скопировать формулу"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{copied ? 'Скопировано!' : 'Скопировать'}</span>
            </button>

            {onSaveToDb && (
              <button
                onClick={handleSave}
                disabled={isSaving || savedSuccess}
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-medium transition-colors flex items-center space-x-1.5"
                title="Сохранить в базу PostgreSQL на VPS"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Сохранено в VPS DB!</span>
                  </>
                ) : isSaving ? (
                  <span>Сохранение...</span>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>В базу рецептов</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              Отмена
            </button>

            <button
              id="sauce-profile-load-to-constructor-btn"
              onClick={() => {
                onLoadToConstructor(sauce.ingredients, sauce.title);
                onClose();
              }}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-rose-950/50 border border-rose-400/40 transition-all group"
            >
              <FlaskConical className="w-4 h-4 text-rose-200 group-hover:rotate-12 transition-transform" />
              <span>Загрузить в Конструктор соусов</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
