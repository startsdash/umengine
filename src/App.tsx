import React, { useState, useMemo, useEffect } from 'react';
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

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('constructor');
  const [portions, setPortions] = useState<number>(2);
  const [selectedProtein, setSelectedProtein] = useState<string>('doupi');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Active Recipe State (Defaulting to Classic Wanzhi Brown Sauce)
  const defaultPreset = SAUCE_PRESETS[0];
  const [activePresetId, setActivePresetId] = useState<string>(defaultPreset.id);
  const [recipeTitle, setRecipeTitle] = useState<string>(defaultPreset.title);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(defaultPreset.ingredients);
  const [steps, setSteps] = useState<CulinaryStep[]>(defaultPreset.steps);

  // Pantry State (Initialized with full user inventory, with local storage recovery)
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

  // Save Pantry to LocalStorage
  useEffect(() => {
    localStorage.setItem('umami_pantry_v1', JSON.stringify(pantryList));
  }, [pantryList]);

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
    setSteps(preset.steps);
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
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tasteProfile={tasteProfile}
        portions={portions}
        setPortions={setPortions}
        onReset={handleReset}
        onExport={() => setShowExportModal(true)}
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
              />
            </div>

            {/* Right Column: Live Telemetry & Kinetic Visualizers (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <UmamiRadar tasteProfile={tasteProfile} />
              <SynergyCurve tasteProfile={tasteProfile} />
            </div>
          </div>
        )}

        {/* TAB 2: PRESET LIBRARY */}
        {activeTab === 'library' && (
          <div className="animate-fade-in">
            <PresetLibrary
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
            />
          </div>
        )}

        {/* TAB: PLAYGROUND (FIRE CRAWL SCRAPER, ARTICLES & RECIPES) */}
        {activeTab === 'playground' && (
          <div className="animate-fade-in">
            <Playground
              pantryList={pantryList}
              tasteProfile={tasteProfile}
              onLoadRecipeToConstructor={handleLoadPlaygroundRecipe}
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
        <p>Umami Engineer · Основано на исследованиях Yamaguchi & Ninomiya (2000) и Chinese Cooking Demystified</p>
      </footer>
    </div>
  );
};
export default App;
