import React, { useState } from 'react';
import { ActiveTab, TasteProfile } from '../types';
import { 
   FlaskConical, 
   BookOpen, 
   Flame, 
   PackageCheck, 
   Sparkles, 
   SlidersHorizontal,
   Share2, 
   RotateCcw,
   Layers,
   Menu,
   X,
   Activity,
   Check,
   ChevronRight,
   Command,
   Zap,
   Globe,
   Database,
   Server,
   RefreshCw,
   AlertCircle,
   Terminal,
   Copy
 } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasteProfile: TasteProfile;
  portions: number;
  setPortions: (p: number) => void;
  onReset: () => void;
  onExport: () => void;
  dbStatus?: {
    connected: boolean;
    host?: string;
    database?: string;
    tables?: string[];
    error?: string;
  };
  onRefreshDb?: () => Promise<void> | void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  tasteProfile,
  portions,
  setPortions,
  onReset,
  onExport,
  dbStatus,
  onRefreshDb
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDbInfo, setShowDbInfo] = useState(false);
  const [isRefreshingDb, setIsRefreshingDb] = useState(false);
  const [showVpsGuide, setShowVpsGuide] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleManualRefreshDb = async () => {
    if (!onRefreshDb || isRefreshingDb) return;
    setIsRefreshingDb(true);
    try {
      await onRefreshDb();
    } finally {
      setTimeout(() => setIsRefreshingDb(false), 500);
    }
  };

  const vpsSetupScript = `# 1. Открыть порт в фаерволе Ubuntu
sudo ufw allow 5432/tcp

# 2. Разрешить удаленные подключения в postgresql.conf
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/*/main/postgresql.conf

# 3. Разрешить доступ пользователю umami_user в pg_hba.conf
echo "host umami_db umami_user 0.0.0.0/0 scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# 4. Перезапустить PostgreSQL
sudo systemctl restart postgresql`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(vpsSetupScript);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; key: string }[] = [
    { id: 'constructor', label: 'Конструктор', icon: <FlaskConical className="w-3.5 h-3.5" />, key: '1' },
    { id: 'protein_matrix', label: 'Матрица белка', icon: <Layers className="w-3.5 h-3.5 text-amber-400" />, badge: '18', key: '2' },
    { id: 'library', label: 'Профили соусов', icon: <Layers className="w-3.5 h-3.5" />, badge: '14', key: '3' },
    { id: 'playground', label: 'Playground', icon: <Globe className="w-3.5 h-3.5 text-rose-400" />, badge: 'Web', key: '4' },
    { id: 'protocol', label: 'Вок-протокол', icon: <Flame className="w-3.5 h-3.5" />, key: '5' },
    { id: 'pantry', label: 'Кладовая', icon: <PackageCheck className="w-3.5 h-3.5" />, badge: '28', key: '6' },
    { id: 'science', label: 'Наука об Умами', icon: <BookOpen className="w-3.5 h-3.5" />, key: '7' },
    { id: 'ai_synthesizer', label: 'AI Шеф-Инженер', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400" />, badge: 'AI', key: '8' },
    { id: 'optimizer', label: 'Оптимизатор', icon: <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />, badge: '★', key: '9' }
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
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* VPS PostgreSQL Cloud Sync Indicator */}
            <div className="relative">
              <button
                onClick={() => setShowDbInfo(!showDbInfo)}
                id="vps-db-status-btn"
                className={`flex items-center space-x-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-mono transition-all touch-manipulation ${
                  dbStatus?.connected
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                }`}
                title="Статус базы данных PostgreSQL на вашем VPS"
                aria-label="Статус базы данных"
              >
                <Database className="w-3.5 h-3.5" />
                <span className={`w-1.5 h-1.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="hidden xl:inline text-[11px]">
                  {dbStatus?.connected ? 'VPS DB Active' : 'DB Connecting'}
                </span>
              </button>

              {/* DB Info Dropdown (Constrained for mobile screen width) */}
              {showDbInfo && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-24px)] sm:w-80 max-w-md p-3.5 rounded-xl bg-[#0E1118] border border-white/[0.12] shadow-2xl z-50 space-y-3 animate-in fade-in-50 zoom-in-95 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                    <div className="flex items-center space-x-2">
                      <Server className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-white">PostgreSQL VPS</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={handleManualRefreshDb}
                        disabled={isRefreshingDb}
                        className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                        title="Проверить подключение заново"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshingDb ? 'animate-spin text-emerald-400' : ''}`} />
                      </button>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        dbStatus?.connected 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {dbStatus?.connected ? 'Онлайн' : 'Не подключен'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Хост:</span>
                      <span className="text-zinc-200">{dbStatus?.host || '2.26.86.122'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>База данных:</span>
                      <span className="text-zinc-200">{dbStatus?.database || 'umami_db'}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Синхронизация:</span>
                      <span className="text-emerald-400">Рецепты, Кладовая, Статьи</span>
                    </div>
                    {dbStatus?.tables && dbStatus.tables.length > 0 && (
                      <div className="pt-1 text-[10px] text-zinc-400 border-t border-white/[0.04]">
                        Таблицы: <span className="text-emerald-300 font-mono">{dbStatus.tables.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Error diagnosis block if not connected */}
                  {!dbStatus?.connected && (
                    <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start space-x-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-[11px] text-amber-200/90 leading-tight">
                          <div className="font-semibold text-amber-300 mb-0.5">Причина:</div>
                          {dbStatus?.error || 'Сервер Vercel не может достучаться до порта 5432 на VPS.'}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowVpsGuide(!showVpsGuide)}
                        className="w-full py-1 px-2 rounded bg-white/[0.05] hover:bg-white/[0.09] text-[10px] font-mono text-zinc-300 flex items-center justify-between transition-colors border border-white/[0.08]"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>Инструкция: как открыть доступ на VPS</span>
                        </span>
                        <span className="text-zinc-500">{showVpsGuide ? '▲' : '▼'}</span>
                      </button>

                      {showVpsGuide && (
                        <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.08] space-y-2 text-[10px] font-mono animate-in fade-in-50">
                          <div className="flex justify-between items-center text-zinc-400 pb-1 border-b border-white/[0.06]">
                            <span>Выполните на вашем сервере по SSH:</span>
                            <button
                              onClick={copyScriptToClipboard}
                              className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>{copiedCmd ? 'Скопировано!' : 'Скопировать'}</span>
                            </button>
                          </div>
                          <pre className="text-emerald-300/90 overflow-x-auto text-[10px] leading-relaxed whitespace-pre font-mono p-1 bg-black/40 rounded">
                            {vpsSetupScript}
                          </pre>
                        </div>
                      )}

                      <button
                        onClick={handleManualRefreshDb}
                        disabled={isRefreshingDb}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshingDb ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingDb ? 'Проверка соединения...' : 'Повторить подключение'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Linear-style Stepper with Touch-optimized sizing */}
            <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5 text-xs">
              <span className="text-[11px] text-zinc-400 px-2 font-medium hidden sm:inline">Порции:</span>
              <button
                onClick={() => setPortions(Math.max(1, portions - 1))}
                aria-label="Уменьшить порции"
                className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors touch-manipulation"
              >
                -
              </button>
              <span className="w-5 text-center font-mono text-xs font-semibold text-white">
                {portions}
              </span>
              <button
                onClick={() => setPortions(Math.min(10, portions + 1))}
                aria-label="Увеличить порции"
                className="w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.15] transition-colors touch-manipulation"
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
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-medium text-xs transition-all shadow-sm shadow-rose-950/40 border border-rose-500/40 touch-manipulation"
              title="Открыть технологическую карту"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Техкарта</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white active:bg-white/[0.1] touch-manipulation"
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar with Momentum Scroll */}
      <div className="md:hidden border-t border-white/[0.06] px-2.5 py-1.5 overflow-x-auto flex items-center space-x-1.5 bg-[#08090C]/80 backdrop-blur-md scroll-smooth [-webkit-overflow-scrolling:touch]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation ${
                isActive 
                  ? 'bg-rose-500/20 text-white border border-rose-500/30 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 bg-white/[0.03] active:bg-white/[0.06]'
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

