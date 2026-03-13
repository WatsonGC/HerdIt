import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db, currentUser } from 'src/boot/firebase';
import type { FavoriteLocation } from 'src/models/livestock';

export const favoriteLocations = ref<Record<string, FavoriteLocation>>({});

function favoritesPath(): string {
  const uid = currentUser.value?.uid;
  if (!uid) throw new Error('Not authenticated');
  return `herdit/favorites/${uid}`;
}

export async function loadFavoriteLocations(): Promise<void> {
  const snap = await get(dbRef(db, favoritesPath()));
  favoriteLocations.value = snap.exists() ? (snap.val() as Record<string, FavoriteLocation>) : {};
}

export async function saveFavoriteLocation(location: FavoriteLocation): Promise<string> {
  const newRef = push(dbRef(db, favoritesPath()));
  const newId = newRef.key ?? crypto.randomUUID();
  await set(newRef, location);
  favoriteLocations.value[newId] = location;
  return newId;
}

export async function deleteFavoriteLocation(id: string): Promise<void> {
  await remove(dbRef(db, `${favoritesPath()}/${id}`));
  delete favoriteLocations.value[id];
}
