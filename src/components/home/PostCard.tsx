import React, { useState } from 'react';
import { Heart, MessageSquare, Lock, Globe, Share2, Shield, Flame, Tag, EyeOff, RotateCcw, Edit2 } from 'lucide-react';
import { ForumPost } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { VideoPlayer } from '../common/VideoPlayer';
import { EditPostModal } from '../modals/EditPostModal';
import { formatPostTimeAgo } from '../../utils/date';

interface PostCardProps {
  post: ForumPost;
  onOpenDetail: (post: ForumPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenDetail }) => {
  const { authStatus, currentUser, openGiaModal, showToast, openConfirmModal } = useAuth();
  const { togglePostLike, toggleForumPostActive } = usePortal();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Regra estrita: postagens que precisam de login NÃO aparecem para quem não está logado
  if (post.visibility === 'members_only' && authStatus === 'unauthenticated') {
    return null;
  }

  const isDeactivated = post.isActive === false;
  const isAuthor = currentUser?.name === post.author.name;
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const canManage = isAuthor || isEditor;
  const isLocked = false;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePostLike(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    showToast('Link do post copiado para a área de transferência!', 'info');
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willDeactivate = !isDeactivated;
    openConfirmModal({
      title: willDeactivate ? 'Desativar Publicação' : 'Reativar Publicação',
      message: willDeactivate
        ? `Tem certeza que deseja desativar a publicação "${post.title}"? Ela será ocultada para colaboradores comuns, mas todas as informações permanecerão intactas no histórico de auditoria.`
        : `Deseja reativar a publicação "${post.title}" para visualização pública no fórum?`,
      confirmText: willDeactivate ? 'Desativar Publicação' : 'Reativar Publicação',
      onConfirm: () => {
        toggleForumPostActive(post.id, willDeactivate ? 'Desativação rápida pelo card' : 'Reativação rápida pelo card');
      }
    });
  };

  const displayImage = post.imageUrl || post.image;
  const isLiked = post.userLiked;
  const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

  return (
    <>
      <article
      onClick={() => {
        if (isLocked) {
          openGiaModal();
        } else {
          onOpenDetail(post);
        }
      }}
      className={`portal-card p-6 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-brand-wine/30 group ${
        isDeactivated
          ? 'border-amber-400/50 bg-amber-50/20 dark:bg-amber-950/10'
          : isLocked
          ? 'relative overflow-hidden bg-gradient-to-b from-card to-brand-wine/5 border-dashed border-brand-wine/30'
          : ''
      }`}
    >
      {/* Top Meta: Author & Visibility Tag */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full border-2 border-brand-wine/30 object-cover shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground hover:text-brand-wine transition-colors">
                {post.author.name}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-wine/10 text-brand-wine font-medium">
                {post.author.role}
              </span>
              {post.author.isEditor && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-amber/20 text-brand-amber font-semibold flex items-center gap-0.5">
                  <Shield size={10} /> Editor
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-2">
              <span>{post.author.unit}</span>
              <span>•</span>
              <span>{formatPostTimeAgo(post)}</span>
            </div>
          </div>
        </div>

        {/* Visibility & Status Badges */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {isDeactivated && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <EyeOff size={11} /> Desativada
            </span>
          )}

          {post.visibility === 'public' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              <Globe size={13} />
              Aberta
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-wine/15 text-brand-wine border border-brand-wine/30">
              <Lock size={13} />
              Exclusiva
            </span>
          )}

          {canManage && (
            <div className="flex items-center gap-0.5 bg-stone-100/90 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60 shadow-2xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                aria-label={`Editar publicação: ${post.title}`}
                title="Editar publicação"
                className="p-1.5 rounded-lg text-stone-400 hover:text-[#7c172e] dark:hover:text-rose-300 hover:bg-[#7c172e]/10 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
              >
                <Edit2 size={13} />
              </button>
              <button
                type="button"
                onClick={handleToggleActive}
                aria-label={isDeactivated ? `Reativar publicação: ${post.title}` : `Desativar publicação: ${post.title}`}
                title={isDeactivated ? 'Reativar Publicação' : 'Desativar Publicação (não apaga)'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                  isDeactivated
                    ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                    : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                }`}
              >
                {isDeactivated ? <RotateCcw size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Post Category / Tag */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-[#7c172e]/20">
          <Tag size={11} />
          {post.tag || post.category}
        </span>
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/25">
            <Flame size={12} /> Destaque
          </span>
        )}
      </div>

      {/* Post Title */}
      <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-brand-wine transition-colors leading-snug">
        {post.title}
      </h3>

      {/* Post Content: Blurred or Clear */}
      <div className="relative mb-4">
        {isLocked ? (
          <div>
            <p className="text-sm text-muted-foreground line-clamp-2 select-none filter blur-[5px] pointer-events-none opacity-60">
              {post.content}
            </p>
            {/* Lock Overlay Gateway */}
            <div className="mt-3 p-4 rounded-xl bg-brand-wine/5 border border-brand-wine/25 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-wine text-white flex items-center justify-center flex-shrink-0 shadow-md">
                  <Lock size={15} />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-brand-wine uppercase tracking-wider">
                    Publicação Exclusiva para Colaboradores
                  </h5>
                  <p className="text-xs text-muted-foreground">
                    Faça login com sua conta corporativa para ler o conteúdo integral e comentar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openGiaModal();
                }}
                className="btn-crm-gateway whitespace-nowrap text-xs py-2 px-3.5 shadow-sm"
              >
                Acessar com GIA
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
              <RichTextRenderer content={post.content} />
            </div>
            {post.videoUrl ? (
              <div
                className="mt-3 rounded-xl overflow-hidden border border-border/40 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <VideoPlayer url={post.videoUrl} title={post.title} controls={true} />
              </div>
            ) : displayImage ? (
              <div className="mt-3 rounded-xl overflow-hidden max-h-64 border border-border/40 shadow-sm">
                <img
                  src={displayImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Card Footer: Likes, Comments, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition-colors font-medium touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden rounded-md px-1.5 py-0.5 ${
              isLiked ? 'text-brand-wine font-bold' : 'hover:text-brand-wine'
            }`}
          >
            <Heart size={15} className={isLiked ? 'fill-brand-wine' : ''} />
            <span className="tabular-nums">{post.likes}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isLocked) {
                openGiaModal();
              } else {
                onOpenDetail(post);
              }
            }}
            className="flex items-center gap-1.5 hover:text-brand-wine transition-colors font-medium touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden rounded-md px-1.5 py-0.5"
          >
            <MessageSquare size={15} />
            <span><span className="tabular-nums">{commentsCount}</span> comentários</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="hover:text-brand-wine transition-colors p-1 touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden rounded-md"
          title="Compartilhar"
        >
          <Share2 size={15} />
        </button>
      </div>
    </article>

    {isEditModalOpen && (
      <EditPostModal
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    )}
  </>
  );
};
