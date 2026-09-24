import { Timestamp } from 'firebase/firestore';

export interface Prompt {
  id?: string;
  title: string;
  content: string;
  exampleUrl?: string;
  category?: string;
  type: 'image' | 'video';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorUid: string;
  authorName?: string;
  linkedPromptIds?: string[];
  copyCount?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  favoritePromptIds?: string[];
  role?: 'admin' | 'user';
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
