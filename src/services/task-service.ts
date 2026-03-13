import { ref as dbRef, get, set, remove, push } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { FarmTask } from 'src/models/livestock';

export const tasks = ref<Record<string, FarmTask>>({});

export async function loadTasks(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/tasks`));
  tasks.value = snap.exists() ? (snap.val() as Record<string, FarmTask>) : {};
}

export async function saveTask(id: string | null, task: FarmTask): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/tasks/${id}`), task);
    tasks.value[id] = task;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/tasks`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, task);
    tasks.value[newId] = task;
    return newId;
  }
}

export async function completeTask(id: string): Promise<void> {
  const task = tasks.value[id];
  if (!task) return;
  task.completed = true;
  task.completedAt = Date.now();
  await set(dbRef(db, `${farmPath()}/tasks/${id}`), task);
}

export async function uncompleteTask(id: string): Promise<void> {
  const task = tasks.value[id];
  if (!task) return;
  task.completed = false;
  task.completedAt = null;
  await set(dbRef(db, `${farmPath()}/tasks/${id}`), task);
}

export async function deleteTask(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/tasks/${id}`));
  delete tasks.value[id];
}
