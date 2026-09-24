import type { User } from 'firebase/auth';
import type { Prompt, UserProfile } from '../types';

// Bootstrap owner: always an admin. Must match isAdmin() in firestore.rules.
export const OWNER_EMAIL = 'mme.creo@lidera.agency';

export function isOwnerEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === OWNER_EMAIL;
}

export function isAdminUser(user: User | null, profile: UserProfile | null): boolean {
  if (!user) return false;
  return isOwnerEmail(user.email) || profile?.role === 'admin';
}

// UI mirror of the Firestore rule: authors manage their own prompts, admins manage all.
export function canManagePrompt(prompt: Prompt, user: User | null, isAdmin: boolean): boolean {
  if (!user) return false;
  return isAdmin || prompt.authorUid === user.uid;
}
