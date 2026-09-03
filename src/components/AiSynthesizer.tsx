import React, { useState, useEffect } from 'react';
import { PantryIngredient, RecipeIngredient, TasteProfile } from '../types';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  FlaskConical, 
  Layers, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2,
  Cpu,
  RefreshCw,
  Zap,
  Brain,
  ChevronDown,
  SlidersHorizontal,
  Info,
  Globe,
  Radio
} from 'lucide-react';

interface AiSynthesizerProps {
  pantryList: PantryIngredient[];
  tasteProfile: TasteProfile;
  selectedProtein: string;
  onApplyRecipe: (ingredients: RecipeIngredient[], title: string) => void;
}

interface GeminiModelInfo {
  id: string;
  displayName: string;
  description: string;
  category: string;
  speed: string;
  reasoning: string;
  isRecommended?: boolean;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

const DEFAULT_CURATED_MODELS: GeminiModelInfo[] = [
  {
    id: 'gemini-3.7-flash',
    displayName: 'Gemini 3.7 Flash (Рекомендуется)',
    description: 'Флагманская гибридная модель с адаптивным мышлением, наивысшая скорость и точность биохимических расчетов.',
    category: 'flagship',
    speed: 'Высокая',
    reasoning: 'Отличное',
    isRecommended: true
  },
  {
    id: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash Lite',
    description: 'Сверхбыстрая легковесная модель для мгновенного подбора базовых соотношений.',
    category: 'fast',
    speed: 'Молниеносная',
    reasoning: 'Хорошее',
    isRecommended: false
  },
  {
    id: 'gemini-3.1-pro-preview',
    displayName: 'Gemini 3.1 Pro Preview',
    description: 'Глубокое рассуждение и сложные биохимические взаимосвязи рецептур.',
    category: 'reasoning',
    speed: 'Средняя',
    reasoning: 'Максимальное',
    isRecommended: false
  },
  {
    id: 'gemini-flash-latest',
    displayName: 'Gemini Flash Latest',
    description: 'Актуальный стабильный релиз линейки Gemini Flash.',
    category: 'standard',
    speed: 'Высокая',
    reasoning: 'Хорошее',
    isRecommended: false
  }
];

export const AiSynthesizer: React.FC<AiSynthesizerProps> = ({
  pantryList,
  tasteProfile,
  selectedProtein,
  onApplyRecipe
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Model Selection State - Initialized with curated models so list is never empty
  const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>(DEFAULT_CURATED_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelsSource, setModelsSource] = useState<string>('curated');
  const [showModelDrawer, setShowModelDrawer] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const samplePrompts = [
    'Хрустящий сейтан в карамельно-умами глазури с легким сычуаньским онемением',
    'Нежный светлый Wanzhi соус для тушения рулетов из доупи без чеснока',
    'Плотный бульон для томления фучжу с грибами шиитаке и огуречным рассолом',
    'Быстрый кисло-сладкий вок-соус с глубоким послевкусием (Tangcu)'
  ];

  // Fetch available models from backend (Google API + Curated list)
  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch('/api/models');
      if (res.ok) {
        const text = await res.text();
        // Check if response is valid JSON (and not index.html on SPA fallback)
        if (text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data.models && Array.isArray(data.models) && data.models.length > 0) {
            setAvailableModels(data.models);
            setModelsSource(data.source || 'google_api');
            
            // Ensure selected model exists, otherwise keep gemini-3.7-flash or first
            if (!data.models.some((m: GeminiModelInfo) => m.id === selectedModel)) {
              const defaultM = data.models.find((m: GeminiModelInfo) => m.isRecommended) || data.models[0];
              if (defaultM) setSelectedModel(defaultM.id);
            }
            return;
          }
        }
      }
      // If endpoint failed or returned non-JSON, ensure curated models remain
      setAvailableModels(DEFAULT_CURATED_MODELS);
      setModelsSource('curated');
    } catch (err) {
      console.warn('Failed to load live models, keeping curated list:', err);
      setAvailableModels(DEFAULT_CURATED_MODELS);
      setModelsSource('curated');
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSynthesize = async (userQuery?: string) => {
    const queryToSend = userQuery || prompt;
    if (!queryToSend.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/engineer/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: queryToSend,
          pantryItems: pantryList.filter(p => p.inPantry).map(p => ({
            id: p.id,
            name: p.name,
            chineseName: p.chineseName,
            category: p.category
          })),
          currentProfile: tasteProfile,
          targetProtein: selectedProtein,
          validIngredientIds: pantryList.map((p: any) => p.id),
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Ошибка синтеза рецепта');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Не удалось связаться с сервером синтеза.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadToWorkbench = () => {
    if (!result) return;
    
    // Map generated ingredients back to IDs if possible
    const mapped: RecipeIngredient[] = [];
    result.ingredients?.forEach((ing: any) => {
      const found = pantryList.find(p => 
        p.name.toLowerCase().includes(ing.name.toLowerCase()) ||
        ing.name.toLowerCase().includes(p.name.toLowerCase())
      );

      if (found) {
        let amount = 15;
        let unit: RecipeIngredient['unit'] = found.defaultUnit;
        const numMatch = ing.amount?.match(/(\d+(\.\d+)?)/);
        if (numMatch) {
          amount = parseFloat(numMatch[0]);
        }

        mapped.push({
          ingredientId: found.id,
          amount,
          unit,
          stage: ing.stage?.includes('Baoguo') ? 'baoguo_aromatics' :
                 ing.stage?.includes('крахмал') || ing.stage?.includes('Суспензия') ? 'slurry_gouqian' :
                 ing.stage?.includes('Финиш') || ing.stage?.includes('Mingyou') ? 'finish_mingyou' :
                 ing.stage?.includes('База') || ing.stage?.includes('Вода') ? 'liquid_base' : 'seasoning_mix'
        });
      }
    });

    if (mapped.length > 0) {
      onApplyRecipe(mapped, result.recipeTitle || 'AI-Синтезированный соус');
    }
  };

  const currentModelInfo = availableModels.find(m => m.id === selectedModel) || {
    id: selectedModel,
    displayName: selectedModel,
    description: 'Модель Google Gemini',
    category: 'custom',
    speed: 'Высокая',
    reasoning: 'Отличное'
  };

  const filteredModels = availableModels.filter(m => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'flagship') return m.category === 'flagship' || m.id.includes('3.7');
    if (filterCategory === 'reasoning') return m.category === 'reasoning' || m.id.includes('pro');
    if (filterCategory === 'fast') return m.category === 'fast' || m.id.includes('lite') || m.id.includes('flash');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase text-[10px]">Нейросетевой молекулярный синтезатор</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              AI Шеф-Инженер Китайской Кухни
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Сгенерируйте точную формулу соуса или бульона под целевой белок (сейтан, доупи, фучжу) и запасы в кладовой.
            </p>
          </div>

          {/* Model Selector Bar */}
          <div className="bg-[#0C0E14] border border-white/[0.08] p-2.5 rounded-xl flex flex-col gap-2 min-w-[260px] sm:min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 font-medium uppercase tracking-wider">
                <Cpu className="w-3 h-3 text-rose-400" />
                Модель Google
              </span>
              <button
                onClick={fetchModels}
                disabled={loadingModels}
                title="Обновить список актуальных моделей из Google API"
                id="refresh-models-btn"
                className="px-1.5 py-0.5 rounded-md text-zinc-400 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-all text-[10px] flex items-center gap-1"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loadingModels ? 'animate-spin text-rose-400' : ''}`} />
                <span className="text-[10px]">API</span>
              </button>
            </div>

            {/* Main Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDrawer(!showModelDrawer)}
                id="open-model-selector-btn"
                className="w-full px-2.5 py-1.5 bg-black/40 border border-white/[0.08] hover:border-white/[0.18] rounded-lg text-left flex items-center justify-between gap-2 transition-all group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white group-hover:text-rose-300 transition-colors truncate">
                      {currentModelInfo.displayName}
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-1.5">
                      <span>{currentModelInfo.speed}</span>
                      <span>•</span>
                      <span>{currentModelInfo.reasoning}</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform shrink-0 ${showModelDrawer ? 'rotate-180' : ''}`} />
              </button>

