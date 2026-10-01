import React, { useState } from 'react';
import { Megaphone, Plus, Search, X, Lock, Globe, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { Announcement } from '../../types';
import { AnnouncementModal } from '../modals/publish/AnnouncementModal';
import { AnnouncementDetailModal } from '../modals/AnnouncementDetailModal';
import { AnnouncementCard } from './AnnouncementCard';
import { matchesSeparatedWords } from '../../utils/text';

export const AnnouncementsSection: React.FC = () => {
  const { openPublishModal, authStatus, currentUser } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
  const {
    announcements,
    isLoadingAnnouncements,
    errorAnnouncements,
    retrySyncAll
  } = usePortal();
  const [localSearch, setLocalSearch] = useState('');
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcementStatusFilter, setAnnouncementStatusFilter] = useState<'active' | 'all' | 'inactive'>('active');
  const [announcementVisibilityFilter, setAnnouncementVisibilityFilter] = useState<'all' | 'public' | 'members_only'>('all');

  // Regra: Comunicados exclusivos (que precisam de login) NÃO aparecem para quem não está logado
  // Regra: Colaboradores comuns NUNCA veem comunicados desativados
  // Regra: Busca por palavras separadas sem distinção de acentos
  const displayAnnouncements = React.useMemo(() => {
    return announcements.filter((item) => {
      if (!isEditor) {
        if (item.isActive === false) return false;
      } else {
        if (announcementStatusFilter === 'active' && item.isActive === false) return false;
        if (announcementStatusFilter === 'inactive' && item.isActive !== false) return false;
      }

      if (!isLogged && item.visibility === 'members_only') {
        return false;
      }

      if (announcementVisibilityFilter === 'public' && item.visibility !== 'public') return false;
      if (announcementVisibilityFilter === 'members_only' && item.visibility !== 'members_only') return false;

      if (localSearch.trim()) {
        const commentsText = (item.comments || []).map((c) => `${c.author || ''} ${c.text || c.content || ''}`).join(' ');
        const searchableText = `${item.title} ${item.content} ${item.summary || ''} ${item.category || ''} ${item.author || ''} ${item.authorDepartment || ''} ${commentsText}`;
        if (!matchesSeparatedWords(searchableText, localSearch)) return false;
      }

      return true;
    });
  }, [announcements, isLogged, isEditor, announcementStatusFilter, announcementVisibilityFilter, localSearch]);

  return (
    <section
      id="comunicados-section"
      aria-label="Comunicados Gerais"
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-6 shadow-xs transition-colors"
    >
      {/* Top Header with Card Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
            <Megaphone className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                COMUNICADOS GERAIS
              </h3>
              {isEditor && (
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Modo Gestão
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Mural oficial de avisos corporativos e comunicados da gestão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => openPublishModal('comunicados')}
            title="Publicar novo comunicado geral ou em destaque"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
          >
            <Plus size={14} />
            <span>Novo comunicado</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 border-b border-stone-200/70 dark:border-stone-800/80 pb-4">
        {/* Busca interna nos Comunicados */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar nos comunicados gerais..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-full border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden shadow-2xs transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              title="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtros de Visibilidade */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
              Visibilidade:
            </span>

            <button
              type="button"
              onClick={() => setAnnouncementVisibilityFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                announcementVisibilityFilter === 'all'
                  ? 'bg-[#7c172e] text-white'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              Todos
            </button>

            <button
              type="button"
              onClick={() => setAnnouncementVisibilityFilter(announcementVisibilityFilter === 'public' ? 'all' : 'public')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                announcementVisibilityFilter === 'public'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <Globe size={13} className={announcementVisibilityFilter === 'public' ? 'text-white' : 'text-blue-500'} />
              <span>Públicos</span>
            </button>

            {isLogged && (
              <button
                type="button"
                onClick={() => setAnnouncementVisibilityFilter(announcementVisibilityFilter === 'members_only' ? 'all' : 'members_only')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                  announcementVisibilityFilter === 'members_only'
                    ? 'bg-[#7c172e] text-white font-bold'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 hover:bg-stone-50'
                }`}
              >
                <Lock size={13} className={announcementVisibilityFilter === 'members_only' ? 'text-white' : 'text-[#7c172e] dark:text-rose-400'} />
                <span>Colaboradores</span>
              </button>
            )}
          </div>

          {/* Filtros de Status (Gestão de Editores) */}
          {isEditor && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
                Status:
              </span>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800/80 p-0.5 rounded-full border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setAnnouncementStatusFilter('active')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    announcementStatusFilter === 'active'
                      ? 'bg-[#7c172e] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Ativos
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementStatusFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    announcementStatusFilter === 'all'
                      ? 'bg-[#7c172e] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementStatusFilter('inactive')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    announcementStatusFilter === 'inactive'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
                  }`}
                >
                  Desativados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Announcements */}
      {isLoadingAnnouncements && displayAnnouncements.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 animate-pulse space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-full" />
                <div className="h-3 bg-stone-100 dark:bg-stone-800/60 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : errorAnnouncements && displayAnnouncements.length === 0 ? (
        <div className="border border-red-200/80 dark:border-red-900/60 rounded-2xl p-8 bg-red-50/40 dark:bg-red-950/20 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-2xs">
            <AlertCircle size={22} />
          </div>
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Não foi possível carregar os comunicados no momento
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
            Não foi possível sincronizar os comunicados no momento.
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
      ) : displayAnnouncements.length === 0 ? (
        localSearch.trim() ? (
          <div className="py-10 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-stone-50/50 dark:bg-stone-900/20 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center shadow-2xs">
              <Megaphone size={18} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Nenhum comunicado encontrado para "{localSearch}"
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                Tente buscar por outras palavras separadas ou limpe o campo de busca.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocalSearch('')}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#7c172e] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 transition-colors shadow-2xs cursor-pointer touch-manipulation"
            >
              <X size={13} />
              <span>Limpar busca nos comunicados</span>
            </button>
          </div>
        ) : (
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl p-8 sm:p-12 bg-gradient-to-b from-stone-50/60 to-stone-50/20 dark:from-stone-900/40 dark:to-stone-900/10 flex flex-col items-center justify-center text-center space-y-2 group">
            <div className="relative mb-1">
              <div className="w-12 h-12 rounded-2xl bg-[#7c172e]/10 dark:bg-rose-950/40 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Megaphone size={22} className="stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-400 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                📣
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Mural limpo e sem comunicados pendentes
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
              Todos os comunicados corporativos, orientações de RH, campanhas comerciais e notas técnicas aparecerão organizados aqui.
            </p>
            {isEditor && (
              <button
                type="button"
                onClick={() => openPublishModal('comunicados')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-xs cursor-pointer touch-manipulation"
              >
                <Plus size={14} />
                <span>Publicar primeiro comunicado no mural</span>
              </button>
            )}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {displayAnnouncements.slice(0, 6).map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              onOpenDetail={(ann) => setSelectedAnnouncement(ann)}
              onEdit={(ann) => {
                setEditingAnnouncement(ann);
                setIsEditModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de Edição de Comunicado */}
      {isEditModalOpen && (
        <AnnouncementModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAnnouncement(null);
          }}
          editingAnnouncement={editingAnnouncement}
        />
      )}

      {/* Modal de Leitura Completa do Comunicado */}
      <AnnouncementDetailModal
        announcement={selectedAnnouncement}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </section>
  );
};
