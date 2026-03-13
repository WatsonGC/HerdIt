import { ref as dbRef, get, set } from 'firebase/database';
import { ref } from 'vue';
import { db, currentUser } from 'src/boot/firebase';
import { createFarm } from './farm-service';

const ADMINS_PATH = 'herdit/admins';
const DEFAULT_FARM_ID = 'MyFarm';

export const isAdmin = ref(false);

export async function checkAdmin(): Promise<boolean> {
  const uid = currentUser.value?.uid;
  if (!uid) {
    isAdmin.value = false;
    return false;
  }

  const snapshot = await get(dbRef(db, ADMINS_PATH));
  if (!snapshot.exists()) {
    await set(dbRef(db, `${ADMINS_PATH}/${uid}`), true);
    isAdmin.value = true;
    try {
      await createFarm(DEFAULT_FARM_ID, 'My Farm', '', 0, 'mixed');
    } catch { /* already exists */ }
    return true;
  }

  const admins = snapshot.val() as Record<string, boolean>;
  isAdmin.value = !!admins[uid];
  return isAdmin.value;
}
