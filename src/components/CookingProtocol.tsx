import React, { useState } from 'react';
import { CulinaryStep } from '../types';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  Thermometer, 
  Play, 
  RotateCcw 
} from 'lucide-react';

interface CookingProtocolProps {
  steps: CulinaryStep[];
  recipeTitle: string;
  selectedProtein: string;
}

export const CookingProtocol: React.FC<CookingProtocolProps> = ({
  steps,
  recipeTitle,
  selectedProtein
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const toggleStepCompleted = (idx: number) => {
    setCompletedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const getTempMeta = (temp: CulinaryStep['tempLevel']) => {
    switch (temp) {
      case 'high_wok_blast':
        return { label: 'Максимальный жар (Wok Hei 190-220°C)', color: 'text-rose-400 bg-rose-950/30 border-rose-800' };
      case 'medium_gentle':
        return { label: 'Средний огонь (140-160°C)', color: 'text-amber-400 bg-amber-950/30 border-amber-800' };
      case 'low_warm':
        return { label: 'Слабый огонь / Инфузия (90-110°C)', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800' };
      case 'off_heat':
        return { label: 'Без нагрева (Финиш)', color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800' };
      default:
        return { label: 'Комнатная температура', color: 'text-zinc-400 bg-zinc-900 border-zinc-800' };
    }
  };

  // Protein prep guide
  const getProteinPrep = (protein: string) => {
    switch (protein) {
      case 'seitan':
        return {
          title: 'Сейтан (Пшеничный глютен / 面筋)',
          prep: 'Нарежьте ломтиками толщиной 1 см. Предварительно обжарьте на сухой сковороде или воке с 1 ч. л. масла до появления золотистой микропористой корочки. Это предотвратит разваливание и усилит впитывание крахмального Wanzhi соуса.',
          biochem: 'Глютеновый полимер при быстрой обжарке фиксирует форму, сохраняя эластичные карманы для захвата глутамата.'
        };
      case 'doupi':
        return {
          title: 'Доупи (Тофу-листы / 豆皮)',
          prep: 'Замочите сухие листы в теплой воде на 10 минут, аккуратно отожмите. Сверните в плотные рулеты (Doupi Juan) или нарежьте широкой лентой («лапшой»). Идеально сочетается с соусами стиля Hongshao.',
          biochem: 'Белковые пласты сои имеют высокую удельную поверхность, поглощая жидкую фазу капиллярным методом.'
        };
      case 'fuzhu':
        return {
          title: 'Фучжу («Соевая спаржа» / 腐竹)',
          prep: 'Замочите в холодной воде на 4-6 часов (или в теплой воде со щепоткой соли на 1.5 часа). Отожмите лишнюю влагу, нарежьте брусками по 4-5 см. Обжаривайте в воке сразу после ароматики Baoguo.',
          biochem: 'Слоистая структура юбы удерживает взвесь соуса между волокнами.'
        };
      default:
        return {
          title: 'Овощная матрица (Картофель & Морковь)',
          prep: 'Нарежьте ломтиками (Pian) или соломкой (Si). Картофель промойте от поверхностного крахмала, чтобы он не горел в масле.',
          biochem: 'Крахмал картофеля медленно отдает сахара, гармонируя с соленостью соуса.'
        };
    }
  };

  const proteinGuide = getProteinPrep(selectedProtein);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[10px]">Вок-протокол & СОП</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Технологическая Карта Вока
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Рецепт: <span className="text-white font-medium">{recipeTitle}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs font-mono self-start sm:self-center">
            <span className="text-zinc-400 text-[11px]">Прогресс:</span>
            <span className="font-semibold text-rose-400 text-[11px]">
              {completedSteps.length} / {steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Protein Matrix Preparation Card */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 backdrop-blur-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">ПОДГОТОВКА СУБСТРАТА: {proteinGuide.title}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {proteinGuide.prep}
        </p>
        <div className="p-2.5 rounded-lg bg-[#0C0E14] border border-white/[0.06] text-[11px] text-zinc-400">
          <span className="font-mono text-zinc-300 font-medium mr-1.5">Биомеханика:</span>
          {proteinGuide.biochem}
        </div>
      </div>

      {/* Culinary Step Pipeline */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const tempMeta = getTempMeta(step.tempLevel);

          return (
            <div
              key={idx}
              className={`rounded-xl bg-white/[0.02] border p-4 transition-all backdrop-blur-xl ${
                isDone 
                  ? 'border-emerald-500/30 bg-emerald-500/[0.02]' 
                  : 'border-white/[0.08] hover:border-white/[0.14]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  {/* Step Number Circle */}
                  <button
                    onClick={() => toggleStepCompleted(idx)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-mono text-xs font-medium shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/[0.06] border border-white/[0.1] text-zinc-300 hover:bg-white/[0.1]'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.stepNumber}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-sm text-white">
                        {step.title}
                      </h4>
                      {step.chineseTerm && (
                        <span className="font-mono text-xs text-rose-400">
                          {step.chineseTerm}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>

                {/* Badges & Temp info */}
                <div className="flex sm:flex-col items-end gap-1.5 shrink-0 self-end sm:self-start">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${tempMeta.color}`}>
                    {tempMeta.label}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] font-mono text-zinc-400">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>

              {/* Biochemical Action Callout */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start space-x-2 text-[11px] text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <span className="text-zinc-300 font-medium font-mono text-[10px] uppercase mr-1">Физико-химия:</span>
                  {step.biochemicalAction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
