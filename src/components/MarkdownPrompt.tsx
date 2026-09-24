import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkHighlightPlaceholders from '../utils/highlightPlaceholders';

export const HighlightedPrompt = memo(({ content, values = {} }: { content: string; values?: Record<string, string> }) => {
  const parts = content.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          const key = part.slice(1, -1);
          return (
            <span key={i} className="text-ph font-bold bg-ph/10 px-0.5 rounded">
              {values[key] || part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
});

export const MarkdownPrompt = memo(({ content, values = {} }: { content: string; values?: Record<string, string> }) => {
  return (
    <div className="prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkHighlightPlaceholders]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic text-ink/70">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-ink/80">{children}</li>,
          code: ({ children }) => <code className="bg-ink/10 px-1.5 py-0.5 rounded text-accent-hover text-xs">{children}</code>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-ink">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-ink">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mb-2 text-ink">{children}</h3>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-accent underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/40 pl-4 italic text-ink/60 mb-3">{children}</blockquote>
          ),
          mark: (props: any) => {
            const key = props['data-placeholder'];
            return (
              <span className="text-ph font-bold bg-ph/10 px-0.5 rounded">
                {values[key] || props.children}
              </span>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
