import { AnimatePresence, motion } from 'motion/react';
import { X, Loader2 } from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  isAuthSubmitting,
  onSubmit,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  authEmail: string;
  setAuthEmail: (v: string) => void;
  authPassword: string;
  setAuthPassword: (v: string) => void;
  isAuthSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  t: any;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-ink/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-ink/10 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold">
                {authMode === 'signup' ? t.createAccount : t.login}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-ink/10 rounded-full text-ink/40 hover:text-ink transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">{t.password}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-ink/5 border border-ink/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 bg-accent text-accent-ink rounded-xl font-bold hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAuthSubmitting && <Loader2 className="animate-spin" size={16} />}
                {authMode === 'signup' ? t.createAccount : t.login}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="w-full text-center text-xs text-ink/40 hover:text-ink transition-colors"
              >
                {authMode === 'signup' ? t.alreadyHaveAccount : t.noAccount}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
