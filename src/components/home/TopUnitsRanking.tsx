import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Trophy, ChevronUp, ChevronDown, Calendar, Utensils, Bike, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { PORTAL_MONTH_OPTIONS, CURRENT_PORTAL_MONTH, isCurrentPortalMonth, formatPortalMonthDropdownItem } from '../../utils/date';

type ModalityTab = 'delivery' | 'self-service';

interface MedalConfig {
  title: string;
  ribbonLeft: string;
  ribbonRight: string;
  ribbonStripe: string;
  rimOuter: string;
  rimInner: string;
  coinGradStart: string;
  coinGradMid: string;
  coinGradEnd: string;
  textColor: string;
  textShadow: string;
  sparkle?: boolean;
}

const MEDAL_CONFIGS: Record<number, MedalConfig> = {
  1: {
    title: 'Medalha de Ouro - 1º Lugar',
    ribbonLeft: '#991b1b', // rubi / burgundy Ambozini
    ribbonRight: '#7f1d1d',
    ribbonStripe: '#fde047', // listra dourada
    rimOuter: '#ca8a04',
    rimInner: '#fef08a',
    coinGradStart: '#fef08a',
    coinGradMid: '#f59e0b',
    coinGradEnd: '#b45309',
    textColor: '#78350f',
    textShadow: 'rgba(255,255,255,0.6)',
    sparkle: true
  },
  2: {
    title: 'Medalha de Prata - 2º Lugar',
    ribbonLeft: '#1e3a8a', // azul real
    ribbonRight: '#172554',
    ribbonStripe: '#f1f5f9', // listra prata
    rimOuter: '#64748b',
    rimInner: '#f8fafc',
    coinGradStart: '#ffffff',
    coinGradMid: '#cbd5e1',
    coinGradEnd: '#64748b',
    textColor: '#1e293b',
    textShadow: 'rgba(255,255,255,0.7)'
  },
  3: {
    title: 'Medalha de Bronze - 3º Lugar',
    ribbonLeft: '#065f46', // verde escuro contrastante
    ribbonRight: '#022c22',
    ribbonStripe: '#fed7aa', // listra bronze
    rimOuter: '#9a3412',
    rimInner: '#fdba74',
    coinGradStart: '#fed7aa',
    coinGradMid: '#ea580c',
    coinGradEnd: '#9a3412',
    textColor: '#451a03',
    textShadow: 'rgba(255,255,255,0.5)'
  },
  4: {
    title: '4º Lugar - Medalha de Honra ao Mérito',
    ribbonLeft: '#7c172e',
    ribbonRight: '#4c0519',
    ribbonStripe: '#cbd5e1',
    rimOuter: '#475569',
    rimInner: '#94a3b8',
    coinGradStart: '#f1f5f9',
    coinGradMid: '#94a3b8',
    coinGradEnd: '#475569',
    textColor: '#0f172a',
    textShadow: 'rgba(255,255,255,0.5)'
  },
  5: {
    title: '5º Lugar - Medalha de Honra ao Mérito',
    ribbonLeft: '#334155',
    ribbonRight: '#0f172a',
    ribbonStripe: '#e7e5e4',
    rimOuter: '#57534e',
    rimInner: '#a8a29e',
    coinGradStart: '#e7e5e4',
    coinGradMid: '#78716c',
    coinGradEnd: '#44403c',
    textColor: '#ffffff',
    textShadow: 'rgba(0,0,0,0.5)'
  }
};

