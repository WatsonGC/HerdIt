import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { JournalEntry } from 'src/models/livestock';

export const journalEntries = ref<Record<string, JournalEntry>>({});

export async function loadJournal(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/journal`));
  journalEntries.value = snap.exists() ? (snap.val() as Record<string, JournalEntry>) : {};
}

export async function saveJournalEntry(id: string | null, entry: JournalEntry): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/journal/${id}`), entry);
    journalEntries.value[id] = entry;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/journal`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, entry);
    journalEntries.value[newId] = entry;
    return newId;
  }
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/journal/${id}`));
  delete journalEntries.value[id];
}
