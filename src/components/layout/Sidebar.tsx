import React from 'react';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutGrid,
  Calendar,
  BarChart3,
  Target,
  Award,
  Megaphone,
  Gem,
  MessageSquare,
  Search,
  ShieldCheck,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';

interface SidebarProps {
  isOpen: boolean; // Mobile drawer open/close
  onClose: () => void;
  isExpanded?: boolean; // Desktop collapsed (w-20) vs expanded (w-64)
  onToggleExpand?: () => void;
  activeNav?: string;
  onSelectNav?: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isExpanded = false,
  onToggleExpand,
  activeNav = 'inicio',
  onSelectNav
}) => {
  const { authStatus, currentUser, openGiaModal, logout } = useAuth();
  const { searchQuery, setSearchQuery } = usePortal();
  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;

  // Escuta ESC e clique fora apenas quando o drawer mobile está aberto
  useModalDismiss({ isOpen, onClose });

  // Itens na ordem rigorosa das seções do site (do topo até o rodapé)
  const navItems = [
    {
      id: 'inicio',
      label: 'Início',
      shortLabel: 'Início',
      description: 'Boas-vindas e perfil',
      icon: Home,
      target: 'hero-section'
    },
    {
      id: 'acesso-rapido',
      label: 'Acesso Rápido',
      shortLabel: 'Sistemas',
      description: isLogged ? 'Sistemas, holerite e atalhos' : 'Acesso restrito ao colaborador',
      icon: LayoutGrid,
      target: 'acesso-rapido-section'
    },
    {
      id: 'avisos-agenda',
      label: 'Avisos & Agenda',
      shortLabel: 'Agenda',
      description: 'Destaques e treinamentos',
      icon: Calendar,
      target: 'avisos-principais-section'
    },
    {
      id: 'unidades',
      label: 'Top Unidades',
      shortLabel: 'Unidades',
      description: 'Ranking Delivery e Salão',
      icon: BarChart3,
      target: 'unidades-section'
    },
    {
      id: 'metas',
      label: 'Metas da Rede',
      shortLabel: 'Metas',
      description: 'Meta geral e pensamento',
      icon: Target,
      target: 'metas-section'
    },
    {
      id: 'destaques',
      label: 'Destaques & Equipe',
      shortLabel: 'Destaques',
      description: 'Filial e colaborador em evidência',
      icon: Award,
      target: 'card-2-section'
    },
    {
      id: 'comunicados',
      label: 'Comunicados Oficiais',
      shortLabel: 'Comunicados',
      description: 'Mural de avisos e novidades',
      icon: Megaphone,
      target: 'comunicados-section'
    },
    {
      id: 'valores',
      label: 'Valores da Empresa',
      shortLabel: 'Valores',
      description: 'Cultura, pilares e propósito',
      icon: Gem,
      target: 'card-4-section'
    },
    {
      id: 'forum',
      label: 'Fórum Corporativo',
      shortLabel: 'Fórum',
      description: 'Comunidade e dúvidas',
      icon: MessageSquare,
      target: 'forum'
    }
  ];

  const handleClick = (item: (typeof navItems)[0]) => {
    if (onSelectNav) onSelectNav(item.id);
    if (searchQuery) {
      setSearchQuery('');
    }
    const el = document.getElementById(item.target) || document.getElementById('hero-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Fecha o drawer mobile ao clicar em um item
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* ========================================================
          1. DRAWER MOBILE (Quando o menu hambúrguer é clicado no celular)
          ======================================================== */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-80 max-w-[85vw] bg-[#3d131d] text-stone-200 z-50 flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal de navegação móvel"
      >
        {/* Topo: Logo + Botão Fechar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span translate="no" className="font-script text-2xl text-rose-300 font-bold">
              Ambozini
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-200/70 border-l border-white/20 pl-2">
              PORTAL
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Busca rápida para Mobile */}
        <div className="pt-3 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Buscar postagens e comunicados…"
              aria-label="Buscar postagens e comunicados gerais"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/10 border border-white/10 text-white placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#bd1e3c]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title="Limpar busca"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Navegação Mobile (Sincronizada na ordem do site) */}
        <nav aria-label="Seções do portal" className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7c172e] text-white shadow-md font-bold ring-1 ring-white/20'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold tracking-tight truncate">{item.label}</div>
                  <div className="text-[10px] text-stone-300/70 truncate">{item.description}</div>
                </div>
                {isActive && <div className="w-1.5 h-6 rounded-full bg-amber-300 shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* Rodapé Mobile: Informações do Usuário / GIA */}
        <div className="pt-3 border-t border-white/10">
          {isLogged ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#7c172e] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser?.initials || 'JS'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{currentUser?.name}</div>
                  <div className="text-[10px] text-stone-300/70 truncate">{currentUser?.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sair da conta"
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-stone-300 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onClose();
                openGiaModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#7c172e] hover:bg-[#8e1a35] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Entrar no GIA</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. SIDEBAR DESKTOP (Docked, recolhível ou expansível)
          ======================================================== */}
      <aside
        aria-label="Navegação lateral principal"
        className={`hidden md:flex sticky top-0 left-0 h-screen bg-[#3d131d] text-stone-200 z-30 flex-col justify-between py-4 shrink-0 shadow-xl transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64 px-3' : 'w-20 px-2 items-center'
        }`}
      >
        {/* Topo Desktop: Botão Hambúrguer / Expandir / Recolher */}
        <div className={`w-full flex items-center pb-2 ${isExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          {isExpanded ? (
            <>
              <div className="flex items-center gap-2 select-none">
                <span translate="no" className="font-script text-2xl text-rose-300 font-bold">
                  Ambozini
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-200/60 border-l border-white/20 pl-1.5">
                  PORTAL
                </span>
              </div>
              <button
                onClick={onToggleExpand}
                title="Recolher menu lateral"
                aria-label="Recolher menu lateral"
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 flex items-center justify-center shadow-xs transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggleExpand}
              title="Expandir menu lateral"
              aria-label="Expandir menu lateral"
              className="w-10 h-10 rounded-xl bg-white/90 hover:bg-white text-[#3d131d] flex items-center justify-center shadow-md transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden cursor-pointer touch-manipulation"
            >
              <Menu className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Centro Desktop: Lista de Ícones/Itens em ordem estrita do site */}
        <nav
          aria-label="Seções do portal"
          className="w-full flex flex-col gap-1.5 flex-1 pt-2 overflow-y-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            if (isExpanded) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full px-3 py-2 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden ${
                    isActive
                      ? 'bg-[#7c172e] text-white shadow-md font-bold ring-1 ring-white/20'
                      : 'text-stone-300/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold tracking-tight truncate leading-tight">{item.label}</div>
                    <div className="text-[9px] text-stone-300/70 truncate leading-tight">{item.description}</div>
                  </div>
                  {isActive && <div className="w-1.5 h-4 rounded-full bg-amber-300 shrink-0" />}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleClick(item)}
                title={item.label}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`w-14 py-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden ${
                  isActive
                    ? 'bg-[#7c172e] text-white shadow-md font-bold scale-102 ring-1 ring-white/20'
                    : 'text-stone-300/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[9.5px] tracking-tight leading-tight truncate max-w-[56px] text-center">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Rodapé Desktop: Perfil do usuário ou Atalho de Expansão */}
        <div className={`w-full pt-2 border-t border-white/10 flex flex-col ${isExpanded ? 'px-1' : 'items-center'}`}>
          {isExpanded ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#7c172e] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {currentUser?.initials || <UserIcon className="w-4 h-4" />}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Visitante'}</div>
                  <div className="text-[10px] text-stone-300/70 truncate">{currentUser?.role || 'Não logado'}</div>
                </div>
              </div>
              <button
                onClick={onToggleExpand}
                title="Recolher barra"
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onToggleExpand}
              title="Expandir barra lateral"
              aria-label="Expandir barra lateral"
              className="w-10 h-10 rounded-xl text-stone-300/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:outline-hidden cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
