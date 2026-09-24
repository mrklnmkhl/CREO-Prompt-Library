import { auth } from '../firebase';
import { FirestoreErrorInfo, OperationType } from '../types';

// Logs a structured Firestore error and returns its code. It deliberately does
// not throw: callers invoke it from catch blocks and still need to show a toast.
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): string | undefined {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return (error as { code?: string })?.code;
}
