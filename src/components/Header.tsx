import React from 'react';
import { ActiveTab, TasteProfile } from '../types';
import { 
  FlaskConical, 
  BookOpen, 
  Flame, 
  PackageCheck, 
  Sparkles, 
  Share2, 
  RotateCcw,
  Layers
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
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'constructor', label: 'Конструктор', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'library', label: 'Профили соусов', icon: <Layers className="w-4 h-4" />, badge: '7' },
    { id: 'protocol', label: 'Вок-протокол', icon: <Flame className="w-4 h-4" /> },
    { id: 'pantry', label: 'Моя кладовая', icon: <PackageCheck className="w-4 h-4" />, badge: '28' },
    { id: 'science', label: 'Наука об Умами', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'ai_synthesizer', label: 'AI Шеф-Инженер', icon: <Sparkles className="w-4 h-4" />, badge: 'AI' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#090D12]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Telemetry Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
              <FlaskConical className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-lg text-white tracking-tight">UMAMI ENGINEER</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                  v2.5 · γ=1218
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Биохимический генератор соусов китайской традиции
              </p>
            </div>
          </div>

          {/* Mobile Fast Action */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={onExport}
              id="mobile-share-btn"
              className="p-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-300 hover:text-white"
              title="Экспорт техкарты"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="hidden lg:flex items-center space-x-4 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 font-mono-tabular text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500">Синергия:</span>
            <span className={`font-semibold ${tasteProfile.synergyMultiplier > 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {tasteProfile.synergyMultiplier}×
            </span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500">Умами (0-10):</span>
            <span className="text-rose-400 font-bold">
              {tasteProfile.umamiIntensityScore}
            </span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500">Соль:</span>
            <span className="text-cyan-400">
              {tasteProfile.salinityPercent}%
            </span>
            <span className="text-[10px] text-emerald-400 font-sans">(-{tasteProfile.saltReductionBonusPercent}%)</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center space-x-1.5">
            <span className="text-zinc-500">Текстура:</span>
            <span className="text-zinc-300 truncate max-w-[110px]">
              {tasteProfile.viscosityLabel.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Portions & Actions */}
        <div className="flex items-center space-x-3 justify-between md:justify-end">
          {/* Portion Adjuster */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1">
            <span className="text-xs text-zinc-400 px-2 font-medium">Порции:</span>
            <button
              onClick={() => setPortions(Math.max(1, portions - 1))}
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              -
            </button>
            <span className="w-7 text-center font-mono text-xs font-bold text-white">
              {portions}
            </span>
            <button
              onClick={() => setPortions(Math.min(10, portions + 1))}
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              +
            </button>
          </div>

          <button
            onClick={onReset}
            id="reset-recipe-btn"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
            title="Сбросить конструктор к базовому Wanzhi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Сброс</span>
          </button>

          <button
            onClick={onExport}
            id="export-lab-sheet-btn"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all shadow-sm shadow-rose-900/30"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Техкарта</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <nav className="max-w-7xl mx-auto mt-3 overflow-x-auto no-scrollbar flex items-center space-x-1 border-t border-zinc-800/60 pt-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
