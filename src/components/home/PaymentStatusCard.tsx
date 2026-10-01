import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  MessageSquare,
  Lock,
  FileText,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { Announcement } from '../../types';
import { isReducedMotionPreferred } from '../../utils/date';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { AnnouncementDetailModal } from '../modals/AnnouncementDetailModal';

export const PaymentStatusCard: React.FC = () => {
  const { openPublishModal, openGiaModal, showToast, authStatus, currentUser } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
  const { featuredAnnouncements, toggleLike, isLoadingAnnouncements, errorAnnouncements, retrySyncAll } = usePortal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Announcement | null>(null);

  // Filtra estritamente para que SOMENTE avisos marcados como destaque (isFeatured === true) e ativos sejam exibidos
  const notices: Announcement[] = useMemo(() => {
    return featuredAnnouncements.filter(
      (a) => a.isFeatured === true && a.isActive !== false && (isLogged || a.visibility === 'public')
    );
  }, [featuredAnnouncements, isLogged]);

  // Se a lista de avisos destacados mudar e o índice atual ficar fora do intervalo, ajusta para 0
  useEffect(() => {
    if (currentIndex >= notices.length && notices.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, notices.length]);

  const prev = useCallback(() => {
    if (notices.length === 0) return;
    setCurrentIndex((prevIdx) => (prevIdx - 1 + notices.length) % notices.length);
  }, [notices.length]);

  const next = useCallback(() => {
    if (notices.length === 0) return;
    setCurrentIndex((prevIdx) => (prevIdx + 1) % notices.length);
  }, [notices.length]);

  // Rotação automática respeitando prefers-reduced-motion e pausa no hover
  useEffect(() => {
    if (isHovered || notices.length <= 1 || isReducedMotionPreferred()) return;
    const timer = setInterval(() => {
      next();
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, notices.length, next]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  // 1. SKELETON STATE: Enquanto a API estiver carregando do backend
  if (isLoadingAnnouncements && notices.length === 0) {
    return (
      <section
        id="avisos-principais-section"
        aria-label="Carregando avisos em destaque"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full relative animate-pulse"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              <div className="space-y-1.5">
                <div className="h-4 w-36 bg-stone-200 dark:bg-stone-800 rounded-md" />
                <div className="h-3 w-48 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
              </div>
            </div>
            <div className="h-7 w-20 bg-stone-200 dark:bg-stone-800 rounded-full" />
          </div>

          <div className="my-3 bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded-full" />
              <div className="h-4 w-16 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full bg-stone-100 dark:bg-stone-800/60 rounded-md" />
              <div className="h-3.5 w-5/6 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-stone-200/40 dark:border-stone-800/50">
              <div className="h-4 w-28 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
              <div className="h-7 w-24 bg-stone-200 dark:bg-stone-800 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. ERROR STATE: Se falhar ou der timeout na API, exibe erro claro com botão de tentar novamente
  if (errorAnnouncements && notices.length === 0) {
    return (
      <section
        id="avisos-principais-section"
        aria-label="Erro ao carregar avisos em destaque"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-amber-200/80 dark:border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full relative"
      >
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs">
                <Megaphone size={19} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                  Avisos em Destaque
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Fique por dentro das principais novidades
                </p>
              </div>
            </div>
          </div>

          <div className="my-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl py-8 px-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <AlertCircle size={22} className="stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Não foi possível carregar os avisos
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                Não foi possível sincronizar os avisos no momento.
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
        </div>
      </section>
    );
  }

  // 3. EMPTY STATE: Sucesso na API, porém nenhum aviso marcado como destaque
  if (notices.length === 0) {
    return (
      <section
        id="avisos-principais-section"
        role="region"
        aria-label="Avisos em Destaque"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full relative transition-colors"
      >
        <div>
          {/* Header matching Image 3 */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
                <Megaphone size={19} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                    Avisos em Destaque
                  </h3>
                  {isEditor && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                      Modo Gestão
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Fique por dentro das principais novidades
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="#comunicados-section"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
              >
                <span>Ver todos</span>
                <ChevronRight size={13} />
              </a>

              {isEditor && (
                <button
                  type="button"
                  onClick={() => openPublishModal('avisos_principais')}
                  title="Publicar novo aviso em destaque no topo"
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Publicar</span>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Empty state container */}
          <div className="my-3 bg-gradient-to-b from-stone-50/80 to-stone-50/40 dark:from-stone-900/50 dark:to-stone-900/20 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl py-10 px-6 flex flex-col items-center justify-center text-center space-y-2 group">
            <div className="relative mb-1">
              <div className="w-12 h-12 rounded-2xl bg-[#7c172e]/10 dark:bg-rose-950/40 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <FileText size={22} className="stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold flex items-center justify-center shadow-xs">
                ✨
              </span>
            </div>
            <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
              Tudo em dia por aqui!
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              Nenhum comunicado urgente ou em destaque no momento. As principais notícias e avisos institucionais aparecerão fixados aqui.
            </p>
            {isEditor && (
              <button
                type="button"
                onClick={() => openPublishModal('avisos_principais')}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 hover:bg-[#7c172e]/15 dark:bg-rose-950/40 transition-colors border border-[#7c172e]/20 cursor-pointer touch-manipulation"
              >
                <Plus size={13} />
                <span>Fixar comunicado em destaque</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  const activeNotice = notices[currentIndex % notices.length];

  const isPaymentNotice =
    activeNotice.id === 'com_5' ||
    activeNotice.tag === 'RH & Folha' ||
    activeNotice.title?.toLowerCase().includes('pagamento') ||
    activeNotice.title?.toLowerCase().includes('folha');

  const isLocked = activeNotice.visibility === 'members_only' && !isLogged;

  const handleActionClick = (url?: string) => {
    if (!url || url === '#holerite') {
      showToast('Acessando módulo de contracheque e comprovante de benefícios no GIA... 💳', 'success');
      return;
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="avisos-principais-section"
      role="region"
      aria-roledescription="carrossel de comunicados"
      aria-label="Avisos em Destaque"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full relative group transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7c172e]/40"
    >
      <div>
        {/* Header with Card Identifier, Badges and Carousel Controls */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Megaphone size={19} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                  Avisos em Destaque
                </h3>
                {isEditor && (
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                    Modo Gestão
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Fique por dentro das principais novidades
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notices.length > 1 && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Aviso anterior (tecla seta esquerda)"
                  className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Próximo aviso (tecla seta direita)"
                  className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            <a
              href="#comunicados-section"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Ver todos</span>
              <ChevronRight size={13} />
            </a>

            {isEditor && (
              <button
                type="button"
                onClick={() => openPublishModal('avisos_principais')}
                title="Publicar novo aviso em destaque no topo"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-[#7c172e] hover:bg-[#631023] px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <Plus size={12} />
                <span>Publicar</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice Content with optional Image */}
        <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start" aria-live="polite" aria-atomic="true">
          {activeNotice.imageUrl && (
            <div className="w-full sm:w-36 h-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/80 shadow-2xs">
              <img
                src={activeNotice.imageUrl}
                alt={activeNotice.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 flex-wrap">
              <span>Por <strong className="text-stone-800 dark:text-stone-200">{activeNotice.author}</strong></span>
              {activeNotice.date && <span>• {activeNotice.date}</span>}
            </div>

            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 leading-snug [text-wrap:balance]">
              {activeNotice.title}
            </h3>

            {/* If locked (logged out visitor viewing exclusive notice) */}
            {isLocked ? (
              <div className="mt-2.5 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50/50 dark:from-amber-950/40 dark:to-rose-950/30 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7c172e] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Lock size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {isPaymentNotice ? 'Detalhes de pagamento restritos a colaboradores' : 'Aviso restrito para colaboradores'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      {isPaymentNotice
                        ? 'Faça login com sua conta no GIA para visualizar seu contracheque e benefícios.'
                        : 'Faça login com seu e-mail corporativo no GIA para ler este comunicado.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openGiaModal()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs whitespace-nowrap cursor-pointer flex items-center gap-1 self-end sm:self-auto"
                >
                  <span>Acessar com GIA</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div>
                <div className="line-clamp-3">
                  <RichTextRenderer
                    content={activeNotice.content || activeNotice.summary || ''}
                    className="text-stone-600 dark:text-stone-300"
                  />
                </div>

                {/* Botão de Ação Padronizado (ex: Consultar Holerite / Comprovante ou Ação Personalizada) */}
                {(activeNotice.actionButtonText || (isPaymentNotice && isLogged)) && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleActionClick(activeNotice.actionButtonUrl)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
                    >
                      <FileText size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{activeNotice.actionButtonText || 'Consultar Holerite / Comprovante'}</span>
                    </button>
                    {(activeNotice.actionButtonSubtext || isPaymentNotice) && (
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {activeNotice.actionButtonSubtext || 'Crédito em conta confirmado • Ciclo ativo'}
                      </span>
                    )}
                  </div>
                )}
                {/* Botão de Ver Comunicado Completo */}
                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedNotice(activeNotice)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7c172e] dark:text-rose-400 hover:text-[#631023] dark:hover:text-rose-300 transition-colors group/link cursor-pointer"
                  >
                    <span>Ler comunicado completo</span>
                    <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-0.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Pagination Indicators and Reactions */}
      <div className="pt-3 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
        {/* Dots/Pills for notices */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Navegação dos avisos">
          {notices.map((n, idx) => (
            <button
              key={n.id || idx}
              type="button"
              role="tab"
              aria-selected={idx === (currentIndex % notices.length)}
              aria-current={idx === (currentIndex % notices.length) ? 'true' : 'false'}
              aria-label={`Ir para o aviso ${idx + 1}: ${n.title}`}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                idx === (currentIndex % notices.length)
                  ? 'w-6 h-2 bg-[#7c172e] dark:bg-rose-500'
                  : 'w-2 h-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
              }`}
              title={`Aviso ${idx + 1}: ${n.title}`}
            />
          ))}
        </div>

        {/* Reaction button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleLike('announcements', activeNotice.id)}
            className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
              activeNotice.userLiked
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Heart size={13} className={activeNotice.userLiked ? 'fill-rose-600 text-rose-600' : ''} />
            <span>{activeNotice.likesCount || 0}</span>
          </button>

          <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
            <MessageSquare size={13} />
            <span>{activeNotice.comments?.length || 0}</span>
          </span>
        </div>
      </div>

      {/* Modal de Detalhes do Comunicado */}
      <AnnouncementDetailModal
        announcement={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />
    </section>
  );
};

export const MainNoticesCard = PaymentStatusCard;

