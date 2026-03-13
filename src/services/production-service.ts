import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { ProductionEntry } from 'src/models/livestock';

export const productions = ref<Record<string, ProductionEntry>>({});

export async function loadProductions(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/productions`));
  productions.value = snap.exists() ? (snap.val() as Record<string, ProductionEntry>) : {};
}

export async function saveProduction(id: string | null, entry: ProductionEntry): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/productions/${id}`), entry);
    productions.value[id] = entry;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/productions`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, entry);
    productions.value[newId] = entry;
    return newId;
  }
}

export async function deleteProduction(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/productions/${id}`));
  delete productions.value[id];
}
