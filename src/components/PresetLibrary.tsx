import React from 'react';
import { SauceArchetype } from '../types';
import { SAUCE_PRESETS } from '../data/presets';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Database,
  Trash2,
  Calendar,
  Layers
} from 'lucide-react';

interface PresetLibraryProps {
  onSelectPreset: (preset: SauceArchetype) => void;
  activePresetId?: string;
  customSauces?: (SauceArchetype & { createdAt?: string; updatedAt?: string })[];
  onDeleteCustomSauce?: (id: string) => void;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  onSelectPreset,
  activePresetId,
  customSauces = [],
  onDeleteCustomSauce
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'wanzhi_brown':
        return { label: 'Кантонский Wanzhi', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      case 'sichuan_spicy':
        return { label: 'Сычуань Мала', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'braising_glaze':
        return { label: 'Томление Hongshao', color: 'bg-orange-500/10 text-orange-300 border-orange-500/20' };
      case 'superior_broth':
        return { label: 'Золотой бульон', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20' };
      case 'sweet_sour':
        return { label: 'Танцу (Кисло-сладкий)', color: 'bg-lime-500/10 text-lime-300 border-lime-500/20' };
      case 'pickle_fermented':
        return { label: 'Ферментация / Рассол', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' };
      default:
        return { label: 'Кастомный соус (БД)', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase text-[10px]">Биохимические архетипы & База Данных</span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Инженерные профили соусов и бульонов
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
            Спроектированы на основе аутентичной китайской гастрономической физики (Wanzhi, Hongshao, Mala), синергии Yamaguchi и ваших персональных рецептов, сохраненных в PostgreSQL на VPS.
          </p>
        </div>
      </div>

      {/* SECTION 1: User's Custom Sauces from PostgreSQL */}
      {customSauces.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Сохраненные соусы в VPS PostgreSQL ({customSauces.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Таблица custom_sauces
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customSauces.map((sauce) => {
              const isCurrent = activePresetId === sauce.id;
              const badge = getCategoryBadge(sauce.category);

              return (
                <div
                  key={sauce.id}
                  className={`rounded-xl bg-white/[0.02] border p-4 flex flex-col justify-between transition-all backdrop-blur-xl ${
                    isCurrent 
                      ? 'border-emerald-500/50 bg-emerald-500/[0.03] ring-1 ring-emerald-500/30' 
                      : 'border-white/[0.08] hover:border-emerald-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
                        {sauce.createdAt && (
                          <span className="flex items-center space-x-1 text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(sauce.createdAt).toLocaleDateString()}</span>
                          </span>
                        )}
                        <span>{sauce.ingredients?.length || 0} ингр.</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-sm text-white tracking-tight">
                        {sauce.title}
                      </h4>
                      {sauce.chineseTitle && (
                        <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono">
                          <span>{sauce.chineseTitle}</span>
                          {sauce.pinyin && <span className="text-zinc-400 truncate text-[11px]">· {sauce.pinyin}</span>}
                        </div>
                      )}
                    </div>

                    {sauce.summary && (
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {sauce.summary}
                      </p>
                    )}

                    {sauce.scientificBreakdown && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-[#0C0E14] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
                        <span className="font-mono text-zinc-300 font-medium block text-[10px]">
                          Биохимия:
                        </span>
                        <p className="line-clamp-2 text-zinc-400 leading-normal">{sauce.scientificBreakdown}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                    {onDeleteCustomSauce && (
                      <button
                        onClick={() => onDeleteCustomSauce(sauce.id)}
                        className="flex items-center space-x-1 text-xs text-zinc-500 hover:text-rose-400 active:text-rose-300 transition-colors p-1.5 rounded-md hover:bg-rose-500/10 touch-manipulation"
                        title="Удалить из PostgreSQL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Удалить</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectPreset(sauce)}
                      id={`load-custom-sauce-${sauce.id}`}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                        isCurrent 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-600/20 hover:bg-emerald-600/30 active:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Активен</span>
                        </>
                      ) : (
                        <>
                          <span>Загрузить в воркбенч</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: Standard Scientific Archetypes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">
            Канонические китайские архетипы ({SAUCE_PRESETS.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SAUCE_PRESETS.map((preset) => {
            const isCurrent = activePresetId === preset.id;
            const badge = getCategoryBadge(preset.category);

            return (
              <div
                key={preset.id}
                className={`rounded-xl bg-white/[0.02] border p-4 flex flex-col justify-between transition-all backdrop-blur-xl ${
                  isCurrent 
                    ? 'border-rose-500/50 bg-rose-500/[0.03] ring-1 ring-rose-500/30' 
                    : 'border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div>
                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {preset.ingredients.length} ингр. · {preset.steps.length} шага
                    </span>
                  </div>

                  {/* Title */}
                  <div className="space-y-0.5">
                    <h3 className="font-semibold text-sm text-white tracking-tight">
                      {preset.title}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono">
                      <span>{preset.chineseTitle}</span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-zinc-400 truncate text-[11px]">{preset.pinyin}</span>
                    </div>
                  </div>

                  {/* Subtitle / Summary */}
                  <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                    {preset.summary}
                  </p>

                  {/* Biochemical Rationale */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-[#0C0E14] border border-white/[0.06] text-[11px] text-zinc-400 space-y-1">
                    <span className="font-mono text-zinc-300 font-medium block text-[10px]">
                      Биохимический механизм:
                    </span>
                    <p className="line-clamp-2 text-zinc-400 leading-normal">{preset.scientificBreakdown}</p>
                  </div>

                  {/* Target Proteins */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    <span className="text-[10px] text-zinc-500 font-mono py-0.5 mr-1">Для:</span>
                    {preset.targetProteins.map((prot, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 border border-white/[0.08]"
                      >
                        {prot}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono italic truncate max-w-[140px] sm:max-w-[180px]">
                    {preset.literatureReference.split('/')[0]}
                  </span>

                  <button
                    onClick={() => onSelectPreset(preset)}
                    id={`load-preset-${preset.id}`}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all touch-manipulation ${
                      isCurrent 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-default'
                        : 'bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] text-white border border-white/[0.12] hover:border-white/[0.2]'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Активен</span>
                      </>
                    ) : (
                      <>
                        <span>Загрузить</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

