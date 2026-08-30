import React, { useState } from 'react';
import { TasteProfile, PantryIngredient, RecipeIngredient } from '../types';
import { PANTRY_INGREDIENTS } from '../data/pantry';
import { 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  X, 
  Calculator, 
  Flame, 
  Droplet, 
  Plus, 
  Check, 
  ChevronRight,
  Info,
  Layers,
  Zap
} from 'lucide-react';

interface UmamiRadarProps {
  tasteProfile: TasteProfile;
  pantryList?: PantryIngredient[];
  currentIngredients?: RecipeIngredient[];
  onAddIngredient?: (ingredient: PantryIngredient) => void;
}

type AxisId = 'umami' | 'salinity' | 'sweetness' | 'acidity' | 'heat';

interface AxisMeta {
  id: AxisId;
  label: string;
  shortLabel: string;
  value: number; // 0-10 normalized
  displayValue: string;
  color: string;
  bgTint: string;
  borderTint: string;
  icon: React.ReactNode;
  optimalTarget: string;
  biochemicalMechanism: string;
  practicalTip: string;
  recommendedIngredients: {
    id: string;
    keyCompound: string;
    impactDescription: string;
    suggestedAmount: string;
  }[];
}

export const UmamiRadar: React.FC<UmamiRadarProps> = ({ 
  tasteProfile,
  pantryList = PANTRY_INGREDIENTS,
  currentIngredients = [],
  onAddIngredient
}) => {
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [selectedAxisId, setSelectedAxisId] = useState<AxisId | null>(null);

  // Normalize 5 sensory axes (0 to 10 scale) with rich biochemical metadata
  const axesData: Record<AxisId, AxisMeta> = {
    umami: {
      id: 'umami',
      label: 'Умами (Глутамат + I+G)',
      shortLabel: 'Умами',
      value: Math.min(10, tasteProfile.umamiIntensityScore),
      displayValue: `${tasteProfile.umamiIntensityScore.toFixed(1)} / 10`,
      color: '#F43F5E',
      bgTint: 'bg-rose-500/10',
      borderTint: 'border-rose-500/30',
      icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />,
      optimalTarget: '6.5 - 9.5 (Синергетический каркас Wanzhi / Hongshao)',
      biochemicalMechanism: 'Умами многократно усиливается при одновременном связывании свободного L-глутамата (аминокислоты) и 5\'-рибонуклеотидов (GMP, IMP, AMP) на сопряженных вкусовых рецепторах T1R1/T1R3. Добавление нуклеотидов разгоняет восприятие вкуса до 8-16 раз (по формуле Ямагучи).',
      practicalTip: 'Для взрывной глубины добавьте нуклеотидный бустер (цзицзин Taitaile или пудру шиитаке) в соевый соус в соотношении нуклеотиды:глутамат ~ 1:10.',
      recommendedIngredients: [
        { id: 'taitaile_jijing', keyCompound: 'MSG 38% + I+G 2.6%', impactDescription: 'Мгновенный взрывной буст синергии (γ=1218)', suggestedAmount: '0.5-1 ч.л.' },
        { id: 'shiitake_powder', keyCompound: 'Природный 5\'-GMP (гуанилат)', impactDescription: 'Веганский мультипликатор, связывается с T1R1 в 2.5× прочнее IMP', suggestedAmount: '0.5 ч.л.' },
        { id: 'oyster_sauce', keyCompound: 'Аденилат (AMP) + L-глутамат', impactDescription: 'Шелковистое тело соуса и округлый моллюсковый профиль', suggestedAmount: '1 ст.л.' },
        { id: 'light_soy', keyCompound: 'Свободный L-глутамат (950 мг/100г)', impactDescription: 'Фундамент аминокислотного профиля блюда', suggestedAmount: '1-2 ст.л.' },
        { id: 'haday_huangdoujiang', keyCompound: 'Соевые пептиды + глутамин', impactDescription: 'Плотная ферментированная база для тушения', suggestedAmount: '1 ст.л.' }
      ]
    },
    salinity: {
      id: 'salinity',
      label: 'Соленость (Минеральный Na+)',
      shortLabel: 'Соленость',
      value: Math.min(10, tasteProfile.salinityPercent * 4.5),
      displayValue: `${tasteProfile.salinityPercent.toFixed(2)}% NaCl`,
      color: '#38BDF8',
      bgTint: 'bg-sky-500/10',
      borderTint: 'border-sky-500/30',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />,
      optimalTarget: '1.2% - 1.8% NaCl (Китайский стандарт для соусов)',
      biochemicalMechanism: 'Ионы натрия Na+ проникают через эпителиальные натриевые каналы ENaC вкусовых рецепторов. При высоком уровне умами-синергии порог восприятия соли снижается: соус кажется насыщенным при уменьшении количества чистого NaCl на 30-38%.',
      practicalTip: 'Используйте ферментированные соусы (светлый соевый, доубанцзян) вместо поваренной соли, чтобы насыщать блюдо сложными аминокислотами.',
      recommendedIngredients: [
        { id: 'light_soy', keyCompound: '16.5% соли + 950 мг глутамата', impactDescription: 'Первичная жидкая соленость и чистота профиля', suggestedAmount: '1 ст.л. (+0.6% NaCl)' },
        { id: 'pixian_doubanjiang', keyCompound: '13.5% соли + чили и бобы', impactDescription: 'Сычуаньская ферментированная соленость', suggestedAmount: '1 ст.л. (+0.5% NaCl)' },
        { id: 'salt', keyCompound: '100% чистый NaCl', impactDescription: 'Точечная финальная калибровка баланса', suggestedAmount: '0.25-0.5 ч.л.' },
        { id: 'pickle_brine', keyCompound: '3.8% соли + молочная кислота', impactDescription: 'Мягкая пробиотическая соленость с кислинкой', suggestedAmount: '2-3 ст.л.' }
      ]
    },
    sweetness: {
      id: 'sweetness',
      label: 'Сладость (Tiwei 提味)',
      shortLabel: 'Сладость',
      value: Math.min(10, tasteProfile.sweetnessBrix * 0.7),
      displayValue: `${tasteProfile.sweetnessBrix.toFixed(1)} °Bx`,
      color: '#FBBF24',
      bgTint: 'bg-amber-500/10',
      borderTint: 'border-amber-500/30',
      icon: <Droplet className="w-3.5 h-3.5 text-amber-400" />,
      optimalTarget: '2.5 - 6.0 °Bx (Гармонизация без десертности)',
      biochemicalMechanism: 'В китайской гастрономии сахар используется как модулятор резких граней (Tiwei 提味). Сахароза активирует гетеродимер T1R2/T1R3, смягчая агрессивную горечь, жгучесть чили и уксусную кислотность, а также образует карамельный глянец.',
      practicalTip: 'Небольшая щепотка сахара в несладком коричневом соусе не сделает его сладким, но мгновенно объединит разобщенные вкусовые ноты.',
      recommendedIngredients: [
        { id: 'sugar', keyCompound: '100% сахароза', impactDescription: 'Быстрое сглаживание резких граней и кислотности', suggestedAmount: '0.5-1 ч.л.' },
        { id: 'dark_soy', keyCompound: '14.5% сахаров + карамель/меласса', impactDescription: 'Глубокий рубиновый цвет и карамельная сладость', suggestedAmount: '1-1.5 ч.л.' },
        { id: 'oyster_sauce', keyCompound: '18% природных и добавленных сахаров', impactDescription: 'Бархатная сладость с морским умами', suggestedAmount: '1 ст.л.' },
        { id: 'haday_huangdoujiang', keyCompound: '16% ферментативных сахаров сои', impactDescription: 'Солодово-соевая мягкая сладость', suggestedAmount: '1 ст.л.' },
        { id: 'carrot', keyCompound: '4.7% сахарозы и глюкозы', impactDescription: 'Естественная сладость для овощного бульона', suggestedAmount: '20-30 г' }
      ]
    },
    acidity: {
      id: 'acidity',
      label: 'Кислотность (pH & Активация)',
      shortLabel: 'Кислотность',
      value: Math.min(10, tasteProfile.acidityIndex),
      displayValue: `Индекс ${tasteProfile.acidityIndex.toFixed(1)} / 10`,
      color: '#A3E635',
      bgTint: 'bg-lime-500/10',
      borderTint: 'border-lime-500/30',
      icon: <Zap className="w-3.5 h-3.5 text-lime-400" />,
      optimalTarget: '2.0 - 4.5 (Wanzhi) / 6.0 - 8.5 (Yuxiang, Tangcu)',
      biochemicalMechanism: 'Органические кислоты (уксусная, молочная, янтарная) деполяризуют протонные каналы OTOP1, стимулируя обильное слюноотделение. Это многократно усиливает контрастное восприятие глутамата и очищает рецепторы от жирового налета.',
      practicalTip: 'Черный Чжэньцзянский уксус добавляет глубокий дымно-солодовый профиль, а рассол соленых огурцов дает нежную молочнокислую базу.',
      recommendedIngredients: [
        { id: 'black_vinegar', keyCompound: 'Уксусная + янтарная кислота (выдержка)', impactDescription: 'Дымный солодовый вкус для стилей Юйсян и Танцу', suggestedAmount: '1-2 ч.л.' },
        { id: 'rice_vinegar', keyCompound: 'Чистая 5% уксусная кислота', impactDescription: 'Освежающая резкая кислинка без затемнения соуса', suggestedAmount: '1 ч.л.' },
        { id: 'pickle_brine', keyCompound: 'L-молочная кислота брожения', impactDescription: 'Мягкий пробиотический кислый фон без уксусного душка', suggestedAmount: '2-4 ст.л.' },
        { id: 'pickled_cucumber', keyCompound: 'Молочнокислый растительный пектин', impactDescription: 'Хрустящий кисло-соленый текстурный контраст', suggestedAmount: '15-20 г' }
      ]
    },
    heat: {
      id: 'heat',
      label: 'Пряность / Жар (TRPV1 & Мала)',
      shortLabel: 'Пряность / Жар',
      value: Math.min(10, Math.max(tasteProfile.heatIndex, tasteProfile.numbingIndex)),
      displayValue: `Жар ${tasteProfile.heatIndex.toFixed(1)} | Ma ${tasteProfile.numbingIndex.toFixed(1)}`,
      color: '#FB7185',
      bgTint: 'bg-rose-500/10',
      borderTint: 'border-rose-500/30',
      icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
      optimalTarget: '1.0 - 3.0 (Wanzhi) / 6.0 - 9.5 (Mala Сычуань)',
      biochemicalMechanism: 'Капсаицин и пиперин активируют терморецепторы TRPV1 (ощущение огня и прилив крови к языку), а гидрокси-α-саншул сычуаньского перца стимулирует тактильные механорецепторы RA1/SA1 с частотой ~50 Гц, создавая эффект онемения (Ma 麻).',
      practicalTip: 'Пряности и чили гидрофобны: их обязательно нужно обжаривать в теплом масле на фазе Baoguo (130-150°C), чтобы эфиры перешли в липидную фазу.',
      recommendedIngredients: [
        { id: 'sichuan_pepper', keyCompound: 'Гидрокси-α-саншул (вибрация 50 Гц)', impactDescription: 'Электрическое онемение губ и языка (Ma 麻)', suggestedAmount: '0.5-1 ч.л.' },
        { id: 'pixian_doubanjiang', keyCompound: 'Капсаицин + ферментированное красное масло', impactDescription: 'Плотный пряно-глутаматный каркас сычуаньского соуса', suggestedAmount: '1 ст.л.' },
        { id: 'chili_flakes', keyCompound: 'Сухой капсаицин чили', impactDescription: 'Прямой разогрев соуса и яркий красный оттенок', suggestedAmount: '0.5-1 ч.л.' },
        { id: 'lao_gan_ma', keyCompound: 'Жареный чили + черные соевые бобы Доучи', impactDescription: 'Хрустящая острая текстура с умами', suggestedAmount: '1 ст.л.' },
        { id: 'white_pepper', keyCompound: 'Пиперин (Piperine)', impactDescription: 'Тонкое фоновое тепло в горле (база Brown Sauce)', suggestedAmount: '0.25 ч.л.' },
        { id: 'ginger', keyCompound: 'Гингеролы и шогаолы', impactDescription: 'Свежая цитрусово-пряная острота', suggestedAmount: '5-10 г' }
      ]
    }
  };

  const axesList: AxisMeta[] = [
    axesData.umami,
    axesData.salinity,
    axesData.sweetness,
    axesData.acidity,
    axesData.heat
  ];

  // SVG Radar coordinates calculation
  const size = 190;
  const center = size / 2;
  const radius = 68;
  const angleStep = (Math.PI * 2) / axesList.length;

  const points = axesList.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (axis.value / 10) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const gridCircles = [0.25, 0.5, 0.75, 1.0];

  const handleToggleAxis = (axisId: AxisId) => {
    setSelectedAxisId(prev => prev === axisId ? null : axisId);
  };

  const selectedAxis = selectedAxisId ? axesData[selectedAxisId] : null;

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
        <div className="flex items-center space-x-1.5">
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

      {/* Interactive Helper Prompt */}
      <div className="px-2 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-[10px] text-zinc-400">
        <span className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400/80 animate-ping" />
          <span className="text-zinc-300">Кликните по любой оси (на графике или в списке) для подсказок по усилению</span>
        </span>
        {selectedAxisId && (
          <button
            onClick={() => setSelectedAxisId(null)}
            className="text-zinc-500 hover:text-zinc-300 font-mono"
            title="Сбросить выбор оси"
          >
            ✕ Скрыть
          </button>
        )}
      </div>

      {/* Center Radar & Pentagon */}
      <div className="flex flex-col sm:flex-row items-center justify-around py-1 gap-3">
        {/* Radar SVG */}
        <div className="relative w-[170px] h-[170px] flex items-center justify-center">
          <svg width={size} height={size} className="overflow-visible select-none">
            {/* Concentric Polygons */}
            {gridCircles.map((level, idx) => {
              const polyPoints = axesList.map((_, i) => {
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

            {/* Axis Rays with Click Interaction */}
            {axesList.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              const isSelected = selectedAxisId === axis.id;
              return (
                <g 
                  key={i} 
                  onClick={() => handleToggleAxis(axis.id)}
                  className="cursor-pointer group"
                >
                  <line
                    x1={center}
                    y1={center}
                    x2={x2}
                    y2={y2}
                    stroke={isSelected ? axis.color : '#27272A'}
                    strokeWidth={isSelected ? '2' : '1'}
                    className="transition-colors group-hover:stroke-zinc-500"
                  />
                  {/* Invisible broad stroke for easier clicking */}
                  <line
                    x1={center}
                    y1={center}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth="14"
                  />
                </g>
              );
            })}

            {/* Filled Taste Polygon */}
            <polygon
              points={points}
              fill="rgba(244, 63, 94, 0.22)"
              stroke="#F43F5E"
              strokeWidth="1.75"
              className="transition-all duration-300 ease-out pointer-events-none"
            />

            {/* Axis Markers & Clickable Hit Areas */}
            {axesList.map((axis, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = (axis.value / 10) * radius;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              const isSelected = selectedAxisId === axis.id;
              return (
                <g
                  key={i}
                  onClick={() => handleToggleAxis(axis.id)}
                  className="cursor-pointer group"
                >
                  {/* Active Selection Glow Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="7.5"
                      fill="none"
                      stroke={axis.color}
                      strokeWidth="1.5"
                      className="animate-ping opacity-75"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? "4.5" : "3"}
                    fill={axis.color}
                    stroke="#0C0E14"
                    strokeWidth="1.5"
                    className="transition-all duration-200 group-hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sensory Values Interactive Legend */}
        <div className="w-full sm:w-auto space-y-1.5 font-mono text-xs">
          {axesList.map((axis) => {
            const isSelected = selectedAxisId === axis.id;
            return (
              <button
                key={axis.id}
                onClick={() => handleToggleAxis(axis.id)}
                id={`radar-axis-btn-${axis.id}`}
                className={`w-full flex items-center justify-between sm:justify-start space-x-2.5 p-1.5 rounded-lg text-left transition-all border ${
                  isSelected 
                    ? 'bg-white/[0.08] border-white/[0.2] shadow-sm' 
                    : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                }`}
                title={`Нажмите, чтобы узнать как усилить параметр "${axis.shortLabel}"`}
              >
                <div className="flex items-center space-x-1.5 min-w-[100px]">
                  <div 
                    className={`w-2 h-2 rounded-full transition-transform ${isSelected ? 'scale-125 ring-2 ring-white/40' : ''}`} 
                    style={{ backgroundColor: axis.color }} 
                  />
                  <span className={`text-xs font-sans truncate ${isSelected ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                    {axis.shortLabel}:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-14 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(axis.value / 10) * 100}%`, backgroundColor: axis.color }}
                    />
                  </div>
                  <span className="text-white font-semibold text-xs w-6 text-right font-mono">
                    {axis.value.toFixed(1)}
                  </span>
                  <ChevronRight className={`w-3 h-3 text-zinc-500 transition-transform ${isSelected ? 'rotate-90 text-white' : 'opacity-40'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* POPUP / INLINE RECOMMENDATION DRAWER WHEN AXIS IS CLICKED */}
      {selectedAxis && (
        <div className={`p-3.5 rounded-xl border ${selectedAxis.borderTint} ${selectedAxis.bgTint} space-y-3 animate-fade-in text-left`}>
          {/* Drawer Header */}
          <div className="flex items-start justify-between gap-2 border-b border-white/[0.08] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-md bg-white/[0.08]">
                {selectedAxis.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {selectedAxis.label}
                  </h4>
                  <span 
                    className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border"
                    style={{ borderColor: selectedAxis.color, color: selectedAxis.color }}
                  >
                    Текущее: {selectedAxis.displayValue}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Целевой диапазон: <span className="text-zinc-200">{selectedAxis.optimalTarget}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedAxisId(null)}
              className="p-1 rounded text-zinc-400 hover:text-white transition-colors"
              title="Закрыть подсказку"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Biochemical Explanation */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-zinc-300">
              <Info className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Биохимический механизм усиления:</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed pl-4.5">
              {selectedAxis.biochemicalMechanism}
            </p>
          </div>

          {/* Practical Culinary Tip */}
          <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[11px] text-amber-200/90 flex items-start space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Практический совет:</strong> {selectedAxis.practicalTip}</span>
          </div>

          {/* Recommended Pantry Ingredients */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-200">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-3 h-3 text-sky-400" />
                <span>Ингредиенты из кладовой для усиления параметра:</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {selectedAxis.recommendedIngredients.length} доступно
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {selectedAxis.recommendedIngredients.map((rec) => {
                const pantryItem = pantryList.find(p => p.id === rec.id) || PANTRY_INGREDIENTS.find(p => p.id === rec.id);
                if (!pantryItem) return null;

                const isAlreadyInSauce = currentIngredients.some(i => i.ingredientId === pantryItem.id);
                const isInUserStock = pantryItem.inPantry;

                return (
                  <div
                    key={rec.id}
                    className="p-2 rounded-lg bg-black/30 border border-white/[0.06] flex items-center justify-between gap-2 hover:border-white/[0.14] transition-all text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white truncate text-[11px]">
                          {pantryItem.name}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 hidden sm:inline">
                          {pantryItem.chineseName}
                        </span>
                        {isInUserStock ? (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            В запасе
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-700/40 text-zinc-400">
                            Нет в наличии
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="text-amber-400/90 font-mono">{rec.keyCompound}</span>
                        <span>•</span>
                        <span className="text-zinc-300">{rec.impactDescription}</span>
                        <span className="text-zinc-500 font-mono hidden md:inline">({rec.suggestedAmount})</span>
                      </div>
                    </div>

                    {/* Quick Add / Status Button */}
                    {onAddIngredient && (
                      <div className="shrink-0">
                        {isAlreadyInSauce ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">В соусе</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => onAddIngredient(pantryItem)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-white text-[11px] font-medium transition-all border border-white/[0.1]"
                            title={`Добавить ${pantryItem.name} в соус`}
                          >
                            <Plus className="w-3 h-3 text-rose-400" />
                            <span>Добавить</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
