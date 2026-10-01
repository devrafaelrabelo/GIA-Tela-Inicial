import React from 'react';
import {
  Megaphone,
  GraduationCap,
  Building2,
  ShieldCheck,
  Coins,
  Star,
  Heart,
  Edit2,
  EyeOff,
  RotateCcw,
  Globe,
  Lock,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Announcement } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { RichTextRenderer } from '../common/RichTextRenderer';

const iconConfig: Record<string, { icon: React.ElementType; bg: string }> = {
  megaphone: { icon: Megaphone, bg: 'bg-[#bd1e3c] text-white' },
  'graduation-cap': { icon: GraduationCap, bg: 'bg-[#4a121d] text-white' },
  store: { icon: Building2, bg: 'bg-[#7c172e] text-white' },
  'shield-check': { icon: ShieldCheck, bg: 'bg-indigo-900 text-white' },
  coins: { icon: Coins, bg: 'bg-amber-600 text-white' },
};

interface AnnouncementCardProps {
  item: Announcement;
  onOpenDetail: (item: Announcement) => void;
  onEdit?: (item: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ item, onOpenDetail, onEdit }) => {
  const { authStatus, currentUser, openConfirmModal } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const {
    toggleLike,
    toggleAnnouncementFeatured,
    toggleAnnouncementActive,
    toggleAnnouncementVisibility
  } = usePortal();

  const cfg = iconConfig[item.icon || 'megaphone'] || { icon: Megaphone, bg: 'bg-[#7c172e] text-white' };
  const IconComponent = cfg.icon;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      className={`p-5 rounded-2xl border ${
        item.isActive === false
          ? 'border-amber-300/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
          : 'border-stone-200/80 dark:border-stone-800/90 bg-stone-50/50 dark:bg-stone-900/40'
      } hover:bg-stone-50/90 dark:hover:bg-stone-900/70 flex flex-col justify-between hover:border-[#7c172e]/40 dark:hover:border-rose-500/40 hover:shadow-md transition-all duration-200 group cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7c172e]`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 shadow-xs`}>
            <IconComponent size={16} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isEditor && (
              <div className="flex items-center gap-0.5 bg-stone-100/90 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60 shadow-2xs mr-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAnnouncementFeatured(item.id);
                  }}
                  aria-label={item.isFeatured ? 'Remover dos avisos principais em destaque' : 'Destacar nos avisos principais do topo'}
                  title={item.isFeatured ? 'Remover dos avisos principais' : 'Destacar nos avisos principais'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                    item.isFeatured
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-700'
                  }`}
                >
                  <Star size={13} className={item.isFeatured ? 'fill-amber-400' : ''} />
                </button>
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    aria-label={`Editar comunicado: ${item.title}`}
                    title="Editar comunicado"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-[#7c172e] dark:hover:text-rose-300 hover:bg-[#7c172e]/10 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const willDeactivate = item.isActive !== false;
                    openConfirmModal({
                      title: willDeactivate ? 'Desativar Comunicado' : 'Reativar Comunicado',
                      message: willDeactivate
                        ? `Tem certeza que deseja desativar o comunicado "${item.title}"? Ele será ocultado para os colaboradores no mural, mas nenhum dado será apagado e tudo ficará registrado no histórico.`
                        : `Deseja reativar o comunicado "${item.title}" para visualização pública no mural?`,
                      confirmText: willDeactivate ? 'Desativar Comunicado' : 'Reativar Comunicado',
                      onConfirm: () => {
                        toggleAnnouncementActive(item.id, willDeactivate ? 'Desativado no mural pelo gestor' : 'Reativado no mural pelo gestor');
                      }
                    });
                  }}
                  aria-label={item.isActive === false ? `Reativar comunicado: ${item.title}` : `Desativar comunicado: ${item.title}`}
                  title={item.isActive === false ? 'Reativar comunicado' : 'Desativar comunicado (não apaga)'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                    item.isActive === false
                      ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                      : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                  }`}
                >
                  {item.isActive === false ? <RotateCcw size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
            )}

            {/* Tag de Desativado se aplicável */}
            {item.isActive === false && (
              <span className="text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <EyeOff size={10} />
                Desativado
              </span>
            )}

            {/* Tag de Visibilidade */}
            {item.visibility === 'public' ? (
              <button
                type="button"
                disabled={!isEditor}
                onClick={(e) => {
                  if (isEditor) {
                    e.stopPropagation();
                    toggleAnnouncementVisibility(item.id);
                  }
                }}
                title={isEditor ? "Clique para tornar exclusivo para Colaboradores" : "Comunicado Público"}
                className={`text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isEditor ? 'hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer touch-manipulation' : ''
                }`}
              >
                <Globe size={10} />
                <span>Público</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!isEditor}
                onClick={(e) => {
                  if (isEditor) {
                    e.stopPropagation();
                    toggleAnnouncementVisibility(item.id);
                  }
                }}
                title={isEditor ? "Clique para tornar Público para todos" : "Exclusivo para Colaboradores"}
                className={`text-[9px] font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 dark:bg-rose-950/60 border border-[#7c172e]/20 px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isEditor ? 'hover:bg-[#7c172e]/20 dark:hover:bg-rose-950/80 cursor-pointer touch-manipulation' : ''
                }`}
              >
                <Lock size={10} />
                <span>Colaborador</span>
              </button>
            )}

            {item.isFeatured && (
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-500" />
                Destaque
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1 flex-wrap">
          <span>{item.author}</span>
          {item.date && <span>• {item.date}</span>}
        </div>

        <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#7c172e] dark:group-hover:text-rose-400 transition-colors line-clamp-2 mb-2 leading-snug">
          {item.title}
        </h4>

        {/* Renderização rica de conteúdo ou sumário */}
        <div className="line-clamp-3">
          <RichTextRenderer
            content={item.content || item.summary || ''}
            className="text-stone-600 dark:text-stone-400"
          />
        </div>

        {/* Botão de Ação Customizado se configurado */}
        {item.actionButtonText && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (item.actionButtonUrl?.startsWith('http')) {
                  window.open(item.actionButtonUrl, '_blank', 'noopener,noreferrer');
                } else if (item.actionButtonUrl?.startsWith('#')) {
                  const el = document.querySelector(item.actionButtonUrl);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-hidden"
            >
              <FileText size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span>{item.actionButtonText}</span>
            </button>
            {item.actionButtonSubtext && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                {item.actionButtonSubtext}
              </span>
            )}
          </div>
        )}

        {/* Indicador visual para ver completo */}
        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-400 group-hover:translate-x-0.5 transition-transform">
          <span>Ver completo</span>
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      {/* Card Footer: Likes */}
      <div className="pt-3 mt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs">
        <span className="text-[10px] text-stone-400 font-medium">
          {item.tag || 'Comunicado'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleLike('announcements', item.id);
          }}
          aria-label={`Curtir comunicado: ${item.title}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
            item.userLiked
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Heart size={12} className={item.userLiked ? 'fill-rose-600 text-rose-600' : ''} />
          <span className="tabular-nums">{item.likesCount || 0}</span>
        </button>
      </div>
    </div>
  );
};
