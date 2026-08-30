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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#10151E] border border-zinc-800/90 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-2">
              <Flame className="w-4 h-4" />
              <span>СТАНДАРТНАЯ ОПЕРАЦИОННАЯ ПРОЦЕДУРА (СОП)</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              Вок-Протокол & Технологическая Карта
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Рецепт: <span className="text-white font-medium">{recipeTitle}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono">
            <span className="text-zinc-400">Прогресс:</span>
            <span className="font-bold text-rose-400">
              {completedSteps.length} / {steps.length}
            </span>
          </div>
        </div>
      </div>

      {/* Protein Matrix Preparation Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-[#121822] border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-2">
          <Layers className="w-4 h-4" />
          <span>ПОДГОТОВКА СУБСТРАТА: {proteinGuide.title}</span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">
          {proteinGuide.prep}
        </p>
        <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/60 text-[11px] text-zinc-400 italic">
          <span className="font-mono text-zinc-300 font-semibold not-italic mr-1">Биомеханика:</span>
          {proteinGuide.biochem}
        </div>
      </div>

      {/* Culinary Step Pipeline */}
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isDone = completedSteps.includes(idx);
          const tempMeta = getTempMeta(step.tempLevel);

          return (
            <div
              key={idx}
              className={`bg-[#10151E] border rounded-2xl p-5 transition-all ${
                isDone 
                  ? 'border-emerald-500/40 bg-emerald-950/5' 
                  : 'border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5">
                  {/* Step Number Circle */}
                  <button
                    onClick={() => toggleStepCompleted(idx)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                  </button>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">
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
                <div className="flex sm:flex-col items-end gap-2 shrink-0 self-end sm:self-start">
                  <span className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border ${tempMeta.color}`}>
                    {tempMeta.label}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] font-mono text-zinc-400">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>

              {/* Biochemical Action Callout */}
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-start space-x-2 text-[11px] text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <span className="text-zinc-300 font-semibold font-mono">Физико-химия: </span>
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