const PositionMedal: React.FC<{ position: number; className?: string }> = ({ position, className = '' }) => {
  const p = Math.max(1, Math.min(5, position || 1));
  const cfg = MEDAL_CONFIGS[p] || MEDAL_CONFIGS[5];
  const uid = `pos-medal-${p}`;

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={cfg.title}
    >
      <svg
        width="32"
        height="40"
        viewBox="0 0 32 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-xs"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-coin`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.coinGradStart} />
            <stop offset="45%" stopColor={cfg.coinGradMid} />
            <stop offset="100%" stopColor={cfg.coinGradEnd} />
          </linearGradient>
          <linearGradient id={`${uid}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.rimInner} />
            <stop offset="100%" stopColor={cfg.rimOuter} />
          </linearGradient>
        </defs>

        {/* Ribbons V-shape */}
        {/* Left strap */}
        <polygon points="6,1 13,1 16,18 9,18" fill={cfg.ribbonLeft} />
        <polygon points="8.5,1 10.5,1 13.5,18 11.5,18" fill={cfg.ribbonStripe} opacity="0.85" />

        {/* Right strap */}
        <polygon points="26,1 19,1 16,18 23,18" fill={cfg.ribbonRight} />
        <polygon points="23.5,1 21.5,1 18.5,18 20.5,18" fill={cfg.ribbonStripe} opacity="0.85" />

        {/* Ribbon Fold shadow */}
        <polygon points="13,17 19,17 16,21" fill="rgba(0,0,0,0.25)" />

        {/* Coin Outer Beveled Rim */}
        <circle cx="16" cy="27" r="12" fill={`url(#${uid}-rim)`} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />

        {/* Coin Inner Face */}
        <circle cx="16" cy="27" r="10.2" fill={`url(#${uid}-coin)`} />

        {/* Coin Decorative Dashed Inset Ring */}
        <circle
          cx="16"
          cy="27"
          r="8.8"
          fill="none"
          stroke={cfg.rimInner}
          strokeWidth="0.65"
          strokeDasharray="1.2 1"
          opacity="0.8"
        />

        {/* Ordinal Text */}
        <text
          x="16"
          y="31"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill={cfg.textColor}
          style={{ textShadow: `0 1px 1px ${cfg.textShadow}` }}
        >
          {p}º
        </text>

        {/* Sparkle glint on 1st place gold medal */}
        {cfg.sparkle && (
          <path
            d="M 23 18 L 24 20 L 26 21 L 24 22 L 23 24 L 22 22 L 20 21 L 22 20 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        )}
      </svg>
    </div>
  );
};

const getMedalBadgeInfo = (position: number) => {
  switch (position) {
    case 1:
      return {
        pillClass: 'bg-amber-100/90 text-amber-900 border-amber-300/80 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/60',
        cardBorder: 'border-amber-300/50 dark:border-amber-700/50 hover:border-amber-400',
        label: '1º Lugar • Ouro',
        title: 'Medalha de Ouro - 1º Lugar',
        emoji: '🥇'
      };
    case 2:
      return {
        pillClass: 'bg-slate-100/90 text-slate-800 border-slate-300/80 dark:bg-slate-900/70 dark:text-slate-200 dark:border-slate-700/60',
        cardBorder: 'border-slate-300/60 dark:border-slate-700/60 hover:border-slate-400',
        label: '2º Lugar • Prata',
        title: 'Medalha de Prata - 2º Lugar',
        emoji: '🥈'
      };
    case 3:
      return {
        pillClass: 'bg-orange-100/90 text-orange-950 border-orange-300/80 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-800/60',
        cardBorder: 'border-orange-300/50 dark:border-orange-800/50 hover:border-orange-400',
        label: '3º Lugar • Bronze',
        title: 'Medalha de Bronze - 3º Lugar',
        emoji: '🥉'
      };
    case 4:
      return {
        pillClass: 'bg-stone-100 text-stone-700 border-stone-200/90 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
        cardBorder: 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700',
        label: '4º Lugar',
        title: '4º Lugar - Honra ao Mérito',
        emoji: '🏅'
      };
    case 5:
    default:
      return {
        pillClass: 'bg-stone-100 text-stone-700 border-stone-200/90 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
        cardBorder: 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700',
        label: '5º Lugar',
        title: '5º Lugar - Honra ao Mérito',
        emoji: '🏅'
      };
  }
};

