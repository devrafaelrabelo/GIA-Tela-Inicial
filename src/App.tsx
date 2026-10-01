import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortalProvider, usePortal } from './context/PortalContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { HeroBanner } from './components/home/HeroBanner';
import { PaymentStatusCard } from './components/home/PaymentStatusCard';
import { CalendarEvents } from './components/home/CalendarEvents';
import { TopUnitsRanking } from './components/home/TopUnitsRanking';
import { CompanyGoalCard } from './components/home/CompanyGoalCard';
import { MotivationalCard } from './components/home/MotivationalCard';
import { MonthlyHighlight } from './components/home/MonthlyHighlight';
import { GrowthHighlight } from './components/home/GrowthHighlight';
import { AnnouncementsSection } from './components/home/AnnouncementsSection';
import { MissionsCarousel } from './components/home/MissionsCarousel';
import { QuickAccessGrid } from './components/home/QuickAccessGrid';
import { ForumSection } from './components/home/ForumSection';
import { PostCard } from './components/home/PostCard';
import { AnnouncementCard } from './components/home/AnnouncementCard';
import { GiaLoginModal } from './components/modals/GiaLoginModal';
import { PublishModal } from './components/modals/PublishModal';
import { PostDetailModal } from './components/modals/PostDetailModal';
import { AnnouncementDetailModal } from './components/modals/AnnouncementDetailModal';
import { PermissionDeniedModal } from './components/modals/PermissionDeniedModal';
import { ConfirmDeleteModal } from './components/modals/ConfirmDeleteModal';
import { Toast } from './components/modals/Toast';
import { ShieldCheck, ArrowRight, Search, X, MessageSquare, Megaphone } from 'lucide-react';
import { Announcement, ForumPost } from './types';

