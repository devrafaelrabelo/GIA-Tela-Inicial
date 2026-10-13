import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageSquare,
  Send,
  Globe,
  Lock,
  Shield,
  Clock,
  History,
  Edit2,
  EyeOff,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ForumPost, AuditLogEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { VideoPlayer } from '../common/VideoPlayer';
import { EditPostModal } from './EditPostModal';
import { formatPostTimeAgo } from '../../utils/date';

interface PostDetailModalProps {
  post: ForumPost | null;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
  const { authStatus, currentUser, openGiaModal, showToast, openConfirmModal } = useAuth();
  const { forumPosts, togglePostLike, addForumComment, toggleForumPostActive } = usePortal();
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'audit'>('content');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

  React.useEffect(() => {
    if (!isEditor && activeTab === 'audit') {
      setActiveTab('content');
    }
  }, [isEditor, activeTab]);

  const { handleBackdropClick } = useModalDismiss({
    isOpen: !!post,
    onClose
  });

  if (!post) return null;

  const activePost = forumPosts.find((p) => p.id === post.id) || post;
  const isLocked = activePost.visibility === 'members_only' && authStatus === 'unauthenticated';
  const displayImage = activePost.imageUrl || activePost.image;
  const isLiked = activePost.userLiked;
  const isAuthor = currentUser?.name === activePost.author.name;
  const canManage = isAuthor || isEditor;
  const isDeactivated = activePost.isActive === false;

