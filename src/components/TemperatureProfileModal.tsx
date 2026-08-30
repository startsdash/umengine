import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TasteProfile, RecipeIngredient, PantryIngredient } from '../types';
import { 
  Flame, 
  Thermometer, 
  Snowflake, 
  Zap, 
  Layers, 
  Sparkles, 
  Info, 
  X, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Droplets,
  Clock,
  FlaskConical,
  Gauge
} from 'lucide-react';

interface TemperatureProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasteProfile: TasteProfile;
  ingredients: RecipeIngredient[];
  pantryList: PantryIngredient[];
}

interface TempZone {
  id: string;
  minTemp: number;
  maxTemp: number;
  name: string;
  chineseTerm: string;
  pinyin: string;
  badgeColor: string;
  description: string;
  biochemistrySummary: string;
}

const TEMP_ZONES: TempZone[] = [
  {
    id: 'cold_maceration',
    minTemp: 4,
    maxTemp: 25,
    name: 'Холодная мацерация / Лянбань',
    chineseTerm: '凉拌 / 浸泡',
    pinyin: 'Liángbàn / Jìnpào',
    badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    description: 'Холодные соусы для обмакивания, маринады и холодные закуски.',
    biochemistrySummary: '100% стабильность нуклеотидов. Рецепторы T1R1/T1R3 работают в сдержанном кинетическом режиме (~0.85× интенсивности). Крахмал пассивен, кислотность воспринимается острее.'
  },
  {
    id: 'gentle_infusion',
    minTemp: 50,
    maxTemp: 75,
    name: 'Теплая энзиматическая вытяжка',
    chineseTerm: '温水浸提',
    pinyin: 'Wēnshuǐ Jìntí',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    description: 'Настаивание сушеных шиитаке, комбу и деликатных умами-бульонов.',
    biochemistrySummary: 'Оптимальное окно для эндогенных РНКаз (ферментация нуклеотидов GMP из РНК шиитаке). Начало клейстеризации амилопектина при ~65°C.'
  },
  {
    id: 'simmer_braise',
    minTemp: 85,
    maxTemp: 100,
    name: 'Томление Hongshao / Кипение бульона',
    chineseTerm: '红烧 / 慢炖',
    pinyin: 'Hóngshāo / Màndùn',
    badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    description: 'Классическое китайское тушение в соусе, глазирование доупи/фучжу и варка Гао Тан.',
    biochemistrySummary: 'Полная клейстеризация крахмала (Gouqian) с образованием глянцевой защитной эмульсии. Гидролиз сложных пептидов в свободный глутамат. Эталонный баланс диффузии вкуса.'
  },
  {
    id: 'pan_caramel',
    minTemp: 140,
    maxTemp: 175,
    name: 'Глазирование & Реакция Майяра',
    chineseTerm: '收汁 / 炒糖色',
    pinyin: 'Shōuzhī / Chǎo Tángsè',
    badgeColor: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    description: 'Уваривание соуса до блестящей глазури, карамелизация сахаров и обжарка ароматики.',
    biochemistrySummary: 'Бурная реакция Майяра между L-глутаматом и редуцирующими сахарами. Рост ароматических пиразинов и фуранонов. Быстрое концентрирование умами-кислот.'
  },
  {
    id: 'wok_blast',
    minTemp: 190,
    maxTemp: 260,
    name: 'Высокотемпературный Вок-бласт (Wok Hei)',
    chineseTerm: '爆炒 / 锅边酱',
    pinyin: 'Bàochǎo / Guōbiānjiàng',
    badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    description: 'Техника Guobianjiang — соевый соус по раскаленным стенкам вока за 3–5 секунд.',
    biochemistrySummary: 'Пиролиз микроаэрозолей масла, молниеносное испарение воды (+20% концентрация умами). L-глутамат стабилен до 225°C при секундном контакте, создавая дымный карамельный шлейф.'
  }
];

