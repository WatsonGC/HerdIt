import { ref as dbRef, get, set, remove, push, update } from 'firebase/database';
import { ref } from 'vue';
import { db } from 'src/boot/firebase';
import { farmPath } from './farm-service';
import type { GeoFence, MapPoint } from 'src/models/livestock';

export const geofences = ref<Record<string, GeoFence>>({});
export const mapPoints = ref<Record<string, MapPoint>>({});

export async function loadGeofences(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/geofences`));
  geofences.value = snap.exists() ? (snap.val() as Record<string, GeoFence>) : {};
}

export async function saveGeofence(id: string | null, fence: GeoFence): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/geofences/${id}`), fence);
    geofences.value[id] = fence;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/geofences`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, fence);
    geofences.value[newId] = fence;
    return newId;
  }
}

export async function updateGeofence(id: string, updates: Partial<GeoFence>): Promise<void> {
  await update(dbRef(db, `${farmPath()}/geofences/${id}`), updates);
  if (geofences.value[id]) {
    Object.assign(geofences.value[id], updates);
  }
}

export async function deleteGeofence(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/geofences/${id}`));
  delete geofences.value[id];
}

export async function loadMapPoints(): Promise<void> {
  const snap = await get(dbRef(db, `${farmPath()}/mapPoints`));
  mapPoints.value = snap.exists() ? (snap.val() as Record<string, MapPoint>) : {};
}

export async function saveMapPoint(id: string | null, point: MapPoint): Promise<string> {
  if (id) {
    await set(dbRef(db, `${farmPath()}/mapPoints/${id}`), point);
    mapPoints.value[id] = point;
    return id;
  } else {
    const newRef = push(dbRef(db, `${farmPath()}/mapPoints`));
    const newId = newRef.key ?? crypto.randomUUID();
    await set(newRef, point);
    mapPoints.value[newId] = point;
    return newId;
  }
}

export async function updateMapPoint(id: string, updates: Partial<MapPoint>): Promise<void> {
  await update(dbRef(db, `${farmPath()}/mapPoints/${id}`), updates);
  if (mapPoints.value[id]) {
    Object.assign(mapPoints.value[id], updates);
  }
}

export async function deleteMapPoint(id: string): Promise<void> {
  await remove(dbRef(db, `${farmPath()}/mapPoints/${id}`));
  delete mapPoints.value[id];
}
