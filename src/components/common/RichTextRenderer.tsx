import React from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

/**
 * Renderizador seguro de formatação rica (Markdown simples: negrito, itálico, listas, links, citações e cabeçalhos).
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Renderiza inline formatting: negrito, itálico, links e badges
  const renderInline = (text: string): React.ReactNode => {
    // Regex tokens:
    // 1. Links: [texto](url)
    // 2. Bold: **texto**
    // 3. Italic: *texto*
    // 4. Code: `código`
    const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Link: [label](url)
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [, label, url] = match;
          const isExternal = url.startsWith('http://') || url.startsWith('https://');
          return (
            <a
              key={i}
              href={url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="text-[#7c172e] dark:text-rose-400 font-bold underline decoration-[#7c172e]/40 hover:decoration-[#7c172e] hover:text-[#5a0f20] dark:hover:text-rose-300 transition-colors inline-flex items-center gap-0.5"
            >
              {label}
            </a>
          );
        }
      }

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-extrabold text-stone-950 dark:text-stone-50">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text*
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-stone-800 dark:text-stone-200">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Inline code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 text-[11px] font-mono rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return part;
    });
  };

  // Divide o texto em blocos por linhas
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1 my-2">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-stone-700 dark:text-stone-300">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Linha vazia
    if (!trimmed) {
      flushList();
      return;
    }

    // Item de lista com marcadores (- ou *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentList.push(trimmed.slice(2));
      return;
    }

    // Não é lista, libera lista acumulada
    flushList();

    // Cabeçalho H3: ### Título
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${idx}`} className="font-bold text-sm text-stone-900 dark:text-stone-100 mt-3 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Cabeçalho H2: ## Título
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${idx}`} className="font-extrabold text-base text-stone-900 dark:text-stone-100 mt-3 mb-1">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Citação: > Texto
    if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${idx}`}
          className="border-l-3 border-[#7c172e] dark:border-rose-500 pl-3.5 my-2 py-0.5 italic text-stone-600 dark:text-stone-300 bg-stone-50/70 dark:bg-stone-900/40 rounded-r-lg"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Parágrafo comum
    blocks.push(
      <p key={`p-${idx}`} className="leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-2 text-xs sm:text-sm ${className}`}>{blocks}</div>;
};
