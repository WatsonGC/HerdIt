import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { BreedingRecord, BreedingStatus } from 'src/models/livestock';

export const breedingRecords = ref<Record<string, BreedingRecord>>({});

export async function loadBreedingRecords(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/breeding`));
  breedingRecords.value = snap.exists() ? (snap.val() as Record<string, BreedingRecord>) : {};
}

export async function saveBreedingRecord(id: string | null, record: BreedingRecord): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/breeding/${id}`), record);
    breedingRecords.value[id] = record;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/breeding`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, record);
    breedingRecords.value[newId] = record;
    return newId;
  }
}

export async function updateBreedingStatus(id: string, status: BreedingStatus): Promise<void> {
  const record = breedingRecords.value[id];
  if (!record) return;
  record.status = status;
  await set(dbRef(db, `${farmPath()}/breeding/${id}/status`), status);
}

export async function deleteBreedingRecord(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/breeding/${id}`));
  delete breedingRecords.value[id];
}