export const TemperatureProfileModal: React.FC<TemperatureProfileModalProps> = ({
  isOpen,
  onClose,
  tasteProfile,
  ingredients,
  pantryList
}) => {
  // Current active temperature on slider (4°C to 250°C)
  const [temperature, setTemperature] = useState<number>(95);
  const [activeMetricTab, setActiveMetricTab] = useState<'synergy' | 'maillard' | 'viscosity' | 'stability'>('synergy');

  const pantryMap = useMemo(() => {
    const map = new Map<string, PantryIngredient>();
    pantryList.forEach(p => map.set(p.id, p));
    return map;
  }, [pantryList]);

  // Determine current active zone
  const currentZone = useMemo(() => {
    return TEMP_ZONES.find(z => temperature >= z.minTemp && temperature <= z.maxTemp) || TEMP_ZONES[2];
  }, [temperature]);

  // Biochemical calculations dynamic to temperature
  const thermoMetrics = useMemo(() => {
    const baseMultiplier = tasteProfile.synergyMultiplier || 1.0;
    const baseScore = tasteProfile.umamiIntensityScore || 0;

    // 1. Temperature Perception Coefficient (Human taste receptor T1R1/T1R3 kinetic response)
    // Optimal oral perception is between 35°C and 60°C.
    // In cold liquid (4-20°C), perceived umami is ~85%.
    // In hot wok burst (180-240°C), flash vaporization concentrates solids by up to +25%.
    let tempPerceptionFactor = 1.0;
    let concentrationFactor = 1.0;

    if (temperature <= 25) {
      tempPerceptionFactor = 0.82 + (temperature / 25) * 0.08; // 0.82 -> 0.90
      concentrationFactor = 1.0;
    } else if (temperature <= 65) {
      tempPerceptionFactor = 0.90 + ((temperature - 25) / 40) * 0.15; // 0.90 -> 1.05 (Peak oral receptor binding)
      concentrationFactor = 1.0;
    } else if (temperature <= 100) {
      tempPerceptionFactor = 1.0;
      concentrationFactor = 1.0 + ((temperature - 85) / 15) * 0.05; // slight water loss
    } else if (temperature <= 180) {
      tempPerceptionFactor = 0.95;
      concentrationFactor = 1.05 + ((temperature - 100) / 80) * 0.15; // 1.05 -> 1.20 concentration
    } else {
      // Wok Hei zone: rapid water flash-off concentrates solutes
      tempPerceptionFactor = 0.92;
      concentrationFactor = 1.20 + ((temperature - 180) / 80) * 0.12; // 1.20 -> 1.32
    }

    // 2. Nucleotide thermal preservation (5'-IMP & 5'-GMP degradation curve)
    // Ribonucleotides are stable up to 100°C in standard rapid cooking (95-99%).
    // Long holding at >120°C in dry heat causes gradual hydrolysis.
    let nucleotideStabilityPercent = 100;
    if (temperature > 100 && temperature <= 180) {
      nucleotideStabilityPercent = Math.max(88, 100 - ((temperature - 100) / 80) * 8);
    } else if (temperature > 180) {
      // In wok cooking, brief flash contact (3-5s) preserves 90-95%
      nucleotideStabilityPercent = Math.max(85, 92 - ((temperature - 180) / 80) * 6);
    }

    // 3. Effective Yamaguchi synergy multiplier at this temperature
    const effectiveMultiplier = Math.round(
      baseMultiplier * (nucleotideStabilityPercent / 100) * concentrationFactor * 10
    ) / 10;

    // 4. Perceived umami score at this temperature
    const effectiveUmamiScore = Math.min(
      10,
      Math.round(baseScore * tempPerceptionFactor * concentrationFactor * 10) / 10
    );

    // 5. Maillard / Volatilization Reaction Index (0 to 100%)
    let maillardIndex = 0;
    if (temperature < 100) {
      maillardIndex = Math.max(0, Math.round((temperature / 100) * 8));
    } else if (temperature <= 140) {
      maillardIndex = Math.round(8 + ((temperature - 100) / 40) * 27); // 8% -> 35%
    } else if (temperature <= 190) {
      maillardIndex = Math.round(35 + ((temperature - 140) / 50) * 45); // 35% -> 80%
    } else {
      maillardIndex = Math.min(100, Math.round(80 + ((temperature - 190) / 70) * 20)); // 80% -> 100% (Wok Hei)
    }

    // 6. Starch Gelatinization & Viscosity Index (0 to 100%)
    let starchGelatinization = 0;
    if (temperature < 58) {
      starchGelatinization = Math.round((temperature / 58) * 5);
    } else if (temperature <= 72) {
      // Sharp sigmoid around 65°C
      starchGelatinization = Math.round(5 + ((temperature - 58) / 14) * 75); // 5% -> 80%
    } else if (temperature <= 105) {
      starchGelatinization = Math.round(80 + ((temperature - 72) / 33) * 20); // 80% -> 100%
    } else {
      // Slight thermal shear-thinning at extreme pan temperatures
      starchGelatinization = Math.max(85, Math.round(100 - ((temperature - 105) / 155) * 12));
    }

    return {
      effectiveMultiplier,
      effectiveUmamiScore,
      nucleotideStabilityPercent: Math.round(nucleotideStabilityPercent),
      maillardIndex,
      starchGelatinization,
      tempPerceptionFactor: Math.round(tempPerceptionFactor * 100) / 100,
      concentrationFactor: Math.round(concentrationFactor * 100) / 100
    };
  }, [temperature, tasteProfile]);

  // Ingredient Behavior Table at current temperature
  const ingredientResponses = useMemo(() => {
    return ingredients.map(item => {
      const ing = pantryMap.get(item.ingredientId);
      if (!ing) return null;

      let stateBadge = 'Пассивен';
      let stateColor = 'bg-white/[0.04] text-zinc-400 border-white/[0.08]';
      let description = 'Холодное растворение в водной матрице.';

      if (ing.id === 'pixian_doubanjiang') {
        if (temperature < 60) {
          description = 'Ферментированные бобы и чили сохраняют пастообразную текстуру; капсантин заперт в матрице.';
        } else if (temperature < 140) {
          stateBadge = 'Экстракция пигмента';
          stateColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          description = 'Каротиноиды (капсантин) начинают окрашивать масло в красный цвет (Hongyou).';
        } else {
          stateBadge = 'Пик ароматики (Baoguo)';
          stateColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
          description = 'Мгновенный выброс пиразинов и летучих эфиров. Обжаривать 20-30 сек до появления красного масла.';
        }
      } else if (ing.id === 'light_soy_sauce' || ing.id === 'dark_soy_sauce') {
        if (temperature < 90) {
          description = 'Прямой источник свободного L-глутамата и NaCl.';
        } else if (temperature < 160) {
          stateBadge = 'Равномерное глазирование';
          stateColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          description = 'Растворение в соусе, связывание с гидролизованными белками.';
        } else {
          stateBadge = 'Guobianjiang (锅边酱)';
          stateColor = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
          description = 'Ввод по раскаленным стенкам вока: микро-карамелизация аминокислот с дымным шлейфом.';
        }
      } else if (ing.id === 'potato_starch') {
        if (temperature < 60) {
          description = 'Суспензия взвешена в холодной воде. Гранулы амилозы не набухают.';
        } else if (temperature < 80) {
          stateBadge = 'Клейстеризация (Gouqian)';
          stateColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
          description = 'Резкое набухание гранул, образование прозрачной шелковистой сетки (вязкость ×5).';
        } else {
          stateBadge = 'Стабильный глянец';
          stateColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
          description = 'Глянцевая эмульсия, обволакивающая кусочки продукта защитным слоем.';
        }
      } else if (ing.id === 'shaoxing_wine') {
        if (temperature < 78) {
          description = 'Этанол связывает летучие гидрофобные компоненты; деликатная кислинка.';
        } else {
          stateBadge = 'Испарение этанола';
          stateColor = 'bg-orange-500/10 text-orange-300 border-orange-500/20';
          description = 'Спирт выкипает (Tкип = 78.3°C), оставляя аминокислоты, сахара и богатую янтарную кислоту.';
        }
      } else if (ing.id === 'dried_shiitake_powder' || ing.id === 'tianmianjiang') {
        if (temperature >= 55 && temperature <= 75) {
          stateBadge = 'Ферментативный оптимум GMP';
          stateColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
          description = 'Пик энзиматического образования 5\'-гуанилата. Сильнейшая синергия с L-глутаматом.';
        } else if (temperature > 160) {
          stateBadge = 'Ароматический пиролиз';
          stateColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          description = 'Глубокий орехово-грибной аромат, стабильность глутамата.';
        } else {
          description = 'Стабильный источник 5\'-GMP и кокуми-пептидов.';
        }
      } else if (ing.id === 'sesame_oil') {
        if (temperature > 150) {
          stateBadge = '⚠️ Деградация аромата';
          stateColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          description = 'Сезамол и тонкие ароматические терпены выгорают при нагреве. Добавлять ТОЛЬКО off-heat!';
        } else {
          stateBadge = 'Mingyou (Финишный глянец)';
          stateColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
          description = 'Создает зеркальный блеск и обволакивающий липидный барьер для рецепторов.';
        }
      } else {
        if (temperature > 140 && ing.category === 'aromatics') {
          stateBadge = 'Активный Baoguo';
          stateColor = 'bg-orange-500/10 text-orange-300 border-orange-500/20';
          description = 'Быстрая экстракция эфирных масел (аллицин, гингерол) в жировую среду.';
        }
      }

      return {
        id: ing.id,
        name: ing.name,
        chineseName: ing.chineseName,
        category: ing.category,
        stateBadge,
        stateColor,
        description
      };
    }).filter(Boolean);
  }, [ingredients, pantryMap, temperature]);

  // Curve Generation for SVG (Temperature 4°C to 250°C)
  const chartWidth = 560;
  const chartHeight = 180;
  const chartPadding = { top: 15, right: 15, bottom: 25, left: 35 };
  const innerW = chartWidth - chartPadding.left - chartPadding.right;
  const innerH = chartHeight - chartPadding.top - chartPadding.bottom;

  const tempToX = (t: number) => chartPadding.left + ((t - 4) / (250 - 4)) * innerW;

  // Generate curves
  const numSteps = 50;
  const curvePoints = useMemo(() => {
    const pts = [];
    const baseMult = tasteProfile.synergyMultiplier || 1.0;

    for (let i = 0; i <= numSteps; i++) {
      const t = 4 + (i / numSteps) * (250 - 4);
      
      // Multiplier model
      let stab = 1.0;
      let conc = 1.0;
      if (t > 100 && t <= 180) {
        stab = 1.0 - ((t - 100) / 80) * 0.08;
        conc = 1.05 + ((t - 100) / 80) * 0.15;
      } else if (t > 180) {
        stab = 0.92 - ((t - 180) / 70) * 0.06;
        conc = 1.20 + ((t - 180) / 70) * 0.12;
      }
      const mult = baseMult * stab * conc;

      // Maillard model (0 to 100)
      let mail = 0;
      if (t >= 100 && t <= 140) mail = 8 + ((t - 100) / 40) * 27;
      else if (t > 140 && t <= 190) mail = 35 + ((t - 140) / 50) * 45;
      else if (t > 190) mail = 80 + ((t - 190) / 60) * 20;

      // Starch model (0 to 100)
      let starch = 0;
      if (t < 58) starch = (t / 58) * 5;
      else if (t <= 72) starch = 5 + ((t - 58) / 14) * 75;
      else if (t <= 105) starch = 80 + ((t - 72) / 33) * 20;
      else starch = Math.max(85, 100 - ((t - 105) / 145) * 12);

      // Stability model (100 to 85)
      const stabPct = stab * 100;

      pts.push({ t, mult, mail, starch, stabPct });
    }
    return pts;
  }, [tasteProfile]);

  // Scales for SVG
  const maxMultiplierDisplay = Math.max(10, (tasteProfile.synergyMultiplier || 1) * 1.5);
  const multToY = (v: number) => chartPadding.top + innerH - (Math.min(maxMultiplierDisplay, v) / maxMultiplierDisplay) * innerH;
  const pctToY = (pct: number) => chartPadding.top + innerH - (pct / 100) * innerH;

  const synergySvgPath = curvePoints.map((pt, idx) => {
    const x = tempToX(pt.t);
    const y = multToY(pt.mult);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const maillardSvgPath = curvePoints.map((pt, idx) => {
    const x = tempToX(pt.t);
    const y = pctToY(pt.mail);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const starchSvgPath = curvePoints.map((pt, idx) => {
    const x = tempToX(pt.t);
    const y = pctToY(pt.starch);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const stabilitySvgPath = curvePoints.map((pt, idx) => {
    const x = tempToX(pt.t);
    const y = pctToY(pt.stabPct);
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const currentX = tempToX(temperature);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-sm sm:text-base text-white">
                  Температурный профиль & Термодинамика Умами
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] hidden sm:inline">
                  4°C — 250°C
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Моделирование синергии Ямагучи, реакции Майяра, клейстеризации крахмала и Wok Hei
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            id="close-temp-profile-modal-btn"
            className="p-1.5 rounded-md text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          
          {/* Main Temperature Controller Box */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                  Активный температурный режим
                </span>
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {temperature}°C
                  </span>
                  <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${currentZone.badgeColor}`}>
                    {currentZone.name}
                  </span>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { temp: 15, label: '❄️ 15°C', name: 'Холодный' },
                  { temp: 65, label: '♨️ 65°C', name: 'Инфузия' },
                  { temp: 95, label: '🍲 95°C', name: 'Томление' },
                  { temp: 160, label: '🍳 160°C', name: 'Майяр' },
                  { temp: 230, label: '⚡ 230°C', name: 'Wok Hei' }
                ].map(p => (
                  <button
                    key={p.temp}
                    onClick={() => setTemperature(p.temp)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                      temperature === p.temp
                        ? 'bg-white/[0.16] text-white border border-white/[0.25]'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>4°C (Холодная мацерация)</span>
                <span>65°C (Gouqian)</span>
                <span>100°C (Кипение)</span>
                <span>160°C (Майяр)</span>
                <span>250°C (Вок-бласт)</span>
              </div>
              <input
                type="range"
                min="4"
                max="250"
                step="1"
                value={temperature}
                onChange={(e) => setTemperature(parseInt(e.target.value))}
                id="interactive-temperature-slider"
                className="w-full accent-rose-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />
            </div>

            {/* Zone Biochemical Summary Callout */}
            <div className="p-3 rounded-lg bg-[#0C0E14] border border-white/[0.06] flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-white text-xs">
                    {currentZone.chineseTerm}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    · {currentZone.pinyin}
                  </span>
                </div>
                <p className="text-zinc-300 mt-1 leading-relaxed text-[11px]">
                  {currentZone.biochemistrySummary}
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Dynamic Kinetic Telemetry Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1: Effective Synergy Multiplier */}
            <div className="rounded-xl bg-[#0C0E14] border border-white/[0.08] p-3 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Действующая синергия
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono text-lg font-bold text-rose-400">
                  {thermoMetrics.effectiveMultiplier}×
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  (база: {tasteProfile.synergyMultiplier}×)
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Концентрация умами: {thermoMetrics.concentrationFactor}×
              </p>
            </div>

            {/* Metric 2: Maillard Volatiles Index */}
            <div className="rounded-xl bg-[#0C0E14] border border-white/[0.08] p-3 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Ароматы Майяра / Wok Hei
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono text-lg font-bold text-orange-400">
                  {thermoMetrics.maillardIndex}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  интенсивность
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {temperature >= 180 ? 'Пиролиз & дымный шлейф' : temperature >= 140 ? 'Карамелизация сахаров' : 'Минимальный синтез'}
              </p>
            </div>

            {/* Metric 3: Starch Gelatinization */}
            <div className="rounded-xl bg-[#0C0E14] border border-white/[0.08] p-3 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Клейстеризация (Gouqian)
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {thermoMetrics.starchGelatinization}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  глянец
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {temperature >= 68 ? 'Шелковистая сетка активна' : 'Гранулы в суспензии'}
              </p>
            </div>

            {/* Metric 4: 5'-Nucleotide Stability */}
            <div className="rounded-xl bg-[#0C0E14] border border-white/[0.08] p-3 space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                Сохранность IMP/GMP
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-mono text-lg font-bold text-cyan-400">
                  {thermoMetrics.nucleotideStabilityPercent}%
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  стабильность
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {thermoMetrics.nucleotideStabilityPercent > 92 ? 'Нуклеотидный остов цел' : 'Незначительный гидролиз'}
              </p>
            </div>
          </div>

          {/* Dynamic Thermodynamic SVG Curve */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-medium text-xs text-white">
                  Термодинамическая кривая фазовых переходов
                </span>
              </div>

              {/* Metric Legend Toggles */}
              <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                <button
                  onClick={() => setActiveMetricTab('synergy')}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center space-x-1 ${
                    activeMetricTab === 'synergy'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
                  <span>Синергия</span>
                </button>
                <button
                  onClick={() => setActiveMetricTab('maillard')}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center space-x-1 ${
                    activeMetricTab === 'maillard'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                  <span>Майяр</span>
                </button>
                <button
                  onClick={() => setActiveMetricTab('viscosity')}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center space-x-1 ${
                    activeMetricTab === 'viscosity'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  <span>Крахмал</span>
                </button>
                <button
                  onClick={() => setActiveMetricTab('stability')}
                  className={`px-2 py-0.5 rounded-md transition-all flex items-center space-x-1 ${
                    activeMetricTab === 'stability'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                  <span>Нуклеотиды</span>
                </button>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                className="w-full h-44 select-none"
              >
                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
                  const y = chartPadding.top + innerH * (1 - frac);
                  return (
                    <g key={i}>
                      <line 
                        x1={chartPadding.left} 
                        y1={y} 
                        x2={chartWidth - chartPadding.right} 
                        y2={y} 
                        stroke="rgba(255, 255, 255, 0.05)" 
                        strokeDasharray="3 3"
                      />
                    </g>
                  );
                })}

                {/* Vertical Temperature Milestone Guides */}
                {[65, 100, 160, 220].map((tVal) => {
                  const x = tempToX(tVal);
                  return (
                    <g key={tVal}>
                      <line
                        x1={x}
                        y1={chartPadding.top}
                        x2={x}
                        y2={chartPadding.top + innerH}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="2 2"
                      />
                      <text
                        x={x}
                        y={chartHeight - 8}
                        fill="#71717A"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {tVal}°C
                      </text>
                    </g>
                  );
                })}

                {/* Curves */}
                {/* Maillard Curve */}
                <path
                  d={maillardSvgPath}
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth={activeMetricTab === 'maillard' ? '2.5' : '1.2'}
                  strokeOpacity={activeMetricTab === 'maillard' ? '1.0' : '0.4'}
                  strokeLinecap="round"
                />

                {/* Starch Gouqian Curve */}
                <path
                  d={starchSvgPath}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth={activeMetricTab === 'viscosity' ? '2.5' : '1.2'}
                  strokeOpacity={activeMetricTab === 'viscosity' ? '1.0' : '0.4'}
                  strokeLinecap="round"
                />

                {/* Nucleotide Stability Curve */}
                <path
                  d={stabilitySvgPath}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth={activeMetricTab === 'stability' ? '2.5' : '1.2'}
                  strokeOpacity={activeMetricTab === 'stability' ? '1.0' : '0.3'}
                  strokeDasharray="4 2"
                />

                {/* Synergy Multiplier Curve (Primary Highlight) */}
                <path
                  d={synergySvgPath}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth={activeMetricTab === 'synergy' ? '3' : '1.8'}
                  strokeOpacity={activeMetricTab === 'synergy' ? '1.0' : '0.6'}
                  strokeLinecap="round"
                />

                {/* Active Temperature Crosshair Indicator */}
                <line
                  x1={currentX}
                  y1={chartPadding.top}
                  x2={currentX}
                  y2={chartPadding.top + innerH}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />

                <circle
                  cx={currentX}
                  cy={
                    activeMetricTab === 'synergy' 
                      ? multToY(thermoMetrics.effectiveMultiplier)
                      : activeMetricTab === 'maillard'
                      ? pctToY(thermoMetrics.maillardIndex)
                      : activeMetricTab === 'viscosity'
                      ? pctToY(thermoMetrics.starchGelatinization)
                      : pctToY(thermoMetrics.nucleotideStabilityPercent)
                  }
                  r="4.5"
                  fill="#F43F5E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* Y-axis labels */}
                <text x="5" y={chartPadding.top + 10} fill="#71717A" fontSize="9" fontFamily="monospace">
                  Max
                </text>
                <text x="5" y={chartPadding.top + innerH} fill="#71717A" fontSize="9" fontFamily="monospace">
                  0
                </text>
              </svg>
            </div>
          </div>

          {/* Ingredient Response Matrix at Current Temperature */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                Поведение компонентов рецепта при {temperature}°C ({ingredientResponses.length})
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Фазовые реакции
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ingredientResponses.map(item => {
                if (!item) return null;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-[#0C0E14] border border-white/[0.06] flex flex-col justify-between space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="font-medium text-xs text-white truncate">{item.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 truncate">{item.chineseName}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md border shrink-0 ${item.stateColor}`}>
                        {item.stateBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Master Chef Thermodynamic Rules */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <span className="text-[10px] font-mono text-amber-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" />
              Золотые правила термодинамики китайского вока:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
                <span className="font-mono text-rose-400 font-medium text-[10px] block">
                  1. GUOBIANJIANG (Ввод по стенкам):
                </span>
                <p className="text-zinc-400">
                  Соевые соусы и рисовое вино вводятся по раскаленным стенкам вока (180–220°C). Мгновенный контакт запускает реакцию Майяра без пережигания соуса.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
                <span className="font-mono text-emerald-400 font-medium text-[10px] block">
                  2. GOUQIAN (Крахмальное окно):
                </span>
                <p className="text-zinc-400">
                  Крахмальную суспензию вводят круговыми движениями при умеренном кипении (85–95°C), чтобы амилоза равномерно связала свободные умами-жидкости.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
                <span className="font-mono text-amber-400 font-medium text-[10px] block">
                  3. MINGYOU (Финишный блеск):
                </span>
                <p className="text-zinc-400">
                  Кунжутное или чесночное масло вводится строго после выключения огня (off-heat), чтобы не разрушить летучие сесквитерпены и сезамол.
                </p>
              </div>
              <div className="p-2 rounded-lg bg-black/40 border border-white/[0.04] space-y-1">
                <span className="font-mono text-cyan-400 font-medium text-[10px] block">
                  4. ТЕМПЕРАТУРА ПОДАЧИ (50–60°C):
                </span>
                <p className="text-zinc-400">
                  Хотя вок разогревается до 240°C, вкусовые рецепторы T1R1/T1R3 достигают максимума чувствительности при температуре блюда 50–60°C.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
          <span className="text-[10px] font-mono text-zinc-500">
            Основано на моделировании кинетики Yamaguchi & Ninomiya (2000)
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-medium border border-white/[0.1] transition-all"
          >
            Закрыть профиль
          </button>
        </div>
      </div>
    </div>
  );
};
