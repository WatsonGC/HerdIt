import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { AnimalEntry, AnimalStatus } from 'src/models/livestock';

export const animals = ref<Record<string, AnimalEntry>>({});

export async function loadAnimals(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/animals`));
  animals.value = snap.exists() ? (snap.val() as Record<string, AnimalEntry>) : {};
}

export async function saveAnimal(id: string | null, animal: AnimalEntry): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/animals/${id}`), animal);
    animals.value[id] = animal;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/animals`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, animal);
    animals.value[newId] = animal;
    return newId;
  }
}

export async function deleteAnimal(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/animals/${id}`));
  delete animals.value[id];
}

export async function updateAnimalStatus(id: string, status: AnimalStatus): Promise<void> {
  const animal = animals.value[id];
  if (!animal) return;
  animal.status = status;
  await set(dbRef(db, `${farmPath()}/animals/${id}/status`), status);
}
