import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TasteProfile } from '../types';
import { generateAftertasteCurve } from '../utils/umamiCalculator';
import { Activity, Info, Sparkles, Dna, Clock, Crosshair } from 'lucide-react';

interface SynergyCurveProps {
  tasteProfile: TasteProfile;
}

type CurveViewMode = 'kinetic' | 'space' | 'ratio';

export const SynergyCurve: React.FC<SynergyCurveProps> = ({ tasteProfile }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<CurveViewMode>('kinetic');
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  // Kinetic time points
  const dataPoints = useMemo(() => generateAftertasteCurve(tasteProfile), [tasteProfile]);

  // Chart dimensions
  const width = 480;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 35 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Kinetic Scales (0 to 240 seconds, 0 to 10 intensity)
  const maxTime = 240;
  const maxIntensity = 10;

  const scaleTimeX = (t: number) => padding.left + (Math.max(0, Math.min(maxTime, t)) / maxTime) * plotWidth;
  const scaleIntensityY = (v: number) => padding.top + plotHeight - (Math.max(0, Math.min(maxIntensity, v)) / maxIntensity) * plotHeight;

  // Build SVG path strings for Kinetic View
  const buildSmoothPath = (key: 'umami' | 'salt' | 'acid') => {
    if (dataPoints.length === 0) return '';
    return dataPoints.map((pt, i) => {
      const x = scaleTimeX(pt.time);
      const y = scaleIntensityY(pt[key]);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const umamiPath = buildSmoothPath('umami');
  const saltPath = buildSmoothPath('salt');
  const acidPath = buildSmoothPath('acid');

  // Closed area under umami curve for glowing gradient
  const umamiAreaPath = useMemo(() => {
    if (dataPoints.length === 0) return '';
    const pointsStr = dataPoints.map((pt, i) => {
      const x = scaleTimeX(pt.time);
      const y = scaleIntensityY(pt.umami);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    const lastX = scaleTimeX(dataPoints[dataPoints.length - 1].time);
    const zeroY = scaleIntensityY(0);
    const firstX = scaleTimeX(dataPoints[0].time);
    return `${pointsStr} L ${lastX.toFixed(1)} ${zeroY.toFixed(1)} L ${firstX.toFixed(1)} ${zeroY.toFixed(1)} Z`;
  }, [dataPoints, plotWidth, plotHeight]);

  // Synergy Peak Node (at t = 20s, peak binding)
  const peakTime = 20;
  const peakX = scaleTimeX(peakTime);
  const peakY = scaleIntensityY(tasteProfile.umamiIntensityScore);

  // VIEW MODE 2: Glutamate (u) vs Nucleotide (v) 2D Coordinate Space
  const maxU = 0.35; // g/dL Glutamate
  const maxV = 0.035; // g/dL Nucleotides

  const scaleSpaceX = (uVal: number) => padding.left + (Math.min(maxU, Math.max(0, uVal)) / maxU) * plotWidth;
  const scaleSpaceY = (vVal: number) => padding.top + plotHeight - (Math.min(maxV, Math.max(0, vVal)) / maxV) * plotHeight;

  const currentU = tasteProfile.glutamateConcentrationPercent;
  const currentV = tasteProfile.nucleotideConcentrationPercent;

  const pointSpaceX = scaleSpaceX(currentU);
  const pointSpaceY = scaleSpaceY(currentV);

  // Generate Isosurface contours for Yamaguchi equation
  const isoLevels = [0.05, 0.15, 0.30, 0.60];
  const isoPaths = useMemo(() => {
    return isoLevels.map(targetY => {
      const pts: string[] = [];
      const steps = 35;
      for (let i = 1; i <= steps; i++) {
        const uStep = (i / steps) * maxU;
        if (targetY > uStep) {
          const vStep = (targetY - uStep) / (1218 * uStep);
          if (vStep >= 0 && vStep <= maxV * 1.2) {
            const x = scaleSpaceX(uStep);
            const y = scaleSpaceY(vStep);
            pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
          }
        }
      }
      return { targetY, path: pts.join(' ') };
    }).filter(p => p.path.length > 0);
  }, [maxU, maxV, plotWidth, plotHeight]);

  // VIEW MODE 3: Yamaguchi Ratio Curve
  const ratioSteps = 40;
  const ratioData = useMemo(() => {
    const totalC = 0.1;
    const arr = [];
    for (let i = 0; i <= ratioSteps; i++) {
      const nucleotideRatio = i / ratioSteps;
      const uVal = totalC * (1 - nucleotideRatio);
      const vVal = totalC * nucleotideRatio;
      const yVal = uVal + 1218 * uVal * vVal;
      const score = Math.min(10, Math.log10(1 + yVal * 30) * 6.5);
      arr.push({ ratio: nucleotideRatio * 100, score });
    }
    return arr;
  }, []);

  const scaleRatioX = (ratioPct: number) => padding.left + (ratioPct / 100) * plotWidth;
  const scaleRatioY = (sc: number) => padding.top + plotHeight - (sc / 10) * plotHeight;

  const ratioPath = useMemo(() => {
    return ratioData.map((d, i) => {
      const x = scaleRatioX(d.ratio);
      const y = scaleRatioY(d.score);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }, [ratioData, plotWidth, plotHeight]);

  // Current Recipe Ratio Position
  const totalGlutPlusNucl = currentU + currentV;
  const currentNucleotidePercent = totalGlutPlusNucl > 0 
    ? Math.min(100, Math.max(0, (currentV / totalGlutPlusNucl) * 100))
    : 0;
  const pointRatioX = scaleRatioX(currentNucleotidePercent);
  const currentRatioScore = Math.min(10, tasteProfile.umamiIntensityScore);
  const pointRatioY = scaleRatioY(currentRatioScore);

  const activeHoverPoint = hoveredTime !== null 
    ? dataPoints.reduce((prev, curr) => Math.abs(curr.time - hoveredTime) < Math.abs(prev.time - hoveredTime) ? curr : prev)
    : null;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl flex flex-col justify-between space-y-3">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rose-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
              <span>Синергия и кинетика вкуса</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                {tasteProfile.synergyMultiplier}×
              </span>
            </h3>
          </div>
        </div>

        {/* View Switcher Tabs (Linear Pill Group) */}
        <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/[0.08] self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('kinetic')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
              viewMode === 'kinetic'
                ? 'bg-white/[0.12] text-white border border-white/[0.16] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Кинетика</span>
          </button>

          <button
            onClick={() => setViewMode('space')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
              viewMode === 'space'
                ? 'bg-white/[0.12] text-white border border-white/[0.16] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Crosshair className="w-3 h-3 text-amber-400" />
            <span>Координаты (u×v)</span>
          </button>

          <button
            onClick={() => setViewMode('ratio')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 ${
              viewMode === 'ratio'
                ? 'bg-white/[0.12] text-white border border-white/[0.16] shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Dna className="w-3 h-3 text-cyan-400" />
            <span>Баланс 1:1</span>
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-0.5"
            title="Научная справка"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Explainer */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-[#0C0E14] border border-white/[0.08] rounded-xl text-xs text-zinc-300 space-y-1.5 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Модель кинетики Yamaguchi & Ninomiya (2000)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">J. Nutr. 130: 921S-926S</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              В точке контакта свободного <strong>L-глутамата (u)</strong> и <strong>5'-нуклеотидов (v)</strong> рецептор T1R1/T1R3 защелкивается аллостерически. Синергия <strong>{tasteProfile.synergyMultiplier}×</strong> удерживает вкусовое плато до ~<strong>{tasteProfile.aftertasteHalfLifeSeconds}с</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive SVG Chart Canvas */}
      <div 
        className="relative flex items-center justify-center select-none py-1"
        onMouseLeave={() => setHoveredTime(null)}
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto max-w-xl overflow-visible"
        >
          <defs>
            <linearGradient id="umamiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#F43F5E" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* VIEW 1: TIME-INTENSITY KINETICS */}
          {viewMode === 'kinetic' && (
            <g className="kinetic-layer">
              {/* Horizontal Grid lines */}
              {[0, 2.5, 5, 7.5, 10].map((v) => (
                <g key={`y-grid-${v}`}>
                  <line
                    x1={padding.left}
                    y1={scaleIntensityY(v)}
                    x2={width - padding.right}
                    y2={scaleIntensityY(v)}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={scaleIntensityY(v) + 3}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* Vertical Time Grid lines */}
              {[0, 60, 120, 180, 240].map((t) => (
                <g key={`x-grid-${t}`}>
                  <line
                    x1={scaleTimeX(t)}
                    y1={padding.top}
                    x2={scaleTimeX(t)}
                    y2={padding.top + plotHeight}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scaleTimeX(t)}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {t}с
                  </text>
                </g>
              ))}

              {/* Peak Line */}
              <motion.line
                x1={peakX}
                y1={padding.top}
                x2={peakX}
                y2={padding.top + plotHeight}
                stroke="#EF4444"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={0.6}
              />

              {/* Acid Curve */}
              <motion.path
                d={acidPath}
                fill="none"
                stroke="#A3E635"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                opacity={0.4}
                transition={{ duration: 0.5 }}
              />

              {/* Salt Curve */}
              <motion.path
                d={saltPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeDasharray="4 2"
                opacity={0.5}
                transition={{ duration: 0.5 }}
              />

              {/* Umami Area */}
              <motion.path
                d={umamiAreaPath}
                fill="url(#umamiAreaGrad)"
                transition={{ duration: 0.5 }}
              />

              {/* Umami Dynamic Curve */}
              <motion.path
                d={umamiPath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={{ duration: 0.5 }}
              />

              {/* Synergy Peak Marker */}
              <motion.g
                initial={false}
                animate={{ x: peakX, y: peakY }}
                transition={{ duration: 0.5 }}
              >
                <circle r={7} fill="#F43F5E" opacity={0.3} />
                <circle r={3} fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
              </motion.g>

              {/* Hover zones */}
              {dataPoints.map((pt) => (
                <rect
                  key={`hover-col-${pt.time}`}
                  x={scaleTimeX(pt.time) - 8}
                  y={padding.top}
                  width={16}
                  height={plotHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredTime(pt.time)}
                />
              ))}

              {activeHoverPoint && hoveredTime !== null && (
                <g>
                  <line
                    x1={scaleTimeX(hoveredTime)}
                    y1={padding.top}
                    x2={scaleTimeX(hoveredTime)}
                    y2={padding.top + plotHeight}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                  <circle
                    cx={scaleTimeX(hoveredTime)}
                    cy={scaleIntensityY(activeHoverPoint.umami)}
                    r={3.5}
                    fill="#F43F5E"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </g>
          )}

          {/* VIEW 2: 2D SPACE (u × v) */}
          {viewMode === 'space' && (
            <g className="space-layer">
              <text
                x={width - padding.right}
                y={height - 8}
                textAnchor="end"
                fill="#F43F5E"
                fontSize="8.5"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                Глутамат u →
              </text>
              <text
                x={padding.left - 4}
                y={padding.top - 6}
                textAnchor="start"
                fill="#38BDF8"
                fontSize="8.5"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                ↑ 5'-Нуклеотиды v
              </text>

              {[0, 0.1, 0.2, 0.3].map(uStep => (
                <g key={`ugrid-${uStep}`}>
                  <line
                    x1={scaleSpaceX(uStep)}
                    y1={padding.top}
                    x2={scaleSpaceX(uStep)}
                    y2={padding.top + plotHeight}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scaleSpaceX(uStep)}
                    y={height - 10}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {uStep.toFixed(2)}
                  </text>
                </g>
              ))}

              {[0, 0.01, 0.02, 0.03].map(vStep => (
                <g key={`vgrid-${vStep}`}>
                  <line
                    x1={padding.left}
                    y1={scaleSpaceY(vStep)}
                    x2={width - padding.right}
                    y2={scaleSpaceY(vStep)}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={scaleSpaceY(vStep) + 3}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {vStep.toFixed(3)}
                  </text>
                </g>
              ))}

              {isoPaths.map((iso, idx) => (
                <path
                  key={`iso-${idx}`}
                  d={iso.path}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity={0.3 + idx * 0.15}
                />
              ))}

              <motion.g
                initial={false}
                animate={{ x: pointSpaceX, y: pointSpaceY }}
                transition={{ duration: 0.5 }}
              >
                <circle r={8} fill="#F59E0B" opacity={0.25} />
                <circle r={3.5} fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1.5" />
              </motion.g>
            </g>
          )}

          {/* VIEW 3: RATIO CURVE */}
          {viewMode === 'ratio' && (
            <g className="ratio-layer">
              {[0, 2.5, 5, 7.5, 10].map((v) => (
                <g key={`r-y-grid-${v}`}>
                  <line
                    x1={padding.left}
                    y1={scaleRatioY(v)}
                    x2={width - padding.right}
                    y2={scaleRatioY(v)}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={padding.left - 6}
                    y={scaleRatioY(v) + 3}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {[0, 25, 50, 75, 100].map(pct => (
                <g key={`pct-${pct}`}>
                  <line
                    x1={scaleRatioX(pct)}
                    y1={padding.top}
                    x2={scaleRatioX(pct)}
                    y2={padding.top + plotHeight}
                    stroke="#1E293B"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scaleRatioX(pct)}
                    y={height - 10}
                    textAnchor="middle"
                    fill={pct === 50 ? '#F59E0B' : '#64748B'}
                    fontWeight={pct === 50 ? 'bold' : 'normal'}
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                  >
                    {pct}%
                  </text>
                </g>
              ))}

              <motion.path
                d={ratioPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
                transition={{ duration: 0.5 }}
              />

              <motion.g
                initial={false}
                animate={{ x: pointRatioX, y: pointRatioY }}
                transition={{ duration: 0.5 }}
              >
                <circle r={8} fill="#38BDF8" opacity={0.25} />
                <circle r={3.5} fill="#FFFFFF" stroke="#38BDF8" strokeWidth="1.5" />
              </motion.g>
            </g>
          )}
        </svg>
      </div>

      {/* Telemetry Footer */}
      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-[#0C0E14] p-2 rounded-lg border border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">L-Глутамат [u]:</span>
          <span className="font-semibold text-rose-400 text-[11px]">{currentU.toFixed(3)}</span>
        </div>

        <div className="bg-[#0C0E14] p-2 rounded-lg border border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">Нуклеотиды [v]:</span>
          <span className="font-semibold text-amber-400 text-[11px]">{currentV.toFixed(3)}</span>
        </div>

        <div className="bg-[#0C0E14] p-2 rounded-lg border border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">Усиление:</span>
          <span className="font-semibold text-cyan-400 text-[11px]">{tasteProfile.synergyMultiplier}×</span>
        </div>

        <div className="bg-[#0C0E14] p-2 rounded-lg border border-white/[0.06] flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">Послевкусие:</span>
          <span className="font-semibold text-emerald-400 text-[11px]">~{tasteProfile.aftertasteHalfLifeSeconds}с</span>
        </div>
      </div>
    </div>
  );
};

