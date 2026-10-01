import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, UploadCloud, Trash2, CheckCircle2, Link as LinkIcon, Quote, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import { compressImageFile } from '../../../utils/imageCompressor';
import { useModalDismiss } from '../../../hooks/useModalDismiss';

interface MotivationalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MotivationalModal: React.FC<MotivationalModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useAuth();
  const { dynamicCards, addForumPost, addMotivationalThought, motivationalThoughts } = usePortal();

  const current = dynamicCards['card_1'] || (motivationalThoughts && motivationalThoughts[0]);

  const [title, setTitle] = useState(current?.title || '');
  const [content, setContent] = useState(current?.content || '');
  const [authorName, setAuthorName] = useState(current?.authorName || currentUser?.name || 'Liderança Ambozini');
  const [imageUrl, setImageUrl] = useState(current?.imageUrl || '');
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

  useEffect(() => {
    if (isOpen) {
      setTitle(current?.title || '');
      setContent(current?.content || '');
      setAuthorName(current?.authorName || currentUser?.name || 'Liderança Ambozini');
      setImageUrl(current?.imageUrl || '');
      setUploadFileName('');
      setUploadFileSize('');
      setSubmitError(null);
    }
  }, [isOpen, current, currentUser]);

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
      showToast('Foto de fundo otimizada e carregada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar e comprimir a imagem de fundo.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim()) {
      showToast('Por favor, informe o pensamento ou frase do dia.', 'error');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80';

    setIsSubmitting(true);
    try {
      await addMotivationalThought({
        title: title.trim(),
        content: content.trim(),
        authorName: authorName.trim() || 'Liderança Ambozini',
        authorRole: 'Pensamento do Dia',
        imageUrl: finalImage,
        tagline: `${authorName.trim() || 'Liderança Ambozini'} • Pensamento do Dia`,
        isActive: true
      });

      await addForumPost({
        targetCard: 'card_1',
        title: `Pensamento do Dia: "${title.trim()}"`,
        content: content.trim() || title.trim(),
        category: 'Card 1',
        tag: 'Pensamento do Dia',
        imageUrl: finalImage,
        visibility: 'public',
        author: {
          name: authorName.trim() || currentUser?.name || 'Liderança',
          role: 'Pensamento do Dia',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          unit: currentUser?.unit || 'Rede Ambozini',
          isEditor: true
        }
      });

      showToast('Pensamento do Dia publicado com sucesso no Card 1! 🌟', 'success');
      onClose();
    } catch (err: unknown) {
      console.error('Falha ao publicar pensamento do dia no servidor:', err);
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
        aria-labelledby="motivational-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shadow-2xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="motivational-modal-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100 [text-wrap:balance]">
                  Publicar Pensamento do Dia
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Card 1
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Inspire a equipe com uma frase de motivação e foto de fundo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar publicação de pensamento do dia"
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 text-xs">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Não foi possível salvar no servidor:</p>
                <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1.5">
              <Quote size={13} className="text-amber-500" />
              <span>Frase / Pensamento Principal *</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Disciplina hoje, conquistas amanhã."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-bold shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Autor da Frase / Assinatura *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Liderança Ambozini, Mário Sérgio Cortella, etc."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Contexto / Subtítulo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Reflexão para início de semana"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* Upload de Imagem de Fundo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
                Foto de Fundo do Card (Upload do Computador ou Link)
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
                  <span>Upload</span>
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
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processImageFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3 flex items-center gap-3.5">
                <div className="w-20 h-16 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-800 flex-shrink-0 border border-stone-200/80 shadow-2xs">
                  <img src={imageUrl} alt="Prévia do fundo" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {uploadFileName || 'Imagem selecionada para o fundo'}
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
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-[#7c172e] bg-[#7c172e]/5'
                    : 'border-stone-300 dark:border-stone-700 hover:border-[#7c172e]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    <span className="text-[#7c172e] dark:text-rose-400 underline decoration-[#7c172e]/30">Clique para selecionar</span> ou arraste a foto de fundo aqui
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">PNG, JPG, WEBP (máx. 5MB)</p>
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

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#7c172e] to-[#631023] hover:from-[#8d1a34] shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Salvando no servidor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Publicar no Card 1</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
