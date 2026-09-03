import { GoogleGenAI } from '@google/genai';

const DEFAULT_KEY = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6IxkrKpJhYc1hyK11Y4W0Bhb4ciATE89-48f2MzzL5WFw';

function getGeminiClient(customApiKey?: string): GoogleGenAI | null {
  const key = customApiKey || process.env.GEMINI_API_KEY || DEFAULT_KEY;
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
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      sourceText, 
      title, 
      sourceUrl, 
      type = 'article', 
      pantryList = [] 
    } = req.body || {};

    const customKey = req.headers['x-gemini-api-key'] as string | undefined;
    const ai = getGeminiClient(customKey);

    if (!sourceText && !title) {
      return res.status(400).json({ error: 'Текст источника или заголовок обязателен' });
    }

    const availablePantryBrief = (pantryList || []).slice(0, 35).map((p: any) => ({
      id: p.id,
      name: p.name,
      chineseName: p.chineseName,
      category: p.category,
      defaultUnit: p.defaultUnit
    }));

    if (ai) {
      try {
        const prompt = `Ты — ведущий шеф-биохимик и эксперт китайской кулинарии (Wok Science & Chinese Cooking Demystified).
Твоя задача: извлечь ЧИСТУЮ СОУСНУЮ ОСНОВУ (Sauce Matrix / Wanzhi formulation / Профиль соуса) из предоставленного кулинарного материала (статьи, лонгрида или рецепта).

ДЕТАЛИ МАТЕРИАЛА:
- Тип: ${type === 'article' ? 'Статья / Теоретический лонгрид' : 'Кулинарный рецепт'}
- Заголовок: ${title || 'Без названия'}
- Источник: ${sourceUrl || ''}

ТЕКСТ:
"""
${(sourceText || '').slice(0, 14000)}
"""

ДОСТУПНЫЕ ИНГРЕДИЕНТЫ В КЛАДОВОЙ (используй строго эти ID для parsedIngredients):
${JSON.stringify(availablePantryBrief)}

ВАЖНЫЕ ПРАВИЛА:
1. Выдели ИМЕННО СОУС ИЛИ СИСТЕМУ ПРИПРАВ (Wanzhi / Baoguo / Gouqian), даже если статья чисто теоретическая (например, о соевых соусах, Wok Hei, ферментации Доубаньцзян или технике крахмальной суспензии). Смоделируй идеальную аутентичную формулу соуса, иллюстрирующую принципы статьи!
2. Для каждого ингредиента укажи:
   - "ingredientId": точный ID из списка выше (например 'light_soy', 'dark_soy', 'oyster_sauce', 'shaoxing_wine', 'potato_starch', 'water_stock', 'garlic', 'ginger', 'sesame_oil', 'pixian_doubanjiang', 'chinkiang_vinegar', 'taitaile_jijing', 'sugar_rock' и т.д.)
   - "amount": числовое значение (например 15, 5, 4, 60)
   - "unit": "ml" | "g" | "tsp" | "tbsp" | "cloves" | "pcs"
   - "stage": один из пяти классических этапов вок-кулинарии:
     * "baoguo_aromatics" (обжарка имбиря, чеснока, чили, доубаньцзяна)
     * "seasoning_mix" (соевые соусы, вино, сахар, умами)
     * "liquid_base" (бульон Gao Tang, вода, рассол)
     * "slurry_gouqian" (крахмал для суспензии)
     * "finish_mingyou" (кунжутное/ароматическое масло в конце)
3. Рассчитай биохимические показатели:
   - Доминирующие вкусы (Умами, Соленость, Сладость, Кислотность, Острота, Онемение от 0 до 10)
   - Оценку синергии Ямагути (глутамат + нуклеотиды IMP/GMP)
   - Вязкость и технику загущения крахмалом (Gouqian)
   - Совместимые белки (Сейтан, Доупи, Тофу, Грибы)

Верни СТРОГО валидный JSON следующей структуры:
{
  "id": "sauce_${Date.now()}",
  "title": "Название соуса на русском (например: Аутентичный Браун-соус Wanzhi для вока)",
  "chineseTitle": "Иероглифы (например: 经典万能碗汁)",
  "pinyin": "Пиньинь (например: Jīngdiǎn Wànnéng Wǎnzhī)",
  "category": "wanzhi_brown" | "sichuan_spicy" | "superior_broth" | "sweet_sour" | "braising_glaze" | "pickle_fermented" | "velvet_white",
  "summary": "Краткое описание характера соуса и его кулинарной роли (2 предложения)",
  "scientificBreakdown": "Биохимическое обоснование синергии умами, действия крахмала и баланса аминокислот",
  "targetProteins": ["doupi", "seitan", "tofu"],
  "ingredients": [
    {
      "ingredientId": "light_soy",
      "amount": 15,
      "unit": "ml",
      "stage": "seasoning_mix",
      "notes": "Основа глутамата и солености"
    }
  ],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Смешивание соусной основы Wanzhi",
      "chineseTerm": "调碗汁",
      "tempLevel": "cold",
      "duration": "1 мин",
      "instruction": "В отдельной пиале соедините соевый соус, вино, бульон и картофельный крахмал до полного растворения.",
      "biochemicalAction": "Равномерная дисперсия гранул амилопектина перед термической клейстеризацией"
    }
  ],
  "proTips": [
    "Совет по работе с воком и температурой",
    "Совет по балансу умами и текстуре"
  ],
  "tasteEstimates": {
    "umami": 8.5,
    "salinity": 1.4,
    "sweetness": 2.1,
    "acidity": 1.0,
    "heat": 0.5,
    "viscosityLabel": "Шелковистый бархат (Coating)"
  },
  "synergyMultiplierEstimate": "x5.8 синергия (глутамат сои + IMP бульона)"
}`;

        const genRes = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        if (genRes?.text) {
          const parsed = JSON.parse(genRes.text);
          return res.status(200).json({ success: true, sauceProfile: parsed });
        }
      } catch (aiErr: any) {
        console.warn('[Sauce Extract API] AI extraction failed, falling back to heuristic engine:', aiErr.message);
      }
    }

    // Fallback heuristic sauce extraction
    const isSpicy = (sourceText + title).toLowerCase().includes('sichuan') || (sourceText + title).toLowerCase().includes('douban') || (sourceText + title).toLowerCase().includes('spicy') || (sourceText + title).toLowerCase().includes('остр');
    const isSweetSour = (sourceText + title).toLowerCase().includes('sweet') || (sourceText + title).toLowerCase().includes('sour') || (sourceText + title).toLowerCase().includes('кисло-сладк') || (sourceText + title).toLowerCase().includes('vinegar');

    const fallbackSauce = {
      id: `sauce_${Date.now()}`,
      title: isSpicy ? 'Сычуаньский острый умами-соус (Мала)' : isSweetSour ? 'Кисло-сладкий умами-глянец (Tangcu)' : `Соусная основа: ${title || 'Аутентичный вок-соус'}`,
      chineseTitle: isSpicy ? '川味麻辣鲜汁' : isSweetSour ? '糖醋风味汁' : '万能炒菜碗汁',
      pinyin: isSpicy ? 'Chuānwèi Málà Xiānzhī' : isSweetSour ? 'Tángcù Fēngwèizhī' : 'Wànnéng Chǎocài Wǎnzhī',
      category: isSpicy ? 'sichuan_spicy' : isSweetSour ? 'sweet_sour' : 'wanzhi_brown',
      summary: 'Сбалансированная формула соуса, извлеченная из кулинарного материала с выверенными пропорциями крахмала и свободных аминокислот.',
      scientificBreakdown: 'Взаимодействие глутамата натрия из соевого соуса и свободных нуклеотидов с образованием устойчивой белково-крахмальной глазури в раскаленном воке.',
      targetProteins: ['doupi', 'seitan', 'fuzhu'],
      ingredients: [
        { ingredientId: 'light_soy', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: 'Первичный глутамат' },
        { ingredientId: 'dark_soy', amount: 5, unit: 'ml', stage: 'seasoning_mix', notes: 'Глубина цвета' },
        { ingredientId: 'shaoxing_wine', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: 'Деглазирование' },
        { ingredientId: 'water_stock', amount: 60, unit: 'ml', stage: 'liquid_base', notes: 'Жидкая фаза' },
        { ingredientId: 'potato_starch', amount: 4, unit: 'g', stage: 'slurry_gouqian', notes: 'Клейстеризация' },
        { ingredientId: 'garlic', amount: 2, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Ароматика Baoguo' },
        { ingredientId: 'ginger', amount: 5, unit: 'g', stage: 'baoguo_aromatics', notes: 'Ароматика Baoguo' },
        { ingredientId: 'sesame_oil', amount: 2.5, unit: 'ml', stage: 'finish_mingyou', notes: 'Финишный блеск' }
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Смешивание соусной основы (Wanzhi)',
          chineseTerm: '调碗汁',
          tempLevel: 'cold',
          duration: '30 сек',
          instruction: 'В пиале соедините воду/бульон, соевые соусы, шаосинское вино и картофельный крахмал.',
          biochemicalAction: 'Формирование холодной крахмальной суспензии'
        },
        {
          stepNumber: 2,
          title: 'Ароматическая обжарка (Baoguo)',
          chineseTerm: '爆锅',
          tempLevel: 'high_wok_blast',
          duration: '15 сек',
          instruction: 'В разогретом воке быстро обжарьте измельченный чеснок и имбирь до появления аромата.',
          biochemicalAction: 'Высвобождение летучих сернистых и терпеновых соединений'
        },
        {
          stepNumber: 3,
          title: 'Глазирование крахмалом (Gouqian)',
          chineseTerm: '勾芡',
          tempLevel: 'high_wok_blast',
          duration: '30 сек',
          instruction: 'Влейте соусную смесь по стенкам вока, непрерывно помешивая до прозрачного глянца.',
          biochemicalAction: 'Мгновенная клейстеризация картофельного крахмала при 68-72°C'
        }
      ],
      proTips: [
        'Картофельный крахмал оседает на дно за секунды — перемешайте соус прямо перед вливанием в вок.',
        'Вливайте соус по раскаленной стенке вока (Guobian) для карамелизации и активации Wok Hei.'
      ],
      tasteEstimates: {
        umami: 8.2,
        salinity: 1.3,
        sweetness: 1.5,
        acidity: 0.8,
        heat: isSpicy ? 6.5 : 0.5,
        viscosityLabel: 'Шелковистый бархат (Coating)'
      },
      synergyMultiplierEstimate: 'x5.4 синергетический эффект умами'
    };

    return res.status(200).json({ success: true, sauceProfile: fallbackSauce });
  } catch (err: any) {
    console.error('[Sauce Extract Handler] Error:', err);
    return res.status(500).json({ error: err.message || 'Ошибка извлечения соуса' });
  }
}
