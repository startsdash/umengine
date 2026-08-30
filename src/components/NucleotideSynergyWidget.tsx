import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { TasteProfile, RecipeIngredient, PantryIngredient } from '../types';
import { 
  Zap, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
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

    gluSources = gluSources.map(s => ({ ...s, pct: totalGlu > 0 ? (s.amountMg / totalGlu) * 100 : 0 }));
    nucSources = nucSources.map(s => ({ ...s, pct: totalNuc > 0 ? (s.amountMg / totalNuc) * 100 : 0 }));

    return { gluSources, nucSources, totalGlu, totalNuc };
  }, [ingredients, pantryMap]);

  const u = tasteProfile.glutamateConcentrationPercent; // g/dL
  const v = tasteProfile.nucleotideConcentrationPercent; // g/dL
  const multiplier = tasteProfile.synergyMultiplier;

  // Biochemical State Classification
  const status = useMemo(() => {
    if (u === 0 && v === 0) {
      return {
        type: 'neutral' as const,
        label: 'Нет умами-активаторов',
        color: 'text-zinc-400',
        badgeBg: 'bg-white/[0.04] text-zinc-400 border-white/[0.08]',
        icon: <Minus className="w-3.5 h-3.5 text-zinc-400" />,
        desc: 'Добавьте соевый соус, доубанцзян, комбу или грибы шиитаке для запуска рецепторного связывания.',
        deltaTag: '1.0× Базовый',
        scoreColor: 'text-zinc-400'
      };
    }

    if (u > 0 && v === 0) {
      return {
        type: 'isolated' as const,
        label: 'Изолированный глутамат (без синергии)',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        icon: <TrendingUp className="w-3.5 h-3.5 text-amber-400" />,
        desc: 'Свободный глутамат присутствует, но T1R1 не активирован аллостерически. Добавьте IMP/GMP (шиитаке, Ribotide, Цзицзин) для усиления в 4-8×.',
        deltaTag: '1.0× Линейный',
        scoreColor: 'text-amber-400'
      };
    }

    if (u === 0 && v > 0) {
      return {
        type: 'dormant' as const,
        label: 'Спящие нуклеотиды (нужен глутамат)',
        color: 'text-amber-300',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        desc: 'Рибонуклеотиды не имеют выраженного вкуса без глутамата-партнера. Добавьте соевый соус, комбу или MSG.',
        deltaTag: 'Спящий потенциал',
        scoreColor: 'text-amber-300'
      };
    }

    if (v > u * 2.5 && v > 0.05) {
      return {
        type: 'inhibition' as const,
        label: 'Ингибирование / избыток нуклеотидов',
        color: 'text-rose-400',
        badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: <TrendingDown className="w-3.5 h-3.5 text-rose-400" />,
        desc: 'Избыток рибонуклеотидов при дефиците глутамата может вызывать металлический привкус и десенситизацию T1R1.',
        deltaTag: 'Десенситизация T1R1',
        scoreColor: 'text-rose-400'
      };
    }

    if (u > 0.8) {
      return {
        type: 'saturated' as const,
        label: 'Плато насыщения (>0.8 г/дл)',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        icon: <Activity className="w-3.5 h-3.5 text-amber-400" />,
        desc: 'Концентрация глутамата достигла зоны насыщения papillae. Дальнейшее добавление не увеличивает интенсивность.',
        deltaTag: 'Плато Вебера-Фехнера',
        scoreColor: 'text-amber-400'
      };
    }

    if (multiplier >= 4.0) {
      return {
        type: 'optimal' as const,
        label: 'Аллостерический замок (Golden Synergy)',
        color: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
        desc: `Комплекс T1R1/T1R3 зафиксирован. Воспринимаемый умами усилен в ${multiplier}× раз (экв. ${(tasteProfile.equivalentMsgConcentrationGPerDl * 10).toFixed(1)} г/л MSG).`,
        deltaTag: `+${((multiplier - 1) * 100).toFixed(0)}% Boost`,
        scoreColor: 'text-emerald-400'
      };
    }

    return {
      type: 'moderate' as const,
      label: 'Умеренное синергетическое усиление',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      icon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
      desc: `Вкусовая связка работает стабильно (${multiplier}×). Для перехода в зону максимального раскрытия добавьте шиитаке или комбу.`,
      deltaTag: `+${((multiplier - 1) * 100).toFixed(0)}% Boost`,
      scoreColor: 'text-cyan-400'
    };
  }, [u, v, multiplier, tasteProfile]);

  // Balance meter (0 to 100%)
  const balancePercent = useMemo(() => {
    if (u === 0 && v === 0) return 0;
    const total = u + v;
    if (total === 0) return 0;
    const ratioNuc = v / total;
    const distFromOptimum = Math.abs(ratioNuc - 0.5);
    return Math.max(5, Math.min(100, (1 - distFromOptimum * 2) * 100));
  }, [u, v]);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-3 sm:p-4 backdrop-blur-xl space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            {status.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-semibold text-white tracking-tight uppercase">
                Синергия нуклеотидов
              </span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${status.badgeBg}`}>
                {status.deltaTag}
              </span>
            </div>
            <span className={`text-[11px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Multiplier Badge */}
        <div className="flex items-baseline space-x-1.5 self-start sm:self-auto bg-black/40 px-2.5 py-1 rounded-lg border border-white/[0.08]">
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Множитель:</span>
          <motion.span 
            key={multiplier}
            initial={{ scale: 1.2, color: '#F43F5E' }}
            animate={{ scale: 1, color: '#FFFFFF' }}
            transition={{ duration: 0.2 }}
            className={`font-mono text-sm font-bold ${status.scoreColor}`}
          >
            {multiplier.toFixed(1)}×
          </motion.span>
          <span className="text-[10px] font-mono text-zinc-500">Yamaguchi</span>
        </div>
      </div>

      {/* Main Interactive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Metric 1: Glutamate Pool */}
        <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px] font-medium">L-Глутамат [u]</span>
            <span className="font-mono font-semibold text-rose-400 text-xs">
              {(tasteProfile.glutamateMgTotal).toFixed(0)} мг
            </span>
          </div>
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden my-2 border border-white/[0.04]">
            <motion.div 
              className="bg-rose-500 h-full rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, (u / 0.5) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 truncate font-mono">
            {breakdown.gluSources.slice(0, 2).map(s => `${s.name} (${s.pct.toFixed(0)}%)`).join(', ') || 'нет источников'}
          </div>
        </div>

        {/* Metric 2: Nucleotide Pool */}
        <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px] font-medium">5'-Нуклеотиды [v]</span>
            <span className="font-mono font-semibold text-amber-400 text-xs">
              {(tasteProfile.nucleotidesMgTotal).toFixed(1)} мг
            </span>
          </div>
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden my-2 border border-white/[0.04]">
            <motion.div 
              className="bg-amber-500 h-full rounded-full"
              initial={false}
              animate={{ width: `${Math.min(100, (v / 0.05) * 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 truncate font-mono">
            {breakdown.nucSources.length > 0 
              ? breakdown.nucSources.slice(0, 2).map(s => `${s.name} [${s.type}]`).join(', ')
              : 'Шиитаке / Цзицзин не добавлены'}
          </div>
        </div>

        {/* Metric 3: Synergistic Balance Meter */}
        <div className="bg-[#0C0E14] border border-white/[0.06] rounded-lg p-2.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 text-[11px] font-medium">Баланс T1R1</span>
            <span className={`font-mono font-semibold text-xs ${balancePercent >= 70 ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {balancePercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden my-2 border border-white/[0.04]">
            <motion.div 
              className={`h-full rounded-full ${
                status.type === 'inhibition' ? 'bg-rose-500' : balancePercent >= 70 ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              initial={false}
              animate={{ width: `${balancePercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center justify-between font-mono">
            <span>u:v</span>
            <span className="text-zinc-300">
              1 : {u > 0 ? (v / u).toFixed(2) : '0'}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Biochemical Insight & Recommendation */}
      <div className="text-xs text-zinc-300 leading-relaxed bg-[#0C0E14] p-2.5 rounded-lg border border-white/[0.06] flex items-start space-x-2">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          {status.desc}
        </p>
      </div>
    </div>
  );
};

