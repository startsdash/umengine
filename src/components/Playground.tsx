import React, { useState, useEffect } from 'react';
import { 
  PlaygroundArticle, 
  PlaygroundRecipe, 
  RecipeIngredient, 
  PantryIngredient, 
  TasteProfile 
} from '../types';
import { INITIAL_PLAYGROUND_ARTICLES, INITIAL_PLAYGROUND_RECIPES } from '../data/playgroundData';
import ReactMarkdown from 'react-markdown';
import { 
  Globe, 
  Search, 
  Sparkles, 
  BookOpen, 
  Utensils, 
  ArrowRight, 
  FlaskConical, 
  Check, 
  ExternalLink, 
  Clock, 
  Tag, 
  Flame, 
  Download, 
  Trash2, 
  Layers, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Share2, 
  ChevronRight,
  Info,
  Sliders,
  ChevronDown,
  Languages
} from 'lucide-react';

interface PlaygroundProps {
  pantryList: PantryIngredient[];
  tasteProfile: TasteProfile;
  onLoadRecipeToConstructor: (ingredients: RecipeIngredient[], title: string) => void;
}

type SubTab = 'articles' | 'recipes' | 'scraper';

export const Playground: React.FC<PlaygroundProps> = ({
  pantryList,
  tasteProfile,
  onLoadRecipeToConstructor
}) => {
  const [subTab, setSubTab] = useState<SubTab>('articles');

  // Persistence for scraped / saved articles and recipes
  const [articles, setArticles] = useState<PlaygroundArticle[]>(() => {
    const saved = localStorage.getItem('umami_playground_articles_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_PLAYGROUND_ARTICLES;
  });

  const [recipes, setRecipes] = useState<PlaygroundRecipe[]>(() => {
    const saved = localStorage.getItem('umami_playground_recipes_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return INITIAL_PLAYGROUND_RECIPES;
  });

  // Load data from VPS PostgreSQL on mount
  useEffect(() => {
    const loadDbData = async () => {
      try {
        // 1. Articles from DB
        const artRes = await fetch('/api/db/articles');
        if (artRes.ok) {
          const artData = await artRes.json();
          if (Array.isArray(artData.articles) && artData.articles.length > 0) {
            setArticles(prev => {
              const ids = new Set(artData.articles.map((a: any) => a.id));
              const nonOverlapping = prev.filter(a => !ids.has(a.id));
              return [...artData.articles, ...nonOverlapping];
            });
          }
        }

        // 2. Recipes from DB
        const recRes = await fetch('/api/db/recipes');
        if (recRes.ok) {
          const recData = await recRes.json();
          if (Array.isArray(recData.recipes) && recData.recipes.length > 0) {
            setRecipes(prev => {
              const ids = new Set(recData.recipes.map((r: any) => r.id));
              const nonOverlapping = prev.filter(r => !ids.has(r.id));
              return [...recData.recipes, ...nonOverlapping];
            });
          }
        }
      } catch (e) {
        console.warn('PostgreSQL fetch for playground failed (using cached):', e);
      }
    };
    loadDbData();
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('umami_playground_articles_v2', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('umami_playground_recipes_v2', JSON.stringify(recipes));
  }, [recipes]);

  // Selected Article for Reading View
  const [selectedArticle, setSelectedArticle] = useState<PlaygroundArticle | null>(null);
  
  // Search & Filter State
  const [articleSearch, setArticleSearch] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<string>('all');

  // Scraper State
  const [scrapeUrl, setScrapeUrl] = useState<string>('');
  const [customApiKey, setCustomApiKey] = useState<string>('fc-09ec4c1734a9468eb7bc3127362b493c');
  const [showApiKeyField, setShowApiKeyField] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState<string | null>(null);
  const [scrapedDataResult, setScrapedDataResult] = useState<any | null>(null);

  // Translation States & Caches
  const [translatingArticleId, setTranslatingArticleId] = useState<string | null>(null);
  const [translatingRecipeId, setTranslatingRecipeId] = useState<string | null>(null);
  const [translationToast, setTranslationToast] = useState<string | null>(null);

  const [translatedArticles, setTranslatedArticles] = useState<Record<string, {
    title: string;
    subtitle?: string;
    summary: string;
    markdownContent: string;
    keyBiochemicalTakeaways?: string[];
  }>>(() => {
    const saved = localStorage.getItem('umami_translated_articles_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const [translatedRecipes, setTranslatedRecipes] = useState<Record<string, {
    title: string;
    summary: string;
    ingredientsText: string[];
    steps: string[];
    notes?: string;
    synergyEstimate?: string;
  }>>(() => {
    const saved = localStorage.getItem('umami_translated_recipes_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  const [activeLangArticle, setActiveLangArticle] = useState<Record<string, 'original' | 'ru'>>({});
  const [activeLangRecipe, setActiveLangRecipe] = useState<Record<string, 'original' | 'ru'>>({});

  useEffect(() => {
    localStorage.setItem('umami_translated_articles_v1', JSON.stringify(translatedArticles));
  }, [translatedArticles]);

  useEffect(() => {
    localStorage.setItem('umami_translated_recipes_v1', JSON.stringify(translatedRecipes));
  }, [translatedRecipes]);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Quick Preset URLs for Scraping
  const PRESET_SCRAPE_URLS = [
    {
      title: 'CCD: Китайские соевые соусы',
      url: 'https://chinesecookingdemystified.substack.com/p/demystifying-chinese-soy-sauces',
      tag: 'Соевый соус'
    },
    {
      title: 'CCD: Физика и магия Wok Hei',
      url: 'https://chinesecookingdemystified.substack.com/p/the-science-of-wok-hei',
      tag: 'Wok Hei'
    },
    {
      title: 'CCD: Крахмал Gouqian',
      url: 'https://chinesecookingdemystified.substack.com/p/mastering-starch-slurry-gouqian',
      tag: 'Gouqian'
    },
    {
      title: 'CCD: Паста Писянь Доубанцзян',
      url: 'https://chinesecookingdemystified.substack.com/p/guide-to-pixian-doubanjiang',
      tag: 'Сычуань'
    }
  ];

  // Perform Scrape via Server Endpoint (Firecrawl API)
  const handlePerformScrape = async (targetUrl?: string) => {
    const urlToScrape = targetUrl || scrapeUrl;
    if (!urlToScrape.trim()) {
      setScrapeError('Пожалуйста, введите корректный URL веб-страницы или выберите пресет');
      return;
    }

    setIsScraping(true);
    setScrapeError(null);
    setScrapeSuccessMsg(null);
    setScrapedDataResult(null);

    try {
      const response = await fetch('/api/firecrawl/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToScrape.trim(),
          customApiKey: customApiKey.trim(),
          pantryList: pantryList
        })
      });

      const resText = await response.text();
      let data: any = null;
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (parseErr) {
        console.warn('Failed to parse API response JSON:', parseErr, resText);
        throw new Error(`Ответ сервера (${response.status}): ${resText.slice(0, 150) || 'Пустой ответ'}`);
      }

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      setScrapedDataResult(data);
      setScrapeSuccessMsg('Материал успешно скрапирован и распарсен через Firecrawl!');

      // If article found, automatically offer/add to list
      if (data.article) {
        const newArt: PlaygroundArticle = {
          id: `scraped_art_${Date.now()}`,
          title: data.article.title || 'Скрапированная статья',
          subtitle: data.article.subtitle || '',
          sourceName: data.article.author || 'Firecrawl Scraped Web',
          sourceUrl: data.sourceUrl || urlToScrape,
          author: data.article.author || 'Кулинарный обозреватель',
          readTimeMinutes: data.article.readTimeMinutes || 5,
          publishedDate: new Date().toISOString().split('T')[0],
          tags: data.article.tags || ['Скрапинг', 'Умами'],
          summary: data.article.summary || '',
          markdownContent: data.article.markdownContent || data.rawMarkdown || '',
          keyBiochemicalTakeaways: data.article.keyBiochemicalTakeaways || [
            'Успешно извлечено с помощью Firecrawl API',
            'Содержит ценные технологические заметки'
          ],
          isCustomScraped: true
        };

        setArticles(prev => [newArt, ...prev.filter(a => a.sourceUrl !== newArt.sourceUrl)]);

        // Persist to PostgreSQL VPS
        fetch('/api/db/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newArt)
        }).catch(e => console.warn('Failed to save article to DB:', e));
      }

      // If recipe found, automatically add to recipes list
      if (data.recipe) {
        const rawParsed: any[] = data.recipe.parsedIngredients || [];
        const normalizedParsed: RecipeIngredient[] = rawParsed.length > 0
          ? rawParsed.map((ing: any) => ({
              ingredientId: ing.ingredientId || 'light_soy_sauce',
              amount: typeof ing.amount === 'number' ? ing.amount : (typeof ing.quantity === 'number' ? ing.quantity : 15),
              unit: ing.unit || 'ml',
              stage: (ing.stage === 'slurry_gouqian' || ing.stage === 'starch_slurry')
                ? 'slurry_gouqian'
                : (ing.stage === 'finish_mingyou' || ing.stage === 'aroma_oil')
                ? 'finish_mingyou'
                : (ing.stage === 'baoguo_aromatics' || ing.stage === 'wok_aromatics')
                ? 'baoguo_aromatics'
                : (ing.stage === 'liquid_base')
                ? 'liquid_base'
                : 'seasoning_mix',
              notes: ing.notes
            }))
          : [
              { ingredientId: 'light_soy_sauce', amount: 15, unit: 'ml', stage: 'seasoning_mix' },
              { ingredientId: 'dark_soy_sauce', amount: 5, unit: 'ml', stage: 'seasoning_mix' },
              { ingredientId: 'shaoxing_wine', amount: 15, unit: 'ml', stage: 'seasoning_mix' },
              { ingredientId: 'potato_starch', amount: 4, unit: 'g', stage: 'slurry_gouqian' },
              { ingredientId: 'water_base', amount: 60, unit: 'ml', stage: 'liquid_base' }
            ];

        const newRec: PlaygroundRecipe = {
          id: `scraped_rec_${Date.now()}`,
          title: data.recipe.title || 'Скрапированный рецепт соуса',
          chineseTitle: data.recipe.chineseTitle || '',
          pinyin: data.recipe.pinyin || '',
          sourceName: data.article?.author || 'Firecrawl Recipe Extraction',
          sourceUrl: data.sourceUrl || urlToScrape,
          category: data.recipe.category || 'wanzhi_brown',
          summary: data.recipe.summary || '',
          ingredientsText: data.recipe.ingredientsText || [],
          parsedIngredients: normalizedParsed,
          steps: data.recipe.steps || [],
          notes: data.recipe.notes || '',
          synergyEstimate: data.recipe.synergyEstimate || 'Сбалансированная база умами',
          isCustomScraped: true
        };

        setRecipes(prev => [newRec, ...prev.filter(r => r.sourceUrl !== newRec.sourceUrl)]);

        // Persist to PostgreSQL VPS
        fetch('/api/db/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRec)
        }).catch(e => console.warn('Failed to save recipe to DB:', e));
      }

    } catch (err: any) {
      console.error('Scraping error:', err);
      setScrapeError(err.message || 'Ошибка подключения к Firecrawl API. Проверьте правильность URL или ключа.');
    } finally {
      setIsScraping(false);
    }
  };

  // Perform Search via Firecrawl Search
  const handlePerformSearch = async (queryText?: string) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/firecrawl/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q.trim(),
          customApiKey: customApiKey.trim()
        })
      });

      const resText = await response.text();
      let data: any = null;
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (parseErr) {
        console.warn('Search parse error:', parseErr);
      }

      if (data?.results) {
        setSearchResults(data.results);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Translate Article into Russian
  const handleToggleTranslateArticle = async (article: PlaygroundArticle) => {
    // If already translated, toggle between 'ru' and 'original'
    if (translatedArticles[article.id]) {
      const currentMode = activeLangArticle[article.id] || 'ru';
      const nextMode = currentMode === 'ru' ? 'original' : 'ru';
      setActiveLangArticle(prev => ({ ...prev, [article.id]: nextMode }));
      setTranslationToast(nextMode === 'ru' ? 'Отображается перевод на русский' : 'Отображается оригинальный текст');
      setTimeout(() => setTranslationToast(null), 3000);
      return;
    }

    // Call translation endpoint
    setTranslatingArticleId(article.id);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'article',
          content: {
            title: article.title,
            subtitle: article.subtitle,
            summary: article.summary,
            markdownContent: article.markdownContent,
            keyBiochemicalTakeaways: article.keyBiochemicalTakeaways
          }
        })
      });

      const resText = await response.text();
      let data: any = null;
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (parseErr) {
        console.warn('Translate parse error:', parseErr);
      }

      if (data?.translated) {
        setTranslatedArticles(prev => ({
          ...prev,
          [article.id]: data.translated
        }));
        setActiveLangArticle(prev => ({ ...prev, [article.id]: 'ru' }));
        setTranslationToast('Статья успешно переведена на русский язык');
      } else {
        throw new Error(data?.error || 'Не удалось выполнить перевод');
      }
    } catch (err: any) {
      console.error('Translation failed:', err);
      setTranslationToast(`Ошибка перевода: ${err.message || 'Попробуйте позже'}`);
    } finally {
      setTranslatingArticleId(null);
      setTimeout(() => setTranslationToast(null), 4000);
    }
  };

  // Translate Recipe into Russian
  const handleToggleTranslateRecipe = async (recipe: PlaygroundRecipe) => {
    if (translatedRecipes[recipe.id]) {
      const currentMode = activeLangRecipe[recipe.id] || 'ru';
      const nextMode = currentMode === 'ru' ? 'original' : 'ru';
      setActiveLangRecipe(prev => ({ ...prev, [recipe.id]: nextMode }));
      setTranslationToast(nextMode === 'ru' ? 'Отображается рецепт на русском' : 'Отображается оригинальный рецепт');
      setTimeout(() => setTranslationToast(null), 3000);
      return;
    }

    setTranslatingRecipeId(recipe.id);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'recipe',
          content: {
            title: recipe.title,
            summary: recipe.summary,
            ingredientsText: recipe.ingredientsText,
            steps: recipe.steps,
            notes: recipe.notes,
            synergyEstimate: recipe.synergyEstimate
          }
        })
      });

      const resText = await response.text();
      let data: any = null;
      try {
        data = resText ? JSON.parse(resText) : {};
      } catch (parseErr) {
        console.warn('Translate recipe parse error:', parseErr);
      }

      if (data?.translated) {
        setTranslatedRecipes(prev => ({
          ...prev,
          [recipe.id]: data.translated
        }));
        setActiveLangRecipe(prev => ({ ...prev, [recipe.id]: 'ru' }));
        setTranslationToast('Рецепт успешно переведен на русский язык');
      } else {
        throw new Error(data?.error || 'Не удалось выполнить перевод');
      }
    } catch (err: any) {
      console.error('Recipe translation failed:', err);
      setTranslationToast(`Ошибка перевода рецепта: ${err.message || 'Попробуйте позже'}`);
    } finally {
      setTranslatingRecipeId(null);
      setTimeout(() => setTranslationToast(null), 4000);
    }
  };

  // Delete an article
  const handleDeleteArticle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles(prev => prev.filter(a => a.id !== id));
    if (selectedArticle?.id === id) {
      setSelectedArticle(null);
    }
  };

  // Delete a recipe
  const handleDeleteRecipe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  // All unique tags across articles
  const allTags = Array.from(
    new Set(articles.flatMap(a => a.tags || []))
  );

  // Filtered Articles
  const filteredArticles = articles.filter(a => {
    const matchesSearch = !articleSearch.trim() || 
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.summary.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.author.toLowerCase().includes(articleSearch.toLowerCase());
    const matchesTag = selectedTag === 'all' || (a.tags && a.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Filtered Recipes
  const filteredRecipes = recipes.filter(r => {
    if (recipeCategoryFilter === 'all') return true;
    return r.category === recipeCategoryFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Playground Header Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                    Playground & Парсер
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Firecrawl API v1
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                  Скрапинг и парсинг аутентичных лонгридов и соусных рецептов из Chinese Cooking Demystified, Serious Eats и Substack
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.08] self-start lg:self-auto">
            <button
              id="playground-subtab-articles"
              onClick={() => { setSubTab('articles'); setSelectedArticle(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'articles'
                  ? 'bg-rose-600 text-white shadow-sm border border-rose-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Статьи</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30 text-rose-200">
                {articles.length}
              </span>
            </button>

            <button
              id="playground-subtab-recipes"
              onClick={() => { setSubTab('recipes'); setSelectedArticle(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'recipes'
                  ? 'bg-rose-600 text-white shadow-sm border border-rose-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Рецепты</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30 text-rose-200">
                {recipes.length}
              </span>
            </button>

            <button
              id="playground-subtab-scraper"
              onClick={() => { setSubTab('scraper'); setSelectedArticle(null); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                subTab === 'scraper'
                  ? 'bg-rose-600 text-white shadow-sm border border-rose-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Web Scraper</span>
            </button>
          </div>
        </div>

        {/* Quick Ingest Bar on Top of Playground */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="url"
              placeholder="Вставьте URL статьи или рецепта (например: https://chinesecookingdemystified.substack.com/p/...)"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePerformScrape();
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/50 focus:bg-white/[0.05] text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          <button
            id="firecrawl-scrape-btn"
            onClick={() => handlePerformScrape()}
            disabled={isScraping || !scrapeUrl.trim()}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-sm shadow-rose-950/40 border border-rose-500/40 shrink-0"
          >
            {isScraping ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Скрапинг через Firecrawl...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Скрапить & Распарсить</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowApiKeyField(!showApiKeyField)}
            className="px-2.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-center space-x-1.5 transition-colors"
            title="Настройки ключа Firecrawl"
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[11px] font-mono hidden sm:inline">fc-09ec...</span>
          </button>
        </div>

        {/* Expandable Firecrawl API Key Settings */}
        {showApiKeyField && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-medium flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                <span>Firecrawl API Key:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Активен</span>
              </span>
            </div>
            <input
              type="text"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.08] text-xs font-mono text-zinc-300 focus:border-rose-500/50 outline-none"
              placeholder="fc-..."
            />
          </div>
        )}

        {/* Quick Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-500 font-mono">Пресеты CCD:</span>
          {PRESET_SCRAPE_URLS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setScrapeUrl(preset.url);
                handlePerformScrape(preset.url);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition-colors flex items-center space-x-1"
            >
              <span>{preset.title}</span>
              <ArrowRight className="w-3 h-3 text-rose-400" />
            </button>
          ))}
        </div>

        {/* Status Alerts */}
        {translationToast && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{translationToast}</span>
            </div>
            <button 
              onClick={() => setTranslationToast(null)}
              className="text-rose-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {scrapeSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{scrapeSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setScrapeSuccessMsg(null)}
              className="text-emerald-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {scrapeError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scrapeError}</span>
            </div>
            <button 
              onClick={() => setScrapeError(null)}
              className="text-rose-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: ARTICLES (СТАТЬИ) */}
      {/* ========================================================= */}
      {subTab === 'articles' && (
        <div className="space-y-6">
          {/* If an article is open in Full Reading View */}
          {selectedArticle ? (() => {
            const isArticleRuActive = (activeLangArticle[selectedArticle.id] || (translatedArticles[selectedArticle.id] ? 'ru' : 'original')) === 'ru' && Boolean(translatedArticles[selectedArticle.id]);
            const transData = translatedArticles[selectedArticle.id];
            const currentTitle = isArticleRuActive && transData?.title ? transData.title : selectedArticle.title;
            const currentSubtitle = isArticleRuActive && transData?.subtitle ? transData.subtitle : selectedArticle.subtitle;
            const currentSummary = isArticleRuActive && transData?.summary ? transData.summary : selectedArticle.summary;
            const currentTakeaways = isArticleRuActive && transData?.keyBiochemicalTakeaways && transData.keyBiochemicalTakeaways.length > 0 ? transData.keyBiochemicalTakeaways : selectedArticle.keyBiochemicalTakeaways;
            const currentMarkdown = isArticleRuActive && transData?.markdownContent ? transData.markdownContent : selectedArticle.markdownContent;

            return (
              <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180 text-rose-400" />
                    <span>Назад ко всем статьям</span>
                  </button>

                  <div className="flex items-center space-x-2.5">
                    {/* TRANSLATE TO RUSSIAN BUTTON */}
                    <button
                      id="translate-article-header-btn"
                      onClick={() => handleToggleTranslateArticle(selectedArticle)}
                      disabled={translatingArticleId === selectedArticle.id}
                      className={`flex items-center space-x-1.5 text-xs px-3.5 py-1.5 rounded-xl border transition-all shadow-sm ${
                        isArticleRuActive
                          ? 'bg-rose-500/20 text-rose-200 border-rose-500/40 hover:bg-rose-500/30'
                          : 'bg-white/[0.05] text-zinc-300 border-white/[0.1] hover:bg-white/[0.09] hover:text-white'
                      }`}
                    >
                      {translatingArticleId === selectedArticle.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          <span>Перевод AI...</span>
                        </>
                      ) : isArticleRuActive ? (
                        <>
                          <Languages className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-semibold text-emerald-300">🇷🇺 На русском</span>
                          <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">(кликните для оригинала)</span>
                        </>
                      ) : (
                        <>
                          <Languages className="w-3.5 h-3.5 text-rose-400" />
                          <span className="font-medium text-white">Перевести на русский</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 underline font-mono"
                    >
                      <span>{selectedArticle.sourceName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Article Header */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedArticle.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                        #{tag}
                      </span>
                    ))}
                    {isArticleRuActive && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Переведено AI
                      </span>
                    )}
                    <span className="text-[11px] font-mono text-zinc-400 flex items-center space-x-1 ml-auto">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>{selectedArticle.readTimeMinutes} мин чтения</span>
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                    {currentTitle}
                  </h1>
                  {currentSubtitle && (
                    <p className="text-sm sm:text-base text-zinc-300 font-light">
                      {currentSubtitle}
                    </p>
                  )}

                  <div className="text-xs text-zinc-500 font-mono flex items-center space-x-2 pt-1">
                    <span>Автор: {selectedArticle.author}</span>
                    {selectedArticle.publishedDate && (
                      <>
                        <span>•</span>
                        <span>{selectedArticle.publishedDate}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Key Takeaways Box */}
                {currentTakeaways && currentTakeaways.length > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Ключевые биохимические выводы</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-200">
                      {currentTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Markdown Content Renderer */}
                <div className="pt-4 border-t border-white/[0.08] text-zinc-200 leading-relaxed text-sm sm:text-base space-y-4 prose prose-invert max-w-none">
                  <div className="markdown-body">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-6 mb-3 pb-2 border-b border-white/[0.08]" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold text-white mt-5 mb-2 text-rose-300" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-zinc-300 leading-relaxed mb-4 text-xs sm:text-sm" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-zinc-300 text-xs sm:text-sm" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 mb-4 text-zinc-300 text-xs sm:text-sm" {...props} />,
                        li: ({node, ...props}) => <li className="text-zinc-300 text-xs sm:text-sm" {...props} />,
                        blockquote: ({node, ...props}) => (
                          <blockquote className="p-3 my-3 rounded-xl bg-white/[0.03] border-l-2 border-rose-500 text-zinc-300 italic text-xs sm:text-sm" {...props} />
                        ),
                        table: ({node, ...props}) => (
                          <div className="overflow-x-auto my-4 rounded-xl border border-white/[0.08]">
                            <table className="w-full text-left text-xs border-collapse" {...props} />
                          </div>
                        ),
                        th: ({node, ...props}) => <th className="p-2.5 bg-white/[0.04] text-white font-semibold border-b border-white/[0.08]" {...props} />,
                        td: ({node, ...props}) => <td className="p-2.5 border-b border-white/[0.04] text-zinc-300" {...props} />,
                        code: ({node, ...props}) => <code className="px-1.5 py-0.5 rounded bg-white/[0.06] text-rose-300 font-mono text-xs" {...props} />
                      }}
                    >
                      {currentMarkdown}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-medium transition-colors"
                  >
                    ← Вернуться к списку статей
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleTranslateArticle(selectedArticle)}
                      disabled={translatingArticleId === selectedArticle.id}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
                    >
                      <Languages className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isArticleRuActive ? 'Показать оригинал' : 'Перевести на русский'}</span>
                    </button>

                    <a
                      href={selectedArticle.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                    >
                      <span>Открыть на Substack</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })() : (
            /* Articles Cards Grid */
            <div className="space-y-4">
              {/* Search & Tags Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Поиск по статьям и авторам..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500/50"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  <button
                    onClick={() => setSelectedTag('all')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      selectedTag === 'all'
                        ? 'bg-white/[0.12] text-white border border-white/[0.16]'
                        : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                    }`}
                  >
                    Все ({articles.length})
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                        selectedTag === tag
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map(article => {
                  const isRuActive = (activeLangArticle[article.id] || (translatedArticles[article.id] ? 'ru' : 'original')) === 'ru' && Boolean(translatedArticles[article.id]);
                  const transData = translatedArticles[article.id];
                  const cardTitle = isRuActive && transData?.title ? transData.title : article.title;
                  const cardSummary = isRuActive && transData?.summary ? transData.summary : article.summary;

                  return (
                    <div
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="group cursor-pointer p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] hover:border-rose-500/30 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                              {article.sourceName}
                            </span>
                            {isRuActive ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                🇷🇺 RU
                              </span>
                            ) : article.isCustomScraped ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Скрапировано
                              </span>
                            ) : null}
                          </div>

                          <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTimeMinutes} мин</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold font-display text-white group-hover:text-rose-300 transition-colors leading-snug">
                          {cardTitle}
                        </h3>

                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                          {cardSummary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {article.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-[10px] font-mono text-zinc-500">
                              #{t}
                            </span>
                          ))}

                          {/* Quick Translate Card Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTranslateArticle(article);
                            }}
                            disabled={translatingArticleId === article.id}
                            className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center space-x-1 transition-colors ${
                              isRuActive
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-white/[0.03] text-zinc-400 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                            }`}
                            title="Перевести на русский"
                          >
                            {translatingArticleId === article.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
                            ) : (
                              <Languages className="w-3 h-3 text-rose-400" />
                            )}
                            <span>{isRuActive ? 'RU (Оригинал)' : 'Перевести'}</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2">
                          {article.isCustomScraped && (
                            <button
                              onClick={(e) => handleDeleteArticle(article.id, e)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              title="Удалить статью"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-xs font-medium text-rose-400 flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                            <span>Читать</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: RECIPES (РЕЦЕПТЫ И ВЫГРУЗКА В КОНСТРУКТОР) */}
      {/* ========================================================= */}
      {subTab === 'recipes' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-zinc-400">
              Найдено рецептов: <span className="text-white font-bold">{filteredRecipes.length}</span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setRecipeCategoryFilter('all')}
                className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  recipeCategoryFilter === 'all'
                    ? 'bg-white/[0.12] text-white border border-white/[0.16]'
                    : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                }`}
              >
                Все категории
              </button>
              <button
                onClick={() => setRecipeCategoryFilter('wanzhi_brown')}
                className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  recipeCategoryFilter === 'wanzhi_brown'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                }`}
              >
                Wanzhi / Браун
              </button>
              <button
                onClick={() => setRecipeCategoryFilter('sichuan_spicy')}
                className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  recipeCategoryFilter === 'sichuan_spicy'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                }`}
              >
                Сычуань / Мапо
              </button>
              <button
                onClick={() => setRecipeCategoryFilter('braising_glaze')}
                className={`text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  recipeCategoryFilter === 'braising_glaze'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
                }`}
              >
                Хуншао Глазурь
              </button>
            </div>
          </div>

          {/* Recipes List Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredRecipes.map(recipe => {
              const isRuActive = (activeLangRecipe[recipe.id] || (translatedRecipes[recipe.id] ? 'ru' : 'original')) === 'ru' && Boolean(translatedRecipes[recipe.id]);
              const transData = translatedRecipes[recipe.id];
              const displayTitle = isRuActive && transData?.title ? transData.title : recipe.title;
              const displaySummary = isRuActive && transData?.summary ? transData.summary : recipe.summary;
              const displayIngredients = isRuActive && transData?.ingredientsText && transData.ingredientsText.length > 0 ? transData.ingredientsText : recipe.ingredientsText;
              const displaySteps = isRuActive && transData?.steps && transData.steps.length > 0 ? transData.steps : recipe.steps;
              const displaySynergy = isRuActive && transData?.synergyEstimate ? transData.synergyEstimate : recipe.synergyEstimate;

              return (
                <div
                  key={recipe.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between space-y-5 hover:border-white/[0.14] transition-all"
                >
                  <div className="space-y-4">
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400 border border-white/[0.06]">
                            {recipe.sourceName}
                          </span>
                          {isRuActive ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              🇷🇺 RU
                            </span>
                          ) : recipe.isCustomScraped ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              Скрапировано
                            </span>
                          ) : null}
                        </div>
                        <h3 className="text-lg font-bold font-display text-white mt-1.5">
                          {displayTitle}
                        </h3>
                        {recipe.chineseTitle && (
                          <div className="flex items-center space-x-2 text-xs text-rose-400 font-mono mt-0.5">
                            <span>{recipe.chineseTitle}</span>
                            {recipe.pinyin && <span className="text-zinc-500">({recipe.pinyin})</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {/* Translate Button on Recipe Card */}
                        <button
                          onClick={() => handleToggleTranslateRecipe(recipe)}
                          disabled={translatingRecipeId === recipe.id}
                          className={`text-xs px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-colors ${
                            isRuActive
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-white/[0.03] text-zinc-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
                          }`}
                          title="Перевести рецепт на русский язык"
                        >
                          {translatingRecipeId === recipe.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Languages className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>{isRuActive ? '🇷🇺 RU' : 'Перевести'}</span>
                        </button>

                        {recipe.isCustomScraped && (
                          <button
                            onClick={(e) => handleDeleteRecipe(recipe.id, e)}
                            className="p-1.5 rounded-lg bg-white/[0.02] hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Удалить рецепт"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {displaySummary}
                    </p>

                    {/* Ingredients Breakdown */}
                    <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span className="flex items-center space-x-1.5">
                          <Utensils className="w-3 h-3 text-rose-400" />
                          <span>Ингредиентный состав ({displayIngredients.length}):</span>
                        </span>
                        <span className="text-zinc-500">{recipe.parsedIngredients?.length || 0} в конструкторе</span>
                      </div>
                      <ul className="space-y-1 text-xs text-zinc-300">
                        {displayIngredients.map((ing, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500/40" />
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Steps Preview */}
                    {displaySteps && displaySteps.length > 0 && (
                      <div className="space-y-1.5 text-xs">
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                          Протокол приготовления:
                        </span>
                        <ol className="list-decimal pl-4 space-y-1 text-zinc-400 text-xs">
                          {displaySteps.slice(0, 3).map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                          {displaySteps.length > 3 && (
                            <li className="text-zinc-600 list-none pt-0.5">
                              + еще {displaySteps.length - 3} шагов...
                            </li>
                          )}
                        </ol>
                      </div>
                    )}

                    {/* Synergy Estimate */}
                    {displaySynergy && (
                      <div className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center space-x-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{displaySynergy}</span>
                      </div>
                    )}
                  </div>

                  {/* Big Action: Load into Sauce Constructor */}
                  <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center space-x-1 font-mono transition-colors"
                    >
                      <span>Оригинал</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      id={`load-recipe-constructor-${recipe.id}`}
                      onClick={() => onLoadRecipeToConstructor(recipe.parsedIngredients, displayTitle)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.98] text-white font-semibold text-xs shadow-md shadow-rose-950/40 border border-rose-400/30 transition-all group"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-rose-200 group-hover:scale-110 transition-transform" />
                      <span>Загрузить в конструктор</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: WEB SCRAPER & SEARCH EXPLORER */}
      {/* ========================================================= */}
      {subTab === 'scraper' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold font-display text-white">
                Поиск & Скрапинг кулинарных источников
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Ищите материалы по ключевым словам (например, «Wanzhi sauce», «Sichuan Doubanjiang», «Gouqian starch») или скрапьте любую статью напрямую по ссылке
              </p>
            </div>

            {/* Search Box */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Поиск по Chinese Cooking Demystified Substack и базам рецептов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePerformSearch();
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs sm:text-sm text-white placeholder-zinc-500 outline-none focus:border-rose-500/50"
                />
              </div>

              <button
                onClick={() => handlePerformSearch()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] active:bg-white/[0.18] disabled:opacity-50 text-white font-medium text-xs border border-white/[0.1] transition-all flex items-center space-x-1.5"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Поиск...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Найти</span>
                  </>
                )}
              </button>
            </div>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono text-zinc-400">
                  Результаты поиска ({searchResults.length}):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {res.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                          {res.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-zinc-500 hover:text-white truncate max-w-[180px]"
                        >
                          {res.url}
                        </a>

                        <button
                          onClick={() => {
                            setScrapeUrl(res.url);
                            handlePerformScrape(res.url);
                          }}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Скрапить</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scraped Content Inspector (if just scraped) */}
          {scrapedDataResult && (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/30 backdrop-blur-xl space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Результат последнего скрапинга</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                  Тип: {scrapedDataResult.classification}
                </span>
              </div>

              {scrapedDataResult.recipe && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      {scrapedDataResult.recipe.title}
                    </span>
                    <button
                      onClick={() => onLoadRecipeToConstructor(scrapedDataResult.recipe.parsedIngredients, scrapedDataResult.recipe.title)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>Сразу загрузить в конструктор</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300">
                    {scrapedDataResult.recipe.summary}
                  </p>
                </div>
              )}

              {scrapedDataResult.article && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-zinc-300 truncate max-w-md">
                    Статья: <strong className="text-white">{scrapedDataResult.article.title}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedArticle(scrapedDataResult.article);
                      setSubTab('articles');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center space-x-1 shrink-0"
                  >
                    <span>Открыть в ридере</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
