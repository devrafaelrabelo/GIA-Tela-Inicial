import React from 'react';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';

export const PermissionDeniedModal: React.FC = () => {
  const { isPermissionModalOpen, permissionMessage, closePermissionModal, loginAs } = useAuth();

  const { handleBackdropClick } = useModalDismiss({
    isOpen: isPermissionModalOpen,
    onClose: closePermissionModal
  });

  if (!isPermissionModalOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="perm-denied-title"
        className="relative w-full max-w-md bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-6 overflow-hidden overscroll-contain animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closePermissionModal}
          aria-label="Fechar aviso de permissão negada"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-brand-amber border border-amber-500/20 mx-auto flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert size={28} />
        </div>

        <h3 id="perm-denied-title" className="text-lg font-bold text-foreground mb-1 [text-wrap:balance]">
          Ação Restrita a Gestores / Editores
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
          {permissionMessage || 'Este bloco ou funcionalidade possui controle editorial restrito para gestores e liderança.'}
        </p>

        <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-left mb-6">
          <div className="text-[11px] font-semibold text-foreground mb-1">
            Deseja testar com perfil de Gestor?
          </div>
          <p className="text-[11px] text-muted-foreground">
            Alterne instantaneamente para <strong>João Silva (Gestor / Editor)</strong> para ter acesso completo de edição e publicação.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closePermissionModal}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={() => {
              loginAs('editor');
              closePermissionModal();
            }}
            className="flex-1 btn-crm-gateway px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Trocar p/ Gestor</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
