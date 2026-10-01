import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthStatus, User } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { safeStorage } from '../utils/storage';

interface ToastData {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface ConfirmModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

interface AuthContextType {
  authStatus: AuthStatus;
  currentUser: User | null;
  switchUser: (type: AuthStatus) => void;
  loginAs: (type: AuthStatus) => void;
  handleGiaLogin: (email: string) => Promise<boolean>;
  logout: () => void;
  
  // Modais
  isGiaModalOpen: boolean;
  openGiaModal: () => void;
  closeGiaModal: () => void;
  
  isPublishModalOpen: boolean;
  publishTarget: string;
  openPublishModal: (target?: string) => void;
  closePublishModal: () => void;

  isPermissionModalOpen: boolean;
  permissionMessage: string;
  openPermissionModal: (msg?: string) => void;
  closePermissionModal: () => void;

  confirmModal: ConfirmModalData | null;
  openConfirmModal: (data: ConfirmModalData) => void;
  closeConfirmModal: () => void;

  toast: ToastData | null;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_AUTH_KEY = 'ambozini_auth_status_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(() => {
    return safeStorage.getItem<AuthStatus>(STORAGE_AUTH_KEY, 'unauthenticated');
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeStorage.getItem<AuthStatus>(STORAGE_AUTH_KEY, 'unauthenticated');
    if (saved === 'editor') return MOCK_USERS.editor;
    if (saved === 'reader') return MOCK_USERS.reader;
    return null;
  });

  const [isGiaModalOpen, setIsGiaModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState('forum');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const openConfirmModal = (data: ConfirmModalData) => setConfirmModal(data);
  const closeConfirmModal = () => setConfirmModal(null);

  useEffect(() => {
    safeStorage.setItem(STORAGE_AUTH_KEY, authStatus);
    if (authStatus === 'editor') setCurrentUser(MOCK_USERS.editor);
    else if (authStatus === 'reader') setCurrentUser(MOCK_USERS.reader);
    else setCurrentUser(null);
  }, [authStatus]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3200);
  };

  const switchUser = (type: AuthStatus) => {
    setAuthStatus(type);
    if (type === 'unauthenticated') {
      showToast('Modo Visitante ativo (Deslogado). Botão de Login restaurado. 🚪', 'info');
    } else if (type === 'reader') {
      showToast('Conectado como Lucas Pereira (Colaborador / Leitor). 👤', 'info');
    } else if (type === 'editor') {
      showToast('Conectado como João Silva (Gestor / Editor). Edição liberada! 👑', 'success');
    }
  };

  const loginAs = (type: AuthStatus) => {
    switchUser(type);
    setIsGiaModalOpen(false);
  };

  const handleGiaLogin = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const clean = email.toLowerCase();
        const isEditor =
          clean.includes('ambozini') ||
          clean.includes('ambrozini') ||
          clean.includes('admin') ||
          clean.includes('gestor') ||
          clean.includes('joao');
        const nextStatus: AuthStatus = isEditor ? 'editor' : 'reader';
        switchUser(nextStatus);
        setIsGiaModalOpen(false);
        resolve(true);
      }, 700);
    });
  };

  const logout = () => {
    switchUser('unauthenticated');
  };

  const openGiaModal = () => setIsGiaModalOpen(true);
  const closeGiaModal = () => setIsGiaModalOpen(false);

  const openPublishModal = (target = 'forum') => {
    if (authStatus === 'unauthenticated' || !currentUser) {
      showToast('Faça login no GIA para poder publicar no portal. 🔒', 'info');
      openGiaModal();
      return;
    }

    const managerOnlyTargets = ['comunicados', 'avisos_principais', 'metas'];
    if (!currentUser.canEdit && managerOnlyTargets.includes(target)) {
      openPermissionModal('Publicações oficiais nesta seção são restritas a Gestores e Liderança.');
      return;
    }

    setPublishTarget(target);
    setIsPublishModalOpen(true);
  };

  const closePublishModal = () => setIsPublishModalOpen(false);

  const openPermissionModal = (msg?: string) => {
    if (msg) setPermissionMessage(msg);
    setIsPermissionModalOpen(true);
  };
  const closePermissionModal = () => setIsPermissionModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        authStatus,
        currentUser,
        switchUser,
        loginAs,
        handleGiaLogin,
        logout,
        isGiaModalOpen,
        openGiaModal,
        closeGiaModal,
        isPublishModalOpen,
        publishTarget,
        openPublishModal,
        closePublishModal,
        isPermissionModalOpen,
        permissionMessage,
        openPermissionModal,
        closePermissionModal,
        confirmModal,
        openConfirmModal,
        closeConfirmModal,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
};
