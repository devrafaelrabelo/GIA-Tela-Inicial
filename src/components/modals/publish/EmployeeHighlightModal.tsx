import React, { useState, useRef } from 'react';
import {
  X,
  Award,
  UploadCloud,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  Star,
  Plus,
  Edit2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import { EmployeeHighlightItem } from '../../../types';
import { compressImageFile } from '../../../utils/imageCompressor';
import { useModalDismiss } from '../../../hooks/useModalDismiss';

interface EmployeeHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEditingId?: string | null;
}

export const EmployeeHighlightModal: React.FC<EmployeeHighlightModalProps> = ({
  isOpen,
  onClose,
  initialEditingId = null
}) => {
  const { currentUser, showToast, openConfirmModal } = useAuth();
  const {
    employeeHighlights,
    addEmployeeHighlight,
    updateEmployeeHighlight,
    deleteEmployeeHighlight,
    addForumPost
  } = usePortal();

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(initialEditingId);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('Consultora Comercial');
  const [badge, setBadge] = useState('Colaborador do Mês');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  const startAddNew = () => {
    setEditingId(null);
    setSubmitError(null);
    setName('');
    setRole('Consultor(a) de Vendas');
    setBadge('Colaborador do Mês');
    setContent('');
    setImageUrl('');
    setUploadFileName('');
    setUploadFileSize('');
    setViewMode('form');
  };

  const startEdit = (emp: EmployeeHighlightItem) => {
    setEditingId(emp.id);
    setSubmitError(null);
    setName(emp.name);
    setRole(emp.role);
    setBadge(emp.badge);
    setContent(emp.content);
    setImageUrl(emp.imageUrl);
    setUploadFileName('');
    setUploadFileSize('');
    setViewMode('form');
  };

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
      const { dataUrl, sizeKb } = await compressImageFile(file, 800, 800, 0.82);
      setImageUrl(dataUrl);
      setUploadFileName(file.name);
      setUploadFileSize(sizeKb > 1000 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      showToast('Foto do colaborador otimizada e carregada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar e comprimir a foto do colaborador.', 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setUploadFileName('');
    setUploadFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim() || !content.trim()) {
      showToast('Por favor, preencha o nome do colaborador e o depoimento de destaque.', 'error');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80';

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateEmployeeHighlight(editingId, {
          name: name.trim(),
          role: role.trim(),
          badge: badge.trim(),
          content: content.trim(),
          imageUrl: finalImage
        });
        showToast('Funcionário Destaque atualizado com sucesso!', 'success');
      } else {
        await addEmployeeHighlight({
          name: name.trim(),
          role: role.trim(),
          badge: badge.trim(),
          content: content.trim(),
          imageUrl: finalImage
        });

        await addForumPost({
          targetCard: 'card_3',
          title: `Homenagem ao Colaborador Destaque: ${name.trim()} (${badge.trim()})`,
          content: content.trim(),
          category: 'Card 3',
          tag: 'Funcionário Destaque',
          imageUrl: finalImage,
          visibility: 'public',
          author: {
            name: currentUser?.name || 'Gestão de Pessoas',
            role: 'RH & Cultura',
            avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            unit: 'Ambozini Corporativo',
            isEditor: true
          }
        });
        showToast('Funcionário Destaque cadastrado com sucesso!', 'success');
      }

      setViewMode('list');
    } catch (err: unknown) {
      console.error('Falha ao salvar colaborador destaque no servidor:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha ao salvar no banco de dados do servidor.';
      setSubmitError(errMsg);
      showToast(errMsg, 'error');
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
        aria-labelledby="employee-highlight-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="employee-highlight-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100 [text-wrap:balance]">
                  Card 3: Funcionário Destaque (Slides)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300">
                  {employeeHighlights.length} no carrossel
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Gerencie todos os colaboradores homenageados nos slides
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar gerenciador de funcionário destaque"
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 bg-stone-50/50 dark:bg-stone-900/30">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ver Todos os Slides ({employeeHighlights.length})
          </button>
          <button
            type="button"
            onClick={startAddNew}
            className={`py-3 px-4 font-bold text-xs border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'form' && !editingId
                ? 'border-[#7c172e] text-[#7c172e] dark:text-rose-400'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Plus size={13} />
            <span>+ Adicionar Novo Funcionário</span>
          </button>
        </div>

        {/* Body */}
        {viewMode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Colaboradores Ativos no Card 3
              </span>
              <button
                type="button"
                onClick={startAddNew}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-all shadow-2xs cursor-pointer"
              >
                <Plus size={13} />
                <span>+ Novo Funcionário</span>
              </button>
            </div>

            {employeeHighlights.map((emp, idx) => (
              <div
                key={emp.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 transition-all"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 relative border border-stone-300 dark:border-stone-700">
                  <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 px-1 py-0.2 rounded-full bg-amber-500 text-white font-extrabold text-[8px]">
                    #{idx + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 truncate">
                      {emp.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 border border-amber-300/30 shrink-0 flex items-center gap-1">
                      <Star size={9} className="fill-amber-500 text-amber-500" />
                      {emp.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#7c172e] dark:text-rose-400 font-semibold">{emp.role}</p>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">{emp.content}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(emp)}
                    title="Editar colaborador"
                    className="p-2 rounded-xl text-stone-600 hover:text-[#7c172e] hover:bg-[#7c172e]/10 transition-colors cursor-pointer"
                  >
                    <Edit2 size={15} />
                  </button>
                  {employeeHighlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        openConfirmModal({
                          title: 'Remover Destaque',
                          message: `Deseja realmente remover "${emp.name}" dos funcionários destaques?`,
                          confirmText: 'Remover',
                          onConfirm: async () => {
                            try {
                              await deleteEmployeeHighlight(emp.id);
                              showToast('Colaborador removido com sucesso!', 'info');
                            } catch (err: unknown) {
                              const errMsg = err instanceof Error ? err.message : 'Falha ao excluir no servidor';
                              showToast(errMsg, 'error');
                            }
                          }
                        });
                      }}
                      title="Excluir destaque"
                      className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível salvar no servidor:</p>
                  <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between pb-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {editingId ? '✏️ Editando Funcionário Destaque' : '⭐ Cadastrar Novo Funcionário Destaque'}
              </h4>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-xs font-bold text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                Voltar para lista
              </button>
            </div>

            {/* Nome & Cargo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Joana Prado"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Cargo / Função *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Consultora Comercial Sênior"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
                />
              </div>
            </div>

            {/* Medalha / Reconhecimento */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Título do Reconhecimento (Medalha / Badge)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Colaboradora do Mês, Campeã de Vendas, Atendimento Ouro"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
              />
            </div>

            {/* Depoimento / Motivo do Reconhecimento */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Depoimento & Motivo da Premiação *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                placeholder="Descreva a atitude positiva, os resultados atingidos e o exemplo de dedicação para a equipe..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
              />
            </div>

            {/* Foto do Colaborador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
                  Foto de Perfil do Colaborador
                </label>
                <div className="flex items-center gap-1 border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 bg-stone-100/60 dark:bg-stone-900 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                      imageInputMode === 'upload'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2 py-0.5 rounded font-medium transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {!imageUrl ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#7c172e] bg-[#7c172e]/5'
                          : 'border-stone-200 dark:border-stone-800 hover:border-[#7c172e]'
                      }`}
                    >
                      <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Clique para escolher foto ou arraste aqui
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">PNG, JPG até 5MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60">
                      <div className="flex items-center gap-3">
                        <img src={imageUrl} alt="Prévia" className="w-12 h-12 rounded-full object-cover border" />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 size={13} />
                            <span>{uploadFileName || 'Imagem carregada'}</span>
                          </div>
                          {uploadFileSize && (
                            <span className="text-[10px] text-stone-400">{uploadFileSize}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto-funcionario.jpg"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
                  />
                </div>
              )}
            </div>

            {/* Footer Form Buttons */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-all shadow-md shadow-[#7c172e]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Salvando no servidor...</span>
                  </>
                ) : (
                  <>
                    <Award size={14} />
                    <span>{editingId ? 'Salvar Alterações' : 'Adicionar ao Carrossel'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
