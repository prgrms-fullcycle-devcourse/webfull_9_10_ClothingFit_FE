import type { MallId } from '../constants/malls';
import { createEmptyCopySession, type CopySession } from '../types/copy-session';

let sharedSession = createEmptyCopySession('musinsa');
const listeners = new Set<() => void>();

export function getCopySession() {
  return sharedSession;
}

export function setCopySession(next: CopySession) {
  sharedSession = next;
  listeners.forEach((l) => l());
}

export function subscribeCopySession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetCopySessionStore(mallId?: MallId) {
  setCopySession(createEmptyCopySession(mallId ?? sharedSession.mallId));
}