export const TopUnitsRanking: React.FC = () => {
  const { authStatus, currentUser } = useAuth();
  const { topUnits, isLoadingTopUnits, errorTopUnits, retrySyncAll } = usePortal();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalityTab>('delivery');
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_PORTAL_MONTH);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMonthDropdownOpen(false);
      }
    };
    if (isMonthDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMonthDropdownOpen]);

  const deliveryUnits = useMemo(() => {
    const allByMonth = (topUnits as any)?.allByMonth;
    if (allByMonth) {
      const clean = selectedMonth.toLowerCase().split('/')[0];
      const matchKey = Object.keys(allByMonth).find((k) =>
        k.toLowerCase().includes(clean)
      );
      if (matchKey && allByMonth[matchKey]?.delivery?.length > 0) {
        return [...allByMonth[matchKey].delivery]
          .sort((a, b) => a.position - b.position)
          .slice(0, 5);
      }
    }
    const all = topUnits?.delivery ?? [];
    const clean = selectedMonth.toLowerCase().split('/')[0];
    const filtered = all.filter((u) => u.month && u.month.toLowerCase().includes(clean));
    const list = filtered.length > 0 ? filtered : all.filter(u => !u.month || isCurrentPortalMonth(u.month));
    return list.sort((a, b) => a.position - b.position).slice(0, 5);
  }, [topUnits, selectedMonth]);

  const selfServiceUnits = useMemo(() => {
    const allByMonth = (topUnits as any)?.allByMonth;
    if (allByMonth) {
      const clean = selectedMonth.toLowerCase().split('/')[0];
      const matchKey = Object.keys(allByMonth).find((k) =>
        k.toLowerCase().includes(clean)
      );
      if (matchKey && allByMonth[matchKey]?.selfService?.length > 0) {
        return [...allByMonth[matchKey].selfService]
          .sort((a, b) => a.position - b.position)
          .slice(0, 5);
      }
    }
    const all = topUnits?.selfService ?? [];
    const clean = selectedMonth.toLowerCase().split('/')[0];
    const filtered = all.filter((u) => u.month && u.month.toLowerCase().includes(clean));
    const list = filtered.length > 0 ? filtered : all.filter(u => !u.month || isCurrentPortalMonth(u.month));
    return list.sort((a, b) => a.position - b.position).slice(0, 5);
  }, [topUnits, selectedMonth]);

  const units = (activeTab === 'delivery' ? deliveryUnits : selfServiceUnits).slice(0, 5);

  return (
    <section
      id="unidades-section"
      aria-label="Ranking das Top Unidades do Mês"
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-all duration-300 hover:shadow-md"
    >
      {/* Top Header matching Image 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs">
            <Trophy size={19} className="stroke-[2.2] fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                Top Unidades do Mês
              </h3>
              {isEditor && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Modo Gestão
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              Ranking de desempenho e engajamento das unidades da rede
            </p>
          </div>
        </div>

        {/* Right side controls with Delivery / Self-service tabs */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Tabs: Delivery & Self-service */}
          <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 text-xs font-medium shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-bold touch-manipulation cursor-pointer ${
                activeTab === 'delivery'
                  ? 'bg-[#7c172e] text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Bike size={13} className={activeTab === 'delivery' ? 'text-white' : 'text-stone-400'} />
              <span>Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('self-service')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all text-xs font-bold touch-manipulation cursor-pointer ${
                activeTab === 'self-service'
                  ? 'bg-[#7c172e] text-white shadow-2xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Utensils size={13} className={activeTab === 'self-service' ? 'text-white' : 'text-stone-400'} />
              <span>Self-service</span>
            </button>
          </div>

          {/* Dropdown pill de Mês Interativo */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsMonthDropdownOpen((prev) => !prev)}
              aria-label="Selecionar mês do ranking"
              aria-expanded={isMonthDropdownOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/80 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-2xs hover:bg-stone-50 dark:hover:bg-stone-700/60 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e]"
            >
              <Calendar size={13} className="text-stone-400" />
              <span>{isCurrentPortalMonth(selectedMonth) ? 'Este mês' : selectedMonth}</span>
              <ChevronDown size={13} className={`text-stone-400 ml-0.5 transition-transform ${isMonthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMonthDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#251e20] border border-stone-200 dark:border-stone-700 rounded-xl shadow-lg z-30 py-1 max-h-56 overflow-y-auto">
                {PORTAL_MONTH_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(m);
                      setIsMonthDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedMonth === m
                        ? 'bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 font-bold'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/50'
                    }`}
                  >
                    <span>{formatPortalMonthDropdownItem(m)}</span>
                    {selectedMonth === m && <span className="text-[10px] text-[#7c172e] dark:text-rose-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapsible toggle button */}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-expanded={!isCollapsed}
            aria-controls="top-units-grid"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
          >
            <span>{isCollapsed ? 'Expandir ranking' : 'Recolher ranking'}</span>
            {isCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      {/* 5-Column Grid matching Image 2 */}
      {!isCollapsed && (
        <div
          id="top-units-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 animate-in fade-in duration-200"
        >
          {isLoadingTopUnits ? (
            [1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#161212] border border-stone-200/80 dark:border-stone-800 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800" />
                  <div className="w-14 h-11 rounded-xl bg-stone-200 dark:bg-stone-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-20 bg-stone-200 dark:bg-stone-800 rounded-sm" />
                    <div className="h-2.5 w-12 bg-stone-200 dark:bg-stone-800 rounded-sm" />
                  </div>
                </div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full" />
              </div>
            ))
          ) : errorTopUnits || units.length === 0 ? (
            <div className="col-span-full my-1 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl py-8 px-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <AlertCircle size={22} className="stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  {errorTopUnits ? 'Não foi possível carregar o ranking das unidades' : 'Nenhuma unidade com dados para este período'}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                  Não foi possível atualizar o ranking das unidades no momento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => retrySyncAll()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer touch-manipulation"
              >
                <RefreshCw size={13} />
                <span>Tentar novamente</span>
              </button>
            </div>
          ) : (
            units.map((unit) => {
              const rawPercent = parseInt(unit.percent, 10);
              const progressWidth = Math.min(rawPercent, 100);
              const badgeInfo = getMedalBadgeInfo(unit.position);

              return (
                <div
                  key={unit.id}
                  className={`p-3.5 rounded-2xl bg-white dark:bg-[#161212] border ${badgeInfo.cardBorder} flex flex-col justify-between shadow-2xs transition-all group`}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      {/* Authentic Medal with Ribbons & Coin */}
                      <PositionMedal position={unit.position} />

                      {/* Storefront thumbnail */}
                      <div className="w-14 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-stone-200 dark:bg-stone-800 shadow-2xs border border-stone-200/60 dark:border-stone-700/80">
                        <img
                          src={unit.image || (unit as any).imageUrl}
                          alt={unit.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Title and percentage */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 leading-none mb-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badgeInfo.pillClass} shadow-2xs`}
                            title={badgeInfo.title}
                          >
                            <span>{badgeInfo.emoji}</span>
                            <span className="truncate">{badgeInfo.label}</span>
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100 truncate leading-snug">
                          {unit.name}
                        </h4>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {unit.percent}{' '}
                          <span className="text-[10px] font-semibold text-stone-400">da meta</span>
                        </p>
                      </div>
                    </div>

                    {/* Green Progress Bar */}
                    <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden mt-3">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* Bottom Tagline with icon */}
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate mt-2.5 font-medium flex items-center gap-1.5">
                    <span className="flex-shrink-0">{unit.icon}</span>
                    <span className="truncate">{unit.tagline}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};

