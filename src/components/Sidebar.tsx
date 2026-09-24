import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Heart,
  LogIn,
  LogOut,
  Pencil,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { getCategoryColors } from '../lib/categoryColor';

export function Sidebar({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearFilters,
  categoryCounts,
  totalCount,
  selectedTypeFilter,
  onSelectType,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  showMineOnly,
  onToggleMineOnly,
  mineCount,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
  onManageCategories,
  onOpenAdmin,
  isAdmin,
  user,
  onOpenLogin,
  onLogout,
  isLight,
  t,
}: {
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearFilters: () => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  selectedTypeFilter: 'all' | 'image' | 'video';
  onSelectType: (type: 'all' | 'image' | 'video') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  showMineOnly: boolean;
  onToggleMineOnly: () => void;
  mineCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onManageCategories: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  user: any;
  onOpenLogin: () => void;
  onLogout: () => void;
  isLight: boolean;
  t: any;
}) {
  const [logoHover, setLogoHover] = useState(false);
  const navJustify = sidebarOpen ? '' : 'justify-center';
  const noFilters = selectedCategories.length === 0 && !showFavoritesOnly && !showMineOnly;
  const navItem = "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold whitespace-nowrap transition-colors";
  const idle = "text-ink/60 hover:bg-ink/5 hover:text-ink";

  const label = (text: string, count?: number) =>
    sidebarOpen && (
      <>
        <span className="overflow-hidden text-ellipsis flex-1 text-left">{text}</span>
        {count !== undefined && <span className="text-[11px] font-bold opacity-50 tabular-nums">{count}</span>}
      </>
    );

  const sectionTitle = (text: string, action?: React.ReactNode) =>
    sidebarOpen ? (
      <div className="flex items-center justify-between px-2.5 pt-1.5 pb-0.5">
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-ink/40">{text}</span>
        {action}
      </div>
    ) : (
      <div className="mx-2.5 my-1 border-t border-ink/10" />
    );

  return (
    <div
      className="shrink-0 h-screen sticky top-0 bg-surface border-r border-ink/10 flex flex-col py-5 px-3.5 gap-4 overflow-hidden transition-[width] duration-200"
      style={{ width: sidebarOpen ? 224 : 76 }}
    >
      <div className={cn("flex items-center gap-2.5", !sidebarOpen && "justify-center")}>
        <button
          onClick={onToggleSidebar}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
          title={t.toggleSidebar}
          aria-label={t.toggleSidebar}
          className="relative w-9 h-9 rounded-xl bg-accent text-accent-ink flex items-center justify-center font-display font-extrabold text-base shrink-0"
        >
          <span className={cn("transition-opacity", logoHover && "opacity-0")}>C</span>
          <span className={cn("absolute inset-0 flex items-center justify-center transition-opacity", logoHover ? "opacity-100" : "opacity-0")}>
            {sidebarOpen ? <ChevronLeft size={15} strokeWidth={2.5} /> : <ChevronRight size={15} strokeWidth={2.5} />}
          </span>
        </button>
        {sidebarOpen && (
          <div className="min-w-0 overflow-hidden">
            <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-ink/40">CREO</div>
            <div className="font-display font-bold text-[15px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
              {t.brandName}
            </div>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="flex bg-surface-2 rounded-full p-[3px] gap-0.5">
          <button
            onClick={() => onSelectType(selectedTypeFilter === 'image' ? 'all' : 'image')}
            className={cn(
              "flex-1 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all",
              selectedTypeFilter === 'image' ? "bg-chip-image text-chip-image-text" : "text-ink/40 hover:text-ink"
            )}
          >
            {t.image}
          </button>
          <button
            onClick={() => onSelectType(selectedTypeFilter === 'video' ? 'all' : 'video')}
            className={cn(
              "flex-1 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all",
              selectedTypeFilter === 'video' ? "bg-chip-video text-chip-video-text" : "text-ink/40 hover:text-ink"
            )}
          >
            {t.video}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 no-scrollbar">
        {user && (
          <>
            {sectionTitle(t.personalLabel)}
            <button
              onClick={onToggleFavoritesOnly}
              title={t.favorites}
              aria-pressed={showFavoritesOnly}
              className={cn(navItem, navJustify, showFavoritesOnly ? "bg-danger/20 text-danger" : idle)}
            >
              <Heart size={14} className="shrink-0" fill={showFavoritesOnly ? "currentColor" : "none"} />
              {label(t.favorites, favoritesCount)}
            </button>
            <button
              onClick={onToggleMineOnly}
              title={t.createdByMe}
              aria-pressed={showMineOnly}
              className={cn(navItem, navJustify, showMineOnly ? "bg-accent/20 text-accent" : idle)}
            >
              <UserRound size={14} className="shrink-0" />
              {label(t.createdByMe, mineCount)}
            </button>
            <div className="h-2" />
          </>
        )}

        {sectionTitle(
          t.categoriesLabel,
          isAdmin && (
            <button
              onClick={onManageCategories}
              title={t.manageCategories}
              className="text-ink/30 hover:text-accent transition-colors"
            >
              <Pencil size={12} />
            </button>
          )
        )}

        <button
          onClick={onClearFilters}
          title={t.resetFilters}
          className={cn(navItem, navJustify, noFilters ? "bg-accent text-accent-ink" : idle)}
        >
          <span className="w-[9px] h-[9px] rounded-full shrink-0 bg-current opacity-60" />
          {label(t.all, totalCount)}
        </button>

        {categories.map((cat) => {
          const active = selectedCategories.includes(cat);
          const colors = getCategoryColors(cat, isLight);
          return (
            <button
              key={cat}
              onClick={() => onToggleCategory(cat)}
              title={cat}
              aria-pressed={active}
              className={cn(navItem, navJustify, !active && idle)}
              style={active ? { background: colors.bg, color: colors.text, boxShadow: `inset 0 0 0 1px ${colors.dim}` } : undefined}
            >
              <span
                className={cn("w-[9px] h-[9px] rounded-full shrink-0 transition-shadow", active && "ring-2 ring-current/30")}
                style={{ background: colors.dot }}
              />
              {label(cat, categoryCounts[cat] || 0)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 border-t border-ink/10 pt-3.5">
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            title={t.adminPanel}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold text-ink/60 hover:bg-ink/5 hover:text-ink whitespace-nowrap transition-colors",
              navJustify
            )}
          >
            <ShieldCheck size={16} className="shrink-0" />
            {sidebarOpen && <span>{t.adminPanel}</span>}
          </button>
        )}
        <button
          onClick={onOpenSettings}
          title={t.settings}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold text-ink/60 hover:bg-ink/5 hover:text-ink whitespace-nowrap transition-colors",
            navJustify
          )}
        >
          <Settings size={16} className="shrink-0" />
          {sidebarOpen && <span>{t.settings}</span>}
        </button>

        {user ? (
          <div className={cn("flex items-center gap-2.5 px-2.5 pt-1", navJustify)}>
            <div className="w-[30px] h-[30px] rounded-full bg-accent text-accent-ink flex items-center justify-center font-display font-bold text-xs shrink-0">
              {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
            </div>
            {sidebarOpen && (
              <>
                <span className="text-xs font-semibold text-ink/60 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={onLogout}
                  title={t.logout}
                  className="p-1.5 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/10 transition-all shrink-0"
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-bold bg-accent text-accent-ink whitespace-nowrap",
              navJustify
            )}
          >
            <LogIn size={15} className="shrink-0" />
            {sidebarOpen && <span>{t.login}</span>}
          </button>
        )}
      </div>
    </div>
  );
}
