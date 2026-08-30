import React, { useState } from 'react';
import { PantryIngredient, RecipeIngredient, TasteProfile, CulinaryStep } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  Share2, 
  FileText, 
  Sparkles, 
  QrCode 
} from 'lucide-react';

interface LabExportModalProps {
  recipeTitle: string;
  ingredients: RecipeIngredient[];
  pantryList: PantryIngredient[];
  tasteProfile: TasteProfile;
  steps: CulinaryStep[];
  selectedProtein: string;
  portions: number;
  onClose: () => void;
}

export const LabExportModal: React.FC<LabExportModalProps> = ({
  recipeTitle,
  ingredients,
  pantryList,
  tasteProfile,
  steps,
  selectedProtein,
  portions,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const pantryMap = new Map<string, PantryIngredient>();
  pantryList.forEach(p => pantryMap.set(p.id, p));

  const generateMarkdown = () => {
    let md = `# 🧪 ТЕХНОЛОГИЧЕСКАЯ КАРТА: ${recipeTitle.toUpperCase()}\n`;
    md += `**Порции:** ${portions} | **Матрица белка:** ${selectedProtein}\n`;
    md += `**Биохимический коэффициент синергии:** ${tasteProfile.synergyMultiplier}× (Yamaguchi 2000, γ=1218)\n`;
    md += `**Уровень умами:** ${tasteProfile.umamiIntensityScore}/10 | **Соленость:** ${tasteProfile.salinityPercent}% (-${tasteProfile.saltReductionBonusPercent}% NaCl)\n\n`;

    md += `## 1. Ингредиентный каркас\n`;
    ingredients.forEach(item => {
      const ing = pantryMap.get(item.ingredientId);
      if (!ing) return;
      const scaledAmount = Math.round(item.amount * portions * 10) / 10;
      md += `- **${ing.name}** (${ing.chineseName}): ${scaledAmount} ${item.unit} [Фаза: ${item.stage}]\n`;
    });

    md += `\n## 2. Сенсорная телеметрия\n`;
    md += `- Свободный L-глутамат: ${tasteProfile.glutamateMgTotal} мг\n`;
    md += `- 5'-рибонуклеотиды: ${tasteProfile.nucleotidesMgTotal} мг (IMP: ${tasteProfile.impPercentOfNucleotides}%, GMP: ${tasteProfile.gmpPercentOfNucleotides}%, AMP: ${tasteProfile.ampPercentOfNucleotides}%)\n`;
    md += `- Текстура / Вязкость: ${tasteProfile.viscosityLabel}\n`;
    md += `- Время затухания послевкусия: ~${tasteProfile.aftertasteHalfLifeSeconds} сек\n\n`;

    md += `## 3. Стандартная операционная процедура (Вок-протокол)\n`;
    steps.forEach((step, idx) => {
      md += `${idx + 1}. **${step.title}** (${step.duration}, ${step.tempLevel}): ${step.instruction}\n`;
      md += `   *Физико-химия:* ${step.biochemicalAction}\n\n`;
    });

    md += `---\n*Сгенерировано в PWA Umami Engineer (Научный конструктор китайской традиции)*`;
    return md;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0E1015] border border-white/[0.12] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in backdrop-blur-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">
                Лабораторная техкарта
              </h3>
              <p className="text-[10px] text-zinc-400">
                Экспорт рецептуры с биохимическим обоснованием
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md bg-white/[0.04] text-zinc-400 hover:text-white border border-white/[0.08]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-zinc-300 font-sans text-xs">
          {/* Top Spec Card */}
          <div className="bg-[#0C0E14] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5 font-mono">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="font-medium text-white text-xs">
                {recipeTitle}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {tasteProfile.synergyMultiplier}× СИНЕРГИЯ
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <span className="text-zinc-500 block text-[9px]">Порции:</span>
                <span className="text-white font-medium">{portions}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px]">Умами (0-10):</span>
                <span className="text-rose-400 font-medium">{tasteProfile.umamiIntensityScore}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px]">Соленость:</span>
                <span className="text-cyan-400 font-medium">{tasteProfile.salinityPercent}%</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[9px]">Послевкусие:</span>
                <span className="text-amber-400 font-medium">~{tasteProfile.aftertasteHalfLifeSeconds}с</span>
              </div>
            </div>
          </div>

          {/* Markdown Code View */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-zinc-400">Форматированный отчет (Markdown):</span>
            <pre className="p-3.5 rounded-xl bg-black/50 border border-white/[0.06] text-[10px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {generateMarkdown()}
            </pre>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium border border-white/[0.08] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/[0.1] hover:bg-white/[0.16] text-white border border-white/[0.14]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать Markdown</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