  const auditLog: AuditLogEntry[] = activePost.auditLog && activePost.auditLog.length > 0
    ? activePost.auditLog
    : [
        {
          id: `log_init_${activePost.id}`,
          action: 'created',
          timestamp: '2026-09-20T10:00:00.000Z',
          authorName: activePost.author.name,
          authorRole: activePost.author.role,
          authorAvatar: activePost.author.avatar,
          details: 'Publicação criada na Comunidade & Fórum de Trocas'
        }
      ];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authStatus === 'unauthenticated') {
      openGiaModal();
      return;
    }
    if (!commentText.trim()) return;

    addForumComment(activePost.id, {
      author: currentUser?.name || 'Colaborador',
      authorRole: currentUser?.role || 'Colaborador',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      content: commentText.trim(),
    });

    setCommentText('');
    showToast('Comentário publicado!', 'success');
  };

  const handleToggleActive = () => {
    const willDeactivate = !isDeactivated;
    openConfirmModal({
      title: willDeactivate ? 'Desativar Publicação' : 'Reativar Publicação',
      message: willDeactivate
        ? `Tem certeza que deseja desativar a publicação "${activePost.title}"? Ela será ocultada para os colaboradores no fórum, mas todos os dados permanecerão salvos no histórico de auditoria.`
        : `Deseja reativar a publicação "${activePost.title}" para visualização pública no fórum?`,
      confirmText: willDeactivate ? 'Desativar Publicação' : 'Reativar Publicação',
      onConfirm: () => {
        toggleForumPostActive(
          activePost.id,
          willDeactivate ? 'Desativação efetuada no modal de detalhes' : 'Reativação efetuada no modal de detalhes'
        );
      }
    });
  };

  const formatLogDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <>
      <div
        onClick={handleBackdropClick}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="post-detail-title"
          className="relative w-full max-w-2xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={activePost.author.avatar}
                alt={activePost.author.name}
                className="w-10 h-10 rounded-full border-2 border-brand-wine/30 object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground truncate">{activePost.author.name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-wine/10 text-brand-wine font-medium">
                    {activePost.author.role}
                  </span>
                  {activePost.author.isEditor && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-amber/20 text-brand-amber font-semibold flex items-center gap-0.5">
                      <Shield size={10} /> Editor
                    </span>
                  )}
                  {isDeactivated && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                      <EyeOff size={10} /> Desativada
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>{activePost.author.unit}</span>
                  <span>•</span>
                  <span>{formatPostTimeAgo(activePost)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              {activePost.visibility === 'public' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  <Globe size={13} /> Aberta
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-wine/15 text-brand-wine border border-brand-wine/30">
                  <Lock size={13} /> Exclusiva
                </span>
              )}

              {canManage && (
                <div className="flex items-center gap-0.5 bg-stone-100/90 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    aria-label={`Editar publicação: ${activePost.title}`}
                    title="Editar publicação"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-[#7c172e] dark:hover:text-rose-300 hover:bg-[#7c172e]/10 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleActive}
                    aria-label={isDeactivated ? `Reativar publicação: ${activePost.title}` : `Desativar publicação: ${activePost.title}`}
                    title={isDeactivated ? 'Reativar Publicação' : 'Desativar Publicação (não apaga)'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                      isDeactivated
                        ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                        : 'text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                    }`}
                  >
                    {isDeactivated ? <RotateCcw size={13} /> : <EyeOff size={13} />}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar publicação"
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navegação de Abas: Publicação vs Histórico de Auditoria (Exclusivo para Gestor / Editor) */}
          {isEditor && (
            <div className="px-6 pt-2 bg-stone-50/50 dark:bg-stone-900/30 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'content'
                    ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <MessageSquare size={13} />
                <span>Publicação</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                    : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <History size={13} />
                <span>Histórico & Auditoria</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-extrabold">
                  {auditLog.length}
                </span>
              </button>
            </div>
          )}

          {/* Banner de Aviso quando Desativada */}
          {isDeactivated && (
            <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>
                  <strong>Publicação Desativada:</strong> Esta postagem não é visível para colaboradores comuns.
                </span>
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
                >
                  Reativar Post
                </button>
              )}
            </div>
          )}

          {/* Conteúdo da Aba Ativa */}
          <div className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1">
            {activeTab === 'content' || !isEditor ? (
              <>
                <h2 id="post-detail-title" className="text-xl font-bold text-foreground leading-snug [text-wrap:balance]">
                  {activePost.title}
                </h2>

                {isLocked ? (
                  <div className="p-6 rounded-2xl bg-brand-wine/5 border border-brand-wine/25 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-brand-wine text-white mx-auto flex items-center justify-center shadow-md">
                      <Lock size={22} />
                    </div>
                    <h3 className="font-bold text-base text-brand-wine">Conteúdo Protegido por Acesso GIA</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Esta publicação é exclusiva para colaboradores da rede Ambozini. Efetue seu login para desbloquear o texto completo, imagens e comentários.
                    </p>
                    <button
                      type="button"
                      onClick={openGiaModal}
                      className="btn-crm-gateway px-5 py-2.5 text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer"
                    >
                      Acessar com GIA
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <RichTextRenderer content={activePost.content} className="text-foreground/90 text-sm leading-relaxed" />

                    {activePost.videoUrl ? (
                      <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
                        <VideoPlayer url={activePost.videoUrl} title={activePost.title} controls={true} />
                      </div>
                    ) : displayImage ? (
                      <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm max-h-96">
                        <img src={displayImage} alt={activePost.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      </div>
                    ) : null}

                    {/* Likes and stats */}
                    <div className="flex items-center gap-4 py-3 border-y border-border/50 text-xs">
                      <button
                        type="button"
                        onClick={() => togglePostLike(activePost.id)}
                        className={`flex items-center gap-1.5 transition-colors font-semibold cursor-pointer ${
                          isLiked ? 'text-brand-wine' : 'text-muted-foreground hover:text-brand-wine'
                        }`}
                      >
                        <Heart size={16} className={isLiked ? 'fill-brand-wine' : ''} />
                        <span>{activePost.likes} curtidas</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageSquare size={16} />
                        <span>{(activePost.comments || []).length} comentários</span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleCommentSubmit} className="pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={
                            authStatus === 'unauthenticated'
                              ? 'Faça login para comentar...'
                              : 'Escreva um comentário construtivo...'
                          }
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-wine/30 focus:border-brand-wine"
                        />
                        <button
                          type="submit"
                          className="btn-crm-gateway px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send size={14} />
                          <span className="hidden sm:inline">Enviar</span>
                        </button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Comentários ({(activePost.comments || []).length})
                      </h4>
                      {(activePost.comments || []).length > 0 ? (
                        activePost.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3.5 rounded-xl bg-muted/30 border border-border/50 flex items-start gap-3"
                          >
                            <img
                              src={comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={comment.author}
                              className="w-8 h-8 rounded-full border border-border object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-xs text-foreground">{comment.author}</span>
                                  <span className="text-[10px] text-muted-foreground">({comment.authorRole || 'Colaborador'})</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground">{comment.timeAgo || 'Hoje'}</span>
                              </div>
                              <p className="text-xs text-foreground/85 mt-1 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Nenhum comentário ainda. Seja o primeiro!</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ABA DE HISTÓRICO & AUDITORIA */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <div>
                    <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <History size={16} className="text-[#7c172e] dark:text-rose-400" />
                      <span>Rastreabilidade & Registro de Alterações</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Histórico imutável de criação, atualizações de campos e controle de ativação.
                    </p>
                  </div>
                </div>

                {/* Linha do tempo visual */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
                  {auditLog.map((log) => {
                    let badgeColor = 'bg-stone-100 text-stone-700 border-stone-200';
                    let actionLabel = 'Ação Realizada';
                    let dotColor = 'bg-stone-400';

                    if (log.action === 'created') {
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300';
                      actionLabel = 'Criação da Publicação';
                      dotColor = 'bg-emerald-500';
                    } else if (log.action === 'updated') {
                      badgeColor = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300';
                      actionLabel = 'Edição de Dados';
                      dotColor = 'bg-blue-500';
                    } else if (log.action === 'deactivated') {
                      badgeColor = 'bg-rose-50 text-[#7c172e] border-rose-200 dark:bg-rose-950/60 dark:text-rose-300';
                      actionLabel = 'Desativação';
                      dotColor = 'bg-[#7c172e]';
                    } else if (log.action === 'reactivated') {
                      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300';
                      actionLabel = 'Reativação';
                      dotColor = 'bg-purple-500';
                    }

                    return (
                      <div key={log.id} className="relative group">
                        {/* Marcador no trilho da linha do tempo */}
                        <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1e1819] ${dotColor} shadow-xs`} />

                        {/* Card do evento */}
                        <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {actionLabel}
                            </span>
                            <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1">
                              <Clock size={11} />
                              <span>{formatLogDate(log.timestamp)}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {log.authorAvatar ? (
                              <img src={log.authorAvatar} alt={log.authorName} className="w-6 h-6 rounded-full object-cover border border-stone-200 dark:border-stone-700" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center font-bold text-[10px]">
                                {log.authorName.charAt(0)}
                              </div>
                            )}
                            <div className="text-xs">
                              <span className="font-bold text-stone-800 dark:text-stone-200">{log.authorName}</span>
                              {log.authorRole && (
                                <span className="text-[11px] text-stone-400 ml-1.5">({log.authorRole})</span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800/80">
                            {log.details}
                          </p>

                          {log.changedFields && log.changedFields.length > 0 && (
                            <div className="text-[10px] text-stone-400 flex items-center gap-1.5 pt-0.5">
                              <span>Campos afetados:</span>
                              {log.changedFields.map((field) => (
                                <span key={field} className="px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                                  {field}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <EditPostModal
        post={activePost}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};
