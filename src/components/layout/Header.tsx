import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { NotificationPopover, NotificationModal } from '../notifications';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isDark: propIsDark,
  onToggleTheme: propOnToggleTheme
}) => {
  const { authStatus, currentUser, openGiaModal, switchUser, logout } = useAuth();
  const { searchQuery, setSearchQuery, unreadNotificationsCount } = usePortal();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [showBellTooltip, setShowBellTooltip] = useState(false);
  const [internalDark, setInternalDark] = useState(() => document.documentElement.classList.contains('dark'));
  const isDark = propIsDark !== undefined ? propIsDark : internalDark;

  const toggleTheme = propOnToggleTheme || (() => {
    setInternalDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  });

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsUserMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-30 bg-[#f7f5ee] dark:bg-[#161212] border-b border-stone-200/70 dark:border-white/10 px-4 sm:px-8 py-3 transition-colors">
      <div className="w-full flex items-center justify-between gap-4">
        
        {/* Left: Ambozini Script Brand & Portal Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 select-none">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Abrir menu lateral"
              title="Abrir menu lateral"
              className="md:hidden p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden transition-colors cursor-pointer touch-manipulation"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="flex items-center gap-3">
            <span translate="no" className="font-script text-3xl sm:text-4xl text-[#7c172e] dark:text-rose-400 font-bold tracking-wide">
              Ambozini
            </span>
            <div className="h-7 w-px bg-stone-300 dark:bg-stone-700 hidden sm:block"></div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#7c172e] dark:text-rose-300 leading-tight">
                PORTAL CORPORATIVO
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                Pessoas que fazem a diferença
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search pill matching screenshot */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar em postagens e comunicados gerais…"
              spellCheck={false}
              autoComplete="off"
              aria-label="Buscar em postagens e comunicados gerais"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-1.5 text-xs rounded-full bg-stone-100/90 dark:bg-stone-900 border border-stone-300/70 dark:border-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden focus-visible:bg-white dark:focus-visible:bg-stone-900 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Right: Notifications, User Profile / GIA Button */}
        <div className="flex items-center gap-4">
          {/* Notification bell with dynamic badge, tooltip & popover - Somente visível quando logado */}
          {authStatus !== 'unauthenticated' && !!currentUser && (
            <div className="relative notification-bell-container">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setShowBellTooltip(false);
                }}
                onMouseEnter={() => setShowBellTooltip(true)}
                onMouseLeave={() => setShowBellTooltip(false)}
                onFocus={() => setShowBellTooltip(true)}
                onBlur={() => setShowBellTooltip(false)}
                aria-label={`Notificações ${unreadNotificationsCount > 0 ? `(${unreadNotificationsCount} não lidas)` : ''}`}
                aria-expanded={isNotificationsOpen}
                className={`p-2 text-stone-700 dark:text-stone-300 hover:text-[#7c172e] dark:hover:text-rose-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden rounded-xl transition-colors relative cursor-pointer touch-manipulation ${
                  isNotificationsOpen ? 'bg-stone-200/80 dark:bg-stone-800 text-[#7c172e] dark:text-rose-400' : ''
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#bd1e3c] text-white text-[9px] font-bold flex items-center justify-center shadow-xs tabular-nums">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Tooltip moderno ao passar o mouse */}
              {showBellTooltip && !isNotificationsOpen && (
                <div
                  role="tooltip"
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 dark:bg-stone-100/95 text-white dark:text-stone-900 text-[10px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs flex items-center gap-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      unreadNotificationsCount > 0 ? 'bg-rose-400 dark:bg-rose-600' : 'bg-emerald-400'
                    }`}
                  />
                  <span>
                    {unreadNotificationsCount > 0
                      ? `${unreadNotificationsCount} nova${unreadNotificationsCount > 1 ? 's' : ''} notificaç${
                          unreadNotificationsCount > 1 ? 'ões' : 'ão'
                        }`
                      : 'Notificações (em dia)'}
                  </span>
                </div>
              )}

              {/* Dropdown Popover */}
              {isNotificationsOpen && (
                <NotificationPopover
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                  onOpenModal={() => {
                    setIsNotificationsOpen(false);
                    setIsNotificationModalOpen(true);
                  }}
                />
              )}
            </div>
          )}

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Alternar para tema claro" : "Alternar para tema escuro"}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden transition-colors cursor-pointer touch-manipulation"
          >
            {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* User Profile / GIA Login */}
          {authStatus === 'unauthenticated' ? (
            <button
              onClick={openGiaModal}
              className="btn-crm-gateway px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden cursor-pointer touch-manipulation"
            >
              <ShieldCheck size={14} className="text-amber-300" />
              <span>Entrar no <strong translate="no" className="font-bold">GIA</strong></span>
            </button>
          ) : (
            <div className="relative user-menu-container">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 py-1 px-1.5 rounded-full hover:bg-stone-200/50 dark:hover:bg-stone-800 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden transition-colors cursor-pointer touch-manipulation"
              >
                <div className="w-8 h-8 rounded-full bg-[#4a121d] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {currentUser?.initials || 'JS'}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <span>Olá, {currentUser?.name.split(' ')[0] || 'João'}!</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                </div>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1f1819] border border-stone-200 dark:border-stone-800 shadow-2xl p-3 text-xs z-50 animate-slide-up"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <div className="p-2 border-b border-stone-100 dark:border-stone-800 mb-2">
                    <p className="font-bold text-stone-900 dark:text-stone-100">{currentUser?.name}</p>
                    <p className="text-[11px] text-stone-500">{currentUser?.role}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold text-[#7c172e] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/60">
                      {currentUser?.badge}
                    </span>
                  </div>

                  <div className="space-y-1 mb-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">
                      Testar Perfis:
                    </span>
                    <button
                      onClick={() => switchUser('editor')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#4a121d] text-white text-[9px] font-bold flex items-center justify-center">JS</div>
                      <span>João Silva (Gestor / Editor)</span>
                    </button>
                    <button
                      onClick={() => switchUser('reader')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-amber-700 text-white text-[9px] font-bold flex items-center justify-center">LP</div>
                      <span>Lucas Pereira (Colaborador)</span>
                    </button>
                    <button
                      onClick={() => switchUser('unauthenticated')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-full bg-stone-400 text-white text-[9px] font-bold flex items-center justify-center">
                        <UserIcon size={10} />
                      </div>
                      <span>Deslogado (Modo Visitante)</span>
                    </button>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full text-left px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={13} />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Full Modal de Notificações */}
      {isNotificationModalOpen && (
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}
    </header>
  );
};
