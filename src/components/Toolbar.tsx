import {
  Search,
  X,
  ArrowUpDown,
  CheckSquare,
  LayoutGrid,
  Grid3x3,
  List as ListIcon,
  Plus,
  ArrowUp,
} from 'lucide-react';
import { cn } from '../lib/cn';
import type { ViewMode } from './PromptCard';

export type SortBy = 'newest' | 'oldest' | 'alphabetical' | 'mostCopied';

// One set of controls rendered two ways: the full toolbar at the top of the
// page, and the compact floating "island" that slides in once it scrolls away.
export function Toolbar({
  variant,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  canEdit,
  isBulkMode,
  onToggleBulkMode,
  onAddPrompt,
  onScrollTop,
  t,
}: {
  variant: 'full' | 'island';
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  canEdit: boolean;
  isBulkMode: boolean;
  onToggleBulkMode: () => void;
  onAddPrompt: () => void;
  onScrollTop?: () => void;
  t: any;
}) {
  const island = variant === 'island';

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'newest', label: t.sortNewest },
    { value: 'oldest', label: t.sortOldest },
    { value: 'alphabetical', label: t.sortAlphabetical },
    { value: 'mostCopied', label: t.sortMostCopied },
  ];
  const currentSortLabel = sortOptions.find((o) => o.value === sortBy)?.label;

  const viewModes = [
    { mode: 'grid', icon: LayoutGrid, label: t.viewGrid },
    { mode: 'compact', icon: Grid3x3, label: t.viewCompact },
    { mode: 'list', icon: ListIcon, label: t.viewList },
  ] as const;

  const iconButton = (active = false) =>
    cn(
      "rounded-full border transition-all shrink-0",
      island ? "p-2" : "p-2.5",
      active
        ? "bg-accent border-accent text-accent-ink"
        : "bg-ink/5 border-ink/10 text-ink/40 hover:text-accent hover:bg-ink/10"
    );

  return (
    <div className={cn("flex items-center", island ? "gap-1.5" : "flex-wrap gap-3")}>
      <div
        className={cn(
          "relative",
          island ? "w-44 focus-within:w-64 transition-[width] duration-300" : "w-full max-w-md"
        )}
      >
        <Search
          className={cn("absolute top-1/2 -translate-y-1/2 text-ink/30", island ? "left-3" : "left-3")}
          size={island ? 15 : 18}
        />
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full bg-ink/5 border border-ink/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all",
            island ? "rounded-full py-1.5 pl-9 pr-8 text-[13px]" : "rounded-xl py-2.5 pl-10 pr-10 text-sm"
          )}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label={t.cancel}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
          >
            <X size={island ? 14 : 16} />
          </button>
        )}
      </div>

      {!island && <div className="flex-1" />}

      {island ? (
        // Icon-only sort: a transparent native select laid over the icon.
        <div className={cn(iconButton(), "relative")} title={currentSortLabel}>
          <ArrowUpDown size={16} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label={currentSortLabel}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="appearance-none bg-ink/5 border border-ink/10 rounded-full pl-8 pr-4 py-2 text-xs font-medium text-ink/70 focus:outline-none focus:border-accent/50 hover:bg-ink/10 transition-all cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
            ))}
          </select>
          <ArrowUpDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30 pointer-events-none" />
        </div>
      )}

      {canEdit && (
        <button onClick={onToggleBulkMode} title={t.selectMode} className={iconButton(isBulkMode)}>
          <CheckSquare size={island ? 16 : 18} />
        </button>
      )}

      <div className={cn("flex items-center gap-1 bg-ink/5 border border-ink/10 p-1", island ? "rounded-full" : "rounded-xl")}>
        {viewModes.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            title={label}
            aria-label={label}
            className={cn(
              "transition-colors",
              island ? "p-1 rounded-full" : "p-1.5 rounded-lg",
              viewMode === mode ? "bg-accent text-accent-ink" : "text-ink/40 hover:text-ink"
            )}
          >
            <Icon size={island ? 15 : 18} />
          </button>
        ))}
      </div>

      {island && onScrollTop && (
        <button onClick={onScrollTop} title={t.scrollTop} aria-label={t.scrollTop} className={iconButton()}>
          <ArrowUp size={16} />
        </button>
      )}

      {canEdit && (
        island ? (
          <button
            onClick={onAddPrompt}
            title={t.addPrompt}
            aria-label={t.addPrompt}
            className="w-9 h-9 flex items-center justify-center bg-accent text-accent-ink rounded-full hover:bg-accent-hover transition-all active:scale-90 shadow-lg shadow-accent/30 shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={onAddPrompt}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-accent text-accent-ink rounded-xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-accent/20 whitespace-nowrap"
          >
            <Plus size={20} />
            <span>{t.addPrompt}</span>
          </button>
        )
      )}
    </div>
  );
}
