import React, { useState } from 'react';
import { TasteProfile } from '../types';
import { Sparkles, Clock, ShieldCheck, HelpCircle, X, Calculator } from 'lucide-react';

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
  const size = 190;
  const center = size / 2;
  const radius = 68;
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
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <h3 className="text-xs font-semibold text-white tracking-tight">
            Сенсорный профиль и синергия
          </h3>
        </div>
        <button
          onClick={() => setShowFormulaInfo(true)}
          className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] transition-colors"
          title="Расшифровка формул"
          id="open-radar-formula-info-btn"
        >
          <HelpCircle className="w-3 h-3 text-amber-400" />
          <span>Формулы</span>
        </button>
      </div>

      {/* Top Gauge: Multiplier & Aftertaste */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Мультипликатор</span>
            </span>
            <span className="font-mono text-[9px] text-zinc-500">γ=1218</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className={`text-xl font-bold font-mono ${tasteProfile.synergyMultiplier > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {tasteProfile.synergyMultiplier}×
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">boost</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
            Экв: {tasteProfile.equivalentMsgConcentrationGPerDl} г/дл MSG
          </div>
        </div>

        <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>Послевкусие</span>
            </span>
            <span className="font-mono text-[9px] text-rose-400/80">T1/2</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1">
            <span className="text-xl font-bold font-mono text-rose-400">
              ~{tasteProfile.aftertasteHalfLifeSeconds}с
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">
            Стойкость на корне языка
          </div>
        </div>
      </div>

      {/* Center Radar & Pentagon */}
      <div className="flex flex-col sm:flex-row items-center justify-around py-1 gap-3">
        {/* Radar SVG */}
        <div className="relative w-[170px] h-[170px] flex items-center justify-center">
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
              fill="rgba(244, 63, 94, 0.22)"
              stroke="#F43F5E"
              strokeWidth="1.75"
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
                  r="3"
                  fill={axis.color}
                  stroke="#0C0E14"
                  strokeWidth="1.5"
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>
        </div>

        {/* Sensory Values Legend */}
        <div className="w-full sm:w-auto space-y-1.5 font-mono text-xs">
          {axes.map((axis, i) => (
            <div key={i} className="flex items-center justify-between sm:justify-start space-x-2.5">
              <div className="flex items-center space-x-1.5 min-w-[95px]">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: axis.color }} />
                <span className="text-zinc-400 font-sans text-xs">{axis.label}:</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-14 h-1 bg-white/[0.08] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(axis.value / 10) * 100}%`, backgroundColor: axis.color }}
                  />
                </div>
                <span className="text-white font-semibold text-xs w-5 text-right">{axis.value.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nucleotide Breakdown Bar */}
      <div className="pt-2.5 border-t border-white/[0.06] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 text-[11px] font-medium">Баланс нуклеотидов:</span>
          <span className="font-mono text-[11px] text-zinc-300">
            {tasteProfile.nucleotidesMgTotal} мг ({tasteProfile.nucleotideToGlutamateRatio}:1 к Glu)
          </span>
        </div>

        <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden flex">
          <div 
            title={`IMP: ${tasteProfile.impPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.impPercentOfNucleotides}%` }}
            className="bg-amber-500 h-full transition-all"
          />
          <div 
            title={`GMP: ${tasteProfile.gmpPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.gmpPercentOfNucleotides}%` }}
            className="bg-emerald-500 h-full transition-all"
          />
          <div 
            title={`AMP: ${tasteProfile.ampPercentOfNucleotides}%`}
            style={{ width: `${tasteProfile.ampPercentOfNucleotides}%` }}
            className="bg-cyan-500 h-full transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            <span>IMP: {tasteProfile.impPercentOfNucleotides}%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>GMP: {tasteProfile.gmpPercentOfNucleotides}%</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
            <span>AMP: {tasteProfile.ampPercentOfNucleotides}%</span>
          </span>
        </div>
      </div>

      {/* Sodium Bonus Banner */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[11px] text-cyan-200">
            Эффект замещения соли:
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-cyan-300">
          -{tasteProfile.saltReductionBonusPercent}% NaCl
        </span>
      </div>

      {/* Formula Info Modal */}
      {showFormulaInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in text-left">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-xs sm:text-sm text-white">
                  Расшифровка показателей и формул
                </h3>
              </div>
              <button
                onClick={() => setShowFormulaInfo(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Formula 1 */}
              <div className="bg-[#0C0E14] border border-white/[0.06] p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Мультипликатор синергии ({tasteProfile.synergyMultiplier}×)</span>
                  <span className="font-mono text-amber-400 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    y = u + 1218 · u · v
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  <strong>u</strong> = {tasteProfile.glutamateConcentrationPercent} г/дл (свободный L-глутамат).<br />
                  <strong>v</strong> = {tasteProfile.nucleotideConcentrationPercent} г/дл (5'-нуклеотиды: IMP + 2.3·GMP + 0.8·AMP).<br />
                  <strong>1218</strong> — константа аллостерического синергизма рецепторов языка T1R1/T1R3.<br />
                  <strong>Эквивалент MSG</strong>: {tasteProfile.equivalentMsgConcentrationGPerDl} г/дл.
                </p>
              </div>

              {/* Formula 2 */}
              <div className="bg-[#0C0E14] border border-white/[0.06] p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Послевкусие (~{tasteProfile.aftertasteHalfLifeSeconds}с)</span>
                  <span className="font-mono text-rose-400 text-[10px] bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    T1/2 = 45 + (Multi - 1)·15
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Время сохранения вкусовой активации на вкусовых сосочках корня языка. Комплекс глутамата с IMP/GMP распадается в 4-5 раз медленнее соли и кислоты.
                </p>
              </div>

              {/* Formula 3 */}
              <div className="bg-[#0C0E14] border border-white/[0.06] p-3 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">Снижение соли (-{tasteProfile.saltReductionBonusPercent}%)</span>
                  <span className="font-mono text-cyan-400 text-[10px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                    ΔNaCl = min(38%, Score · 3.8%)
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Синергизм позволяет снизить добавление хлорида натрия (соли) на треть без потери соленого вкуса и аппетитности.
                </p>
              </div>
            </div>

            <div className="p-3 border-t border-white/[0.08] bg-[#0C0E14] text-right">
              <button
                onClick={() => setShowFormulaInfo(false)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors"
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