const MainLayout: React.FC = () => {
  const { authStatus, currentUser, openGiaModal } = useAuth();
  const { searchQuery, setSearchQuery, filteredPosts, filteredAnnouncements } = usePortal();
  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
  const isSearching = searchQuery.trim().length > 0;
  const totalResults = filteredPosts.length + filteredAnnouncements.length;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Sincronização em tempo real do item ativo com a posição do scroll no site (Scroll Spy)
  useEffect(() => {
    const sectionTargets = [
      { id: 'inicio', target: 'hero-section' },
      { id: 'acesso-rapido', target: 'acesso-rapido-section' },
      { id: 'avisos-agenda', target: 'avisos-principais-section' },
      { id: 'unidades', target: 'unidades-section' },
      { id: 'metas', target: 'metas-section' },
      { id: 'destaques', target: 'card-2-section' },
      { id: 'comunicados', target: 'comunicados-section' },
      { id: 'valores', target: 'card-4-section' },
      { id: 'forum', target: 'forum' },
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = sectionTargets.length - 1; i >= 0; i--) {
        const item = sectionTargets[i];
        const el = document.getElementById(item.target);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLogged]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarExpanded((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5ee] dark:bg-[#161212] text-stone-900 dark:text-stone-100 flex font-sans transition-colors duration-200">
      {/* Skip Link for accessibility (WCAG 2.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#7c172e] focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Pular para o conteúdo principal
      </a>

      {/* 1. Left Dark Burgundy Vertical Sidebar (Compact ou Expandida) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded((prev) => !prev)}
        activeNav={activeNav}
        onSelectNav={(nav) => setActiveNav(nav)}
      />

      {/* 2. Main Content Stream */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Header onToggleSidebar={handleToggleSidebar} />

        {/* Scrollable Page Body */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] w-full mx-auto">
          {/* Se houver busca ativa na barra superior: Exibe os resultados de Comunicados Gerais e Postagens */}
          {isSearching ? (
            <section
              id="busca-resultados-section"
              aria-label="Resultados da busca no mural"
              className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-7 animate-in fade-in duration-200"
            >
              {/* Header com indicador de busca, contagem e botão para limpar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                    <Search size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100">
                        Resultados da Busca no Mural
                      </h2>
                      <span
                        className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {totalResults} {totalResults === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                      Exibindo resultados para: <strong className="text-stone-800 dark:text-stone-200">"{searchQuery}"</strong> ({filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? 'comunicado' : 'comunicados'}, {filteredPosts.length} {filteredPosts.length === 1 ? 'postagem' : 'postagens'})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer touch-manipulation self-start sm:self-auto"
                >
                  <X size={14} />
                  <span>Limpar busca e ver mural</span>
                </button>
              </div>

              {/* Se nenhum resultado for encontrado em postagens e comunicados */}
              {totalResults === 0 ? (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-stone-50/50 dark:bg-stone-900/20 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center shadow-2xs">
                    <Search size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                      Nenhum resultado encontrado para "{searchQuery}"
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                      Tente buscar por outras palavras separadas ou volte para ver o mural corporativo completo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs cursor-pointer touch-manipulation"
                  >
                    <span>Ver todo o mural</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Bloco 1: COMUNICADOS GERAIS */}
                  {filteredAnnouncements.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                            <Megaphone size={16} className="stroke-[2.2]" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                              COMUNICADOS GERAIS ({filteredAnnouncements.length})
                            </h3>
                            <p className="text-[10px] text-stone-500 font-medium">
                              Comunicados corporativos e avisos da gestão
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAnnouncements.map((ann) => (
                          <AnnouncementCard
                            key={ann.id}
                            item={ann}
                            onOpenDetail={(item) => setSelectedAnnouncement(item)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bloco 2: POSTAGENS DA COMUNIDADE */}
                  {filteredPosts.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/60 dark:border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                            <MessageSquare size={16} className="stroke-[2.2]" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                              COMUNIDADE & FÓRUM DE TROCAS ({filteredPosts.length})
                            </h3>
                            <p className="text-[10px] text-stone-500 font-medium">
                              Publicações, dúvidas e trocas entre colaboradores
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filteredPosts.map((post) => (
                          <PostCard key={post.id} post={post} onOpenDetail={(p) => setSelectedPost(p)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Hero Banner (Card do Usuário) */}
              <HeroBanner />

              {/* Card: Acesso Rápido - Completo quando logado, ou convite elegante quando em modo visitante */}
              {isLogged ? (
                <QuickAccessGrid />
              ) : (
                <div
                  id="acesso-rapido-section"
                  className="scroll-mt-24 bg-gradient-to-r from-amber-50/70 via-rose-50/50 to-white dark:from-[#271518] dark:via-[#1e1517] dark:to-[#171314] border border-amber-200/80 dark:border-rose-900/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#7c172e] text-white flex items-center justify-center font-bold shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-extrabold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                          ÁREA RESTRITA DO COLABORADOR AMBOZINI
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Sistemas Corporativos
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                        Acesse sua conta no <strong>GIA</strong> para consultar holerites, pontos, escalas de folga, benefícios e ferramentas internas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openGiaModal}
                    className="btn-crm-gateway px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 shrink-0 cursor-pointer touch-manipulation hover:scale-102 transition-transform"
                  >
                    <span>Acessar o GIA</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Row 1: Cards Fixos - Avisos em Destaque & Calendário (50% / 50%) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <PaymentStatusCard />
                <CalendarEvents />
              </div>

              {/* Row 2: Card Fixo - Top Unidades do Mês (Full Width) */}
              <TopUnitsRanking />

              {/* Row 3: Card Fixo Meta Geral (~60%) & Pensamento do Dia (~40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                <div className="lg:col-span-7 xl:col-span-7">
                  <CompanyGoalCard />
                </div>
                <div className="lg:col-span-5 xl:col-span-5">
                  <MotivationalCard />
                </div>
              </div>

              {/* Row 4: Card 2 Livre & Card 3 Livre (2 equal cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                <MonthlyHighlight />
                <GrowthHighlight />
              </div>

              {/* Row 5: Card Fixo - Comunicados Oficiais */}
              <AnnouncementsSection />

              {/* Row 6: Card 4 Livre - Slides com os Valores da Empresa (Banner Panorâmico) */}
              <MissionsCarousel />

              {/* Row 7: Fórum & Comunidade Interativo */}
              <div className="pt-2">
                <ForumSection onOpenDetail={(post) => setSelectedPost(post)} />
              </div>
            </>
          )}

          {/* Institutional Footer matching Screenshot */}
          <footer className="pt-8 pb-10 border-t border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            {/* Left Brand */}
            <div className="flex items-center gap-3 select-none">
              <span className="font-script text-3xl sm:text-4xl text-[#7c172e] dark:text-rose-400 font-bold tracking-wide" translate="no">
                Ambozini
              </span>
              <div className="h-6 w-px bg-stone-300 dark:bg-stone-700"></div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c172e] dark:text-rose-300 leading-tight">
                  PORTAL CORPORATIVO
                </span>
                <span className="text-[9px] text-stone-500 font-medium">
                  Pessoas que fazem a diferença
                </span>
              </div>
            </div>

            {/* Right Signature */}
            <div className="flex flex-col items-center sm:items-end select-none">
              <span className="font-handwriting text-2xl sm:text-3xl text-[#7c172e] dark:text-rose-300">
                Juntos vamos mais longe!
              </span>
              <div className="w-16 h-0.5 bg-[#bd1e3c] -mt-1"></div>
            </div>
          </footer>
        </main>
      </div>

      {/* Global Modals */}
      <PublishModal />
      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
      <PermissionDeniedModal />
      <ConfirmDeleteModal />
      <GiaLoginModal />
      <Toast />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PortalProvider>
          <MainLayout />
        </PortalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
