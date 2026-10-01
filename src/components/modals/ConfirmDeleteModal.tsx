import React, { useState } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import { useAuth, ConfirmModalData } from '../../context/AuthContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface ConfirmDeleteModalProps {
  // Optional props for standalone usage; if not provided, uses useAuth().confirmModal
  data?: ConfirmModalData | null;
  onClose?: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  data: propData,
  onClose: propClose
}) => {
  const { confirmModal: contextData, closeConfirmModal } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const activeData = propData !== undefined ? propData : contextData;
  const handleClose = () => {
    if (isDeleting) return;
    if (propClose) propClose();
    else closeConfirmModal();
  };

  const { handleBackdropClick } = useModalDismiss({
    isOpen: !!activeData,
    onClose: handleClose
  });

  if (!activeData) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await activeData.onConfirm();
      handleClose();
    } catch (err) {
      console.error('Erro ao executar confirmação de exclusão:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#1f191a] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        {/* Header with Danger Icon and Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0 shadow-2xs">
              <Trash2 size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <h3
                id="confirm-modal-title"
                className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug"
              >
                {activeData.title || 'Confirmar Exclusão'}
              </h3>
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                Ação irreversível
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            aria-label="Cancelar e fechar"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Content */}
        <p
          id="confirm-modal-desc"
          className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed [text-wrap:balance]"
        >
          {activeData.message}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:outline-hidden disabled:opacity-50"
          >
            {activeData.cancelText || 'Cancelar'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:outline-hidden disabled:opacity-70"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Excluindo…</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>{activeData.confirmText || 'Sim, Excluir'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
