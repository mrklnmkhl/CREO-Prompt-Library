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
} from 'lucide-react';
import { cn } from '../lib/cn';
import { getCategoryColors } from '../lib/categoryColor';

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedTypeFilter,
  onSelectType,
  showFavoritesOnly,
  onToggleFavoritesOnly,
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
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedTypeFilter: 'all' | 'image' | 'video';
  onSelectType: (type: 'all' | 'image' | 'video') => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
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
        {sidebarOpen && (
          <div className="flex items-center justify-between px-2.5 pt-1.5 pb-0.5">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-ink/40">
              {t.categoriesLabel}
            </span>
            {isAdmin && (
              <button
                onClick={onManageCategories}
                title={t.manageCategories}
                className="text-ink/30 hover:text-accent transition-colors"
              >
                <Pencil size={12} />
              </button>
            )}
          </div>
        )}

        {user && (
          <button
            onClick={onToggleFavoritesOnly}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold whitespace-nowrap transition-colors",
              navJustify,
              showFavoritesOnly ? "bg-danger/20 text-danger" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
            )}
          >
            <Heart size={14} className="shrink-0" fill={showFavoritesOnly ? "currentColor" : "none"} />
            {sidebarOpen && <span className="overflow-hidden text-ellipsis">{t.favorites}</span>}
          </button>
        )}

        <button
          onClick={() => onSelectCategory('All')}
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold whitespace-nowrap transition-colors",
            navJustify,
            selectedCategory === 'All' ? "bg-accent text-accent-ink" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
          )}
        >
          <span className="w-[9px] h-[9px] rounded-full shrink-0 bg-current opacity-60" />
          {sidebarOpen && <span className="overflow-hidden text-ellipsis">{t.all}</span>}
        </button>

        {categories.map((cat) => {
          const active = selectedCategory === cat;
          const colors = getCategoryColors(cat, isLight);
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-[11px] text-[13px] font-semibold whitespace-nowrap transition-colors",
                navJustify,
                !active && "text-ink/60 hover:bg-ink/5 hover:text-ink"
              )}
              style={active ? { background: colors.bg, color: colors.text } : undefined}
            >
              <span className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: colors.dot }} />
              {sidebarOpen && <span className="overflow-hidden text-ellipsis">{cat}</span>}
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
