import { GoogleGenAI } from '@google/genai';

const DEFAULT_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6IxkrKpJhYc1hyK11Y4W0Bhb4ciATE89-48f2MzzL5WFw';

const CURATED_MODELS = [
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

export default async function handler(req: any, res: any) {
  try {
    const customKey = (req.headers && req.headers['x-gemini-api-key']) as string | undefined;
    const effectiveKey = customKey || process.env.GEMINI_API_KEY || DEFAULT_KEY;

    let liveModels: any[] = [];

    if (effectiveKey) {
      try {
        const fetchRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`);
        if (fetchRes.ok) {
          const data: any = await fetchRes.json();
          if (data && Array.isArray(data.models)) {
            liveModels = data.models
              .filter((m: any) => {
                const rawId = m.name?.replace(/^models\//, '') || '';
                if (rawId.includes('2.5') || rawId.includes('2.0') || rawId.includes('1.5')) return false;
                return m.supportedGenerationMethods?.includes('generateContent');
              })
              .map((m: any) => {
                const rawId = m.name?.replace(/^models\//, '') || '';
                const curated = CURATED_MODELS.find(c => c.id === rawId);
                
                let category = curated?.category || 'standard';
                if (rawId.includes('3.7') || rawId.includes('3-pro')) category = 'flagship';
                else if (rawId.includes('lite') || rawId.includes('flash-8b')) category = 'fast';
                else if (rawId.includes('pro')) category = 'reasoning';
                else if (rawId.includes('preview') || rawId.includes('exp')) category = 'experimental';

                return {
                  id: rawId,
                  displayName: curated?.displayName || m.displayName || rawId,
                  description: curated?.description || m.description || 'Google Gemini модель',
                  category,
                  speed: curated?.speed || (category === 'fast' ? 'Молниеносная' : 'Высокая'),
                  reasoning: curated?.reasoning || (category === 'reasoning' || category === 'flagship' ? 'Максимальное' : 'Хорошее'),
                  isRecommended: rawId === 'gemini-3.7-flash',
                  inputTokenLimit: m.inputTokenLimit,
                  outputTokenLimit: m.outputTokenLimit,
                };
              });
          }
        }
      } catch (fetchErr) {
        console.warn('Vercel API models fetch error:', fetchErr);
      }
    }

    if (liveModels.length > 0) {
      liveModels.sort((a, b) => {
        if (a.id === 'gemini-3.7-flash') return -1;
        if (b.id === 'gemini-3.7-flash') return 1;
        if (a.id.startsWith('gemini-3') && !b.id.startsWith('gemini-3')) return -1;
        if (!a.id.startsWith('gemini-3') && b.id.startsWith('gemini-3')) return 1;
        return a.displayName.localeCompare(b.displayName);
      });
      return res.status(200).json({ models: liveModels, source: 'google_api', currentKeyConfigured: Boolean(effectiveKey) });
    }

    return res.status(200).json({ models: CURATED_MODELS, source: 'curated', currentKeyConfigured: Boolean(effectiveKey) });
  } catch (err: any) {
    return res.status(200).json({ models: CURATED_MODELS, source: 'curated_fallback', error: err.message });
  }
}
