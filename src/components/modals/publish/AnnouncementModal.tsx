import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Megaphone,
  UploadCloud,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  Star,
  Globe,
  Lock,
  Send,
  FileText,
  Sparkles,
  Calendar,
  AlertTriangle,
  Info,
  Flame,
  Users,
  Building2,
  Briefcase,
  Award,
  UserCheck,
  Eye,
  Edit3,
  ChevronDown,
  ChevronUp,
  Plus,
  Paperclip,
  ExternalLink,
  MessageCircle,
  Heart,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import {
  Announcement,
  AnnouncementPriority,
  TargetAudience,
  AnnouncementAttachment,
  RelatedLink,
  Visibility
} from '../../../types';
import { compressImageFile } from '../../../utils/imageCompressor';
import { useModalDismiss } from '../../../hooks/useModalDismiss';
import { RichTextEditor } from '../../common/RichTextEditor';
import { RichTextRenderer } from '../../common/RichTextRenderer';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFeatured?: boolean;
  editingAnnouncement?: Announcement | null;
}

const CATEGORY_OPTIONS = [
  'Geral',
  'RH & Pessoas',
  'Comercial',
  'Financeiro',
  'Operacional',
  'TI & Sistemas',
  'Marketing',
  'Jurídico & Compliance',
  'Eventos & Treinamentos',
  'Segurança',
  'Benefícios'
];

const UNIT_OPTIONS = [
  'Matriz',
  'Unidade Centro',
  'Unidade Norte',
  'Unidade Sul',
  'Unidade Campinas',
  'Unidade Leste',
  'Shopping Sul',
  'Jardins',
  'Paulista',
  'Alphaville',
  'Morumbi'
];

const DEPARTMENT_OPTIONS = [
  'Comercial',
  'Operações & Logística',
  'Financeiro & Contábil',
  'RH & Departamento Pessoal',
  'TI & Sistemas',
  'Marketing',
  'Atendimento ao Cliente',
  'Jurídico & Compliance'
];

