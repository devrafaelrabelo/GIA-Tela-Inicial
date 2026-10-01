import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  MessageSquare,
  Send,
  Globe,
  Lock,
  Star,
  CheckCircle2,
  FileText,
  ExternalLink,
  Paperclip,
  Share2,
  Megaphone,
  GraduationCap,
  Coins,
  ShieldCheck,
  Building,
  Clock,
  Sparkles,
  ArrowRight,
  Calendar,
  Check,
  History,
  EyeOff,
  RotateCcw,
  AlertTriangle,
  Edit2
} from 'lucide-react';
import { Announcement, AuditLogEntry } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { RichTextRenderer } from '../common/RichTextRenderer';
import { AnnouncementModal } from './publish/AnnouncementModal';

const iconMap: Record<string, React.ElementType> = {
  megaphone: Megaphone,
  'graduation-cap': GraduationCap,
  store: Building,
  'shield-check': ShieldCheck,
  coins: Coins
};

interface AnnouncementDetailModalProps {
  announcement: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementDetailModal: React.FC<AnnouncementDetailModalProps> = ({
  announcement,
  isOpen,
  onClose
}) => {
  const { authStatus, currentUser, openGiaModal, showToast, openConfirmModal } = useAuth();
  const { announcements, toggleLike, addAnnouncementComment, toggleAnnouncementActive, toggleAnnouncementFeatured, toggleAnnouncementVisibility } = usePortal();
  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const [commentText, setCommentText] = useState('');
  const [hasConfirmedRead, setHasConfirmedRead] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audit'>('content');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!isEditor && activeTab === 'audit') {
      setActiveTab('content');
    }
  }, [isEditor, activeTab]);

  const { handleBackdropClick } = useModalDismiss({
    isOpen: isOpen && !!announcement,
    onClose
  });

  if (!isOpen || !announcement) return null;

  // Busca a versão mais atualizada do comunicado no contexto
  const item = announcements.find((a) => a.id === announcement.id) || announcement;
  const IconComponent = iconMap[item.icon || 'megaphone'] || Megaphone;
  const comments = item.comments || [];
  const imageUrl = item.imageUrl;

  // Estimativa aproximada de tempo de leitura
  const wordCount = (item.content ? item.content.split(/\s+/).length : 0) + (item.summary ? item.summary.split(/\s+/).length : 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));
  const isDeactivated = item.isActive === false;

  const auditLog: AuditLogEntry[] = item.auditLog && item.auditLog.length > 0
    ? item.auditLog
    : [
        {
          id: `log_init_${item.id}`,
          action: 'created',
          timestamp: '2026-09-20T10:00:00.000Z',
          authorName: item.author || 'Gestão Ambozini',
          details: 'Comunicado corporativo oficial publicado no mural'
        }
      ];

  const handleToggleActive = () => {
    const willDeactivate = !isDeactivated;
    openConfirmModal({
      title: willDeactivate ? 'Desativar Comunicado' : 'Reativar Comunicado',
      message: willDeactivate
        ? `Tem certeza que deseja desativar o comunicado "${item.title}"? Ele será ocultado para os colaboradores no mural, mas todos os dados permanecerão salvos no histórico de auditoria.`
        : `Deseja reativar o comunicado "${item.title}" para visualização pública no mural?`,
      confirmText: willDeactivate ? 'Desativar Comunicado' : 'Reativar Comunicado',
      onConfirm: () => {
        toggleAnnouncementActive(
          item.id,
          willDeactivate ? 'Desativação efetuada no modal de leitura' : 'Reativação efetuada no modal de leitura'
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

  const handleLike = () => {
    toggleLike('announcements', item.id);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogged) {
      openGiaModal();
      return;
    }
    if (!commentText.trim()) return;

    addAnnouncementComment(item.id, commentText.trim());
    setCommentText('');
    showToast('Comentário publicado com sucesso!', 'success');
  };

  const handleActionClick = () => {
    if (!item.actionButtonUrl) return;
    if (item.actionButtonUrl.startsWith('http')) {
      window.open(item.actionButtonUrl, item.actionButtonOpenNewTab !== false ? '_blank' : '_self', 'noopener,noreferrer');
    } else if (item.actionButtonUrl.startsWith('#')) {
      onClose();
      const el = document.querySelector(item.actionButtonUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + '#' + item.id);
      setCopiedLink(true);
      showToast('Link do comunicado copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleConfirmRead = () => {
    if (!isLogged) {
      openGiaModal();
      return;
    }
    setHasConfirmedRead(true);
    showToast('Confirmação de leitura e ciência registrada com sucesso!', 'success');
  };

  return (
    <>
      <div
        onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-[#1a1415] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* ========================================================
            BARRA DE NAVEGAÇÃO SUPERIOR DO MODAL
            ======================================================== */}
        <div className="px-5 sm:px-7 py-3.5 bg-stone-50/90 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shrink-0 border border-[#7c172e]/15">
              <IconComponent size={16} className="stroke-[2.2]" />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                {item.tag || 'Comunicado Oficial'}
              </span>

              {isDeactivated && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <EyeOff size={10} /> Desativado
                </span>
              )}

              {item.visibility === 'public' ? (
                <button
                  type="button"
                  disabled={!isEditor}
                  onClick={() => {
                    if (isEditor) toggleAnnouncementVisibility(item.id);
                  }}
                  title={isEditor ? "Clique para tornar exclusivo para Colaboradores" : "Visível para todos"}
                  className={`text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isEditor ? 'hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer touch-manipulation' : ''
                  }`}
                >
                  <Globe size={10} /> Público
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isEditor}
                  onClick={() => {
                    if (isEditor) toggleAnnouncementVisibility(item.id);
                  }}
                  title={isEditor ? "Clique para tornar Público para todos" : "Exclusivo para Colaboradores"}
                  className={`text-[10px] font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 dark:bg-rose-950/60 border border-[#7c172e]/20 px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isEditor ? 'hover:bg-[#7c172e]/20 dark:hover:bg-rose-950/80 cursor-pointer touch-manipulation' : ''
                  }`}
                >
                  <Lock size={10} /> Colaborador
                </button>
              )}

              {item.isFeatured && (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-300/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-amber-400 text-amber-500" /> Destaque
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            {isEditor && (
              <div className="flex items-center gap-0.5 bg-stone-100/90 dark:bg-stone-800/80 p-0.5 rounded-xl border border-stone-200/70 dark:border-stone-700/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleAnnouncementFeatured(item.id)}
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
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  aria-label={`Editar comunicado: ${item.title}`}
                  title="Editar comunicado"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#7c172e] dark:hover:text-rose-300 hover:bg-[#7c172e]/10 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  aria-label={isDeactivated ? `Reativar comunicado: ${item.title}` : `Desativar comunicado: ${item.title}`}
                  title={isDeactivated ? 'Reativar Comunicado' : 'Desativar Comunicado (não apaga)'}
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

            <span className="hidden md:flex items-center gap-1 text-[11px] text-stone-400 font-medium mr-1">
              <Clock size={12} />
              <span>{readingTime} min de leitura</span>
            </span>

            <button
              type="button"
              onClick={handleShare}
              title={copiedLink ? 'Link copiado!' : 'Copiar link do comunicado'}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar comunicado"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================
            BARRA DE ABAS: COMUNICADO VS AUDITORIA (EXCLUSIVO PARA GESTOR)
            ======================================================== */}
        {isEditor && (
          <div className="px-6 pt-2 bg-stone-50/50 dark:bg-stone-900/30 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'content'
                  ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Megaphone size={13} />
              <span>Comunicado</span>
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

        {/* Banner de Aviso quando Desativado */}
        {isDeactivated && (
          <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Comunicado Desativado:</strong> Este comunicado não é visível para colaboradores no mural.
              </span>
            </div>
            {isEditor && (
              <button
                type="button"
                onClick={handleToggleActive}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
              >
                Reativar Comunicado
              </button>
            )}
          </div>
        )}

        {/* ========================================================
            CORPO DO COMUNICADO COM HIERARQUIA EDITORIAL
            ======================================================== */}
        {activeTab === 'content' || !isEditor ? (
          <div className="overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6 flex-1">
          {/* Imagem de Capa do Comunicado (se configurada) */}
          {imageUrl && (
            <div className="relative rounded-2xl overflow-hidden shadow-sm border border-stone-200/80 dark:border-stone-800/80 bg-stone-100 dark:bg-stone-900 group">
              <img
                src={imageUrl}
                alt={item.title}
                className="w-full h-56 sm:h-72 object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Cabeçalho do Artigo: Título, Metadados e Tags */}
          <div className="space-y-3.5">
            <h1
              id="announcement-modal-title"
              className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 leading-snug tracking-tight [text-wrap:balance]"
            >
              {item.title}
            </h1>

            {/* Metadados do Autor e Data */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-stone-100 dark:border-stone-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 font-extrabold text-xs flex items-center justify-center border border-[#7c172e]/15">
                  {item.author ? item.author.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    {item.author}
                    {item.authorDepartment && (
                      <span className="text-stone-500 font-normal ml-1">({item.authorDepartment})</span>
                    )}
                  </p>
                  <p className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-0.5">
                    <Calendar size={11} />
                    <span>Publicado em {item.date || 'Hoje'}</span>
                  </p>
                </div>
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-200/60 dark:border-stone-700/60"
                    >
                      #{t.replace(/^#/, '')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Destaque / Resumo do Comunicado (Substitui o callout amarelo) */}
          {item.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-rose-50/20 to-stone-50 dark:from-stone-900/60 dark:to-stone-900/30 border border-stone-200/90 dark:border-stone-800 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#7c172e] dark:text-rose-400">
                <Sparkles size={12} className="stroke-[2.5]" />
                <span>Destaque do Comunicado</span>
              </div>
              <p className="text-sm sm:text-[15px] font-semibold text-stone-800 dark:text-stone-200 leading-relaxed">
                {item.summary}
              </p>
            </div>
          )}

          {/* Conteúdo Completo (Rich Text) */}
          <div className="text-stone-700 dark:text-stone-300 text-sm sm:text-[15px] leading-relaxed prose dark:prose-invert max-w-none pt-1">
            <RichTextRenderer content={item.content || item.summary || ''} />
          </div>

          {/* Card de Ação Vinculada (Paleta Ambozini bordô em vez do verde destoante) */}
          {item.actionButtonText && (
            <div className="pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#7c172e]/5 via-[#bd1e3c]/5 to-transparent dark:from-rose-950/40 dark:to-stone-900/50 border border-[#7c172e]/20 dark:border-rose-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7c172e] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                      Ação recomendada para este comunicado
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      {item.actionButtonSubtext || 'Clique para acessar o documento ou recurso oficial'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleActionClick}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#7c172e] hover:bg-[#631023] transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer touch-manipulation whitespace-nowrap self-stretch sm:self-auto justify-center"
                >
                  <FileText size={14} />
                  <span>{item.actionButtonText}</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Anexos e Links Complementares (se houver) */}
          {((item.attachments && item.attachments.length > 0) || (item.relatedLinks && item.relatedLinks.length > 0)) && (
            <div className="pt-2 space-y-3">
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Arquivos & Links Complementares:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.attachments?.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#7c172e] flex items-center gap-2.5 text-xs transition-colors group cursor-pointer"
                  >
                    <Paperclip size={14} className="text-[#7c172e] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-[#7c172e] truncate">
                        {att.name}
                      </p>
                      {att.size && <p className="text-[10px] text-stone-400">{att.size}</p>}
                    </div>
                  </a>
                ))}

                {item.relatedLinks?.map((lnk) => (
                  <a
                    key={lnk.id}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-[#7c172e] flex items-center gap-2.5 text-xs transition-colors group cursor-pointer"
                  >
                    <ExternalLink size={14} className="text-[#7c172e] shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-[#7c172e] truncate">
                        {lnk.title}
                      </p>
                      <p className="text-[10px] text-stone-400 truncate">{lnk.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Confirmação de Leitura e Ciência */}
          {(item.requireReadConfirmation || isLogged) && (
            <div className="pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className={hasConfirmedRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'} />
                  <div>
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                      {hasConfirmedRead ? 'Ciência registrada com sucesso' : 'Confirmação de Leitura e Ciência'}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {hasConfirmedRead ? 'Você confirmou ciência deste comunicado corporativo.' : 'Colaborador, registre sua ciência após a leitura.'}
                    </span>
                  </div>
                </div>

                {!hasConfirmedRead ? (
                  <button
                    type="button"
                    onClick={handleConfirmRead}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 hover:bg-[#7c172e]/15 border border-[#7c172e]/20 transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    Confirmar Ciência
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                    <Check size={12} />
                    <span>Registrado</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              SEÇÃO DE COMENTÁRIOS E FEEDBACK
              ======================================================== */}
          <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#7c172e] dark:text-rose-400" />
                <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-stone-100">
                  Comentários da Equipe ({comments.length})
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">
                Canal aberto e colaborativo
              </span>
            </div>

            {/* Lista de Comentários */}
            {comments.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-800/80 text-center">
                <p className="text-xs text-stone-400 italic">
                  Nenhum comentário publicado ainda. Seja o primeiro a compartilhar sua consideração com a equipe!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {c.authorAvatar ? (
                          <img
                            src={c.authorAvatar}
                            alt={c.author}
                            className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-300 font-bold text-xs flex items-center justify-center border border-[#7c172e]/15">
                            {c.author.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {c.author}
                        </span>
                        {c.authorRole && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 font-medium">
                            {c.authorRole}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400">
                        {c.timeAgo || 'Hoje'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-stone-600 dark:text-stone-300 pl-9 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Input de Novo Comentário vs Prompt de Login */}
            {!isLogged ? (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Lock size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      Acesso Restrito para Comentar
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Faça login com sua conta no GIA para participar das conversas da equipe.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openGiaModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Acessar com GIA</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="pt-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7c172e]/10 text-[#7c172e] font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva um comentário ou consideração para a equipe..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/70 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-[#7c172e] focus:border-transparent outline-none shadow-2xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#7c172e] hover:bg-[#631023] text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <Send size={13} />
                  <span>Enviar</span>
                </button>
              </form>
            )}
          </div>
        </div>
        ) : (
          <div className="overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-5 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <History size={16} className="text-[#7c172e] dark:text-rose-400" />
                  <span>Rastreabilidade & Registro de Alterações do Comunicado</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Histórico oficial e imutável de criação, alterações nos campos e controle de ativação.
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
                  actionLabel = 'Criação do Comunicado';
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
                    <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#1a1415] ${dotColor} shadow-xs`} />
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
                          <div className="w-6 h-6 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-300 flex items-center justify-center font-bold text-[10px] border border-[#7c172e]/15">
                            {log.authorName.charAt(0).toUpperCase()}
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
                          <span>Campos alterados:</span>
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

        {/* ========================================================
            RODAPÉ DO MODAL: CURTIDAS, COMPARTILHAR E FECHAR
            ======================================================== */}
        <div className="px-6 py-3.5 bg-stone-50/90 dark:bg-stone-900/70 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                item.userLiked
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 border border-[#7c172e]/30 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <Heart size={14} className={item.userLiked ? 'fill-rose-600 text-rose-600' : ''} />
              <span>{item.likesCount || 0} Curtidas</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Fechar</span>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-300/80 dark:bg-stone-700 font-mono text-stone-500 dark:text-stone-400">
              ESC
            </kbd>
          </button>
        </div>
      </div>
    </div>

    {isEditModalOpen && (
      <AnnouncementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editingAnnouncement={item}
      />
    )}
  </>
  );
};
