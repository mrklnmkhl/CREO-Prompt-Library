import { memo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Heart,
  Image as ImageIcon,
  ExternalLink,
  Check,
  CopyPlus,
} from 'lucide-react';
import { Prompt, UserProfile } from '../types';
import { HighlightedPrompt } from './MarkdownPrompt';
import { getCategoryColors } from '../lib/categoryColor';
import { cn } from '../lib/cn';

function onCardMove(e: React.MouseEvent<HTMLDivElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

export const PromptCard = memo(({
  prompt,
  viewMode,
  user,
  userProfile,
  isLight,
  toggleFavorite,
  setViewingPromptId,
  copyToClipboard,
  onDuplicate,
  isBulkMode,
  isSelected,
  onToggleSelect,
  t
}: {
  prompt: Prompt;
  viewMode: 'grid' | 'list';
  user: any;
  userProfile: UserProfile | null;
  isLight: boolean;
  toggleFavorite: (id: string) => void;
  setViewingPromptId: (id: string) => void;
  copyToClipboard: (text: string, promptId?: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  isBulkMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  t: any;
}) => {
  const cat = getCategoryColors(prompt.category || 'General', isLight);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => onCardMove(e), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      onClick={isBulkMode ? () => onToggleSelect(prompt.id!) : undefined}
      onMouseMove={handleMove}
      style={{ '--cat-dim': cat.dim, '--cat-glow': cat.glow, '--cat-solid': cat.solid } as React.CSSProperties}
      className={cn(
        "prompt-card group relative bg-ink/5 border rounded-xl overflow-hidden flex flex-col shadow-lg",
        isBulkMode ? "cursor-pointer" : "",
        isSelected ? "border-accent/60 ring-2 ring-accent/30" : "border-ink/10",
        viewMode === 'list' && "flex flex-row h-48"
      )}
    >
      <div className="prompt-card-ring" />

      {isBulkMode && (
        <div className={cn(
          "absolute top-3 left-3 z-30 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all",
          isSelected ? "bg-accent border-accent text-accent-ink" : "bg-black/40 border-ink/30 text-transparent"
        )}>
          <Check size={14} strokeWidth={3} />
        </div>
      )}

      {/* Preview Image */}
      <div
        className={cn(
          "relative bg-surface-2 overflow-hidden shrink-0",
          isBulkMode ? "" : "cursor-pointer",
          viewMode === 'grid' ? "aspect-square" : "w-64 h-full"
        )}
        onClick={isBulkMode ? undefined : () => setViewingPromptId(prompt.id!)}
      >
        {prompt.exampleUrl ? (
          <img
            src={prompt.exampleUrl}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink/10">
            <ImageIcon size={32} />
            <span className="text-[8px] uppercase tracking-widest mt-2">{t.noPreview}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-ink/10 backdrop-blur-md p-2 rounded-full border border-ink/20">
            <ExternalLink size={16} className="text-ink" />
          </div>
        </div>

        {/* Favorite Button */}
        {user && !isBulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(prompt.id!);
            }}
            className={cn(
              "absolute top-3 right-3 z-20 p-2 rounded-full backdrop-blur-md border transition-all",
              userProfile?.favoritePromptIds?.includes(prompt.id!)
                ? "bg-danger/20 border-danger/30 text-danger"
                : "bg-black/20 border-ink/10 text-ink/40 hover:text-ink hover:bg-black/40"
            )}
          >
            <Heart size={14} fill={userProfile?.favoritePromptIds?.includes(prompt.id!) ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-nowrap overflow-hidden">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: cat.bg, color: cat.text }}
          >
            {prompt.category || 'General'}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm whitespace-nowrap",
            prompt.type === 'video'
              ? "bg-chip-video/20 text-chip-video-text"
              : "bg-chip-image/10 text-chip-image-text"
          )}>
            {prompt.type === 'video' ? 'Video' : 'Image'}
          </span>
          {typeof prompt.copyCount === 'number' && prompt.copyCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-ink/20 ml-auto whitespace-nowrap">
              <Copy size={9} />
              {prompt.copyCount}
            </span>
          )}
        </div>

        <h3 className="text-base font-display font-bold mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {prompt.title}
        </h3>

        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {prompt.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[8px] px-1.5 py-0.5 bg-ink/5 text-ink/40 rounded-full border border-ink/5">
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[8px] px-1.5 py-0.5 text-ink/20">
                +{prompt.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-ink/40 line-clamp-2 mb-4 flex-1 leading-relaxed">
          <HighlightedPrompt content={prompt.content} />
        </p>

        {!isBulkMode && (
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(prompt.content, prompt.id);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-xs font-medium transition-all active:scale-95"
            >
              <Copy size={14} />
              <span>{t.copyPrompt}</span>
            </button>
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(prompt);
                }}
                title={t.duplicate}
                className="p-2 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-ink/40 hover:text-accent transition-all active:scale-95"
              >
                <CopyPlus size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
