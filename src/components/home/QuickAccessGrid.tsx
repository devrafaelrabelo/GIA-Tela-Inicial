import React from 'react';
import {
  Link as LinkIcon,
  Building2,
  BarChart2,
  Users,
  FileText,
  Headphones,
  Folder,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickAccessGrid: React.FC = () => {
  const { authStatus, currentUser, showToast } = useAuth();

  const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

  if (!isLogged) {
    return null;
  }

  const items = [
    {
      id: 'erp',
      name: 'ERP Corporativo',
      icon: Building2,
      bg: 'bg-[#faf2ea] dark:bg-amber-950/30',
      text: 'text-[#9a3412] dark:text-amber-400',
      iconColor: 'text-[#b45309]',
      link: '#erp'
    },
    {
      id: 'comercial',
      name: 'Comercial & CRM',
      icon: BarChart2,
      bg: 'bg-[#eef9f2] dark:bg-emerald-950/30',
      text: 'text-[#065f46] dark:text-emerald-400',
      iconColor: 'text-[#059669]',
      link: '#crm'
    },
    {
      id: 'rh',
      name: 'Portal RH',
      icon: Users,
      bg: 'bg-[#fdf2f8] dark:bg-pink-950/30',
      text: 'text-[#9d174d] dark:text-pink-400',
      iconColor: 'text-[#db2777]',
      link: '#rh'
    },
    {
      id: 'financeiro',
      name: 'Financeiro',
      icon: FileText,
      bg: 'bg-[#fefce8] dark:bg-yellow-950/30',
      text: 'text-[#854d0e] dark:text-yellow-400',
      iconColor: 'text-[#d97706]',
      link: '#financeiro'
    },
    {
      id: 'suporte',
      name: 'Suporte TI',
      icon: Headphones,
      bg: 'bg-[#f5f3ff] dark:bg-indigo-950/30',
      text: 'text-[#5b21b6] dark:text-indigo-400',
      iconColor: 'text-[#7c3aed]',
      link: '#suporte'
    },
    {
      id: 'documentos',
      name: 'Documentos',
      icon: Folder,
      bg: 'bg-[#eff6ff] dark:bg-blue-950/30',
      text: 'text-[#1e40af] dark:text-blue-400',
      iconColor: 'text-[#2563eb]',
      link: '#docs'
    },
    {
      id: 'calendario',
      name: 'Escalas & Férias',
      icon: Calendar,
      bg: 'bg-[#f0fdf4] dark:bg-emerald-950/30',
      text: 'text-[#166534] dark:text-emerald-400',
      iconColor: 'text-[#10b981]',
      link: '#escalas'
    },
    {
      id: 'pesquisa',
      name: 'Pesquisa Clima',
      icon: ClipboardList,
      bg: 'bg-[#fff1f2] dark:bg-rose-950/30',
      text: 'text-[#9f1239] dark:text-rose-400',
      iconColor: 'text-[#e11d48]',
      link: '#pesquisa'
    }
  ];

  const handleTileClick = (e: React.MouseEvent, itemName: string) => {
    e.preventDefault();
    showToast(`Redirecionando para o sistema ${itemName}...`, 'info');
  };

  return (
    <section
      id="acesso-rapido-section"
      aria-label="Acesso Rápido a Sistemas"
      className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-6 shadow-xs relative overflow-hidden transition-colors"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
            <LinkIcon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                ACESSO RÁPIDO & SISTEMAS
              </h3>
              {isEditor && (
                <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Modo Gestão
                </span>
              )}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300/60">
                🔓 Liberado para colaboradores
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              Sistemas internos, ferramentas operacionais e links corporativos
            </p>
          </div>
        </div>

      </div>

      {/* 8 Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => handleTileClick(e, item.name)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl ${item.bg} hover:-translate-y-0.5 hover:shadow-md transition-transform border border-stone-100 dark:border-stone-800/60 group cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden`}
            >
              <div className={`w-8 h-8 mb-2 flex items-center justify-center ${item.iconColor} group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="stroke-[2.2]" />
              </div>
              <span className={`text-xs font-extrabold tracking-tight ${item.text}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
