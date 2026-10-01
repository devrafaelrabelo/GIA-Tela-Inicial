import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { ForumPost, Comment, AuditLogEntry, DynamicCardContent } from '../../types';
import { getForumPostTimestamp } from '../../utils/date';

export function useForumState(
  updateDynamicCard: (cardId: string, content: Partial<DynamicCardContent>) => Promise<void>
) {
  const { currentUser, showToast, authStatus, openGiaModal } = useAuth();

  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'members_only'>('all');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const loadForumPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    setErrorPosts(null);
    try {
      const data = await api.getForumPosts();
      if (Array.isArray(data)) {
        const syncedPosts = data.map((p) => ({
          ...p,
          timestamp: p.timestamp || new Date(getForumPostTimestamp(p)).toISOString()
        }));
        setForumPosts(syncedPosts);
        setErrorPosts(null);
      } else {
        setErrorPosts('Falha ao sincronizar postagens do fórum.');
      }
    } catch {
      setErrorPosts('Falha ao sincronizar postagens do fórum.');
    } finally {
      setIsLoadingPosts(false);
    }
  }, []);

  const addForumPost = useCallback(async (postData: Partial<ForumPost>): Promise<ForumPost> => {
    const targetCard = postData.targetCard || 'forum';
    const nowIso = new Date().toISOString();
    const initialLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: 'created',
      timestamp: nowIso,
      authorName: currentUser?.name || 'Colaborador',
      authorRole: currentUser?.role || 'Colaborador',
      authorAvatar: currentUser?.avatar,
      details: 'Publicação criada na Comunidade & Fórum de Trocas'
    };

    const postPayload: Partial<ForumPost> = {
      id: crypto.randomUUID(),
      targetCard,
      visibility: postData.visibility || 'members_only',
      author: postData.author || {
        name: currentUser?.name || 'Colaborador',
        role: currentUser?.role || 'Colaborador',
        unit: currentUser?.unit || 'Unidade Geral',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isEditor: currentUser?.isEditor || false,
      },
      title: postData.title || '',
      category: postData.category || 'Geral',
      tag: postData.tag || postData.category || 'Geral',
      timestamp: nowIso,
      content: postData.content || '',
      imageUrl: postData.imageUrl,
      image: postData.imageUrl,
      likes: 1,
      userLiked: true,
      commentsCount: 0,
      comments: [],
      pinned: postData.pinned || false,
      isActive: true,
      auditLog: [initialLog],
    };

    // REGRA ESTRITA: Postagem criada PRIMEIRO no backend. Se falhar, NÃO cria no frontend e emite erro.
    try {
      const createdPost = await api.createForumPost(postPayload);
      if (!createdPost || !createdPost.id) {
        throw new Error('Servidor não confirmou a criação da publicação.');
      }

      setForumPosts((prev) => [createdPost, ...prev]);

      // Atualiza imediatamente o card livre caso a publicação seja para ele
      if (['card_1', 'card_2', 'card_3', 'card_4'].includes(targetCard)) {
        updateDynamicCard(targetCard, {
          title: postData.title || 'Nova Publicação',
          content: postData.content || '',
          imageUrl: postData.imageUrl,
          authorName: createdPost.author?.name,
          authorRole: createdPost.author?.role,
          authorAvatar: createdPost.author?.avatar,
          updatedAt: 'Agora mesmo'
        });
      }

      return createdPost;
    } catch (err: unknown) {
      console.error('Falha ao criar postagem no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha ao salvar postagem no banco de dados.';
      showToast(`Erro ao criar postagem: ${errMsg}`, 'error');
      throw err;
    }
  }, [currentUser, showToast, updateDynamicCard]);

  const updateForumPost = useCallback(async (id: string, updated: Partial<ForumPost>, reason?: string): Promise<void> => {
    const post = forumPosts.find((p) => p.id === id);
    if (!post) return;

    const changedFields: string[] = [];
    if (updated.title !== undefined && updated.title !== post.title) changedFields.push('título');
    if (updated.content !== undefined && updated.content !== post.content) changedFields.push('conteúdo');
    if (updated.category !== undefined && updated.category !== post.category) changedFields.push('categoria');
    if (updated.visibility !== undefined && updated.visibility !== post.visibility) changedFields.push('visibilidade');
    if (updated.imageUrl !== undefined && updated.imageUrl !== post.imageUrl) changedFields.push('imagem');

    const newLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: 'updated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Colaborador',
      authorRole: currentUser?.role || 'Colaborador',
      authorAvatar: currentUser?.avatar,
      details: reason || (changedFields.length > 0 ? `Publicação editada (alterado: ${changedFields.join(', ')})` : 'Publicação atualizada'),
      changedFields
    };

    const newPost = {
      ...post,
      ...updated,
      auditLog: [newLog, ...(post.auditLog || [])]
    };

    try {
      await api.updateForumPost(id, newPost);
      setForumPosts((prev) => prev.map((p) => (p.id === id ? newPost : p)));
      showToast('Publicação atualizada com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar postagem no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar postagem: ${errMsg}`, 'error');
      throw err;
    }
  }, [forumPosts, currentUser, showToast]);

  const toggleForumPostActive = useCallback(async (id: string, reason?: string): Promise<void> => {
    const post = forumPosts.find((p) => p.id === id);
    if (!post) return;

    const nextActive = post.isActive === false;
    const newLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Administrador',
      authorRole: currentUser?.role || 'Gestor',
      authorAvatar: currentUser?.avatar,
      details: nextActive
        ? (reason || 'Publicação reativada para exibição pública')
        : (reason || 'Publicação desativada. Ocultada do feed público.')
    };

    const newPost = {
      ...post,
      isActive: nextActive,
      auditLog: [newLog, ...(post.auditLog || [])]
    };

    try {
      await api.toggleForumPostActive(id, {
        actorName: currentUser?.name,
        actorRole: currentUser?.role,
        actorAvatar: currentUser?.avatar,
        reason
      });

      setForumPosts((prev) => prev.map((p) => (p.id === id ? newPost : p)));
      showToast(
        nextActive ? 'Publicação reativada com sucesso! ✨' : 'Publicação desativada. Nenhuma informação foi apagada. 🔒',
        nextActive ? 'success' : 'info'
      );
    } catch (err: unknown) {
      console.error('Erro ao alterar status da postagem no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao alterar status da postagem: ${errMsg}`, 'error');
      throw err;
    }
  }, [forumPosts, currentUser, showToast]);

  const togglePostLike = useCallback((id: string) => {
    api.togglePostLike(id).catch(() => {});
    setForumPosts((prev) =>
      prev.map((post) => {
        if (post.id === id) {
          if (post.visibility === 'members_only' && (authStatus === 'unauthenticated' || !currentUser)) {
            showToast('Faça login no GIA para curtir este post exclusivo. 🔒', 'info');
            openGiaModal();
            return post;
          }
          const nextLiked = !post.userLiked;
          const nextCount = (post.likes || 0) + (nextLiked ? 1 : -1);
          return { ...post, userLiked: nextLiked, likes: nextCount };
        }
        return post;
      })
    );
  }, [authStatus, currentUser, showToast, openGiaModal]);

  const addForumComment = useCallback(async (
    postId: string,
    comment: Partial<Comment>
  ): Promise<void> => {
    if (authStatus === 'unauthenticated' || !currentUser) {
      showToast('Faça login no GIA para comentar nesta publicação. 🔒', 'info');
      openGiaModal();
      return;
    }

    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: comment.author || currentUser.name,
      authorRole: comment.authorRole || currentUser.role,
      authorAvatar: comment.authorAvatar || currentUser.avatar,
      timeAgo: 'Agora mesmo',
      content: comment.content || ''
    };

    try {
      await api.addPostComment(postId, newComment);
      setForumPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: [...(p.comments || []), newComment], commentsCount: (p.comments?.length || 0) + 1 }
            : p
        )
      );
      showToast('Comentário registrado!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao adicionar comentário no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao registrar comentário: ${errMsg}`, 'error');
      throw err;
    }
  }, [authStatus, currentUser, showToast, openGiaModal]);

  return {
    forumPosts,
    setForumPosts,
    isLoadingPosts,
    setIsLoadingPosts,
    errorPosts,
    setErrorPosts,
    selectedCategory,
    setSelectedCategory,
    visibilityFilter,
    setVisibilityFilter,
    postStatusFilter,
    setPostStatusFilter,
    loadForumPosts,
    addForumPost,
    updateForumPost,
    toggleForumPostActive,
    togglePostLike,
    addForumComment,
  };
}
