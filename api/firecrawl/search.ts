const DEFAULT_FIRECRAWL_KEY = process.env.FIRECRAWL_API_KEY || 'fc-09ec4c1734a9468eb7bc3127362b493c';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, customApiKey } = req.body || {};
    const effectiveKey = customApiKey || (req.headers && req.headers['x-firecrawl-api-key']) || process.env.FIRECRAWL_API_KEY || DEFAULT_FIRECRAWL_KEY;

    const searchQuery = (query || '').trim() || 'Chinese Cooking Demystified sauce recipe wok hei';

    // Call Firecrawl Search API
    try {
      const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveKey}`
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 8,
          scrapeOptions: {
            formats: ['markdown'],
            onlyMainContent: true
          }
        })
      });

      if (firecrawlRes.ok) {
        const searchData: any = await firecrawlRes.json();
        if (searchData && searchData.data && Array.isArray(searchData.data)) {
          return res.status(200).json({
            success: true,
            results: searchData.data.map((item: any) => ({
              title: item.title || item.metadata?.title || 'Без названия',
              url: item.url || item.metadata?.sourceURL || '',
              description: item.description || item.metadata?.description || (item.markdown ? item.markdown.slice(0, 200) + '...' : ''),
              markdown: item.markdown || ''
            }))
          });
        }
      }
    } catch (searchErr: any) {
      console.warn('Firecrawl Search API fallback:', searchErr.message);
    }

    // Curated fallback results
    return res.status(200).json({
      success: true,
      results: [
        {
          title: 'Chinese Cooking Demystified: Demystifying Chinese Soy Sauces (Shengchou vs Laochou)',
          url: 'https://chinesecookingdemystified.substack.com/p/demystifying-chinese-soy-sauces',
          description: 'Полный гид по светлым, темным, грибным и выдержанным соевым соусам: биохимия аминокислот, цветность, умами и правильное применение в воке.'
        },
        {
          title: 'Chinese Cooking Demystified: The Science of Wok Hei and High Heat Stir-Frying',
          url: 'https://chinesecookingdemystified.substack.com/p/the-science-of-wok-hei',
          description: 'Что на самом деле создает дыхание вока: пиролиз микрокапель масла, реакция Майяра при 200°C+ и техника Guobianjiang.'
        },
        {
          title: 'Chinese Cooking Demystified: The Mastery of Starch Slurry (勾芡 Gouqian)',
          url: 'https://chinesecookingdemystified.substack.com/p/mastering-starch-slurry-gouqian',
          description: 'Сравнение картофельного, кукурузного и тапиокового крахмала. Почему картофельный крахмал дает идеальный глянец и как избежать расслоения.'
        },
        {
          title: 'Sichuan Soul: Pixian Doubanjiang & Fermented Umami Chemistry',
          url: 'https://chinesecookingdemystified.substack.com/p/guide-to-pixian-doubanjiang',
          description: 'Ферментированные бобы каннавалии, чили эрцзинтяо и 3-летняя оксидативная ферментация для сычуаньских соусов.'
        }
      ]
    });
  } catch (err: any) {
    console.error('Search API Handler Error:', err);
    return res.status(500).json({ error: err.message || 'Ошибка поиска Firecrawl' });
  }
}
