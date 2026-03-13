<template>
  <q-page class="q-pa-md">
    <div class="column items-center" style="max-width: 600px; margin: 0 auto">
      <h4 class="q-mb-md">My Farms</h4>
      <p class="text-subtitle1 text-grey q-mb-lg text-center">Choose a farm to manage or create a new one.</p>

      <q-card
        v-for="f in availableFarms"
        :key="f.id"
        flat bordered
        class="q-mb-md full-width cursor-pointer farm-card"
        @click="enterFarm(f.id)"
      >
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">{{ f.meta.name }}</div>
            <div class="text-caption text-grey">
              {{ farmTypeLabel(f.meta.farmType) }} &bull; {{ f.meta.location || 'No location set' }} &bull; {{ f.meta.acreage }} acres
            </div>
          </div>
          <q-space />
          <q-icon name="chevron_right" size="md" color="grey" />
        </q-card-section>
      </q-card>

      <div v-if="availableFarms.length === 0 && !loading" class="text-grey text-center q-pa-lg">
        <q-icon name="fa-solid fa-cow" size="md" class="q-mb-sm" /><br />
        No farms yet. Create one below!
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg" />

      <!-- Create Farm -->
      <q-separator class="q-my-lg full-width" />
      <div class="text-h6 q-mb-md">Create New Farm</div>
      <q-input
        v-model="newFarmId"
        label="Farm ID (no spaces)"
        dense outlined
        class="full-width q-mb-sm"
        :rules="[v => /^[a-zA-Z0-9_-]+$/.test(v) || 'Letters, numbers, hyphens, underscores only']"
      />
      <q-input v-model="newFarmName" label="Farm Name" dense outlined class="full-width q-mb-sm" />
      <q-select
        v-model="newFarmType"
        :options="farmTypeOptions"
        label="Farm Type"
        dense outlined emit-value map-options
        class="full-width q-mb-sm"
      />
      <q-input v-model="newFarmLocation" label="Location (city, etc.)" dense outlined class="full-width q-mb-sm" />
      <q-input
        v-model.number="newFarmAcreage"
        label="Acreage"
        type="number"
        dense outlined
        class="full-width q-mb-sm"
      />
      <q-btn
        color="brown"
        label="Create Farm"
        icon="add"
        :disable="!newFarmId.trim() || !newFarmName.trim() || !newFarmType"
        @click="doCreateFarm"
        :loading="creating"
        class="q-mb-md"
      />

      <!-- Admin: Manage Access -->
      <template v-if="isAdmin">
        <q-separator class="q-my-lg full-width" />
        <div class="text-h6 q-mb-md">Admin: Manage Access</div>
        <q-select
          v-model="manageFarmId"
          :options="allFarmOptions"
          label="Select Farm"
          dense outlined emit-value map-options
          class="full-width q-mb-sm"
        />
        <div v-if="manageFarmId">
          <div class="text-subtitle2 q-mb-sm">Current Access:</div>
          <q-chip
            v-for="uid in accessList"
            :key="uid"
            removable
            @remove="doRevokeAccess(uid)"
            color="primary"
            text-color="white"
            class="q-mb-xs"
          >
            {{ userEmailMap[uid] || uid }}
          </q-chip>
          <div v-if="accessList.length === 0" class="text-grey text-caption q-mb-sm">No users have access</div>
          <div class="row q-gutter-sm q-mt-sm">
            <q-input v-model="grantEmail" label="User email or UID" dense outlined class="col" />
            <q-btn dense color="brown" label="Grant" @click="doGrantAccess" :disable="!grantEmail.trim()" />
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  availableFarms,
  loadAvailableFarms,
  selectFarm,
  createFarm,
  grantAccess,
  revokeAccess,
  getAccessList,
} from 'src/services/farm-service';
import { isAdmin } from 'src/services/admin-service';
import { getAllUsers, findUidByEmail } from 'src/services/user-directory-service';
import { FARM_TYPE_OPTIONS } from 'src/models/livestock';
import type { FarmType } from 'src/models/livestock';

export default defineComponent({
  name: 'FarmsPage',

  setup() {
    const router = useRouter();
    const $q = useQuasar();
    const loading = ref(true);
    const creating = ref(false);
    const newFarmId = ref('');
    const newFarmName = ref('');
    const newFarmType = ref<FarmType | ''>('');
    const newFarmLocation = ref('');
    const newFarmAcreage = ref<number>(0);
    const manageFarmId = ref<string | null>(null);
    const accessList = ref<string[]>([]);
    const grantEmail = ref('');
    const userEmailMap = ref<Record<string, string>>({});
    const allFarmOptions = ref<{ label: string; value: string }[]>([]);

    onMounted(async () => {
      await loadAvailableFarms();
      loading.value = false;
      updateFarmOptions();
      const users = await getAllUsers();
      const map: Record<string, string> = {};
      for (const [uid, entry] of Object.entries(users)) {
        map[uid] = entry.email || entry.displayName || uid;
      }
      userEmailMap.value = map;
    });

    function updateFarmOptions() {
      allFarmOptions.value = availableFarms.value.map((f) => ({
        label: f.meta.name,
        value: f.id,
      }));
    }

    watch(manageFarmId, async (id) => {
      accessList.value = id ? await getAccessList(id) : [];
    });

    function farmTypeLabel(type: string): string {
      const opt = FARM_TYPE_OPTIONS.find((o) => o.value === type);
      return opt ? opt.label : type;
    }

    async function enterFarm(id: string) {
      await selectFarm(id);
      await router.push('/');
    }

    async function doCreateFarm() {
      creating.value = true;
      try {
        await createFarm(
          newFarmId.value.trim(),
          newFarmName.value.trim(),
          newFarmLocation.value.trim(),
          newFarmAcreage.value,
          newFarmType.value as FarmType,
        );
        $q.notify({ type: 'positive', message: `Farm "${newFarmName.value}" created!` });
        newFarmId.value = '';
        newFarmName.value = '';
        newFarmType.value = '';
        newFarmLocation.value = '';
        newFarmAcreage.value = 0;
        await loadAvailableFarms();
        updateFarmOptions();
      } catch (e: unknown) {
        $q.notify({ type: 'negative', message: (e as Error).message });
      } finally {
        creating.value = false;
      }
    }

    async function doGrantAccess() {
      if (!manageFarmId.value || !grantEmail.value.trim()) return;
      const input = grantEmail.value.trim();
      let uid = await findUidByEmail(input);
      if (!uid) {
        const users = await getAllUsers();
        if (users[input]) uid = input;
      }
      if (!uid) {
        $q.notify({ type: 'negative', message: 'No user found. They must log in at least once first.' });
        return;
      }
      await grantAccess(manageFarmId.value, uid);
      userEmailMap.value[uid] = input;
      grantEmail.value = '';
      accessList.value = await getAccessList(manageFarmId.value);
      $q.notify({ type: 'positive', message: 'Access granted' });
    }

    async function doRevokeAccess(uid: string) {
      if (!manageFarmId.value) return;
      await revokeAccess(manageFarmId.value, uid);
      accessList.value = await getAccessList(manageFarmId.value);
      $q.notify({ type: 'info', message: 'Access revoked' });
    }

    return {
      availableFarms, loading, creating, isAdmin,
      newFarmId, newFarmName, newFarmType, newFarmLocation, newFarmAcreage,
      manageFarmId, allFarmOptions, accessList, grantEmail, userEmailMap,
      farmTypeOptions: FARM_TYPE_OPTIONS,
      farmTypeLabel, enterFarm, doCreateFarm, doGrantAccess, doRevokeAccess,
    };
  },
});
</script>
