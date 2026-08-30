import React from 'react';
import { SauceArchetype } from '../types';
import { SAUCE_PRESETS } from '../data/presets';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Flame, 
  Layers, 
  Droplets, 
  CheckCircle2 
} from 'lucide-react';

interface PresetLibraryProps {
  onSelectPreset: (preset: SauceArchetype) => void;
  activePresetId?: string;
}

export const PresetLibrary: React.FC<PresetLibraryProps> = ({
  onSelectPreset,
  activePresetId
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'wanzhi_brown':
        return { label: 'Кантонский Wanzhi', color: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
      case 'sichuan_spicy':
        return { label: 'Сычуань Мала', color: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'braising_glaze':
        return { label: 'Томление Hongshao', color: 'bg-orange-500/10 text-orange-300 border-orange-500/30' };
      case 'superior_broth':
        return { label: 'Золотой бульон', color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30' };
      case 'sweet_sour':
        return { label: 'Танцу (Кисло-сладкий)', color: 'bg-lime-500/10 text-lime-300 border-lime-500/30' };
      case 'pickle_fermented':
        return { label: 'Ферментация / Рассол', color: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: 'Китайский соус', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-2">
            <Sparkles className="w-4 h-4" />
            <span>БИОХИМИЧЕСКИЕ АРХЕТИПЫ КИТАЙСКОЙ КУХНИ</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Инженерные Профили Соусов и Бульонов
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
            Каждый профиль спроектирован на основе принципов <span className="text-zinc-200">Chinese Cooking Demystified</span> и математической синергии L-глутамата со свободными 5'-нуклеотидами (IMP, GMP, AMP). Нажмите для мгновенной загрузки в конструктор.
          </p>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SAUCE_PRESETS.map((preset) => {
          const isCurrent = activePresetId === preset.id;
          const badge = getCategoryBadge(preset.category);

          return (
            <div
              key={preset.id}
              className={`bg-[#10151E] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-zinc-700 shadow-lg ${
                isCurrent ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-zinc-800/90'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {preset.ingredients.length} комп. · ~{preset.steps.length} шага
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-base text-white tracking-tight">
                    {preset.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-rose-400 font-mono">
                    <span>{preset.chineseTitle}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400 truncate">{preset.pinyin}</span>
                  </div>
                </div>

                {/* Subtitle / Summary */}
                <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                  {preset.summary}
                </p>

                {/* Biochemical Rationale */}
                <div className="mt-3 p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                  <span className="font-mono text-zinc-300 font-semibold block text-[10px]">
                    Биохимический механизм:
                  </span>
                  <p className="line-clamp-2">{preset.scientificBreakdown}</p>
                </div>

                {/* Target Proteins */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-zinc-500 font-mono py-0.5 mr-1">Для:</span>
                  {preset.targetProteins.map((prot, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/60"
                    >
                      {prot}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-mono italic truncate max-w-[200px]">
                  {preset.literatureReference.split('/')[0]}
                </span>

                <button
                  onClick={() => onSelectPreset(preset)}
                  id={`load-preset-${preset.id}`}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-950/40'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Активен</span>
                    </>
                  ) : (
                    <>
                      <span>Загрузить в верстак</span>
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
  );
};
