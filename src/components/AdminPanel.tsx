import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { X, ShieldCheck, Crown, Tags, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../firebase';
import { Prompt, UserProfile, OperationType } from '../types';
import { handleFirestoreError } from '../utils/error-handler';
import { isOwnerEmail } from '../lib/admin';
import { cn } from '../lib/cn';

export function AdminPanel({
  isOpen,
  onClose,
  prompts,
  currentUid,
  onManageCategories,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  prompts: Prompt[];
  currentUid: string | undefined;
  onManageCategories: () => void;
  t: any;
}) {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingUsers(true);
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(snapshot.docs.map((d) => ({ ...(d.data() as UserProfile), id: d.id })));
        setLoadingUsers(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
        setLoadingUsers(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen]);

  const promptCountByAuthor = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((p) => {
      counts[p.authorUid] = (counts[p.authorUid] || 0) + 1;
    });
    return counts;
  }, [prompts]);

  const sortedUsers = useMemo(() => {
    const rank = (u: UserProfile) => (isOwnerEmail(u.email) ? 0 : u.role === 'admin' ? 1 : 2);
    return [...users].sort((a, b) => rank(a) - rank(b) || (a.email || '').localeCompare(b.email || ''));
  }, [users]);

  const adminCount = users.filter((u) => isOwnerEmail(u.email) || u.role === 'admin').length;

  const setRole = async (uid: string, role: 'admin' | 'user') => {
    setPendingUid(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      toast.success(t.roleUpdated);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
      toast.error(t.permissionDenied);
    } finally {
      setPendingUid(null);
    }
  };

  const stats = [
    { label: t.statPrompts, value: prompts.length },
    { label: t.statUsers, value: users.length },
    { label: t.statAdmins, value: adminCount },
  ];

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
            className="w-full max-w-xl max-h-[85vh] flex flex-col bg-surface border border-ink/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-5 border-b border-ink/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-accent text-accent-ink flex items-center justify-center">
                  <ShieldCheck size={16} />
                </span>
                <h3 className="font-display font-bold text-base">{t.adminPanel}</h3>
              </div>
              <button
                onClick={onClose}
                aria-label={t.cancel}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-ink/40 hover:text-ink hover:bg-ink/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="grid grid-cols-3 gap-2.5">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-surface-2 px-4 py-3">
                    <div className="font-display font-bold text-xl">{s.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={onManageCategories}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-2 hover:bg-ink/10 text-left transition-colors"
              >
                <span className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <Tags size={16} />
                </span>
                <span className="text-[13px] font-semibold">{t.manageCategories}</span>
              </button>

              <div className="flex flex-col gap-2.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.statUsers}</div>
                {loadingUsers ? (
                  <div className="flex justify-center py-6 text-ink/30">
                    <Loader2 size={20} className="animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {sortedUsers.map((u) => {
                      const owner = isOwnerEmail(u.email);
                      const admin = owner || u.role === 'admin';
                      const isSelf = u.id === currentUid;
                      const count = promptCountByAuthor[u.id] || 0;
                      return (
                        <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-ink/[0.03] border border-ink/5">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0",
                            admin ? "bg-accent text-accent-ink" : "bg-surface-2 text-ink/60"
                          )}>
                            {(u.displayName || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-semibold truncate">{u.displayName || u.email}</span>
                              {isSelf && <span className="text-[10px] text-ink/30 shrink-0">({t.you})</span>}
                            </div>
                            <div className="text-[11px] text-ink/40 truncate">
                              {u.displayName ? `${u.email} · ` : ''}{count} {t.promptsCountLabel}
                            </div>
                          </div>
                          {owner ? (
                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wider shrink-0">
                              <Crown size={11} />
                              {t.roleOwner}
                            </span>
                          ) : (
                            <button
                              onClick={() => setRole(u.id, admin ? 'user' : 'admin')}
                              disabled={pendingUid === u.id}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 disabled:opacity-50",
                                admin
                                  ? "bg-accent/15 text-accent hover:bg-danger/15 hover:text-danger"
                                  : "bg-ink/5 text-ink/60 hover:bg-accent hover:text-accent-ink"
                              )}
                            >
                              {pendingUid === u.id ? <Loader2 size={12} className="animate-spin" /> : admin ? t.revokeAdmin : t.makeAdmin}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
