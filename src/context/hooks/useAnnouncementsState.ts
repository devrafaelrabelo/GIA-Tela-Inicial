import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { Announcement, AuditLogEntry } from '../../types';

export function useAnnouncementsState() {
  const { currentUser, showToast, authStatus, openGiaModal } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingAnnouncements(true);
    setErrorAnnouncements(null);
    try {
      const data = await api.getAnnouncements();
      if (Array.isArray(data)) {
        setAnnouncements(data);
        setErrorAnnouncements(null);
      } else {
        setErrorAnnouncements('Falha ao sincronizar comunicados do servidor.');
      }
    } catch {
      setErrorAnnouncements('Falha ao sincronizar comunicados do servidor.');
    } finally {
      setIsLoadingAnnouncements(false);
    }
  }, []);

  const addAnnouncement = useCallback(async (newAnnData: Partial<Announcement>): Promise<Announcement> => {
    const isFeatured = newAnnData.isFeatured ?? false;
    const initialLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: 'created',
      timestamp: new Date().toISOString(),
      authorName: newAnnData.author || currentUser?.name || 'Gestão',
      details: 'Comunicado oficial criado no portal'
    };

    const announcement: Announcement = {
      id: crypto.randomUUID(),
      targetCard: 'comunicados',
      title: newAnnData.title || '',
      author: newAnnData.author || currentUser?.name || 'Gestão',
      date: 'Hoje',
      visibility: newAnnData.visibility || 'members_only',
      summary: newAnnData.summary || (newAnnData.content ? newAnnData.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : ''),
      content: newAnnData.content || '',
      badge: isFeatured ? 'Destaque Principal' : (newAnnData.badge || 'Oficial'),
      icon: isFeatured ? 'star' : (newAnnData.icon || 'megaphone'),
      tag: isFeatured ? 'Aviso Principal' : (newAnnData.tag || 'Comunicado'),
      imageUrl: newAnnData.imageUrl,
      isFeatured,
      likesCount: 1,
      userLiked: true,
      comments: [],
      actionButtonText: newAnnData.actionButtonText,
      actionButtonUrl: newAnnData.actionButtonUrl,
      actionButtonSubtext: newAnnData.actionButtonSubtext,
      isActive: true,
      auditLog: [initialLog],
      // Incorpora todos os campos avançados do Novo Comunicado (categoria, tags, anexos, agendamento, etc)
      ...newAnnData,
    };

    // REGRA ESTRITA: Comunicado criado PRIMEIRO no backend. Se falhar, NÃO cria no frontend e emite erro.
    try {
      const createdAnn = await api.createAnnouncement(announcement);
      if (!createdAnn || !createdAnn.id) {
        throw new Error('Servidor não confirmou o registro do comunicado.');
      }

      setAnnouncements((prev) => {
        let updated = [createdAnn, ...prev];
        if (isFeatured) {
          // Enforce max 5 featured announcements
          let count = 0;
          updated = updated.map((item) => {
            if (item.isFeatured) {
              count++;
              if (count > 5) return { ...item, isFeatured: false };
            }
            return item;
          });
        }
        return updated;
      });

      showToast(
        isFeatured
          ? 'Aviso publicado e adicionado aos Avisos Principais no topo! 🌟'
          : 'Comunicado oficial publicado no mural! 📢',
        'success'
      );

      return createdAnn;
    } catch (err: unknown) {
      console.error('Falha ao criar comunicado no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha ao salvar comunicado no banco de dados.';
      showToast(`Erro ao publicar comunicado: ${errMsg}`, 'error');
      throw err;
    }
  }, [currentUser, showToast]);

  const updateAnnouncement = useCallback(async (id: string, updated: Partial<Announcement>, reason?: string): Promise<void> => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;

    const changedFields: string[] = [];
    if (updated.title !== undefined && updated.title !== ann.title) changedFields.push('título');
    if (updated.summary !== undefined && updated.summary !== ann.summary) changedFields.push('resumo');
    if (updated.content !== undefined && updated.content !== ann.content) changedFields.push('conteúdo');
    if (updated.tag !== undefined && updated.tag !== ann.tag) changedFields.push('categoria/tag');
    if (updated.visibility !== undefined && updated.visibility !== ann.visibility) changedFields.push('visibilidade');

    const newLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: 'updated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Gestor',
      details: reason || (changedFields.length > 0 ? `Comunicado editado (alterado: ${changedFields.join(', ')})` : 'Comunicado atualizado'),
      changedFields
    };

    const isFeatured = updated.isFeatured ?? ann.isFeatured;
    const finalImage = updated.imageUrl !== undefined ? updated.imageUrl : ann.imageUrl;
    const newAnn = {
      ...ann,
      ...updated,
      isFeatured,
      badge: isFeatured ? 'Destaque Principal' : (updated.badge || ann.badge || 'Oficial'),
      tag: isFeatured ? 'Aviso Principal' : (updated.tag || ann.tag || 'Comunicado'),
      imageUrl: finalImage,
      auditLog: [newLog, ...(ann.auditLog || [])]
    };

    try {
      await api.updateAnnouncement(id, newAnn);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? newAnn : a)));
      showToast('Comunicado atualizado com sucesso!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao atualizar comunicado no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao atualizar comunicado: ${errMsg}`, 'error');
      throw err;
    }
  }, [announcements, currentUser, showToast]);

  const toggleAnnouncementActive = useCallback(async (id: string, reason?: string): Promise<void> => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;

    const nextActive = ann.isActive === false;
    const newLog: AuditLogEntry = {
      id: crypto.randomUUID(),
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Administrador',
      authorRole: currentUser?.role || 'Gestor',
      details: nextActive
        ? (reason || 'Comunicado reativado para exibição pública')
        : (reason || 'Comunicado desativado. Ocultado da visualização pública.')
    };

    const newAnn = {
      ...ann,
      isActive: nextActive,
      auditLog: [newLog, ...(ann.auditLog || [])]
    };

    try {
      await api.toggleAnnouncementActive(id, {
        actorName: currentUser?.name,
        actorRole: currentUser?.role,
        reason
      });

      setAnnouncements((prev) => prev.map((a) => (a.id === id ? newAnn : a)));
      showToast(
        nextActive ? 'Comunicado reativado no mural! ✨' : 'Comunicado desativado com segurança (não apagado). 🔒',
        nextActive ? 'success' : 'info'
      );
    } catch (err: unknown) {
      console.error('Erro ao alterar status do comunicado no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao alterar status: ${errMsg}`, 'error');
      throw err;
    }
  }, [announcements, currentUser, showToast]);

  /**
   * AVISO: Esta função NÃO apaga o comunicado — apenas o desativa (soft delete).
   * Use toggleAnnouncementActive diretamente para mais controle.
   */
  const deleteAnnouncement = useCallback(async (id: string): Promise<void> => {
    await toggleAnnouncementActive(id, 'Desativado pelo gestor');
  }, [toggleAnnouncementActive]);

  const toggleAnnouncementFeatured = useCallback((id: string) => {
    setAnnouncements((prev) => {
      const target = prev.find((a) => a.id === id);
      if (!target) return prev;
      const willBeFeatured = !target.isFeatured;

      api.updateAnnouncement(id, { isFeatured: willBeFeatured }).catch(() => {});

      let updated = prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            isFeatured: willBeFeatured,
            badge: willBeFeatured ? 'Destaque Principal' : (a.badge === 'Destaque Principal' ? 'Oficial' : a.badge),
            icon: willBeFeatured ? 'star' : (a.icon === 'star' ? 'megaphone' : a.icon),
            tag: willBeFeatured ? 'Aviso Principal' : (a.tag === 'Aviso Principal' ? 'Comunicado' : a.tag)
          };
        }
        return a;
      });

      if (willBeFeatured) {
        let count = 0;
        updated = updated.map((item) => {
          if (item.isFeatured) {
            count++;
            if (count > 5) return { ...item, isFeatured: false };
          }
          return item;
        });
        showToast(`Aviso "${target.title.substring(0, 30)}..." promovido a Destaque no Topo! ⭐`, 'success');
      } else {
        showToast(`Aviso removido dos Destaques no Topo.`, 'info');
      }

      return updated;
    });
  }, [showToast]);

  const toggleAnnouncementVisibility = useCallback((id: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === id) {
          const nextVisibility = ann.visibility === 'public' ? 'members_only' : 'public';
          const newLog: AuditLogEntry = {
            id: crypto.randomUUID(),
            action: 'updated',
            timestamp: new Date().toISOString(),
            authorName: currentUser?.name || 'Administrador',
            authorRole: currentUser?.role || 'Gestor',
            details: `Visibilidade alterada para ${nextVisibility === 'public' ? 'Público Aberto' : 'Apenas Colaboradores'}`,
            changedFields: ['visibilidade']
          };

          const newAnn: Announcement = {
            ...ann,
            visibility: nextVisibility,
            auditLog: [newLog, ...(ann.auditLog || [])]
          };

          api.updateAnnouncement(id, { visibility: nextVisibility }).catch(() => {});

          showToast(
            nextVisibility === 'public'
              ? 'Visibilidade alterada para Público Aberto 🌐'
              : 'Visibilidade alterada para Apenas Colaboradores 🔒',
            'info'
          );
          return newAnn;
        }
        return ann;
      })
    );
  }, [currentUser, showToast]);

  const toggleAnnouncementLike = useCallback((id: string) => {
    api.toggleAnnouncementLike(id).catch(() => {});
    setAnnouncements((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.visibility === 'members_only' && (authStatus === 'unauthenticated' || !currentUser)) {
            showToast('Faça login no GIA para curtir este comunicado. 🔒', 'info');
            openGiaModal();
            return item;
          }
          const nextLiked = !item.userLiked;
          const nextCount = (item.likesCount || 0) + (nextLiked ? 1 : -1);
          return { ...item, userLiked: nextLiked, likesCount: nextCount };
        }
        return item;
      })
    );
  }, [authStatus, currentUser, showToast, openGiaModal]);

  return {
    announcements,
    setAnnouncements,
    isLoadingAnnouncements,
    setIsLoadingAnnouncements,
    errorAnnouncements,
    setErrorAnnouncements,
    loadAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementActive,
    toggleAnnouncementFeatured,
    toggleAnnouncementVisibility,
    toggleAnnouncementLike,
  };
}
