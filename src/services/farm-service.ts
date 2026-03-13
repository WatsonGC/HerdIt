import { ref as dbRef, get, set, remove } from 'firebase/database';
import { ref } from 'vue';
import { db, currentUser } from 'src/boot/firebase';
import type { FarmMeta, FarmEntry, FarmType } from 'src/models/livestock';

const FARMS_PATH = 'herdit/farms';

export const activeFarmId = ref<string | null>(null);
export const activeFarmMeta = ref<FarmMeta | null>(null);
export const availableFarms = ref<FarmEntry[]>([]);

export function farmPath(farmId?: string): string {
  const id = farmId ?? activeFarmId.value;
  if (!id) throw new Error('No active farm');
  return `${FARMS_PATH}/${id}`;
}

export async function loadAvailableFarms(): Promise<FarmEntry[]> {
  const uid = currentUser.value?.uid;
  if (!uid) {
    availableFarms.value = [];
    return [];
  }

  const snapshot = await get(dbRef(db, FARMS_PATH));
  if (!snapshot.exists()) {
    availableFarms.value = [];
    return [];
  }

  const farms = snapshot.val() as Record<string, { meta?: FarmMeta; access?: Record<string, boolean> }>;
  const entries: FarmEntry[] = [];

  const adminSnap = await get(dbRef(db, `herdit/admins/${uid}`));
  const isGlobalAdmin = adminSnap.exists() && adminSnap.val() === true;

  for (const [id, data] of Object.entries(farms)) {
    if (!data.meta) continue;
    if (isGlobalAdmin || (data.access && data.access[uid])) {
      entries.push({ id, meta: data.meta });
    }
  }

  availableFarms.value = entries;
  return entries;
}

export async function selectFarm(farmId: string): Promise<void> {
  const snap = await get(dbRef(db, `${FARMS_PATH}/${farmId}/meta`));
  if (!snap.exists()) throw new Error('Farm not found');
  activeFarmId.value = farmId;
  activeFarmMeta.value = snap.val() as FarmMeta;
  localStorage.setItem('herdit-farm', farmId);
}

export async function restoreLastFarm(): Promise<boolean> {
  const saved = localStorage.getItem('herdit-farm');
  if (!saved) return false;
  try {
    await selectFarm(saved);
    return true;
  } catch {
    localStorage.removeItem('herdit-farm');
    return false;
  }
}

export function clearFarm(): void {
  activeFarmId.value = null;
  activeFarmMeta.value = null;
  localStorage.removeItem('herdit-farm');
}

export async function createFarm(id: string, name: string, location: string, acreage: number, farmType: FarmType): Promise<void> {
  const uid = currentUser.value?.uid;
  if (!uid) throw new Error('Not authenticated');

  const existing = await get(dbRef(db, `${FARMS_PATH}/${id}/meta`));
  if (existing.exists()) throw new Error('Farm ID already exists');

  const meta: FarmMeta = {
    name,
    location,
    acreage,
    farmType,
    createdBy: uid,
    createdAt: Date.now(),
  };

  await set(dbRef(db, `${FARMS_PATH}/${id}/meta`), meta);
  await set(dbRef(db, `${FARMS_PATH}/${id}/access/${uid}`), true);
}

export async function grantAccess(farmId: string, uid: string): Promise<void> {
  await set(dbRef(db, `${FARMS_PATH}/${farmId}/access/${uid}`), true);
}

export async function revokeAccess(farmId: string, uid: string): Promise<void> {
  await remove(dbRef(db, `${FARMS_PATH}/${farmId}/access/${uid}`));
}

export async function getAccessList(farmId: string): Promise<string[]> {
  const snap = await get(dbRef(db, `${FARMS_PATH}/${farmId}/access`));
  if (!snap.exists()) return [];
  return Object.keys(snap.val() as Record<string, boolean>);
}

export async function deleteFarm(farmId: string): Promise<void> {
  await remove(dbRef(db, `${FARMS_PATH}/${farmId}`));
  if (activeFarmId.value === farmId) {
    clearFarm();
  }
}
