import React, { useState } from 'react';
import { ActiveTab, TasteProfile } from '../types';
import { 
   FlaskConical, 
   BookOpen, 
   Flame, 
   PackageCheck, 
   Sparkles, 
   Share2, 
   RotateCcw,
   Layers,
   Menu,
   X,
   Activity,
   Check,
   ChevronRight,
   Command,
   Zap
 } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasteProfile: TasteProfile;
  portions: number;
  setPortions: (p: number) => void;
  onReset: () => void;
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  tasteProfile,
  portions,
  setPortions,
  onReset,
  onExport
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; key: string }[] = [
    { id: 'constructor', label: 'Конструктор', icon: <FlaskConical className="w-3.5 h-3.5" />, key: '1' },
    { id: 'library', label: 'Профили соусов', icon: <Layers className="w-3.5 h-3.5" />, badge: '7', key: '2' },
    { id: 'protocol', label: 'Вок-протокол', icon: <Flame className="w-3.5 h-3.5" />, key: '3' },
    { id: 'pantry', label: 'Кладовая', icon: <PackageCheck className="w-3.5 h-3.5" />, badge: '28', key: '4' },
    { id: 'science', label: 'Наука об Умами', icon: <BookOpen className="w-3.5 h-3.5" />, key: '5' },
    { id: 'ai_synthesizer', label: 'AI Шеф-Инженер', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />, badge: 'AI', key: '6' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#08090C]/90 backdrop-blur-xl border-b border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2 sm:gap-4">
          
          {/* Left: Brand Identity (Linear-style) */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-rose-500/20 to-rose-500/5 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-xs sm:text-sm tracking-tight text-white">
                  Umami Engineer
                </span>
                <span className="text-[10px] font-mono text-zinc-500 hidden md:inline px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
                  γ=1218
                </span>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="hidden md:block w-px h-4 bg-white/[0.08]" />

            {/* Linear-style Live Telemetry Pill */}
            <div className="hidden lg:flex items-center space-x-3 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono-tabular">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-400">Синергия:</span>
                <span className={`font-semibold ${tasteProfile.synergyMultiplier > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {tasteProfile.synergyMultiplier}×
                </span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-400">Умами:</span>
                <span className="font-semibold text-rose-400">
                  {tasteProfile.umamiIntensityScore.toFixed(1)}/10
                </span>
              </div>
              <span className="text-zinc-700">•</span>
              <div className="flex items-center space-x-1">
                <span className="text-zinc-400">Соль:</span>
                <span className="text-zinc-300 font-medium">
                  {tasteProfile.salinityPercent}%
                </span>
                <span className="text-[10px] text-emerald-400">
                  (-{tasteProfile.saltReductionBonusPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Center/Desktop Nav: Linear-style Segmented Nav */}
          <nav className="hidden md:flex items-center space-x-0.5 bg-white/[0.02] p-1 rounded-lg border border-white/[0.06]">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-white/[0.1] text-white shadow-sm border border-white/[0.12]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      isActive 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-white/[0.04] text-zinc-400 border border-white/[0.06]'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Portions + Export + Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Linear-style Stepper */}
            <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5 text-xs">
              <span className="text-[11px] text-zinc-400 px-2 font-medium hidden sm:inline">Порции:</span>
              <button
                onClick={() => setPortions(Math.max(1, portions - 1))}
                aria-label="Уменьшить порции"
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                -
              </button>
              <span className="w-5 text-center font-mono text-xs font-semibold text-white">
                {portions}
              </span>
              <button
                onClick={() => setPortions(Math.min(10, portions + 1))}
                aria-label="Увеличить порции"
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                +
              </button>
            </div>

            {/* Quick Reset Button */}
            <button
              onClick={onReset}
              id="reset-recipe-btn"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
              title="Сбросить конструктор"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px]">Сброс</span>
            </button>

            {/* Primary Action Button (Linear Accent) */}
            <button
              onClick={onExport}
              id="export-lab-sheet-btn"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs transition-all shadow-sm shadow-rose-950/40 border border-rose-500/40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Техкарта</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar for Fast Switching */}
      <div className="md:hidden border-t border-white/[0.06] px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center space-x-1.5 bg-[#08090C]/60">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-white/[0.12] text-white border border-white/[0.16] shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.02]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Fullscreen Drawer / Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0E1015] p-4 space-y-4 shadow-2xl animate-fade-in">
          {/* Mobile Telemetry Summary */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Синергия Ямагучи:</span>
              <span className="font-bold text-amber-400">{tasteProfile.synergyMultiplier}×</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Сенсорный умами:</span>
              <span className="font-bold text-rose-400">{tasteProfile.umamiIntensityScore.toFixed(1)} / 10</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Соленость NaCl:</span>
              <span className="font-bold text-cyan-400">{tasteProfile.salinityPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>Текстура Gouqian:</span>
              <span className="text-zinc-200">{tasteProfile.viscosityLabel}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider px-1">
              Разделы приложения
            </span>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' 
                      : 'text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {tab.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
            <button
              onClick={() => {
                onReset();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-white/[0.04] text-xs text-zinc-400 hover:text-white flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить соус</span>
            </button>

            <button
              onClick={() => {
                onExport();
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium shadow-sm flex items-center space-x-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Открыть техкарту</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

