import React, { useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  UploadCloud,
  Globe,
  Lock,
  Save,
  Trash2,
  Video,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { ForumPost, Visibility } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { RichTextEditor } from '../common/RichTextEditor';
import { VideoPlayer } from '../common/VideoPlayer';
import { readVideoFile } from '../../utils/video';

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

  // Mídia
  const [mediaType, setMediaType] = useState<'image' | 'video'>(
    post?.videoUrl ? 'video' : 'image'
  );
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || post?.image || '');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');

  const [videoUrl, setVideoUrl] = useState(post?.videoUrl || '');
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'url'>(
    post?.videoUrl?.startsWith('data:video') ? 'upload' : 'url'
  );
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza campos quando post selecionado mudar
  React.useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setCategory(post.category || 'Geral');
      setContent(post.content || '');
      setVisibility(post.visibility || 'members_only');
      setImageUrl(post.imageUrl || post.image || '');
      setVideoUrl(post.videoUrl || '');
      if (post.videoUrl) {
        setMediaType('video');
        setVideoInputMode(post.videoUrl.startsWith('data:video') ? 'upload' : 'url');
      } else {
        setMediaType('image');
      }
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

  const processVideoFile = async (file: File) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name);
    if (!isVideo) {
      showToast('Selecione um formato de vídeo válido (.mp4, .webm, .ogg ou .mov).', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('O vídeo excede o limite de 15MB. Para vídeos maiores, hospede no YouTube/Vimeo e use o link!', 'error');
      return;
    }

    try {
      const dataUrl = await readVideoFile(file);
      setVideoUrl(dataUrl);
      setVideoFileName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setVideoFileSize(`${sizeMb} MB`);
      showToast('Vídeo carregado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Falha ao processar arquivo de vídeo.', 'error');
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
    setVideoFileName('');
    setVideoFileSize('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast('Preencha o título e o conteúdo da postagem.', 'error');
      return;
    }

    let finalImageUrl: string | undefined = undefined;
    let finalVideoUrl: string | undefined = undefined;
    let finalVideoType: 'upload' | 'embed' | undefined = undefined;

    if (mediaType === 'video') {
      if (videoUrl.trim()) {
        finalVideoUrl = videoUrl.trim();
        finalVideoType = videoInputMode === 'upload' ? 'upload' : 'embed';
      }
    } else {
      if (imageUrl.trim()) {
        finalImageUrl = imageUrl.trim();
      }
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
          imageUrl: finalImageUrl,
          image: finalImageUrl,
          videoUrl: finalVideoUrl,
          videoType: finalVideoType
        },
        'Edição dos dados e mídias da publicação'
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

          {/* Mídia da Postagem: Imagem ou Vídeo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Mídia Anexada (opcional)
              </label>

              {/* Seletor Imagem vs Vídeo */}
              <div className="flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    mediaType === 'image'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <ImageIcon size={13} />
                  <span>Imagem</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    mediaType === 'video'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <Video size={13} className="text-[#7c172e]" />
                  <span>Vídeo</span>
                </button>
              </div>
            </div>

            {/* SEÇÃO IMAGEM */}
            {mediaType === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Escolha o formato de inserção</span>
                  <div className="flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                        imageInputMode === 'upload'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Arquivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                        imageInputMode === 'url'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Link Web
                    </button>
                  </div>
                </div>

                {imageInputMode === 'upload' ? (
                  <div>
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
                          <button
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white shadow-md cursor-pointer"
                          >
                            Remover
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
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
                      />
                    </div>
                    {imageUrl && (
                      <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 max-h-40">
                        <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute top-2 right-2 p-1.5 bg-black/70 text-white hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SEÇÃO VÍDEO */}
            {mediaType === 'video' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">Forma de anexar vídeo</span>
                  <div className="flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('upload')}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                        videoInputMode === 'upload'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Arquivo (PC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoInputMode('url')}
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all ${
                        videoInputMode === 'url'
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Link Web
                    </button>
                  </div>
                </div>

                {videoInputMode === 'upload' ? (
                  <div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          processVideoFile(e.target.files[0]);
                        }
                      }}
                    />
                    {!videoUrl ? (
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="p-5 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-center hover:border-[#7c172e] transition-colors cursor-pointer space-y-1"
                      >
                        <UploadCloud size={22} className="mx-auto text-stone-400" />
                        <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          Clique para selecionar um vídeo (.mp4, .webm)
                        </p>
                        <p className="text-[10px] text-stone-400">Até 15MB de tamanho</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-xs">
                          <div className="flex items-center gap-2">
                            <Video size={16} className="text-[#7c172e]" />
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {videoFileName || 'Vídeo anexado'}
                            </span>
                            {videoFileSize && <span className="text-stone-400">({videoFileSize})</span>}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <VideoPlayer url={videoUrl} controls={true} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... ou Vimeo / Loom"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#7c172e]"
                      />
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Suporta YouTube, Shorts, Vimeo, Loom ou links diretos MP4.
                    </p>
                    {videoUrl && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-700 dark:text-stone-300">Prévia do Vídeo:</span>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="text-red-500 hover:underline flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>Remover</span>
                          </button>
                        </div>
                        <VideoPlayer url={videoUrl} controls={true} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
