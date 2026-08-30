import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TasteProfile } from '../types';
import { generateAftertasteCurve } from '../utils/umamiCalculator';
import { Activity, Info, Sparkles, Dna, Clock, Flame, Crosshair, HelpCircle, Layers, Zap } from 'lucide-react';

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
  const height = 210;
  const padding = { top: 25, right: 25, bottom: 35, left: 40 };

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

  // -------------------------------------------------------------
  // VIEW MODE 2: Glutamate (u) vs Nucleotide (v) 2D Coordinate Space
  // -------------------------------------------------------------
  const maxU = 0.35; // g/dL Glutamate
  const maxV = 0.035; // g/dL Nucleotides

  const scaleSpaceX = (uVal: number) => padding.left + (Math.min(maxU, Math.max(0, uVal)) / maxU) * plotWidth;
  const scaleSpaceY = (vVal: number) => padding.top + plotHeight - (Math.min(maxV, Math.max(0, vVal)) / maxV) * plotHeight;

  const currentU = tasteProfile.glutamateConcentrationPercent;
  const currentV = tasteProfile.nucleotideConcentrationPercent;

  const pointSpaceX = scaleSpaceX(currentU);
  const pointSpaceY = scaleSpaceY(currentV);

  // Generate Isosurface contours for Yamaguchi equation: y = u + 1218*u*v
  // For target perceived umami levels (e.g., y = 0.05, 0.15, 0.35, 0.65 g/dL)
  const isoLevels = [0.05, 0.15, 0.30, 0.60];
  const isoPaths = useMemo(() => {
    return isoLevels.map(targetY => {
      const pts: string[] = [];
      const steps = 35;
      for (let i = 1; i <= steps; i++) {
        const uStep = (i / steps) * maxU;
        // Solve for v: v = (y - u) / (1218 * u)
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

  // -------------------------------------------------------------
  // VIEW MODE 3: Yamaguchi Ratio Curve (% MSG vs % Nucleotides)
  // -------------------------------------------------------------
  // Classic bell-curve showing total fixed amount (e.g. 0.1 g/dL) split from 0% to 100% Nucleotides
  const ratioSteps = 40;
  const ratioData = useMemo(() => {
    const totalC = 0.1; // 0.1 g/dL total fixed blend
    const arr = [];
    for (let i = 0; i <= ratioSteps; i++) {
      const nucleotideRatio = i / ratioSteps; // 0 to 1
      const uVal = totalC * (1 - nucleotideRatio);
      const vVal = totalC * nucleotideRatio;
      const yVal = uVal + 1218 * uVal * vVal;
      // Normalized to peak at 10
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

  // Hover details for kinetic curve
  const activeHoverPoint = hoveredTime !== null 
    ? dataPoints.reduce((prev, curr) => Math.abs(curr.time - hoveredTime) < Math.abs(prev.time - hoveredTime) ? curr : prev)
    : null;

  return (
    <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-5 shadow-xl relative flex flex-col justify-between overflow-hidden">
      {/* Background Subtle Glow Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-3 z-10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-white tracking-wide flex items-center gap-1.5">
              <span>СИНЕРГИЯ И КИНЕТИКА ВКУСА</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60 font-bold">
                {tasteProfile.synergyMultiplier}×
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400 font-sans">
              Плавная динамика рецепторного связывания T1R1/T1R3
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('kinetic')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'kinetic'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="График затухания вкуса во времени (0-240с)"
          >
            <Clock className="w-3 h-3" />
            <span>Кинетика</span>
          </button>

          <button
            onClick={() => setViewMode('space')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'space'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Двумерное пространство концентраций: Глутамат × Нуклеотиды"
          >
            <Crosshair className="w-3 h-3 text-amber-400" />
            <span>Точка (u × v)</span>
          </button>

          <button
            onClick={() => setViewMode('ratio')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              viewMode === 'ratio'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
            title="Соотношение MSG / Нуклеотиды на кривой Ямагучи"
          >
            <Dna className="w-3 h-3 text-cyan-400" />
            <span>Баланс 1:1</span>
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors ml-1"
            title="Научная справка"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Scientific Explainer */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="my-3 p-3.5 bg-zinc-900/95 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Модель кинетики и пересечения Yamaguchi & Ninomiya (2000)
              </span>
              <span className="text-[10px] font-mono text-zinc-400">J. Nutr. 130: 921S-926S</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              В точке контакта свободного <strong>L-глутамата (u)</strong> и <strong>5'-нуклеотидов (v)</strong> рецептор T1R1/T1R3 защелкивается аллостерически. Синергия <strong>{tasteProfile.synergyMultiplier}×</strong> удерживает вкусовое плато до ~<strong>{tasteProfile.aftertasteHalfLifeSeconds}с</strong>, тогда как соль (NaCl) и кислота затухают за 20–40с.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interactive SVG Chart Canvas */}
      <div 
        className="my-2 relative flex items-center justify-center select-none"
        onMouseLeave={() => setHoveredTime(null)}
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto max-w-xl overflow-visible"
        >
          <defs>
            {/* Umami Gradient Fill */}
            <linearGradient id="umamiAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#F43F5E" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
            </linearGradient>

            {/* Synergy Point Radiant Glow */}
            <radialGradient id="pointGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="1" />
              <stop offset="40%" stopColor="#FB7185" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="ratioGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* -------------------------------------------------------- */}
          {/* VIEW 1: TIME-INTENSITY KINETICS                           */}
          {/* -------------------------------------------------------- */}
          {viewMode === 'kinetic' && (
            <g className="kinetic-layer">
              {/* Horizontal Grid lines (Intensity 0 to 10) */}
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
                    fontSize="9"
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
                    y={height - 12}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    {t}с
                  </text>
                </g>
              ))}

              {/* Ingestion & Peak Line (20 sec) */}
              <motion.line
                x1={peakX}
                y1={padding.top}
                x2={peakX}
                y2={padding.top + plotHeight}
                stroke="#EF4444"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.7}
              />
              <text
                x={peakX + 4}
                y={padding.top + 8}
                fill="#EF4444"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                Проглатывание (20с)
              </text>

              {/* Acid Curve */}
              <motion.path
                d={acidPath}
                fill="none"
                stroke="#A3E635"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.5}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Salt Curve */}
              <motion.path
                d={saltPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                opacity={0.65}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Umami Shaded Area (Smooth animated) */}
              <motion.path
                d={umamiAreaPath}
                fill="url(#umamiAreaGrad)"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Umami Dynamic Curve */}
              <motion.path
                d={umamiPath}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Animated Synergy Intersection Beacon (Glutamate-Nucleotide Binding Peak) */}
              <motion.g
                initial={false}
                animate={{ x: peakX, y: peakY }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Outer Radiating Pulse Ring */}
                <motion.circle
                  r={12}
                  fill="#F43F5E"
                  opacity={0.35}
                  animate={{
                    r: [8, 18, 8],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.4,
                    ease: "easeInOut"
                  }}
                />

                {/* Mid Glow */}
                <circle r={7} fill="#F43F5E" opacity={0.6} />

                {/* Core Center Dot */}
                <circle r={3.5} fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />

                {/* Floating Tooltip Label on Peak */}
                <g transform="translate(10, -14)">
                  <rect
                    x={0}
                    y={-12}
                    width={105}
                    height={20}
                    rx={6}
                    fill="#18181B"
                    stroke="#F43F5E"
                    strokeWidth="1"
                    opacity={0.95}
                  />
                  <text
                    x={6}
                    y={2}
                    fill="#FFFFFF"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    Пик {tasteProfile.umamiIntensityScore.toFixed(1)} / 10 ({tasteProfile.synergyMultiplier}×)
                  </text>
                </g>
              </motion.g>

              {/* Invisible touch/hover listener zones */}
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

              {/* Hover Cursor & Readout */}
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
                    opacity={0.7}
                  />
                  <circle
                    cx={scaleTimeX(hoveredTime)}
                    cy={scaleIntensityY(activeHoverPoint.umami)}
                    r={4}
                    fill="#F43F5E"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                </g>
              )}
            </g>
          )}

          {/* -------------------------------------------------------- */}
          {/* VIEW 2: GLUTAMATE (u) × NUCLEOTIDES (v) 2D SPACE         */}
          {/* -------------------------------------------------------- */}
          {viewMode === 'space' && (
            <g className="space-layer">
              {/* Axis Labels */}
              <text
                x={width - padding.right}
                y={height - 10}
                textAnchor="end"
                fill="#F43F5E"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                Глутамат u → (г/дл)
              </text>
              <text
                x={padding.left - 4}
                y={padding.top - 8}
                textAnchor="start"
                fill="#38BDF8"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                ↑ 5'-Нуклеотиды v (г/дл)
              </text>

              {/* Grid lines */}
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
                    y={height - 12}
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="9"
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
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    {vStep.toFixed(3)}
                  </text>
                </g>
              ))}

              {/* Isosurface Umami Contours */}
              {isoPaths.map((iso, idx) => (
                <g key={`iso-${idx}`}>
                  <path
                    d={iso.path}
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity={0.35 + idx * 0.15}
                  />
                  <text
                    x={width - padding.right - 20}
                    y={scaleSpaceY((iso.targetY - 0.28) / (1218 * 0.28) || 0.005)}
                    fill="#FB7185"
                    fontSize="7.5"
                    fontFamily="JetBrains Mono"
                    opacity={0.7}
                  >
                    y = {iso.targetY}
                  </text>
                </g>
              ))}

              {/* Animated Dashed Projection Lines to Axes */}
              <motion.line
                initial={false}
                animate={{
                  x1: pointSpaceX,
                  y1: pointSpaceY,
                  x2: pointSpaceX,
                  y2: padding.top + plotHeight
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.8}
              />

              <motion.line
                initial={false}
                animate={{
                  x1: pointSpaceX,
                  y1: pointSpaceY,
                  x2: padding.left,
                  y2: pointSpaceY
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity={0.8}
              />

              {/* Current Recipe Operating Intersection Node */}
              <motion.g
                initial={false}
                animate={{ x: pointSpaceX, y: pointSpaceY }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Glowing Aura */}
                <motion.circle
                  r={14}
                  fill="#F59E0B"
                  opacity={0.3}
                  animate={{
                    r: [10, 20, 10],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
                <circle r={6} fill="#F59E0B" opacity={0.8} />
                <circle r={3} fill="#FFFFFF" />

                {/* Floating Tag */}
                <g transform="translate(10, -18)">
                  <rect
                    x={0}
                    y={-10}
                    width={130}
                    height={26}
                    rx={6}
                    fill="#18181B"
                    stroke="#F59E0B"
                    strokeWidth="1"
                    opacity={0.95}
                  />
                  <text
                    x={6}
                    y={3}
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    u: {currentU.toFixed(3)} | v: {currentV.toFixed(3)}
                  </text>
                  <text
                    x={6}
                    y={12}
                    fill="#F59E0B"
                    fontSize="7.5"
                    fontFamily="JetBrains Mono"
                  >
                    Соотношение: 1 : {(currentU > 0 ? (currentV / currentU).toFixed(2) : '0')}
                  </text>
                </g>
              </motion.g>
            </g>
          )}

          {/* -------------------------------------------------------- */}
          {/* VIEW 3: YAMAGUCHI RATIO CURVE (% MSG vs % Nucleotides)   */}
          {/* -------------------------------------------------------- */}
          {viewMode === 'ratio' && (
            <g className="ratio-layer">
              {/* Horizontal Grid lines */}
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
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* X Axis Percentage Marks */}
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
                    y={height - 12}
                    textAnchor="middle"
                    fill={pct === 50 ? '#F59E0B' : '#64748B'}
                    fontWeight={pct === 50 ? 'bold' : 'normal'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    {pct}% I+G
                  </text>
                </g>
              ))}

              {/* Optimum 1:1 Reference Line */}
              <line
                x1={scaleRatioX(50)}
                y1={padding.top}
                x2={scaleRatioX(50)}
                y2={padding.top + plotHeight}
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity={0.7}
              />
              <text
                x={scaleRatioX(50) + 4}
                y={padding.top + 10}
                fill="#F59E0B"
                fontSize="8"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                Оптимум 1:1 (Пик синергии)
              </text>

              {/* Ratio Bell Curve */}
              <motion.path
                d={ratioPath}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="3"
                strokeLinecap="round"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />

              {/* Current Recipe Ratio Node */}
              <motion.g
                initial={false}
                animate={{ x: pointRatioX, y: pointRatioY }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.circle
                  r={12}
                  fill="#38BDF8"
                  opacity={0.3}
                  animate={{
                    r: [8, 16, 8],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut"
                  }}
                />
                <circle r={6} fill="#38BDF8" />
                <circle r={3} fill="#FFFFFF" />

                {/* Tooltip Tag */}
                <g transform="translate(10, -14)">
                  <rect
                    x={0}
                    y={-10}
                    width={110}
                    height={20}
                    rx={6}
                    fill="#18181B"
                    stroke="#38BDF8"
                    strokeWidth="1"
                    opacity={0.95}
                  />
                  <text
                    x={6}
                    y={3}
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                  >
                    Рецепт: {currentNucleotidePercent.toFixed(1)}% нуклеотидов
                  </text>
                </g>
              </motion.g>
            </g>
          )}
        </svg>
      </div>

      {/* Dynamic Telemetry Footer */}
      <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Глутамат [u]:</span>
          <span className="font-bold text-rose-400">{currentU.toFixed(3)} г/дл</span>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Нуклеотиды [v]:</span>
          <span className="font-bold text-amber-400">{currentV.toFixed(3)} г/дл</span>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Мультипликатор:</span>
          <span className="font-bold text-cyan-400">{tasteProfile.synergyMultiplier}×</span>
        </div>

        <div className="bg-zinc-950/70 p-2 rounded-xl border border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400">Послевкусие T½:</span>
          <span className="font-bold text-emerald-400">~{tasteProfile.aftertasteHalfLifeSeconds}с</span>
        </div>
      </div>
    </div>
  );
};
