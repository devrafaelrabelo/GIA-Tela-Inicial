import React, { useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  UploadCloud,
  Trash2,
  CheckCircle2,
  Link as LinkIcon,
  Globe,
  Lock,
  Send,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import { Visibility } from '../../../types';
import { compressImageFile } from '../../../utils/imageCompressor';
import { useModalDismiss } from '../../../hooks/useModalDismiss';
import { RichTextEditor } from '../../common/RichTextEditor';

interface ForumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORUM_CATEGORIES = [
  'Dicas de Vendas',
  'Comemoração',
  'Dúvidas & Suporte',
  'Operacional',
  'Geral',
  'Ideias & Inovação',
  'Reconhecimento'
];

export const ForumModal: React.FC<ForumModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const { addForumPost } = usePortal();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Dicas de Vendas');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('members_only');
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
      showToast('Imagem otimizada e carregada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar e comprimir a imagem.', 'error');
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

    if (!title.trim() || !content.trim()) {
      showToast('Por favor, preencha o título e o conteúdo da postagem.', 'error');
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      await addForumPost({
        targetCard: 'forum',
        author: {
          name: currentUser.name,
          role: currentUser.role,
          avatar: currentUser.avatar,
          unit: currentUser.unit,
          isEditor: currentUser.isEditor
        },
        title: title.trim(),
        content: content.trim(),
        category,
        tag: category,
        visibility,
        imageUrl: imageUrl.trim() || undefined,
        pinned: false
      });

      showToast('Tópico publicado no fórum com sucesso!', 'success');
      handleClose();
    } catch (err: any) {
      console.error('Falha ao criar postagem no servidor:', err);
      const msg = err?.message || 'Falha na comunicação com o banco de dados do servidor.';
      setSubmitError(msg);
      // Mantém o formulário aberto para o usuário não perder os dados digitados
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setImageUrl('');
    setUploadFileName('');
    setUploadFileSize('');
    setSubmitError(null);
    onClose();
  };

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose: handleClose
  });

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forum-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ambozini/10 text-ambozini flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 id="forum-modal-title" className="font-bold text-slate-900 dark:text-white text-lg [text-wrap:balance]">Nova Postagem no Fórum</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compartilhe ideias, dicas, comemorações e interaja com a equipe Ambozini
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Fechar modal do fórum"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-6 space-y-5">
          {/* Banner de Erro caso a criação no backend falhe */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Não foi possível criar a postagem no servidor:</p>
                <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          {/* Título & Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Título do Tópico *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Como fechamos o maior contrato do mês!"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-ambozini"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-ambozini"
              >
                {FORUM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibilidade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Visibilidade da Postagem
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('members_only')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  visibility === 'members_only'
                    ? 'border-ambozini bg-ambozini/5 text-ambozini font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">Apenas Colaboradores</div>
                  <div className="text-[11px] text-slate-500">Visível apenas após login</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                  visibility === 'public'
                    ? 'border-ambozini bg-ambozini/5 text-ambozini font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Globe className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white">Público Aberto</div>
                  <div className="text-[11px] text-slate-500">Visível a todos visitantes</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conteúdo com Barra de Ferramentas e Prévia */}
          <RichTextEditor
            required
            minRows={6}
            label="Conteúdo / Mensagem"
            placeholder="Escreva sua mensagem detalhada, dicas, comemorações ou novidades..."
            value={content}
            onChange={(val) => setContent(val)}
          />

          {/* Upload de Imagem ou Link */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Imagem da Postagem (Opcional)
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    imageInputMode === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Upload do PC
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    imageInputMode === 'url'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Link Web
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                />
                {!imageUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-ambozini bg-ambozini/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-ambozini/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Clique para escolher imagem ou arraste o arquivo aqui
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG ou WEBP até 5MB</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {uploadFileName || 'Imagem selecionada'}
                        </div>
                        {uploadFileSize && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{uploadFileSize}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Remover imagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto.jpg"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-ambozini"
                  />
                </div>
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-36">
                    <img src={imageUrl} alt="Preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-ambozini hover:bg-ambozini-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-ambozini/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publicando no servidor...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publicar no Fórum</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
