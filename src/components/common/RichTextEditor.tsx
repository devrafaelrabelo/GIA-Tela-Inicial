import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading3,
  List,
  Link as LinkIcon,
  Quote,
  Eye,
  Edit3,
  HelpCircle
} from 'lucide-react';
import { RichTextRenderer } from './RichTextRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  label?: string;
  required?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva sua mensagem ou comunicado...',
  minRows = 5,
  label = 'Conteúdo da Publicação',
  required = false
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [showHelper, setShowHelper] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insere marcadores ao redor ou na posição do cursor
  const insertFormatting = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Reposiciona o cursor
    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertFormatting('**', '**', 'texto em negrito');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertFormatting('*', '*', 'texto em itálico');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        insertFormatting('[', '](https://)', 'link');
      }
    }
  };

  return (
    <div className="space-y-1.5">
      {/* Header com Label, Tabs e Helper */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="block font-bold text-stone-700 dark:text-stone-300 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            title="Dicas de Formatação"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 transition-colors"
          >
            <HelpCircle size={14} />
          </button>

          {/* Segmented Write / Preview Tab */}
          <div className="flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                activeTab === 'write'
                  ? 'bg-white dark:bg-stone-900 text-[#7c172e] dark:text-rose-400 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Edit3 size={12} />
              <span>Escrever</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-stone-900 text-[#7c172e] dark:text-rose-400 font-bold shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Eye size={12} />
              <span>Prévia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Box de Ajuda de Formatação */}
      {showHelper && (
        <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold">✨ Dicas de Estilização Rápida:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10.5px]">
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">**negrito**</code> → <strong>negrito</strong></li>
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">*itálico*</code> → <em>itálico</em></li>
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">### Título</code> → Subtítulo destacado</li>
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">- item</code> → Lista com marcadores</li>
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">[Texto](link)</code> → Link clicável</li>
            <li><code className="bg-amber-100 dark:bg-amber-900/60 px-1 rounded">&gt; Citação</code> → Citação em destaque</li>
          </ul>
        </div>
      )}

      {/* Container Principal do Editor */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden bg-white dark:bg-stone-900 focus-within:ring-2 focus-within:ring-[#7c172e] focus-within:border-[#7c172e] transition-all shadow-2xs">
        {/* Toolbar de Formatação (ativa no modo Escrever) */}
        {activeTab === 'write' && (
          <div className="px-2 py-1.5 bg-stone-50/90 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700/80 flex items-center gap-1 flex-wrap text-stone-600 dark:text-stone-300">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'texto em negrito')}
              title="Negrito (Ctrl+B)"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'texto em itálico')}
              title="Itálico (Ctrl+I)"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n### ', '', 'Título')}
              title="Subtítulo H3"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation font-bold text-xs"
            >
              <Heading3 size={14} />
            </button>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-0.5"></div>
            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '', 'Item da lista')}
              title="Lista com marcadores"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://)', 'Link')}
              title="Inserir Link (Ctrl+K)"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <LinkIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n> ', '', 'Citação em destaque')}
              title="Citação em bloco"
              className="p-1.5 hover:bg-stone-200/70 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer touch-manipulation"
            >
              <Quote size={14} />
            </button>
          </div>
        )}

        {/* Área de Edição ou Prévia */}
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            required={required}
            rows={minRows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-3.5 text-xs text-stone-900 dark:text-stone-100 bg-transparent outline-none leading-relaxed resize-y placeholder-stone-400"
          />
        ) : (
          <div className="p-4 min-h-[140px] max-h-[300px] overflow-y-auto bg-stone-50/50 dark:bg-stone-950/30">
            {value.trim() ? (
              <RichTextRenderer content={value} />
            ) : (
              <p className="text-xs text-stone-400 italic">
                Nenhum texto digitado para pré-visualizar.
              </p>
            )}
          </div>
        )}

        {/* Contador no rodapé */}
        <div className="px-3 py-1 bg-stone-50/60 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400">
          <span>{activeTab === 'write' ? 'Markdown suportado' : 'Modo de visualização'}</span>
          <span className="tabular-nums">{value.length} caracteres</span>
        </div>
      </div>
    </div>
  );
};
