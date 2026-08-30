import { GoogleGenAI } from '@google/genai';

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6IxkrKpJhYc1hyK11Y4W0Bhb4ciATE89-48f2MzzL5WFw';

function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  if (!key) return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, content, customApiKey } = req.body || {};
    const key = customApiKey || (req.headers && req.headers['x-gemini-api-key']) || process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;

    if (!content) {
      return res.status(400).json({ error: 'Контент для перевода обязателен' });
    }

    const ai = getGeminiClient(key);

    if (!ai) {
      return res.status(500).json({ error: 'Gemini API клиент недоступен' });
    }

    // Type 1: Article translation
    if (type === 'article') {
      const { title, subtitle, summary, markdownContent, keyBiochemicalTakeaways } = content;

      const prompt = `Ты — профессиональный кулинарный переводчик и шеф-биохимик китайской кухни.
Переведи следующий материал с английского (или другого языка) на грамотный, авторитетный русский язык для поваров и кулинарных исследователей.

Правила перевода:
1. Сохраняй всю Markdown-разметку (заголовки #, ##, таблицы, списки, цитаты, жирный шрифт, код).
2. Китайские термины и названия блюд переводи с указанием оригинального термина и пиньиня в скобках, например: "Светлый соевый соус (生抽, Shengchou)", "Крахмальная суспензия (勾芡, Gouqian)", "Дыхание вока (鑊氣, Wok Hei)", "Окончательное ароматическое масло (明油, Mingyou)".
3. Биохимические термины переводи научно: глутамат, инозинат (IMP), гуанилат (GMP), аденилат (AMP), реакция Майяра, пиролиз, клейстеризация амилопектина.
4. Тон — академичный, живой, гастрономический.

Материал для перевода:
{
  "title": ${JSON.stringify(title || '')},
  "subtitle": ${JSON.stringify(subtitle || '')},
  "summary": ${JSON.stringify(summary || '')},
  "keyBiochemicalTakeaways": ${JSON.stringify(keyBiochemicalTakeaways || [])},
  "markdownContent": ${JSON.stringify(markdownContent || '')}
}

Ответь СТРОГО в формате JSON:
{
  "title": "Переведенный заголовок на русском",
  "subtitle": "Переведенный подзаголовок на русском",
  "summary": "Переведенное краткое содержание",
  "keyBiochemicalTakeaways": ["Вывод 1 на русском", "Вывод 2 на русском"],
  "markdownContent": "Полный переведенный Markdown текст статьи"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (aiResponse?.text) {
        const parsed = JSON.parse(aiResponse.text);
        return res.status(200).json({ success: true, translated: parsed });
      }
    }

    // Type 2: Recipe translation
    if (type === 'recipe') {
      const { title, summary, ingredientsText, steps, notes, synergyEstimate } = content;

      const prompt = `Ты — шеф-повар и эксперт китайской кулинарии.
Переведи рецепт соуса/блюда на русский язык.
Правила:
- Укажи точные русские кулинарные названия ингредиентов и граммовки/миллилитры.
- Шаги приготовления распиши понятно с акцентом на вок-технику.
- Сохраняй китайские названия и пиньинь.

Рецепт:
{
  "title": ${JSON.stringify(title || '')},
  "summary": ${JSON.stringify(summary || '')},
  "ingredientsText": ${JSON.stringify(ingredientsText || [])},
  "steps": ${JSON.stringify(steps || [])},
  "notes": ${JSON.stringify(notes || '')},
  "synergyEstimate": ${JSON.stringify(synergyEstimate || '')}
}

Ответь СТРОГО в формате JSON:
{
  "title": "Название рецепта на русском",
  "summary": "Краткое описание на русском",
  "ingredientsText": ["15 мл светлого соевого соуса", "..."],
  "steps": ["Шаг 1 на русском", "..."],
  "notes": "Технологические заметки на русском",
  "synergyEstimate": "Оценка синергии на русском"
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      if (aiResponse?.text) {
        const parsed = JSON.parse(aiResponse.text);
        return res.status(200).json({ success: true, translated: parsed });
      }
    }

    // Type 3: Generic text / markdown translation
    const textToTranslate = typeof content === 'string' ? content : JSON.stringify(content);
    const prompt = `Переведи следующий кулинарный текст на русский язык, сохраняя форматирование и профессиональную терминологию:\n\n${textToTranslate}`;
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt
    });

    return res.status(200).json({
      success: true,
      translatedText: aiResponse?.text || textToTranslate
    });

  } catch (err: any) {
    console.error('Translation Error:', err);
    return res.status(500).json({ error: err.message || 'Ошибка перевода текста' });
  }
}
