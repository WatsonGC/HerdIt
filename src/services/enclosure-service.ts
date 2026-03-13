import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { Enclosure } from 'src/models/livestock';

export const enclosures = ref<Record<string, Enclosure>>({});

export async function loadEnclosures(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/enclosures`));
  enclosures.value = snap.exists() ? (snap.val() as Record<string, Enclosure>) : {};
}

export async function saveEnclosure(id: string | null, enclosure: Enclosure): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/enclosures/${id}`), enclosure);
    enclosures.value[id] = enclosure;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/enclosures`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, enclosure);
    enclosures.value[newId] = enclosure;
    return newId;
  }
}

export async function deleteEnclosure(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/enclosures/${id}`));
  delete enclosures.value[id];
}