const ROLE_OPTIONS = [
  'Liderança & Gestores',
  'Consultores Comerciais',
  'Supervisores de Loja',
  'Operadores & Balcão',
  'Administrativo',
  'Novos Integrantes'
];

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  defaultFeatured = false,
  editingAnnouncement = null
}) => {
  const { currentUser, showToast, openConfirmModal } = useAuth();
  const { addAnnouncement, updateAnnouncement, deleteAnnouncement } = usePortal();

  const isEditing = !!editingAnnouncement;

  // Visualização: 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Conteúdo básico
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Geral');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');

  // 2. Visibilidade e Público-alvo
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [audienceType, setAudienceType] = useState<'all' | 'units' | 'departments' | 'roles' | 'specific'>('all');
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [specificUsers, setSpecificUsers] = useState<string[]>([]);
  const [specificUserInput, setSpecificUserInput] = useState('');

  // 3. Ação do comunicado (CTA)
  const [hasCTA, setHasCTA] = useState(false);
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [ctaSubtext, setCtaSubtext] = useState('');
  const [ctaOpenNewTab, setCtaOpenNewTab] = useState(true);

  // 4. Mídia e anexos
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<AnnouncementAttachment[]>([]);
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([]);
  const [linkTitleInput, setLinkTitleInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');

  // 5. Destaque e publicação
  const [priority, setPriority] = useState<AnnouncementPriority>('info');
  const [isFeatured, setIsFeatured] = useState(defaultFeatured);
  const [publishMode, setPublishMode] = useState<'now' | 'scheduled'>('now');
  const [startDate, setStartDate] = useState('');
  const [expireDate, setExpireDate] = useState('');

  // 6. Interação e confirmação
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [requireReadConfirmation, setRequireReadConfirmation] = useState(false);

  // 7. Responsável
  const [authorName, setAuthorName] = useState('');
  const [authorDepartment, setAuthorDepartment] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Seções expansíveis/colapsáveis
  const [expandedSection, setExpandedSection] = useState<{
    cta: boolean;
    media: boolean;
    scheduling: boolean;
    interaction: boolean;
    author: boolean;
  }>({
    cta: false,
    media: false,
    scheduling: false,
    interaction: false,
    author: false
  });

  const toggleSection = (section: keyof typeof expandedSection) => {
    setExpandedSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    if (isOpen) {
      setViewMode('editor');
      if (editingAnnouncement) {
        setTitle(editingAnnouncement.title || '');
        setCategory(editingAnnouncement.tag || 'Geral');
        setTags(editingAnnouncement.tags || (editingAnnouncement.tag ? [editingAnnouncement.tag] : []));
        setContent(editingAnnouncement.content || editingAnnouncement.summary || '');
        setVisibility(editingAnnouncement.visibility || 'public');

        // Público
        const aud = editingAnnouncement.targetAudience;
        if (aud) {
          setAudienceType(aud.type as any || 'all');
          if (aud.type === 'units') setSelectedUnits(aud.selection || []);
          if (aud.type === 'departments') setSelectedDepartments(aud.selection || []);
          if (aud.type === 'roles') setSelectedRoles(aud.selection || []);
          if (aud.type === 'specific') setSpecificUsers(aud.selection || []);
        } else {
          setAudienceType('all');
        }

        // CTA
        const hasBtn = !!editingAnnouncement.actionButtonText;
        setHasCTA(hasBtn);
        setCtaText(editingAnnouncement.actionButtonText || '');
        setCtaUrl(editingAnnouncement.actionButtonUrl || '');
        setCtaSubtext(editingAnnouncement.actionButtonSubtext || '');
        setCtaOpenNewTab(editingAnnouncement.actionButtonOpenNewTab !== false);

        // Mídia
        setImageUrl(editingAnnouncement.imageUrl || editingAnnouncement.image || '');
        setUploadFileName(editingAnnouncement.imageUrl || editingAnnouncement.image ? 'Imagem existente' : '');
        setAttachments(editingAnnouncement.attachments || []);
        setRelatedLinks(editingAnnouncement.relatedLinks || []);

        // Destaque e Agendamento
        setPriority(editingAnnouncement.priority || 'info');
        setIsFeatured(editingAnnouncement.isFeatured ?? false);
        setPublishMode(editingAnnouncement.publishMode || 'now');
        setStartDate(editingAnnouncement.startDate || '');
        setExpireDate(editingAnnouncement.expireDate || '');

        // Interação
        setAllowReactions(editingAnnouncement.allowReactions !== false);
        setAllowComments(editingAnnouncement.allowComments !== false);
        setRequireReadConfirmation(!!editingAnnouncement.requireReadConfirmation);

        // Responsável
        setAuthorName(editingAnnouncement.author || currentUser?.name || 'Gestão');
        setAuthorDepartment(editingAnnouncement.authorDepartment || '');
        setContactInfo(editingAnnouncement.contactInfo || '');
      } else {
        setTitle('');
        setCategory('Geral');
        setTags([]);
        setTagInput('');
        setContent('');
        setVisibility('public');
        setAudienceType('all');
        setSelectedUnits([]);
        setSelectedDepartments([]);
        setSelectedRoles([]);
        setSpecificUsers([]);
        setSpecificUserInput('');

        setHasCTA(false);
        setCtaText('');
        setCtaUrl('');
        setCtaSubtext('');
        setCtaOpenNewTab(true);

        setImageUrl('');
        setUploadFileName('');
        setUploadFileSize('');
        setAttachments([]);
        setRelatedLinks([]);
        setLinkTitleInput('');
        setLinkUrlInput('');

        setPriority('info');
        setIsFeatured(defaultFeatured);
        setPublishMode('now');
        setStartDate('');
        setExpireDate('');

        setAllowReactions(true);
        setAllowComments(true);
        setRequireReadConfirmation(false);

        setAuthorName(currentUser?.name || 'Diretoria & Gestão');
        setAuthorDepartment(currentUser?.unit ? `Unidade ${currentUser.unit}` : 'Comunicação Interna');
        setContactInfo('');

        // Seção inicial
        setExpandedSection({
          cta: false,
          media: false,
          scheduling: defaultFeatured,
          interaction: false,
          author: false
        });
      }
    }
  }, [defaultFeatured, isOpen, editingAnnouncement, currentUser]);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  // Processamento de Imagem de Capa
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Selecione uma imagem válida (PNG, JPG, WEBP).', 'error');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      showToast('A imagem excede o tamanho máximo de 15MB.', 'error');
      return;
    }

    try {
      const { dataUrl, sizeKb } = await compressImageFile(file, 1200, 800, 0.82);
      setImageUrl(dataUrl);
      setUploadFileName(file.name);
      setUploadFileSize(sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      showToast('Imagem de capa otimizada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar e comprimir a imagem.', 'error');
    }
  };

  // Processamento de Anexos Múltiplos
  const handleAttachmentUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: AnnouncementAttachment[] = [];

    Array.from(files).forEach((file) => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      newAttachments.push({
        id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: sizeStr,
        url: URL.createObjectURL(file),
        type: file.type || file.name.split('.').pop()
      });
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    showToast(`${newAttachments.length} anexo(s) adicionado(s)!`, 'success');
  };

  // Gerenciamento de Tags
  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      showToast('Esta tag já foi adicionada.', 'info');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Gerenciamento de Links Relacionados
  const handleAddLink = () => {
    if (!linkTitleInput.trim() || !linkUrlInput.trim()) {
      showToast('Informe o título e o link (URL).', 'error');
      return;
    }
    setRelatedLinks((prev) => [
      ...prev,
      {
        id: `link_${Date.now()}`,
        title: linkTitleInput.trim(),
        url: linkUrlInput.trim().startsWith('http') ? linkUrlInput.trim() : `https://${linkUrlInput.trim()}`
      }
    ]);
    setLinkTitleInput('');
    setLinkUrlInput('');
  };

  const handleRemoveLink = (linkId: string) => {
    setRelatedLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  // Seletores de público
  const toggleUnitSelection = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const toggleDeptSelection = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const toggleRoleSelection = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAddSpecificUser = () => {
    const val = specificUserInput.trim();
    if (!val) return;
    if (!specificUsers.includes(val)) {
      setSpecificUsers((prev) => [...prev, val]);
    }
    setSpecificUserInput('');
  };

  // Presets Rápidos de CTA
  const applyCtaPreset = (text: string, url: string, sub: string) => {
    setHasCTA(true);
    setCtaText(text);
    setCtaUrl(url);
    setCtaSubtext(sub);
  };

  // Construção do Payload do Comunicado
  const buildAnnouncementData = (isDraftMode = false): Partial<Announcement> => {
    let finalTargetAudience: TargetAudience = { type: audienceType };
    if (audienceType === 'units') finalTargetAudience.selection = selectedUnits;
    if (audienceType === 'departments') finalTargetAudience.selection = selectedDepartments;
    if (audienceType === 'roles') finalTargetAudience.selection = selectedRoles;
    if (audienceType === 'specific') finalTargetAudience.selection = specificUsers;

    const finalImage = imageUrl.trim() ? imageUrl.trim() : undefined;

    return {
      title: title.trim() || (isDraftMode ? 'Rascunho de Comunicado' : 'Sem Título'),
      content: content.trim(),
      summary: (content.trim().replace(/<[^>]*>?/gm, '') || '').substring(0, 140) + '...',
      tag: category,
      tags: tags.length > 0 ? tags : [category],
      visibility,
      isFeatured,
      priority,
      targetAudience: finalTargetAudience,
      imageUrl: finalImage,
      image: finalImage,
      actionButtonText: hasCTA && ctaText.trim() ? ctaText.trim() : undefined,
      actionButtonUrl: hasCTA && ctaUrl.trim() ? ctaUrl.trim() : undefined,
      actionButtonSubtext: hasCTA && ctaSubtext.trim() ? ctaSubtext.trim() : undefined,
      actionButtonOpenNewTab: ctaOpenNewTab,
      attachments,
      relatedLinks,
      publishMode,
      startDate: publishMode === 'scheduled' ? startDate : undefined,
      expireDate: expireDate.trim() ? expireDate.trim() : undefined,
      allowReactions,
      allowComments,
      requireReadConfirmation,
      author: authorName.trim() || currentUser?.name || 'Diretoria Ambozini',
      authorDepartment: authorDepartment.trim() || undefined,
      contactInfo: contactInfo.trim() || undefined,
      isDraft: isDraftMode
    };
  };

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      showToast('Preencha ao menos o título ou conteúdo para salvar como rascunho.', 'error');
      return;
    }
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const data = buildAnnouncementData(true);
      if (isEditing && editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data);
      } else {
        await addAnnouncement(data);
      }
      showToast('Rascunho salvo com sucesso!', 'info');
      onClose();
    } catch (err: any) {
      console.error('Falha ao salvar rascunho no servidor:', err);
      const msg = err?.message || 'Falha ao salvar rascunho no servidor.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      showToast('Por favor, informe o título do comunicado.', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Por favor, escreva o conteúdo do comunicado.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = buildAnnouncementData(false);

      if (isEditing && editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, data);
        showToast('Comunicado atualizado com sucesso!', 'success');
      } else {
        await addAnnouncement(data);
      }

      onClose();
    } catch (err: any) {
      console.error('Falha ao publicar comunicado no servidor:', err);
      const msg = err?.message || 'Falha ao salvar o comunicado no banco de dados do servidor.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header Corporativo Moderno */}
        <div className="px-6 py-4 bg-stone-50/90 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Megaphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="announcement-modal-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100">
                  {isEditing ? 'Editar Comunicado' : 'Novo Comunicado'}
                </h3>
                {isFeatured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 flex items-center gap-1">
                    <Star size={10} className="fill-amber-400" />
                    Destaque
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Crie e publique avisos, novidades, orientações e comunicados para a equipe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de Modo: Editor vs Prévia */}
            <div className="flex items-center p-0.5 rounded-xl bg-stone-200/60 dark:bg-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'editor'
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#7c172e] text-white shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Eye size={13} />
                <span>Prévia</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODO PREVIEW: Como o colaborador verá */}
        {viewMode === 'preview' ? (
          <div className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 text-xs">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível salvar o comunicado no servidor:</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}

            <div className="bg-stone-50 dark:bg-stone-900/40 p-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300 font-medium">
                <Eye size={15} className="text-[#7c172e]" />
                <span>Visualização prévia exata do colaborador</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                Pronto para envio
              </span>
            </div>

            {/* Card Preview */}
            <div className="bg-white dark:bg-[#161212] border border-stone-200/90 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
              {/* Imagem de Capa se houver */}
              {imageUrl && (
                <div className="w-full h-48 sm:h-56 bg-stone-950 overflow-hidden relative">
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                  {isFeatured && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                      <Star size={11} className="fill-white" />
                      Em Destaque
                    </span>
                  )}
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-4">
                {/* Badges e Prioridade */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300">
                    {category}
                  </span>

                  {priority === 'urgent' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <Flame size={11} /> Urgente
                    </span>
                  )}
                  {priority === 'important' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <AlertTriangle size={11} /> Importante
                    </span>
                  )}
                  {priority === 'info' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <Info size={11} /> Informativo
                    </span>
                  )}

                  {visibility === 'public' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1 border border-blue-200 dark:border-blue-900/60">
                      <Globe size={11} /> Público Aberto
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7c172e]/10 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-300 flex items-center gap-1 border border-[#7c172e]/20">
                      <Lock size={11} /> Apenas Colaboradores
                    </span>
                  )}

                  {/* Tags */}
                  {tags.map((t) => (
                    <span key={t} className="text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full font-medium">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Título e Metadados */}
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 leading-snug">
                    {title || 'Título do Comunicado'}
                  </h2>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1 flex-wrap">
                    <span>Por <strong>{authorName || 'Gestão'}</strong></span>
                    {authorDepartment && <span>• {authorDepartment}</span>}
                    <span>• Hoje</span>
                  </div>
                </div>

                {/* Conteúdo Rico */}
                <div className="pt-2 text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed border-t border-stone-100 dark:border-stone-800">
                  <RichTextRenderer content={content || 'Escreva o conteúdo do comunicado para visualizar aqui...'} />
                </div>

                {/* Botão de Ação CTA se configurado */}
                {hasCTA && ctaText && (
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] shadow-xs flex items-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>{ctaText}</span>
                    </button>
                    {ctaSubtext && (
                      <span className="text-[11px] text-stone-500 font-medium">
                        {ctaSubtext}
                      </span>
                    )}
                  </div>
                )}

                {/* Anexos */}
                {attachments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1">
                      <Paperclip size={13} /> Anexos para download ({attachments.length}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2"
                        >
                          <FileText size={15} className="text-[#7c172e] shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                              {att.name}
                            </p>
                            <p className="text-[10px] text-stone-400">{att.size || 'Arquivo'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links Relacionados */}
                {relatedLinks.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1">
                      <LinkIcon size={13} /> Links relacionados:
                    </span>
                    <div className="space-y-1">
                      {relatedLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-[#7c172e] dark:text-rose-400 hover:underline font-semibold"
                        >
                          <ExternalLink size={12} />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exigência de Confirmação de Leitura */}
                {requireReadConfirmation && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-amber-950 dark:text-amber-200">
                          Confirmação de Ciência Obrigatória
                        </p>
                        <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80">
                          Este comunicado exige que cada colaborador registre a leitura.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 opacity-90 shadow-2xs"
                    >
                      Confirmar Ciência
                    </button>
                  </div>
                )}

                {/* Rodapé de Interações */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-stone-500">
                  <div className="flex items-center gap-3">
                    {allowReactions && (
                      <span className="flex items-center gap-1 text-xs">
                        <Heart size={14} className="text-rose-600" />
                        <span>Reações ativas</span>
                      </span>
                    )}
                    {allowComments && (
                      <span className="flex items-center gap-1 text-xs">
                        <MessageCircle size={14} className="text-blue-600" />
                        <span>Comentários permitidos</span>
                      </span>
                    )}
                  </div>
                  {contactInfo && (
                    <span className="text-[10px] text-stone-400">Dúvidas: {contactInfo}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MODO EDITOR COMPLETO ORGANIZADO EM SEÇÕES */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto overscroll-contain space-y-5 flex-1 text-xs">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível salvar o comunicado no servidor:</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}
            {/* SEÇÃO 1: CONTEÚDO DO COMUNICADO (SEMPRE VISÍVEL) */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Título do Comunicado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Atualização sobre diretrizes corporativas e benefícios"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-bold shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags Personalizadas */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 text-[11px]">
                  Tags Personalizadas (Pressione Enter para adicionar)
                </label>
                <div className="p-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 flex items-center gap-1.5 flex-wrap">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-700 p-0.5 cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Adicionar tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 min-w-[120px] outline-none text-xs bg-transparent text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="p-1 rounded-md text-stone-400 hover:text-[#7c172e] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Editor de Texto Completo */}
              <RichTextEditor
                required
                minRows={5}
                label="Texto Completo do Comunicado *"
                placeholder="Escreva aqui as informações, orientações, prazos e demais detalhes do comunicado..."
                value={content}
                onChange={(val) => setContent(val)}
              />
            </div>

            {/* SEÇÃO 2: VISIBILIDADE DO COMUNICADO */}
            <div className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-2.5">
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Visibilidade do Comunicado *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                    visibility === 'public'
                      ? 'border-[#7c172e] bg-[#7c172e]/5 dark:bg-rose-950/20 text-[#7c172e] dark:text-rose-300 font-bold shadow-2xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white">Público Aberto</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Visível a todos os visitantes e no mural</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('members_only')}
                  className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                    visibility === 'members_only'
                      ? 'border-[#7c172e] bg-[#7c172e]/5 dark:bg-rose-950/20 text-[#7c172e] dark:text-rose-300 font-bold shadow-2xs'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-stone-900 dark:text-white">Apenas Colaboradores</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Exclusivo, requer login com credencial corporativa</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SEÇÃO 3: PÚBLICO-ALVO (SEMPRE VISÍVEL) */}
            <div className="p-4 rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#7c172e]" />
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                  Público-alvo do Comunicado *
                </span>
              </div>

              {/* Seletor de Escopo */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'all', label: 'Todos', icon: Globe },
                  { id: 'units', label: 'Unidades', icon: Building2 },
                  { id: 'departments', label: 'Equipes', icon: Briefcase },
                  { id: 'roles', label: 'Cargos', icon: Award },
                  { id: 'specific', label: 'Específico', icon: UserCheck }
                ].map((item) => {
                  const IconComp = item.icon;
                  const isSelected = audienceType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAudienceType(item.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-[#7c172e] bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-300 font-bold shadow-2xs'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                      }`}
                    >
                      <IconComp size={15} />
                      <span className="text-[11px] truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Opções específicas para Unidades */}
              {audienceType === 'units' && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="block text-[11px] font-semibold text-stone-500">
                    Selecione as unidades que receberão o comunicado:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {UNIT_OPTIONS.map((u) => {
                      const sel = selectedUnits.includes(u);
                      return (
                        <button
                          key={u}
                          type="button"
                          onClick={() => toggleUnitSelection(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer font-medium ${
                            sel
                              ? 'bg-[#7c172e] text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {sel ? '✓ ' : ''}{u}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opções para Departamentos */}
              {audienceType === 'departments' && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="block text-[11px] font-semibold text-stone-500">
                    Selecione os departamentos e equipes:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {DEPARTMENT_OPTIONS.map((d) => {
                      const sel = selectedDepartments.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDeptSelection(d)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer font-medium ${
                            sel
                              ? 'bg-[#7c172e] text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {sel ? '✓ ' : ''}{d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opções para Cargos */}
              {audienceType === 'roles' && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="block text-[11px] font-semibold text-stone-500">
                    Selecione os cargos ou grupos:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ROLE_OPTIONS.map((r) => {
                      const sel = selectedRoles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRoleSelection(r)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer font-medium ${
                            sel
                              ? 'bg-[#7c172e] text-white font-bold shadow-2xs'
                              : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {sel ? '✓ ' : ''}{r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opções para Colaboradores Específicos */}
              {audienceType === 'specific' && (
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2">
                  <span className="block text-[11px] font-semibold text-stone-500">
                    Indique nomes ou e-mails específicos:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ex: joao.silva@ambozini.com.br"
                      value={specificUserInput}
                      onChange={(e) => setSpecificUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSpecificUser();
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecificUser}
                      className="px-3 py-1.5 rounded-xl bg-[#7c172e] text-white font-bold"
                    >
                      Adicionar
                    </button>
                  </div>
                  {specificUsers.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {specificUsers.map((u) => (
                        <span key={u} className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-800 text-[10px] font-bold flex items-center gap-1">
                          {u}
                          <button type="button" onClick={() => setSpecificUsers((p) => p.filter((x) => x !== u))}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO 3: BOTÃO DE AÇÃO / CTA (CARD EXPANSÍVEL) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('cta')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
                    <ExternalLink size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Botão de Ação / CTA
                      {hasCTA && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
                          Ativo
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Adicione botão de redirecionamento, documento ou link externo
                    </span>
                  </div>
                </div>
                {expandedSection.cta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection.cta && (
                <div className="p-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      Habilitar botão de ação no comunicado?
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCTA}
                        onChange={(e) => setHasCTA(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c172e]"></div>
                    </label>
                  </div>

                  {hasCTA && (
                    <div className="space-y-3 pt-2 border-t border-stone-200 dark:border-stone-800">
                      {/* Modelos rápidos */}
                      <div>
                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-500" /> Modelos Rápidos:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Abrir Sistema', 'https://sistema.ambozini.com.br', 'Acesso corporativo integrado')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100"
                          >
                            🌐 Abrir Sistema
                          </button>
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Ver Documento', '#documento', 'Disponível para download')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          >
                            📄 Ver Documento
                          </button>
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Preencher Formulário', 'https://forms.ambozini.com.br', 'Prazo até o fim da semana')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100"
                          >
                            📝 Preencher Formulário
                          </button>
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Fazer Inscrição', '#inscricao', 'Vagas limitadas')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100"
                          >
                            🎟️ Fazer Inscrição
                          </button>
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Confirmar Ciência', '#ciencia', 'Registro obrigatório')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100"
                          >
                            🛡️ Confirmar Ciência
                          </button>
                          <button
                            type="button"
                            onClick={() => applyCtaPreset('Saiba Mais', 'https://ambozini.com.br', 'Consulte o regulamento')}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-stone-100 text-stone-800 hover:bg-stone-200"
                          >
                            ℹ️ Saiba Mais
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 text-[11px] mb-1">
                            Texto do Botão *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Acessar Portal de Benefícios"
                            value={ctaText}
                            onChange={(e) => setCtaText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 text-[11px] mb-1">
                            Link / Destino *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: https://... ou #holerite"
                            value={ctaUrl}
                            onChange={(e) => setCtaUrl(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 dark:text-stone-300 text-[11px] mb-1">
                          Subtexto Opcional
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Prazo limite para adesão: 30 de setembro"
                          value={ctaSubtext}
                          onChange={(e) => setCtaSubtext(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={ctaOpenNewTab}
                          onChange={(e) => setCtaOpenNewTab(e.target.checked)}
                          className="rounded text-[#7c172e]"
                        />
                        <span className="text-stone-600 dark:text-stone-300 text-[11px] font-medium">
                          Abrir em nova aba (_blank)
                        </span>
                      </label>

                      {/* Prévia do Botão */}
                      <div className="pt-2">
                        <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Prévia do CTA:
                        </span>
                        <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center gap-2 flex-wrap">
                          <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-[#7c172e] flex items-center gap-1.5 shadow-xs">
                            <ExternalLink size={12} />
                            {ctaText || 'Texto do Botão'}
                          </span>
                          {ctaSubtext && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              {ctaSubtext}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SEÇÃO 4: MÍDIA E ANEXOS (CARD EXPANSÍVEL) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('media')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
                    <Paperclip size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Mídia, Capa e Anexos
                      {(imageUrl || attachments.length > 0 || relatedLinks.length > 0) && (
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full">
                          {attachments.length + (imageUrl ? 1 : 0) + relatedLinks.length} item(ns)
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Imagem de destaque, documentos em anexo (PDF/Excel) e links
                    </span>
                  </div>
                </div>
                {expandedSection.media ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection.media && (
                <div className="p-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-4">
                  {/* 1. Imagem de Capa */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 dark:text-stone-300 text-xs">
                        Imagem de Capa (Banner do Comunicado)
                      </span>
                      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-[10px]">
                        <button
                          type="button"
                          onClick={() => setImageInputMode('upload')}
                          className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                            imageInputMode === 'upload' ? 'bg-white dark:bg-stone-900 text-stone-900 shadow-2xs' : 'text-stone-500'
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode('url')}
                          className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                            imageInputMode === 'url' ? 'bg-white dark:bg-stone-900 text-stone-900 shadow-2xs' : 'text-stone-500'
                          }`}
                        >
                          URL
                        </button>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && processImageFile(e.target.files[0])}
                      className="hidden"
                    />

                    {imageUrl ? (
                      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-2.5 flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg bg-stone-200 overflow-hidden shrink-0">
                          <img src={imageUrl} alt="Capa" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">
                            {uploadFileName || 'Imagem anexada'}
                          </p>
                          {uploadFileSize && <p className="text-[10px] text-stone-400">{uploadFileSize}</p>}
                          <p className="text-[10px] text-emerald-600">✓ Capa pronta para exibição</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2 py-1 rounded-lg border text-xs font-medium hover:bg-stone-100"
                          >
                            Trocar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setUploadFileName('');
                              setUploadFileSize('');
                            }}
                            className="p-1 rounded-lg text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : imageInputMode === 'upload' ? (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            processImageFile(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 ${
                          isDragging
                            ? 'border-[#7c172e] bg-[#7c172e]/5'
                            : 'border-stone-300 dark:border-stone-700 hover:border-[#7c172e]'
                        }`}
                      >
                        <UploadCloud size={20} className="text-[#7c172e]" />
                        <span className="text-xs font-bold text-stone-700">Clique para selecionar imagem de capa ou arraste aqui</span>
                        <span className="text-[10px] text-stone-400">PNG, JPG, WEBP até 15MB</span>
                      </div>
                    ) : (
                      <input
                        type="url"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    )}
                  </div>

                  {/* 2. Anexos Múltiplos */}
                  <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 dark:text-stone-300 text-xs">
                        Documentos em Anexo (PDF, DOCX, XLSX)
                      </span>
                      <button
                        type="button"
                        onClick={() => attachmentInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#7c172e] hover:underline flex items-center gap-1"
                      >
                        <Plus size={12} /> Adicionar arquivos
                      </button>
                    </div>

                    <input
                      ref={attachmentInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleAttachmentUpload(e.target.files)}
                      className="hidden"
                    />

                    {attachments.length > 0 ? (
                      <div className="space-y-1.5">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText size={14} className="text-[#7c172e] shrink-0" />
                              <span className="text-xs font-medium truncate">{att.name}</span>
                              <span className="text-[10px] text-stone-400">({att.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                              className="text-stone-400 hover:text-rose-600 p-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic">Nenhum anexo adicionado.</p>
                    )}
                  </div>

                  {/* 3. Links Relacionados */}
                  <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <span className="font-bold text-stone-700 dark:text-stone-300 text-xs block">
                      Links Relacionados
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Título do link (ex: Manual em PDF)"
                        value={linkTitleInput}
                        onChange={(e) => setLinkTitleInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={linkUrlInput}
                        onChange={(e) => setLinkUrlInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-3 py-1.5 rounded-xl bg-[#7c172e] text-white font-bold"
                      >
                        +
                      </button>
                    </div>

                    {relatedLinks.length > 0 && (
                      <div className="space-y-1">
                        {relatedLinks.map((link) => (
                          <div
                            key={link.id}
                            className="p-1.5 rounded-lg bg-white dark:bg-stone-900 border flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-stone-800 truncate">{link.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-stone-400 truncate max-w-[150px]">{link.url}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(link.id)}
                                className="text-stone-400 hover:text-rose-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 5: DESTAQUE E PUBLICAÇÃO (CARD EXPANSÍVEL) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('scheduling')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
                    <Calendar size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Destaque, Prioridade e Agendamento
                      {isFeatured && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                          Destaque
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Defina prioridade (Urgente), fixar no topo e data de início/expiração
                    </span>
                  </div>
                </div>
                {expandedSection.scheduling ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection.scheduling && (
                <div className="p-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-3.5">
                  {/* Nível de Prioridade */}
                  <div>
                    <span className="block font-bold text-stone-700 dark:text-stone-300 text-xs mb-1.5">
                      Prioridade do Comunicado
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'info', label: 'Informativo', desc: 'Rotina e novidades', icon: Info, color: 'border-blue-300 bg-blue-50 text-blue-800' },
                        { id: 'important', label: 'Importante', desc: 'Atenção necessária', icon: AlertTriangle, color: 'border-amber-300 bg-amber-50 text-amber-800' },
                        { id: 'urgent', label: 'Urgente', desc: 'Ação imediata', icon: Flame, color: 'border-rose-300 bg-rose-50 text-rose-800' }
                      ].map((p) => {
                        const isSel = priority === p.id;
                        const IconComp = p.icon;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPriority(p.id as any)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSel ? `${p.color} ring-1 ring-current font-bold` : 'border-stone-200 bg-white text-stone-600'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <IconComp size={13} />
                              <span className="text-xs font-bold">{p.label}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 block leading-tight">{p.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Toggle Fixar no Topo */}
                  <div className="p-3 rounded-xl border border-amber-300/80 bg-amber-50/70 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <Star size={16} className="text-amber-600 fill-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-amber-950 block">Destacar comunicado no topo</span>
                        <span className="text-[11px] text-amber-800">
                          Exibe este comunicado na área de destaques enquanto estiver ativo.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c172e]"></div>
                    </label>
                  </div>

                  {/* Agendamento */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block font-bold text-stone-700 text-[11px] mb-1">
                        Modo de Publicação
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="pub_mode"
                            checked={publishMode === 'now'}
                            onChange={() => setPublishMode('now')}
                            className="text-[#7c172e]"
                          />
                          <span>Publicar agora</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="pub_mode"
                            checked={publishMode === 'scheduled'}
                            onChange={() => setPublishMode('scheduled')}
                            className="text-[#7c172e]"
                          />
                          <span>Agendar data</span>
                        </label>
                      </div>
                      {publishMode === 'scheduled' && (
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-2 w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
                        />
                      )}
                    </div>

                    <div>
                      <span className="block font-bold text-stone-700 text-[11px] mb-1">
                        Data/Hora de Expiração (Opcional)
                      </span>
                      <input
                        type="datetime-local"
                        value={expireDate}
                        onChange={(e) => setExpireDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-300"
                      />
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        Arquiva automaticamente após este horário
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 6: INTERAÇÃO E CONFIRMAÇÃO (CARD EXPANSÍVEL) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('interaction')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      Interação e Confirmação de Ciência
                      {requireReadConfirmation && (
                        <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded-full">
                          Ciência Obrigatória
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Permitir reações, comentários e exigir confirmação formal de leitura
                    </span>
                  </div>
                </div>
                {expandedSection.interaction ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection.interaction && (
                <div className="p-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-rose-600" />
                      <span className="font-medium text-xs">Permitir reações dos colaboradores</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowReactions}
                      onChange={(e) => setAllowReactions(e.target.checked)}
                      className="rounded text-[#7c172e]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <MessageCircle size={14} className="text-blue-600" />
                      <span className="font-medium text-xs">Permitir comentários na publicação</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                      className="rounded text-[#7c172e]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 cursor-pointer">
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs text-amber-950 dark:text-amber-200 block">
                          Exigir confirmação de leitura e ciência
                        </span>
                        <span className="text-[10px] text-amber-800 dark:text-amber-300 block">
                          Gera relatório com percentual e lista de colaboradores que confirmaram ciência.
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={requireReadConfirmation}
                      onChange={(e) => setRequireReadConfirmation(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* SEÇÃO 7: RESPONSÁVEL (CARD EXPANSÍVEL) */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 overflow-hidden shadow-2xs">
              <button
                type="button"
                onClick={() => toggleSection('author')}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-100/60 dark:hover:bg-stone-800/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
                    <UserCheck size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      Responsável e Contato
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium block">
                      Autor, departamento emissor e canal de dúvidas
                    </span>
                  </div>
                </div>
                {expandedSection.author ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedSection.author && (
                <div className="p-4 pt-2 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        Autor / Responsável
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Nome do emissor"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 text-[11px] mb-1">
                        Área / Departamento
                      </label>
                      <input
                        type="text"
                        value={authorDepartment}
                        onChange={(e) => setAuthorDepartment(e.target.value)}
                        placeholder="Ex: Recursos Humanos & DP"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 text-[11px] mb-1">
                      Canal de Dúvidas (Opcional)
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Ex: Ramal 204 • rh@ambozini.com.br"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* BOTÕES DE AÇÃO NO RODAPÉ */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2.5 flex-wrap">
              <div>
                {isEditing && editingAnnouncement && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      openConfirmModal({
                        title: 'Excluir Comunicado',
                        message: `Deseja realmente excluir o comunicado "${editingAnnouncement.title}"? Esta ação não pode ser desfeita.`,
                        confirmText: 'Excluir Comunicado',
                        onConfirm: async () => {
                          await deleteAnnouncement(editingAnnouncement.id);
                          onClose();
                        }
                      });
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-stone-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Salvar Rascunho</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-[#7c172e]/30 text-[#7c172e] hover:bg-[#7c172e]/10 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Eye size={13} />
                  <span>Visualizar</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#7c172e] hover:bg-[#631023] shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Salvando no servidor...</span>
                    </>
                  ) : (
                    <>
                      {isEditing ? <CheckCircle2 size={14} /> : <Send size={13} />}
                      <span>{isEditing ? 'Salvar Alterações' : 'Publicar Comunicado'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Rodapé quando em modo Preview */}
        {viewMode === 'preview' && (
          <div className="px-6 py-3.5 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Edit3 size={13} />
              <span>Voltar à Edição</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#7c172e] hover:bg-[#631023] shadow-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Salvando no servidor...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>{isEditing ? 'Confirmar e Salvar' : 'Confirmar e Publicar'}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
