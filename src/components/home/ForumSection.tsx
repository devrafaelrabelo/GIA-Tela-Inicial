import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Plus, Filter, Search, Clock, Tag, Trophy, HelpCircle, Settings, AlertCircle, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { PostCard } from './PostCard';
import { ForumPost } from '../../types';
import { getForumPostTimestamp } from '../../utils/date';
import { matchesSeparatedWords } from '../../utils/text';

interface ForumSectionProps {
  onOpenDetail: (post: ForumPost) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Dicas de Vendas': Tag,
  'Comemoração': Trophy,
  'Dúvidas & Suporte': HelpCircle,
  'Operacional': Settings,
};

export const ForumSection: React.FC<ForumSectionProps> = ({ onOpenDetail }) => {
  const { authStatus, currentUser, openGiaModal, openPublishModal } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const {
    filteredPosts,
    isLoadingPosts,
    errorPosts,
    retrySyncAll,
    selectedCategory,
    setSelectedCategory,
    visibilityFilter,
    setVisibilityFilter,
    postStatusFilter,
    setPostStatusFilter,
  } = usePortal();

  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'likes'>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(6); // 6 publicações por página por padrão

  const handleNewPostClick = () => {
    if (authStatus === 'unauthenticated') {
      openGiaModal();
    } else {
      openPublishModal('forum');
    }
  };

  const categories = [
    'Todas',
    'Dicas de Vendas',
    'Comemoração',
    'Dúvidas & Suporte',
    'Operacional',
  ];

  // Busca interna por palavras separadas exclusivamente na Comunidade & Fórum de Trocas
  // Normalização total de acentos, diacríticos e caracteres especiais
  const displayPosts = useMemo(() => {
    let list = [...filteredPosts];

    if (localSearch.trim()) {
      list = list.filter((p) => {
        const commentsText = (p.comments || []).map((c) => `${c.author || ''} ${c.text || c.content || ''}`).join(' ');
        const searchableText = `${p.title} ${p.content} ${p.category || ''} ${p.tag || ''} ${p.author?.name || ''} ${p.author?.role || ''} ${p.author?.unit || ''} ${commentsText}`;
        return matchesSeparatedWords(searchableText, localSearch);
      });
    }

    if (sortBy === 'likes') {
      list.sort((a, b) => {
        const likesDiff = (b.likes || 0) - (a.likes || 0);
        if (likesDiff !== 0) return likesDiff;
        return getForumPostTimestamp(b) - getForumPostTimestamp(a);
      });
    } else {
      // 'recent' - Ordenação estritamente cronológica por horário/data
      list.sort((a, b) => {
        // Destaques fixados permanecem com prioridade no topo do fórum
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Ordena do mais recente para o mais antigo respeitando os horários
        const timeA = getForumPostTimestamp(a);
        const timeB = getForumPostTimestamp(b);
        return timeB - timeA;
      });
    }

    return list;
  }, [filteredPosts, localSearch, sortBy]);

  // Resetar para a primeira página sempre que os filtros, ordenação ou tamanho de página mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, selectedCategory, visibilityFilter, postStatusFilter, sortBy, pageSize]);

  const totalPosts = displayPosts.length;
  const isAll = pageSize === -1;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalPosts / pageSize));
  const startIdx = isAll ? 0 : (currentPage - 1) * pageSize;
  const endIdx = isAll ? totalPosts : Math.min(startIdx + pageSize, totalPosts);

  const paginatedPosts = useMemo(() => {
    if (isAll) return displayPosts;
    return displayPosts.slice(startIdx, endIdx);
  }, [displayPosts, isAll, startIdx, endIdx]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    const el = document.getElementById('forum');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <section
      id="forum"
      aria-label="Comunidade e Fórum de Trocas"
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-5 transition-all duration-300 hover:shadow-md"
    >
      {/* Forum Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-stone-900 dark:text-stone-100">
                Comunidade & Fórum de Trocas
              </h2>
              {isEditor && (
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Modo Gestão
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Compartilhe experiências, comemore metas alcançadas e tire dúvidas com a rede Ambozini.
            </p>
          </div>
        </div>

        {/* New Post Button */}
        <button
          type="button"
          onClick={handleNewPostClick}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] rounded-xl shadow-2xs transition-colors self-start sm:self-auto cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
        >
          <Plus size={14} />
          <span>Nova Publicação no Fórum</span>
        </button>
      </div>

      {/* Toolbar: Search & Segmented Status Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Bar matching screenshot */}
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por palavras separadas (assunto, autor, unidade)..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-9 pr-9 py-2 text-xs rounded-full border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden shadow-2xs transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              title="Limpar busca no fórum"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditor && (
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-full border border-stone-200/80 dark:border-stone-700/60 mr-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setPostStatusFilter('active')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'active'
                    ? 'bg-[#7c172e] text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Ativas
              </button>
              <button
                type="button"
                onClick={() => setPostStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'all'
                    ? 'bg-[#7c172e] text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setPostStatusFilter('inactive')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'inactive'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                }`}
              >
                Desativadas
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setVisibilityFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all touch-manipulation cursor-pointer shadow-2xs ${
              visibilityFilter === 'all'
                ? 'bg-[#7c172e] text-white'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() => setVisibilityFilter(visibilityFilter === 'public' ? 'all' : 'public')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all touch-manipulation cursor-pointer shadow-2xs ${
              visibilityFilter === 'public'
                ? 'bg-[#7c172e] text-white'
                : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Abertas</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy(sortBy === 'recent' ? 'likes' : 'recent')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all touch-manipulation cursor-pointer shadow-2xs ${
              sortBy === 'recent'
                ? 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
                : 'bg-[#7c172e] text-white'
            }`}
          >
            <Clock size={12} className="text-stone-500" />
            <span>{sortBy === 'recent' ? 'Mais Recentes' : 'Mais Curtidas'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills Row */}
      <div role="tablist" aria-label="Categorias do fórum" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 mr-1 font-medium shrink-0">
          <Filter size={12} />
          <span>Categorias:</span>
        </span>

        {categories.map((cat) => {
          const IconComp = categoryIcons[cat];
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3.5 py-1 rounded-full whitespace-nowrap transition-all touch-manipulation cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                isSelected
                  ? 'bg-[#7c172e] text-white font-bold'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 font-medium'
              }`}
            >
              {IconComp && <IconComp size={12} className={isSelected ? 'text-white' : 'text-stone-400'} />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Forum Feed Grid, Loading Skeleton or Empty State */}
      {isLoadingPosts && displayPosts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
                  <div className="h-2.5 bg-stone-100 dark:bg-stone-800/60 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-4/5" />
              <div className="space-y-2">
                <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-full" />
                <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : displayPosts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {paginatedPosts.map((post) => (
              <PostCard key={post.id} post={post} onOpenDetail={onOpenDetail} />
            ))}
          </div>

          {/* Barra de Paginação e Limite de Postagens */}
          {totalPosts > 0 && (
            <div className="pt-4 border-t border-stone-200/70 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Esquerda: Informações de contagem e Seletor de Limite */}
              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 flex-wrap justify-center sm:justify-start">
                <span>
                  Mostrando <strong className="text-stone-800 dark:text-stone-200">{totalPosts === 0 ? 0 : startIdx + 1}–{endIdx}</strong> de <strong className="text-stone-800 dark:text-stone-200">{totalPosts}</strong> publicações
                </span>

                <span className="text-stone-300 dark:text-stone-700 hidden sm:inline">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">Limite:</span>
                  <div className="inline-flex rounded-xl bg-stone-100 dark:bg-stone-800/80 p-0.5 border border-stone-200/80 dark:border-stone-700 shadow-2xs">
                    {[4, 6, 10, -1].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer touch-manipulation ${
                          pageSize === size
                            ? 'bg-[#7c172e] text-white shadow-2xs'
                            : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                        }`}
                        title={size === -1 ? 'Exibir todas as postagens' : `Exibir ${size} postagens por página`}
                      >
                        {size === -1 ? 'Todas' : size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Direita: Controles de Navegação de Páginas */}
              {!isAll && totalPages > 1 && (
                <nav aria-label="Navegação de páginas da comunidade" className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    className="p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer touch-manipulation"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-1 text-xs text-stone-400 font-bold select-none">
                            …
                          </span>
                        );
                      }
                      const pageNum = Number(p);
                      const isCurrent = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          aria-current={isCurrent ? 'page' : undefined}
                          aria-label={`Ir para a página ${pageNum}`}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                            isCurrent
                              ? 'bg-[#7c172e] text-white shadow-xs font-black'
                              : 'bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 shadow-2xs'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Próxima página"
                    className="p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer touch-manipulation"
                  >
                    <ChevronRight size={15} />
                  </button>
                </nav>
              )}
            </div>
          )}
        </div>
      ) : errorPosts && displayPosts.length === 0 ? (
        <div className="border border-red-200/80 dark:border-red-900/60 rounded-2xl p-8 bg-red-50/40 dark:bg-red-950/20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-2xs">
            <AlertCircle size={22} />
          </div>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Não foi possível carregar as publicações do fórum
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
            Não foi possível sincronizar as postagens no momento.
          </p>
          <button
            type="button"
            onClick={() => retrySyncAll()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100 shadow-2xs cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Tentar novamente</span>
          </button>
        </div>
      ) : (
        <div className="p-10 sm:p-12 text-center rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/20 flex flex-col items-center justify-center">
          {/* Stylized speech bubbles with dots matching screenshot */}
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-11 h-9 rounded-2xl rounded-br-xs bg-[#7c172e] flex items-center justify-center text-white shadow-xs">
              <span className="text-xs tracking-widest font-black leading-none">•••</span>
            </div>
            <div className="w-8 h-7 rounded-2xl rounded-bl-xs bg-rose-200/80 dark:bg-rose-950/70 -ml-2 -mt-2 flex items-center justify-center text-[#7c172e] shadow-2xs">
              <span className="text-[10px] tracking-wider font-black leading-none">••</span>
            </div>
          </div>

          <h4 className="font-extrabold text-stone-900 dark:text-stone-100 mb-1 text-sm sm:text-base">
            {localSearch.trim() ? `Nenhuma publicação encontrada para "${localSearch}"` : 'Nenhuma publicação encontrada'}
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mb-4 leading-relaxed">
            {localSearch.trim() ? (
              'Tente buscar por termos diferentes ou limpe a busca para visualizar todas as postagens da comunidade.'
            ) : (
              <>
                Não há discussões correspondentes aos filtros selecionados.
                <br />
                Seja o primeiro a iniciar uma conversa!
              </>
            )}
          </p>

          {localSearch.trim() ? (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors shadow-2xs cursor-pointer touch-manipulation border border-stone-300/70 dark:border-stone-700"
            >
              <X size={14} />
              <span>Limpar busca no fórum</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNewPostClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] rounded-xl transition-colors shadow-2xs cursor-pointer touch-manipulation"
            >
              <Plus size={14} />
              <span>Criar Publicação</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
