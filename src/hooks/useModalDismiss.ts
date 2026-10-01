import { useEffect, useRef } from 'react';

interface UseModalDismissOptions {
  isOpen?: boolean;
  onClose: () => void;
  closeOnEsc?: boolean;
  closeOnOutsideClick?: boolean;
}

/**
 * Hook reutilizável para fechar modals com a tecla ESC ou clique fora (backdrop)
 */
export function useModalDismiss({
  isOpen = true,
  onClose,
  closeOnEsc = true,
  closeOnOutsideClick = true
}: UseModalDismissOptions) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return { modalRef, handleBackdropClick };
}
