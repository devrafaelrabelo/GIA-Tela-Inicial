import React, { useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  UploadCloud,
  Globe,
  Lock,
  Save,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { ForumPost, Visibility } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { RichTextEditor } from '../common/RichTextEditor';

interface EditPostModalProps {
  post: ForumPost | null;
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

export const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose }) => {
  const { showToast } = useAuth();
  const { updateForumPost } = usePortal();

  const [title, setTitle] = useState(post?.title || '');
  const [category, setCategory] = useState(post?.category || 'Geral');
  const [content, setContent] = useState(post?.content || '');
  const [visibility, setVisibility] = useState<Visibility>(post?.visibility || 'members_only');
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || post?.image || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza campos quando post selecionado mudar
  React.useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCategory(post.category || 'Geral');
      setContent(post.content || '');
      setVisibility(post.visibility || 'members_only');
      setImageUrl(post.imageUrl || post.image || '');
    }
  }, [post]);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen || !post) return null;

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
      const { dataUrl } = await compressImageFile(file, 1200, 800, 0.82);
      setImageUrl(dataUrl);
      showToast('Imagem atualizada com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar e comprimir a imagem.', 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Preencha o título e o conteúdo da postagem.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      updateForumPost(
        post.id,
        {
          title: title.trim(),
          category,
          tag: category,
          visibility,
          content: content.trim(),
          imageUrl: imageUrl.trim() || undefined,
          image: imageUrl.trim() || undefined
        },
        'Edição manual dos dados da publicação'
      );
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar alterações da publicação.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-post-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-[#1a1415] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/90 dark:bg-stone-900/80 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 id="edit-post-title" className="font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                Editar Publicação do Fórum
              </h3>
              <p className="text-[11px] text-stone-400 font-medium">
                As alterações realizadas serão registradas no log de auditoria.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Título da Publicação <span className="text-[#7c172e]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do post..."
              required
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
            />
          </div>

          {/* Categoria e Visibilidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#7c172e] cursor-pointer"
              >
                {FORUM_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Visibilidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    visibility === 'public'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <Globe size={12} />
                  <span>Aberta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('members_only')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    visibility === 'members_only'
                      ? 'bg-rose-50 text-[#7c172e] border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-white dark:bg-stone-900 text-stone-500 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <Lock size={12} />
                  <span>GIA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Conteúdo da Postagem <span className="text-[#7c172e]">*</span>
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Edite o conteúdo da sua postagem..."
              minRows={6}
            />
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span>Imagem de Capa (opcional)</span>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={11} />
                  <span>Remover Imagem</span>
                </button>
              )}
            </label>

            {imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 max-h-48 group">
                <img src={imageUrl} alt="Capa da postagem" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-stone-900 shadow-md cursor-pointer"
                  >
                    Substituir
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-center hover:border-[#7c172e] transition-colors cursor-pointer space-y-1"
              >
                <UploadCloud size={22} className="mx-auto text-stone-400" />
                <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Clique para selecionar uma imagem de capa
                </p>
                <p className="text-[10px] text-stone-400">PNG, JPG ou WEBP até 15MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50/90 dark:bg-stone-900/80 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
