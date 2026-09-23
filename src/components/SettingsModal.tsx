import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';
import { THEMES, ThemeName } from '../hooks/useTheme';

const THEME_PREVIEW: Record<ThemeName, string> = {
  dark: 'hsl(252 90% 68%)',
  sunset: 'hsl(14 90% 62%)',
  light: 'hsl(252 85% 58%)',
};

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  lang,
  setLang,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  lang: 'en' | 'ru';
  setLang: (l: 'en' | 'ru') => void;
  t: any;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface border border-ink/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-ink/10 flex items-center justify-between">
              <h3 className="font-display font-bold text-base">{t.settings}</h3>
              <button
                onClick={onClose}
                aria-label={t.cancel}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.theme}</div>
                <div className="flex gap-2.5">
                  {THEMES.map((th) => {
                    const active = th.key === theme;
                    return (
                      <button
                        key={th.key}
                        onClick={() => setTheme(th.key)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl bg-surface-2 border-2 transition-all hover:-translate-y-0.5",
                          active ? "border-accent" : "border-transparent"
                        )}
                      >
                        <span
                          className="w-6 h-6 rounded-full"
                          style={{ background: THEME_PREVIEW[th.key] }}
                        />
                        <span className="text-[11px] font-semibold">{th.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.language}</div>
                <div className="flex bg-surface-2 rounded-full p-[3px]">
                  <button
                    onClick={() => setLang('ru')}
                    className={cn(
                      "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                      lang === 'ru' ? "bg-accent text-accent-ink" : "text-ink/60"
                    )}
                  >
                    RU
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={cn(
                      "flex-1 py-2 rounded-full text-xs font-bold transition-all",
                      lang === 'en' ? "bg-accent text-accent-ink" : "text-ink/60"
                    )}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
