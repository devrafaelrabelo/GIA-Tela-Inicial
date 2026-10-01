import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Toast: React.FC = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-card text-foreground',
    error: 'border-red-500/30 bg-card text-foreground',
    info: 'border-blue-500/30 bg-card text-foreground',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium ${
          borders[toast.type]
        }`}
      >
        {icons[toast.type]}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