              {/* Models Menu / Drawer */}
              {showModelDrawer && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-96 bg-[#0E1015] border border-white/[0.12] rounded-xl shadow-2xl z-50 p-3 space-y-2.5 animate-fade-in backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="text-[10px] font-mono font-medium text-zinc-400 uppercase">
                      Модели ({availableModels.length})
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {modelsSource === 'google_api' ? 'Live API' : 'Curated'}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {[
                      { id: 'all', label: 'Все' },
                      { id: 'flagship', label: 'Флагманы' },
                      { id: 'reasoning', label: 'Pro' },
                      { id: 'fast', label: 'Flash' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterCategory(tab.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                          filterCategory === tab.id 
                            ? 'bg-white/[0.14] text-white border border-white/[0.18]' 
                            : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.04]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Model List */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                    {filteredModels.map(m => {
                      const isSelected = m.id === selectedModel;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m.id);
                            setShowModelDrawer(false);
                          }}
                          className={`w-full p-2 rounded-lg text-left transition-all flex flex-col gap-0.5 border ${
                            isSelected 
                              ? 'bg-rose-500/[0.08] border-rose-500/40 text-white' 
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] text-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-medium text-xs">
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                              <span>{m.displayName}</span>
                            </div>
                            {m.isRecommended && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                TOP
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 line-clamp-1 leading-relaxed">
                            {m.description}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                            <span>{m.speed}</span>
                            <span>•</span>
                            <span>{m.reasoning}</span>
                            <span>•</span>
                            <span className="text-zinc-600 truncate">{m.id}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Опишите желаемый соус (напр. 'Глубокий пряный умами для жареного сейтана')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesize()}
            className="flex-1 px-3 py-2.5 bg-black/50 border border-white/[0.08] focus:border-rose-500/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSynthesize()}
            disabled={loading || !prompt.trim()}
            id="synthesize-sauce-btn"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-white/[0.04] disabled:text-zinc-600 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Синтез...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Синтезировать</span>
              </>
            )}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500 flex items-center mr-1">
            <Lightbulb className="w-3 h-3 mr-1 text-amber-400" />
            Примеры:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p);
                handleSynthesize(p);
              }}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Ошибка генерации</div>
            <div className="text-rose-300/90 mt-0.5 text-[11px]">{error}</div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.12] p-4 sm:p-5 shadow-2xl space-y-4 animate-fade-in backdrop-blur-xl">
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  AI СИНТЕЗ УСПЕШЕН
                </span>
                {result.usedModel && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08] flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 text-rose-400" />
                    {result.usedModel}
                  </span>
                )}
                {result.note && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Info className="w-2.5 h-2.5 text-amber-400" />
                    {result.note}
                  </span>
                )}
                {Array.isArray(result.unmatchedIngredients) && result.unmatchedIngredients.length > 0 && (
                  <span className="font-mono text-[11px] text-amber-400 mr-2">⚠ Не сопоставлено: {result.unmatchedIngredients.map((u: any) => u.original).join(', ')}</span>
                )}
                <span className="font-mono text-xs text-zinc-400">{result.chineseTitle} ({result.pinyin})</span>
              </div>
              <h3 className="font-semibold text-base sm:text-lg text-white mt-1">
                {result.recipeTitle}
              </h3>
            </div>

            <button
              onClick={handleLoadToWorkbench}
              id="apply-ai-recipe-to-workbench"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-all self-start sm:self-center"
            >
              <span>Загрузить в Конструктор</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Biochemical Rationale */}
          <div className="p-3 rounded-lg bg-[#0C0E14] border border-white/[0.06] text-xs text-zinc-300 space-y-1">
            <span className="font-mono text-rose-400 font-medium block text-[10px] uppercase">
              Биохимическое обоснование:
            </span>
            <p className="leading-relaxed text-zinc-400 text-[11px]">{result.biochemicalRationale}</p>
          </div>

          {/* Ingredients & Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ingredients */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-white flex items-center space-x-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                <span>Ингредиентный каркас:</span>
              </h4>
              <div className="space-y-1.5">
                {result.ingredients?.map((ing: any, idx: number) => (
                  <div key={idx} className="p-2 bg-[#0C0E14] border border-white/[0.06] rounded-lg flex items-center justify-between text-xs">
                    <span className="text-zinc-200">{ing.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-zinc-500 font-mono">{ing.stage}</span>
                      <span className="font-mono font-semibold text-rose-400">{ing.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <h4 className="font-medium text-xs text-white flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span>Пошаговый протокол:</span>
              </h4>
              <div className="space-y-1.5">
                {result.steps?.map((step: string, idx: number) => (
                  <div key={idx} className="p-2 bg-[#0C0E14] border border-white/[0.06] rounded-lg flex items-start space-x-2 text-xs text-zinc-300">
                    <span className="font-mono font-semibold text-rose-400 shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed text-zinc-300 text-[11px]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          {result.proTips && result.proTips.length > 0 && (
            <div className="pt-2.5 border-t border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 font-medium block uppercase">СОВЕТЫ ШЕФ-ИНЖЕНЕРА:</span>
              <ul className="space-y-1 text-xs text-zinc-400">
                {result.proTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-1.5 text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
