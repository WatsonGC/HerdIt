import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { HealthRecord } from 'src/models/livestock';

export const healthRecords = ref<Record<string, HealthRecord>>({});

export async function loadHealthRecords(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/health`));
  healthRecords.value = snap.exists() ? (snap.val() as Record<string, HealthRecord>) : {};
}

export async function saveHealthRecord(id: string | null, record: HealthRecord): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/health/${id}`), record);
    healthRecords.value[id] = record;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/health`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, record);
    healthRecords.value[newId] = record;
    return newId;
  }
}

export async function deleteHealthRecord(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/health/${id}`));
  delete healthRecords.value[id];
}
