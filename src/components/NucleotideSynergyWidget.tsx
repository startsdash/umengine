import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TasteProfile, RecipeIngredient, PantryIngredient } from '../types';
import { 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Scale, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Info
} from 'lucide-react';

interface NucleotideSynergyWidgetProps {
  tasteProfile: TasteProfile;
  ingredients: RecipeIngredient[];
  pantryList: PantryIngredient[];
}

export const NucleotideSynergyWidget: React.FC<NucleotideSynergyWidgetProps> = ({
  tasteProfile,
  ingredients,
  pantryList
}) => {
  const pantryMap = useMemo(() => {
    const map = new Map<string, PantryIngredient>();
    pantryList.forEach(p => map.set(p.id, p));
    return map;
  }, [pantryList]);

  // Breakdown of glutamate vs nucleotide contributors
  const breakdown = useMemo(() => {
    let gluSources: { name: string; amountMg: number; pct: number }[] = [];
    let nucSources: { name: string; amountMg: number; pct: number; type: string }[] = [];

    let totalGlu = 0;
    let totalNuc = 0;

    ingredients.forEach(item => {
      const ing = pantryMap.get(item.ingredientId);
      if (!ing) return;

      // Weight conversion
      let weightG = item.amount;
      if (item.unit === 'ml') weightG = item.amount * (ing.density || 1.0);
      else if (item.unit === 'tsp') weightG = item.amount * 5 * (ing.density || 1.0);
      else if (item.unit === 'tbsp') weightG = item.amount * 15 * (ing.density || 1.0);
      else if (item.unit === 'cloves') weightG = item.amount * 4;
      else if (item.unit === 'pcs') weightG = item.amount * 10;

      const glu = (weightG / 100) * (ing.freeGlutamate || 0);
      const imp = (weightG / 100) * (ing.imp || 0);
      const gmp = (weightG / 100) * (ing.gmp || 0);
      const amp = (weightG / 100) * (ing.amp || 0);
      const nuc = imp + gmp + amp;

      if (glu > 0.1) {
        gluSources.push({ name: ing.name.split(' ')[0], amountMg: glu, pct: 0 });
        totalGlu += glu;
      }
      if (nuc > 0.05) {
        let typeStr = [];
        if (gmp > 0.1) typeStr.push('GMP');
        if (imp > 0.1) typeStr.push('IMP');
        if (amp > 0.1) typeStr.push('AMP');
        nucSources.push({ 
          name: ing.name.split(' ')[0], 
          amountMg: nuc, 
          pct: 0,
          type: typeStr.join('+') || 'Ribotides'
        });
        totalNuc += nuc;
      }
    });

    // Compute percentages
    gluSources = gluSources.map(s => ({ ...s, pct: totalGlu > 0 ? (s.amountMg / totalGlu) * 100 : 0 }));
    nucSources = nucSources.map(s => ({ ...s, pct: totalNuc > 0 ? (s.amountMg / totalNuc) * 100 : 0 }));

    return { gluSources, nucSources, totalGlu, totalNuc };
  }, [ingredients, pantryMap]);

  const u = tasteProfile.glutamateConcentrationPercent; // g/dL
  const v = tasteProfile.nucleotideConcentrationPercent; // g/dL
  const multiplier = tasteProfile.synergyMultiplier;
  const ratio = tasteProfile.nucleotideToGlutamateRatio; // v/u

  // Biochemical State Classification (Enhancement vs Inhibition vs Imbalance)
  const status = useMemo(() => {
    if (u === 0 && v === 0) {
      return {
        type: 'neutral' as const,
        label: 'НЕТ УМАМИ-АКТИВАТОРОВ',
        color: 'text-zinc-400',
        bg: 'bg-zinc-900/80',
        border: 'border-zinc-800',
        icon: <Minus className="w-4 h-4 text-zinc-400" />,
        desc: 'Добавьте соевый соус, доубанцзян, комбу или грибы шиитаке для запуска рецепторного связывания.',
        deltaTag: '1.0× Базовый',
        scoreColor: 'text-zinc-400'
      };
    }

    if (u > 0 && v === 0) {
      return {
        type: 'isolated' as const,
        label: 'ИЗОЛИРОВАННЫЙ ГЛУТАМАТ (БЕЗ СИНЕРГИИ)',
        color: 'text-amber-400',
        bg: 'bg-amber-950/20',
        border: 'border-amber-700/50',
        icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
        desc: 'Свободный глутамат присутствует, но T1R1 не активирован аллостерически. Добавьте IMP/GMP (грибы шиитаке, Ribotide E635, Цзицзин) для взрывного усиления в 4-8×.',
        deltaTag: '1.0× Линейный',
        scoreColor: 'text-amber-400'
      };
    }

    if (u === 0 && v > 0) {
      return {
        type: 'dormant' as const,
        label: 'СПЯЩИЕ НУКЛЕОТИДЫ (НУЖЕН ГЛУТАМАТ)',
        color: 'text-amber-300',
        bg: 'bg-amber-950/20',
        border: 'border-amber-700/50',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        desc: 'Рибонуклеотиды сами по себе не имеют выраженного вкуса без глутамата-партнера. Добавьте соевый соус, комбу или MSG.',
        deltaTag: 'Спящий потенциал',
        scoreColor: 'text-amber-300'
      };
    }

    // Ratio checks
    // Ideal ratio v:u is ~ 1:1 up to 1:10 (0.1 to 1.0)
    // Inhibition occurs when nucleotides excessively exceed glutamate (> 2:1) causing metallic bitterness, or saturation above 0.8 g/dL
    if (v > u * 2.5 && v > 0.05) {
      return {
        type: 'inhibition' as const,
        label: 'ИНГИБИРОВАНИЕ / ПЕРЕНАСЫЩЕНИЕ НУКЛЕОТИДАМИ',
        color: 'text-rose-400',
        bg: 'bg-rose-950/30',
        border: 'border-rose-600/60',
        icon: <TrendingDown className="w-4 h-4 text-rose-400" />,
        desc: 'Критический дисбаланс: избыток рибонуклеотидов при недостатке глутамата может вызывать металлический/вяжущий привкус и десенситизацию рецепторов. Сбалансируйте соевым соусом или снизьте Ribotide.',
        deltaTag: 'Десенситизация T1R1',
        scoreColor: 'text-rose-400'
      };
    }

    if (u > 0.8) {
      return {
        type: 'saturated' as const,
        label: 'ПЛАТО НАСЫЩЕНИЯ РЕЦЕПТОРА (>0.8 г/дл)',
        color: 'text-amber-400',
        bg: 'bg-amber-950/20',
        border: 'border-amber-700/50',
        icon: <Activity className="w-4 h-4 text-amber-400" />,
        desc: 'Концентрация глутамата достигла зоны насыщения papillae. Дальнейшее добавление не увеличивает интенсивность, лучше разбавить бульоном или водой.',
        deltaTag: 'Плато Вебера-Фехнера',
        scoreColor: 'text-amber-400'
      };
    }

    if (multiplier >= 4.0) {
      return {
        type: 'optimal' as const,
        label: 'ЭКСТРЕМАЛЬНОЕ УСИЛЕНИЕ (GOLDEN SYNERGY)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/25',
        border: 'border-emerald-500/50',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        desc: `Аллостерический замок T1R1/T1R3 зафиксирован. Воспринимаемый умами усилен в ${multiplier}× раз, эквивалентно ${(tasteProfile.equivalentMsgConcentrationGPerDl * 10).toFixed(1)} г/л чистого MSG.`,
        deltaTag: `+${((multiplier - 1) * 100).toFixed(0)}% Enhancement`,
        scoreColor: 'text-emerald-300'
      };
    }

    return {
      type: 'moderate' as const,
      label: 'УМЕРЕННАЯ СИНЕРГИЯ УСИЛЕНИЯ',
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/20',
      border: 'border-cyan-700/40',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      desc: `Вкусовая связка работает стабильно (${multiplier}×). Для перехода в зону максимального раскрытия увеличьте долю шиитаке или порошка комбу.`,
      deltaTag: `+${((multiplier - 1) * 100).toFixed(0)}% Boost`,
      scoreColor: 'text-cyan-300'
    };
  }, [u, v, multiplier, tasteProfile]);

  // Balance meter (0 to 100%)
  const balancePercent = useMemo(() => {
    if (u === 0 && v === 0) return 0;
    // Ideal ratio v/(u+v) is 0.5 (50%), or scaled up to 100% on meter
    const total = u + v;
    if (total === 0) return 0;
    const ratioNuc = v / total;
    // Bell curve around 0.5
    const distFromOptimum = Math.abs(ratioNuc - 0.5); // 0 (best) to 0.5 (worst)
    return Math.max(5, Math.min(100, (1 - distFromOptimum * 2) * 100));
  }, [u, v]);

  return (
    <div className={`border rounded-2xl p-4 transition-all duration-300 ${status.bg} ${status.border} shadow-lg relative overflow-hidden`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            {status.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white tracking-wide">
                КОЭФФИЦИЕНТ СИНЕРГИИ НУКЛЕОТИДОВ
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                status.type === 'inhibition' 
                  ? 'bg-rose-900/80 text-rose-200 border border-rose-700' 
                  : status.type === 'optimal'
                  ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                  : 'bg-zinc-800 text-zinc-300'
              }`}>
                {status.deltaTag}
              </span>
            </div>
            <span className={`text-[11px] font-semibold ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Real-time Multiplier Badge */}
        <div className="flex items-baseline space-x-1.5 self-start sm:self-auto bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">Множитель:</span>
          <motion.span 
            key={multiplier}
            initial={{ scale: 1.3, color: '#F43F5E' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.3 }}
            className={`font-mono text-base font-black ${status.scoreColor}`}
          >
            {multiplier.toFixed(1)}×
          </motion.span>
          <span className="text-[10px] font-mono text-zinc-500">Yamaguchi</span>
        </div>
      </div>

      {/* Main Interactive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
        {/* Metric 1: Glutamate Pool */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">L-Глутамат [u]</span>
            <span className="font-mono font-bold text-rose-400">
              {(tasteProfile.glutamateMgTotal).toFixed(0)} мг ({u.toFixed(3)} г/дл)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden my-1.5">
            <motion.div 
              className="bg-rose-500 h-full rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, (u / 0.5) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 truncate">
            Источники: {breakdown.gluSources.slice(0, 2).map(s => `${s.name} (${s.pct.toFixed(0)}%)`).join(', ') || 'нет'}
          </div>
        </div>

        {/* Metric 2: Nucleotide Pool */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">5'-Нуклеотиды [v]</span>
            <span className="font-mono font-bold text-amber-400">
              {(tasteProfile.nucleotidesMgTotal).toFixed(1)} мг ({v.toFixed(3)} г/дл)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden my-1.5">
            <motion.div 
              className="bg-amber-500 h-full rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, (v / 0.05) * 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 truncate">
            {breakdown.nucSources.length > 0 
              ? breakdown.nucSources.slice(0, 2).map(s => `${s.name} [${s.type}]`).join(', ')
              : 'Шиитаке / Цзицзин / Ribotide не добавлены'}
          </div>
        </div>

        {/* Metric 3: Synergistic Balance Meter */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Баланс связывания T1R1</span>
            <span className={`font-mono font-bold ${balancePercent >= 70 ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {balancePercent.toFixed(0)}% Оптимума
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden my-1.5">
            <motion.div 
              className={`h-full rounded-full ${
                status.type === 'inhibition' ? 'bg-rose-500' : balancePercent >= 70 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              initial={false}
              animate={{ width: `${balancePercent}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Пропорция u:v</span>
            <span className="font-mono text-zinc-300">
              1 : {u > 0 ? (v / u).toFixed(2) : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Biochemical Insight & Recommendation */}
      <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          {status.desc}
        </p>
      </div>
    </div>
  );
};
