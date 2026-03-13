import { ref as dbRef, get, set } from 'firebase/database';
import { db, currentUser } from 'src/boot/firebase';
import type { UserEntry } from 'src/models/livestock';

const USERS_PATH = 'herdit/users';

export async function registerCurrentUser(): Promise<void> {
  const user = currentUser.value;
  if (!user) return;
  await set(dbRef(db, `${USERS_PATH}/${user.uid}`), {
    email: user.email || '',
    displayName: user.displayName || user.email || 'Anonymous',
  });
}

export async function getAllUsers(): Promise<Record<string, UserEntry>> {
  const snap = await get(dbRef(db, USERS_PATH));
  if (!snap.exists()) return {};
  return snap.val() as Record<string, UserEntry>;
}

export async function findUidByEmail(email: string): Promise<string | null> {
  const users = await getAllUsers();
  const lower = email.toLowerCase();
  for (const [uid, entry] of Object.entries(users)) {
    if (entry.email.toLowerCase() === lower) return uid;
  }
  return null;
}
