import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { FeedEntry } from 'src/models/livestock';

export const feeds = ref<Record<string, FeedEntry>>({});

export async function loadFeeds(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/feeds`));
  feeds.value = snap.exists() ? (snap.val() as Record<string, FeedEntry>) : {};
}

export async function saveFeed(id: string | null, entry: FeedEntry): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/feeds/${id}`), entry);
    feeds.value[id] = entry;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/feeds`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, entry);
    feeds.value[newId] = entry;
    return newId;
  }
}

export async function deleteFeed(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/feeds/${id}`));
  delete feeds.value[id];
}
