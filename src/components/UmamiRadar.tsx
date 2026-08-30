import React, { useState } from 'react';
import { TasteProfile } from '../types';
import { Sparkles, HeartPulse, Clock, ShieldCheck, Flame, Info, X, Calculator, HelpCircle } from 'lucide-react';

interface UmamiRadarProps {
  tasteProfile: TasteProfile;
}

export const UmamiRadar: React.FC<UmamiRadarProps> = ({ tasteProfile }) => {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Normalize 5 sensory axes (0 to 10 scale)
  const axes = [
    { label: 'Умами', value: Math.min(10, tasteProfile.umamiIntensityScore), color: '#F43F5E' },
    { label: 'Соленость', value: Math.min(10, tasteProfile.salinityPercent * 4.5), color: '#38BDF8' },
    { label: 'Сладость', value: Math.min(10, tasteProfile.sweetnessBrix * 0.7), color: '#FBBF24' },
    { label: 'Кислотность', value: Math.min(10, tasteProfile.acidityIndex), color: '#A3E635' },
    { label: 'Пряность / Жар', value: Math.min(10, Math.max(tasteProfile.heatIndex, tasteProfile.numbingIndex)), color: '#FB7185' }
  ];

  // SVG Radar coordinates calculation
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const angleStep = (Math.PI * 2) / axes.length;

  const points = axes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (axis.value / 10) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <h3 className="font-display font-semibold text-sm text-white tracking-wide">
            СЕНСОРНЫЙ ПРОФИЛЬ & СИНЕРГИЯ
          </h3>
        </div>
        <button
          onClick={() => setShowFormulaInfo(true)}
          className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 transition-colors"
          title="Расшифровка формул"
          id="open-radar-formula-info-btn"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Формулы</span>
        </button>
      </div>

      {/* Top Gauge: Multiplier */}
      <div className="my-4 grid grid-cols-2 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Мультипликатор</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-500">γ=1218</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className={`text-2xl font-bold font-mono ${tasteProfile.synergyMultiplier > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {tasteProfile.synergyMultiplier}×
            </span>
            <span className="text-[10px] text-zinc-400">усиление</span>
          </div>
          <div className="mt-1 text-[10px] text-zinc-400 truncate">
            Эквивалент: {tasteProfile.equivalentMsgConcentrationGPerDl} г/дл MSG
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Послевкусие</span>
            </span>
            <span className="font-mono text-[10px] text-rose-400/80">T1/2</span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-rose-400">
              ~{tasteProfile.aftertasteHalfLifeSeconds}с
            </span>
          </div>
          <div className="mt-1 text-[10px] text-zinc-400 truncate">
            Стойкость на корне языка
          </div>
        </div>
      </div>

      {/* Center Radar & Pentagon */}
      <div className="flex flex-col sm:flex-row items-center justify-around py-2 gap-4">
        {/* Radar SVG */}
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible">
            {/* Concentric Polygons */}
            {gridCircles.map((level, idx) => {
              const polyPoints = axes.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = level * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ');
              return (
                <polygon
                  key={idx}
                  points={polyPoints}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth="1"
                  strokeDasharray={idx === gridCircles.length - 1 ? 'none' : '2 2'}
                />
              );
            })}

            {/* Axis Rays */}
            {axes.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#27272A"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Taste Polygon */}
            <polygon
              points={points}
              fill="rgba(244, 63, 94, 0.25)"
              stroke="#F43F5E"
              strokeWidth="2"
              className="transition-all duration-300 ease-out"
            />

            {/* Axis Markers */}
            {axes.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = (axis.value / 10) * radius;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={axis.color}
                  stroke="#090D12"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        </div>

        {/* Sensory Values Legend */}
        <div className="w-full sm:w-auto space-y-2 font-mono text-xs">
          {axes.map((axis, i) => (
            <div key={i} className="flex items-center justify-between sm:justify-start space-x-3">
              <div className="flex items-center space-x-1.5 min-w-[100px]">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: axis.color }} />
                <span className="text-zinc-400 font-sans text-xs">{axis.label}:</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(axis.value / 10) * 100}%`, backgroundColor: axis.color }}
                  />
                </div>
                <span className="text-white font-semibold w-6 text-right">{axis.value.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nucleotide Breakdown Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Баланс 5'-Нуклеотидов:</span>
          <span className="font-mono text-zinc-300">
            {tasteProfile.nucleotidesMgTotal} мг ({tasteProfile.nucleotideToGlutamateRatio}:1 к Glu)
          </span>
        </div>

        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div 
            title={`IMP (Инозинат мяса/птицы): ${tasteProfile.impPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.impPercentOfNucleotides}%` }}
            className="bg-amber-500 h-full transition-all"
          />
          <div 
            title={`GMP (Гуанилат шиитаке): ${tasteProfile.gmpPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.gmpPercentOfNucleotides}%` }}
            className="bg-emerald-500 h-full transition-all"
          />
          <div 
            title={`AMP (Аденилат устриц/моллюсков): ${tasteProfile.ampPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.ampPercentOfNucleotides}%` }}
            className="bg-cyan-500 h-full transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            <span>IMP (Мясо/Цзицзин): {tasteProfile.impPercentOfNucleotides}%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>GMP (Шиитаке): {tasteProfile.gmpPercentOfNucleotides}%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
            <span>AMP (Устрицы): {tasteProfile.ampPercentOfNucleotides}%</span>
          </span>
        </div>
      </div>

      {/* Sodium Bonus Banner */}
      <div className="mt-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs text-cyan-200">
            Эффект замещения соли:
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-300">
          -{tasteProfile.saltReductionBonusPercent}% NaCl
        </span>
      </div>

      {/* Interactive Formula Info Modal */}
      {showFormulaInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#10151E] border border-zinc-700 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-left">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  РАСШИФРОВКА ВСЕХ ПОКАЗАТЕЛЕЙ И ФОРМУЛ
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaInfo(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Formula 1 */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Мультипликатор синергии ({tasteProfile.synergyMultiplier}×)</span>
                  <span className="font-mono text-amber-400 text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    y = u + 1218 · u · v
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  <strong>u</strong> = {tasteProfile.glutamateConcentrationPercent} г/дл (свободный L-глутамат).<br />
                  <strong>v</strong> = {tasteProfile.nucleotideConcentrationPercent} г/дл (5'-нуклеотиды: IMP + 2.3·GMP + 0.8·AMP).<br />
                  <strong>1218</strong> — константа аллостерического синергизма рецепторов языка T1R1/T1R3.<br />
                  <strong>Эквивалент MSG</strong>: {tasteProfile.equivalentMsgConcentrationGPerDl} г/дл.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Послевкусие (~{tasteProfile.aftertasteHalfLifeSeconds}с)</span>
                  <span className="font-mono text-rose-400 text-[11px] bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                    T1/2 = 45 + (Multi - 1)·15
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Время сохранения вкусовой активации на вкусовых сосочках корня языка. Комплекс глутамата с IMP/GMP распадается в 4-5 раз медленнее соли и кислоты.
                </p>
              </div>

              {/* Formula 3 */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Снижение соли (-{tasteProfile.saltReductionBonusPercent}%)</span>
                  <span className="font-mono text-cyan-400 text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    ΔNaCl = min(38%, Score · 3.8%)
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Доказанный эффект: сильный умами-синергизм позволяет снизить добавление хлорида натрия (соли) на треть без потери соленого вкуса и аппетитности.
                </p>
              </div>

              {/* Formula 4 */}
              <div className="bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Вязкость Gouqian: {tasteProfile.viscosityLabel}</span>
                  <span className="font-mono text-emerald-400 text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Starch = {tasteProfile.starchRatioPercent}%
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px]">
                  Процент картофельного крахмала к объему жидкости. Обеспечивает зеркальное сцепление соуса с порами сейтана, доупи и фучжу.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-right">
              <button
                onClick={() => setShowFormulaInfo(false)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-sm transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
