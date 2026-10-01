import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Layers,
  UploadCloud,
  Trash2,
  Edit2,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import { CompanyValueSlide } from '../../../types';
import { compressImageFile } from '../../../utils/imageCompressor';
import { useModalDismiss } from '../../../hooks/useModalDismiss';

interface CompanyValuesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanyValuesModal: React.FC<CompanyValuesModalProps> = ({ isOpen, onClose }) => {
  const { showToast, openConfirmModal } = useAuth();
  const {
    companyValues,
    addCompanyValue,
    updateCompanyValue,
    deleteCompanyValue,
    toggleCompanyValueActive
  } = usePortal();

  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [slideMode, setSlideMode] = useState<'banner' | 'custom'>('custom');
  const [number, setNumber] = useState('06');
  const [title, setTitle] = useState('');
  const [quote, setQuote] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  const resetForm = () => {
    setSlideMode('custom');
    setNumber(String(companyValues.length + 1).padStart(2, '0'));
    setTitle('');
    setQuote('');
    setDescription('');
    setImageUrl('');
    setUploadFileName('');
    setUploadFileSize('');
    setEditingId(null);
    setIsCompressing(false);
    setSubmitError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (val: CompanyValueSlide) => {
    setEditingId(val.id);
    setSubmitError(null);
    setSlideMode(val.mode === 'banner' ? 'banner' : 'custom');
    setNumber(val.number);
    setTitle(val.title);
    setQuote(val.quote || '');
    setDescription(val.description);
    setImageUrl(val.image || '');
    setUploadFileName(val.image ? 'Imagem existente' : '');
    setUploadFileSize('');
    setViewMode('edit');
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('A imagem excede o tamanho máximo suportado de 15MB.', 'error');
      return;
    }

    try {
      setIsCompressing(true);
      const { dataUrl, sizeKb } = await compressImageFile(file, 1400, 900, 0.82);
      setImageUrl(dataUrl);
      setUploadFileName(file.name);
      setUploadFileSize(sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      showToast('Imagem otimizada e carregada com sucesso! ✨', 'success');
    } catch (err) {
      console.error('[CompanyValuesModal] Erro ao comprimir imagem:', err);
      showToast('Falha ao processar a imagem. Tente uma foto menor ou outro formato.', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent, shouldClose = true) => {
    e.preventDefault();
    setSubmitError(null);

    if (isCompressing) {
      showToast('Aguarde a otimização da imagem terminar...', 'info');
      return;
    }

    if (slideMode === 'banner') {
      if (!imageUrl.trim()) {
        showToast('Por favor, envie ou informe uma imagem para o slide.', 'error');
        return;
      }
    } else {
      if (!title.trim() || !description.trim()) {
        showToast('Por favor, preencha o título e a descrição do valor.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&auto=format&fit=crop&q=80';
      const finalTitle = title.trim() || (slideMode === 'banner' ? `Arte ${number || '01'}` : 'Pilar de Valor');
      const finalDescription = description.trim() || (slideMode === 'banner' ? 'Arte gráfica completa com informações' : '');

      if (viewMode === 'edit' && editingId) {
        await updateCompanyValue(editingId, {
          number: number.trim() || '01',
          title: finalTitle,
          quote: slideMode === 'custom' ? (quote.trim() || undefined) : undefined,
          description: finalDescription,
          image: finalImage,
          mode: slideMode
        });
        showToast('Valor corporativo atualizado com sucesso!', 'success');
        resetForm();
        setViewMode('list');
      } else {
        await addCompanyValue({
          number: number.trim() || String(companyValues.length + 1).padStart(2, '0'),
          title: finalTitle,
          quote: slideMode === 'custom' ? (quote.trim() || undefined) : undefined,
          description: finalDescription,
          image: finalImage,
          isActive: true,
          mode: slideMode
        });
        showToast('Valor corporativo cadastrado com sucesso!', 'success');
        resetForm();
        if (shouldClose) {
          onClose();
        } else {
          setViewMode('list');
        }
      }
    } catch (err: any) {
      console.error('[CompanyValuesModal] Erro ao salvar valor corporativo:', err);
      const msg = err?.message || 'Falha ao salvar no banco de dados do servidor.';
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = companyValues.filter((v) => v.isActive !== false).length;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="company-values-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Layers size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="company-values-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100 [text-wrap:balance]">
                  Gestão dos Valores da Empresa
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300">
                  Card 4
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Escolha quais valores aparecem nos slides ou adicione novos princípios
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Fechar gestão dos valores da empresa"
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-0 flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-900/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Valores Cadastrados ({companyValues.length})
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setViewMode('add');
              }}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'add'
                  ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Plus size={14} />
              <span>Adicionar Novo Valor</span>
            </button>
            {viewMode === 'edit' && (
              <span className="px-3.5 py-2 text-xs font-bold border-b-2 border-amber-500 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Edit2 size={13} /> Editando Valor
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 hidden sm:inline">
            <strong className="text-[#7c172e] dark:text-rose-400">{activeCount}</strong> de {companyValues.length} ativos no carrossel
          </span>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {viewMode === 'list' ? (
            /* List of Values with Selection Toggles */
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-amber-900 dark:text-amber-200">
                    Use as chaves ao lado de cada item para <strong>escolher quais valores aparecem</strong> nos slides do portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('add');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors flex-shrink-0 flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Novo Valor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {companyValues.map((val) => {
                  const isActive = val.isActive !== false;
                  return (
                    <div
                      key={val.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isActive
                          ? 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/80 shadow-xs'
                          : 'border-stone-200/60 dark:border-stone-800/50 bg-stone-50/60 dark:bg-stone-950/40 opacity-60'
                      }`}
                    >
                      {/* Photo Thumbnail + Text Details */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-14 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 border border-stone-200/80 shadow-2xs relative">
                          <img
                            src={val.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'}
                            alt={val.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/70 text-white font-black text-[9px] rounded">
                            {val.number}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                              {val.title}
                            </h4>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                              }`}
                            >
                              {isActive ? 'Ativo no Slide' : 'Inativo (Oculto)'}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                val.mode === 'banner'
                                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300/60'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300/60'
                              }`}
                            >
                              {val.mode === 'banner' ? 'Arte Pronta' : 'Com Dados'}
                            </span>
                          </div>

                          {val.quote && (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 italic line-clamp-1 mb-1 font-medium">
                              “{val.quote}”
                            </p>
                          )}

                          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                            {val.description}
                          </p>
                        </div>
                      </div>

                      {/* Controls: Active Toggle, Edit, Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleCompanyValueActive(val.id)}
                          title={isActive ? 'Desativar este slide' : 'Ativar este slide'}
                          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                              : 'bg-stone-100 dark:bg-stone-800 border-stone-300 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {isActive ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
                          <span>{isActive ? 'Exibindo' : 'Oculto'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => startEdit(val)}
                          title="Editar este valor"
                          className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            openConfirmModal({
                              title: 'Excluir Valor da Empresa',
                              message: `Tem certeza que deseja excluir o valor "${val.title}"?`,
                              confirmText: 'Excluir',
                              onConfirm: async () => {
                                try {
                                  await deleteCompanyValue(val.id);
                                  showToast('Valor excluído com sucesso.', 'info');
                                } catch (err: any) {
                                  showToast(err?.message || 'Falha ao excluir no servidor', 'error');
                                }
                              }
                            });
                          }}
                          title="Excluir este valor"
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add or Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Não foi possível salvar no servidor:</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
                  </div>
                </div>
              )}
              {/* Opção de Modo: Fundo Pronto vs Preencher com Dados */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-2">
                  Escolha o Formato do Slide *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSlideMode('banner')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      slideMode === 'banner'
                        ? 'border-[#7c172e] bg-[#7c172e]/5 dark:bg-[#7c172e]/10 shadow-xs ring-2 ring-[#7c172e]/20'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      slideMode === 'banner' ? 'bg-[#7c172e] text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                          Fundo Já Pronto (Arte Completa)
                        </span>
                        {slideMode === 'banner' && (
                          <span className="w-2 h-2 rounded-full bg-[#7c172e]" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        Coloque uma imagem que já possui todas as informações e textos. O slide exibirá a arte inteira sem sobreposições.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlideMode('custom')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      slideMode === 'custom'
                        ? 'border-[#7c172e] bg-[#7c172e]/5 dark:bg-[#7c172e]/10 shadow-xs ring-2 ring-[#7c172e]/20'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:bg-stone-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      slideMode === 'custom' ? 'bg-[#7c172e] text-white' : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                          Preencher com Dados
                        </span>
                        {slideMode === 'custom' && (
                          <span className="w-2 h-2 rounded-full bg-[#7c172e]" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 leading-tight">
                        Preencha título, frase de efeito e descrição. O portal formatará o slide com o layout padrão sobre a foto.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {slideMode === 'banner' && (
                <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40 flex items-center gap-2.5 text-purple-900 dark:text-purple-200 text-xs">
                  <Sparkles size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <p>
                    <strong>Modo Arte Completa:</strong> Basta selecionar ou subir a imagem do banner que já traz todas as informações. Não é necessário preencher textos adicionais.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Número / Ordem *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="06"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-bold shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {slideMode === 'banner' ? 'Identificação / Título do Slide (Opcional)' : 'Título do Pilar / Valor da Empresa *'}
                  </label>
                  <input
                    type="text"
                    required={slideMode === 'custom'}
                    placeholder={slideMode === 'banner' ? 'Ex: Banner Campanha Institucional' : 'Ex: Transparência e Respeito aos Colaboradores'}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs"
                  />
                </div>
              </div>

              {slideMode === 'custom' && (
                <>
                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Frase de Efeito / Lema Inspirador (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: A confiança mútua é a base de todas as nossas conquistas."
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs italic"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Descrição Prática do Valor *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Explique como esse valor é vivenciado no dia a dia da Ambozini..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none resize-y leading-relaxed shadow-2xs"
                    />
                  </div>
                </>
              )}

              {/* Upload de Imagem */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
                    {slideMode === 'banner'
                      ? 'Imagem do Banner / Arte Pronta com Informações *'
                      : 'Imagem Panorâmica de Fundo (Upload ou Link)'}
                  </label>

                  <div className="flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 bg-stone-100/60 dark:bg-stone-900 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2 py-0.5 rounded font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <UploadCloud size={12} />
                      <span>Upload do Computador</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded font-medium transition-all flex items-center gap-1 cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <LinkIcon size={12} />
                      <span>Link / URL</span>
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processImageFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="relative rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3 flex items-center gap-3.5">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 border border-stone-200/80 shadow-2xs">
                      <img src={imageUrl} alt="Prévia" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {uploadFileName || 'Imagem selecionada'}
                        </p>
                      </div>
                      {uploadFileSize && <p className="text-[10px] text-stone-400">{uploadFileSize}</p>}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud size={13} />
                        <span>Trocar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setUploadFileName('');
                          setUploadFileSize('');
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                ) : isCompressing ? (
                  <div className="border-2 border-dashed border-[#7c172e]/50 rounded-xl p-6 text-center bg-[#7c172e]/5 flex flex-col items-center justify-center gap-2">
                    <Loader2 size={24} className="text-[#7c172e] dark:text-rose-400 animate-spin" />
                    <p className="text-xs font-bold text-[#7c172e] dark:text-rose-300">
                      Otimizando e comprimindo imagem para o portal...
                    </p>
                    <p className="text-[10px] text-stone-400">Garantindo carregamento rápido e sem sobrecarregar o navegador</p>
                  </div>
                ) : imageInputMode === 'upload' ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#7c172e] bg-[#7c172e]/5'
                        : 'border-stone-300 dark:border-stone-700 hover:border-[#7c172e]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        <span className="text-[#7c172e] dark:text-rose-400 underline decoration-[#7c172e]/30">Clique para selecionar</span> ou arraste a imagem até aqui
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WEBP até 5MB</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WEBP até 15MB (otimização automática)</p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs"
                  />
                )}
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setViewMode('list');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                {viewMode === 'add' && (
                  <button
                    type="button"
                    onClick={(e) => handleSave(e, false)}
                    disabled={isCompressing || isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Salvar e Ver Lista</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isCompressing || isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#7c172e] to-[#631023] hover:from-[#8d1a34] shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompressing || isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>
                    {isCompressing
                      ? 'Processando Imagem...'
                      : isSubmitting
                      ? 'Salvando no servidor...'
                      : viewMode === 'edit'
                      ? 'Salvar Alterações'
                      : 'Salvar e Ativar Valor'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
