import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ActiveTab, 
  PantryIngredient, 
  RecipeIngredient, 
  SauceArchetype, 
  CulinaryStep 
} from './types';
import { PANTRY_INGREDIENTS } from './data/pantry';
import { SAUCE_PRESETS } from './data/presets';
import { calculateTasteProfile } from './utils/umamiCalculator';

import { Header } from './components/Header';
import { UmamiRadar } from './components/UmamiRadar';
import { SynergyCurve } from './components/SynergyCurve';
import { SauceConstructor } from './components/SauceConstructor';
import { PresetLibrary } from './components/PresetLibrary';
import { PantryManager } from './components/PantryManager';
import { CookingProtocol } from './components/CookingProtocol';
import { ScienceCompendium } from './components/ScienceCompendium';
import { AiSynthesizer } from './components/AiSynthesizer';
import { Playground } from './components/Playground';
import { LabExportModal } from './components/LabExportModal';
import { ProteinMatrixExplorer } from './components/ProteinMatrixExplorer';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('constructor');
  const [portions, setPortions] = useState<number>(2);
  const [selectedProtein, setSelectedProtein] = useState<string>('doupi');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Local Storage Database State (DB disconnected for reliable deployment)
  const [dbStatus] = useState<{
    connected: boolean;
    disabled?: boolean;
    host?: string;
    database?: string;
    tables?: string[];
    error?: string;
  }>({
    connected: false,
    disabled: true,
    host: 'Local Storage (Офлайн)',
    database: 'Browser Cache'
  });

  // Custom Sauces State (Loaded & saved in LocalStorage)
  const [customSauces, setCustomSauces] = useState<(SauceArchetype & { createdAt?: string; updatedAt?: string })[]>(() => {
    const saved = localStorage.getItem('umami_custom_sauces_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  // Active Recipe State (Defaulting to Classic Wanzhi Brown Sauce)
  const defaultPreset = SAUCE_PRESETS[0];
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [recipeTitle, setRecipeTitle] = useState<string>(defaultPreset.title);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(defaultPreset.ingredients);
  const [steps, setSteps] = useState<CulinaryStep[]>(defaultPreset.steps);

  // Pantry State (Initialized with full user inventory, saved to LocalStorage)
  const [pantryList, setPantryList] = useState<PantryIngredient[]>(() => {
    const saved = localStorage.getItem('umami_pantry_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return PANTRY_INGREDIENTS;
  });

  // Save Custom Sauces to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('umami_custom_sauces_v1', JSON.stringify(customSauces));
    } catch (e) {
      console.warn('LocalStorage save failed for custom sauces:', e);
    }
  }, [customSauces]);

  // Save Pantry to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('umami_pantry_v1', JSON.stringify(pantryList));
    } catch (e) {
      console.warn('LocalStorage save failed for pantry:', e);
    }
  }, [pantryList]);

  // Save Custom Sauce to LocalStorage
  const handleSaveSauceToDb = async (sauceData: Partial<SauceArchetype>): Promise<boolean> => {
    try {
      const newSauce: SauceArchetype & { createdAt?: string; updatedAt?: string } = {
        id: sauceData.id || `custom_sauce_${Date.now()}`,
        title: sauceData.title || recipeTitle,
        subtitle: sauceData.subtitle || 'Пользовательский соус',
        chineseTitle: sauceData.chineseTitle || '',
        pinyin: sauceData.pinyin || '',
        category: (sauceData.category as any) || 'wanzhi_brown',
        summary: sauceData.summary || '',
        defaultPortions: sauceData.defaultPortions || portions,
        ingredients: sauceData.ingredients || ingredients,
        steps: sauceData.steps || steps,
        proTips: sauceData.proTips || ['Сохранено в локальном хранилище'],
        targetProteins: sauceData.targetProteins || [selectedProtein],
        literatureReference: 'Umami Lab Recipe (Local Storage)',
        scientificBreakdown: sauceData.scientificBreakdown || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCustomSauces(prev => [newSauce, ...prev.filter(s => s.id !== newSauce.id)]);
      return true;
    } catch (err) {
      console.error('Error saving sauce locally:', err);
      return false;
    }
  };

  // Delete Custom Sauce from LocalStorage
  const handleDeleteCustomSauce = async (id: string) => {
    setCustomSauces(prev => prev.filter(s => s.id !== id));
  };

  // Toggle Pantry Item Stock
  const handleTogglePantryItem = (id: string) => {
    setPantryList(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, inPantry: !item.inPantry };
      }
      return item;
    }));
  };

  // Real-time biochemical simulation
  const tasteProfile = useMemo(() => {
    return calculateTasteProfile(ingredients, pantryList, portions);
  }, [ingredients, pantryList, portions]);

  // Handle Preset Loading
  const handleSelectPreset = (preset: SauceArchetype) => {
    setActivePresetId(preset.id);
    setRecipeTitle(preset.title);
    setIngredients(preset.ingredients);
    setSteps(preset.steps || []);
    setActiveTab('constructor');
  };

  // Handle AI Recipe Application
  const handleApplyAiRecipe = (aiIngredients: RecipeIngredient[], title: string) => {
    setActivePresetId('custom_ai');
    setRecipeTitle(title);
    setIngredients(aiIngredients);
    setActiveTab('constructor');
  };

  // Handle Loading Recipe from Playground to Constructor
  const handleLoadPlaygroundRecipe = (loadedIngredients: RecipeIngredient[], title: string) => {
    setActivePresetId('scraped_' + Date.now());
    setRecipeTitle(title);
    setIngredients(loadedIngredients);
    setActiveTab('constructor');
  };

  // Handle direct ingredient addition (e.g. from UmamiRadar recommendation drawer)
  const handleAddIngredient = (ingredient: PantryIngredient) => {
    if (ingredients.some(i => i.ingredientId === ingredient.id)) return;
    
    let defaultStage: any = 'seasoning_mix';
    if (ingredient.category === 'aromatics' || ingredient.id === 'pixian_doubanjiang') {
      defaultStage = 'baoguo_aromatics';
    } else if (ingredient.id === 'potato_starch') {
      defaultStage = 'slurry_gouqian';
    } else if (ingredient.id === 'water_stock' || ingredient.id === 'pickle_brine') {
      defaultStage = 'liquid_base';
    } else if (ingredient.id === 'sesame_oil') {
      defaultStage = 'finish_mingyou';
    }

    const defaultAmount = ingredient.defaultUnit === 'ml' ? 15 : ingredient.defaultUnit === 'g' ? 10 : 1;

    setIngredients(prev => [
      ...prev,
      {
        ingredientId: ingredient.id,
        amount: defaultAmount,
        unit: ingredient.defaultUnit as any,
        stage: defaultStage
      }
    ]);
  };

  // Handle Reset to Default
  const handleReset = () => {
    setActivePresetId(defaultPreset.id);
    setRecipeTitle(defaultPreset.title);
    setIngredients(defaultPreset.ingredients);
    setSteps(defaultPreset.steps);
    setPortions(2);
  };

  return (
    <div className="min-h-screen bg-[#090D12] text-zinc-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* App Header with PostgreSQL VPS Indicator */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasteProfile={tasteProfile}
        portions={portions}
        setPortions={setPortions}
        onReset={handleReset}
        onExport={() => setShowExportModal(true)}
        dbStatus={dbStatus}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* TAB 1: WORKBENCH / CONSTRUCTOR */}
        {activeTab === 'constructor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            {/* Left Column: Interactive Workbench (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono text-rose-400">
                    ТЕКУЩИЙ СОУСНЫЙ КАРКАС:
                  </span>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                    {recipeTitle}
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {ingredients.length} компонентов
                </span>
              </div>

              <SauceConstructor
                ingredients={ingredients}
                setIngredients={setIngredients}
                pantryList={pantryList}
                tasteProfile={tasteProfile}
                selectedProtein={selectedProtein}
                setSelectedProtein={setSelectedProtein}
                portions={portions}
                recipeTitle={recipeTitle}
                onSaveSauceToDb={handleSaveSauceToDb}
              />
            </div>

            {/* Right Column: Live Telemetry & Kinetic Visualizers (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <UmamiRadar 
                tasteProfile={tasteProfile} 
                pantryList={pantryList}
                currentIngredients={ingredients}
                onAddIngredient={handleAddIngredient}
              />
              <SynergyCurve tasteProfile={tasteProfile} />
            </div>
          </div>
        )}

        {/* TAB: PROTEIN MATRIX & BIOCHEMICAL ATLAS */}
        {activeTab === 'protein_matrix' && (
          <div className="animate-fade-in">
            <ProteinMatrixExplorer
              onSelectProteinForConstructor={(proteinId) => {
                setSelectedProtein(proteinId);
                setActiveTab('constructor');
              }}
            />
          </div>
        )}

        {/* TAB 2: PRESET LIBRARY (INCLUDING POSTGRESQL CUSTOM FORMULAS) */}
        {activeTab === 'library' && (
          <div className="animate-fade-in">
            <PresetLibrary
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
              customSauces={customSauces}
              onDeleteCustomSauce={handleDeleteCustomSauce}
            />
          </div>
        )}

        {/* TAB: PLAYGROUND (FIRE CRAWL SCRAPER, ARTICLES & RECIPES IN POSTGRESQL) */}
        {activeTab === 'playground' && (
          <div className="animate-fade-in">
            <Playground
              pantryList={pantryList}
              tasteProfile={tasteProfile}
              onLoadRecipeToConstructor={handleLoadPlaygroundRecipe}
              onSaveSauceToDb={handleSaveSauceToDb}
            />
          </div>
        )}

        {/* TAB 3: WOK PROTOCOL */}
        {activeTab === 'protocol' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <CookingProtocol
              steps={steps}
              recipeTitle={recipeTitle}
              selectedProtein={selectedProtein}
            />
          </div>
        )}

        {/* TAB 4: PANTRY INVENTORY */}
        {activeTab === 'pantry' && (
          <div className="animate-fade-in">
            <PantryManager
              pantryList={pantryList}
              onTogglePantryItem={handleTogglePantryItem}
            />
          </div>
        )}

        {/* TAB 5: SCIENCE COMPENDIUM */}
        {activeTab === 'science' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <ScienceCompendium />
          </div>
        )}

        {/* TAB 6: AI SYNTHESIZER */}
        {activeTab === 'ai_synthesizer' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            <AiSynthesizer
              pantryList={pantryList}
              tasteProfile={tasteProfile}
              selectedProtein={selectedProtein}
              onApplyRecipe={handleApplyAiRecipe}
            />
          </div>
        )}
      </main>

      {/* Lab Spec Modal */}
      {showExportModal && (
        <LabExportModal
          recipeTitle={recipeTitle}
          ingredients={ingredients}
          pantryList={pantryList}
          tasteProfile={tasteProfile}
          steps={steps}
          selectedProtein={selectedProtein}
          portions={portions}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footer Note */}
      <footer className="border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>Umami Engineer · Автономный режим (Local Storage) · Синергия Yamaguchi & Ninomiya</p>
      </footer>
    </div>
  );
};
export default App;
