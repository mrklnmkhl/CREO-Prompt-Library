import { memo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Heart,
  Image as ImageIcon,
  ExternalLink,
  Check,
  CopyPlus,
  Link2,
} from 'lucide-react';
import { Prompt, UserProfile } from '../types';
import { HighlightedPrompt } from './MarkdownPrompt';
import { getCategoryColors } from '../lib/categoryColor';
import { cn } from '../lib/cn';

export type ViewMode = 'grid' | 'compact' | 'list';

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
  onShare,
  isBulkMode,
  isSelectable,
  isSelected,
  onToggleSelect,
  t
}: {
  prompt: Prompt;
  viewMode: ViewMode;
  user: any;
  userProfile: UserProfile | null;
  isLight: boolean;
  toggleFavorite: (id: string) => void;
  setViewingPromptId: (id: string) => void;
  copyToClipboard: (text: string, promptId?: string) => void;
  onDuplicate: (prompt: Prompt) => void;
  onShare: (id: string) => void;
  isBulkMode: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  t: any;
}) => {
  const cat = getCategoryColors(prompt.category || 'General', isLight);
  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => onCardMove(e), []);
  const isCompact = viewMode === 'compact';
  const isList = viewMode === 'list';
  const isFavorite = !!userProfile?.favoritePromptIds?.includes(prompt.id!);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      onClick={isBulkMode && isSelectable ? () => onToggleSelect(prompt.id!) : undefined}
      onMouseMove={handleMove}
      style={{ '--cat-dim': cat.dim, '--cat-glow': cat.glow, '--cat-solid': cat.solid } as React.CSSProperties}
      className={cn(
        "prompt-card group relative bg-surface border rounded-2xl flex flex-col",
        isBulkMode && isSelectable && "cursor-pointer",
        isBulkMode && !isSelectable && "opacity-40",
        isSelected ? "border-accent/60 ring-2 ring-accent/30" : "border-ink/10",
        isList && "flex-row h-48"
      )}
    >
      <div className="prompt-card-ring" />

      {isBulkMode && isSelectable && (
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
          isList ? "w-64 h-full rounded-l-2xl" : "aspect-square rounded-t-2xl"
        )}
        onClick={isBulkMode ? undefined : () => setViewingPromptId(prompt.id!)}
      >
        {prompt.exampleUrl ? (
          <img
            src={prompt.exampleUrl}
            alt={prompt.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink/10">
            <ImageIcon size={isCompact ? 24 : 32} />
            {!isCompact && <span className="text-[8px] uppercase tracking-widest mt-2">{t.noPreview}</span>}
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-ink/10 backdrop-blur-md p-2 rounded-full border border-ink/20">
            <ExternalLink size={isCompact ? 14 : 16} className="text-ink" />
          </div>
        </div>

        {user && !isBulkMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(prompt.id!);
            }}
            className={cn(
              "absolute z-20 rounded-full backdrop-blur-md border transition-all",
              isCompact ? "top-2 right-2 p-1.5" : "top-3 right-3 p-2",
              isFavorite
                ? "bg-danger/20 border-danger/30 text-danger"
                : "bg-black/20 border-ink/10 text-ink/40 hover:text-ink hover:bg-black/40"
            )}
          >
            <Heart size={isCompact ? 12 : 14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col flex-1 min-w-0", isCompact ? "p-2.5" : "p-4")}>
        <div className={cn("flex items-center gap-1.5 flex-nowrap overflow-hidden", isCompact ? "mb-1.5" : "mb-2 gap-2")}>
          <span
            className={cn(
              "font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis",
              isCompact ? "text-[9px] tracking-wider" : "text-[10px] tracking-widest"
            )}
            style={{ background: cat.bg, color: cat.text }}
          >
            {prompt.category || 'General'}
          </span>
          {!isCompact && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm whitespace-nowrap",
              prompt.type === 'video'
                ? "bg-chip-video/20 text-chip-video-text"
                : "bg-chip-image/10 text-chip-image-text"
            )}>
              {prompt.type === 'video' ? 'Video' : 'Image'}
            </span>
          )}
          {typeof prompt.copyCount === 'number' && prompt.copyCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-ink/20 ml-auto whitespace-nowrap">
              <Copy size={9} />
              {prompt.copyCount}
            </span>
          )}
        </div>

        <h3 className={cn(
          "font-display font-bold line-clamp-1 group-hover:text-accent transition-colors",
          isCompact ? "text-[13px] mb-2" : "text-base mb-1"
        )}>
          {prompt.title}
        </h3>

        {!isCompact && prompt.tags && prompt.tags.length > 0 && (
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

        {!isCompact && (
          <p className="text-xs text-ink/40 line-clamp-2 mb-4 flex-1 leading-relaxed">
            <HighlightedPrompt content={prompt.content} />
          </p>
        )}

        {!isBulkMode && (
          <div className={cn("flex items-center mt-auto", isCompact ? "gap-1.5" : "gap-2")}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(prompt.content, prompt.id);
              }}
              title={t.copyPrompt}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg font-medium transition-all active:scale-95",
                isCompact ? "py-1.5 text-[11px]" : "py-2 text-xs"
              )}
            >
              <Copy size={isCompact ? 12 : 14} />
              <span>{t.copyPrompt}</span>
            </button>
            {!isCompact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(prompt.id!);
                }}
                title={t.share}
                className="p-2 bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-ink/40 hover:text-accent transition-all active:scale-95"
              >
                <Link2 size={14} />
              </button>
            )}
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(prompt);
                }}
                title={t.duplicate}
                className={cn(
                  "bg-ink/5 hover:bg-ink/10 border border-ink/10 rounded-lg text-ink/40 hover:text-accent transition-all active:scale-95",
                  isCompact ? "p-1.5" : "p-2"
                )}
              >
                <CopyPlus size={isCompact ? 12 : 14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
