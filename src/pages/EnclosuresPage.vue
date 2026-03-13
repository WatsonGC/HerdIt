<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="fence" size="md" color="brown" class="q-mr-sm" />
        <h4 class="q-ma-none">Enclosures</h4>
        <q-space />
        <q-btn color="green" icon="add" label="Add Enclosure" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <div class="row q-col-gutter-md">
        <div v-for="(enc, id) in enclosures" :key="id" class="col-12 col-sm-6">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center">
                <div class="text-h6">{{ enc.name }}</div>
                <q-space />
                <q-btn flat dense round icon="edit" size="sm" @click="openDialog(id)" />
                <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(id)" />
              </div>
              <div class="row q-gutter-sm q-mt-sm">
                <q-chip dense size="sm" icon="category" class="text-capitalize">{{ enc.type }}</q-chip>
                <q-chip dense size="sm" icon="straighten">{{ enc.acreage }} acres</q-chip>
                <q-chip dense size="sm" icon="groups">Cap: {{ enc.capacity }}</q-chip>
                <q-chip dense size="sm" icon="security" class="text-capitalize">{{ enc.fencingType.replace(/-/g, ' ') }}</q-chip>
                <q-chip dense size="sm" icon="landscape" class="text-capitalize">{{ enc.terrain }}</q-chip>
                <q-chip v-if="enc.waterSource" dense size="sm" icon="water_drop" color="blue" text-color="white">Water</q-chip>
                <q-chip v-if="enc.shelter" dense size="sm" icon="house" color="brown" text-color="white">Shelter</q-chip>
              </div>
              <div v-if="enc.notes" class="text-caption text-grey q-mt-sm">{{ enc.notes }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-if="!loading && Object.keys(enclosures).length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="fence" size="xl" class="q-mb-md" /><br />
        No enclosures yet. Add your first enclosure!
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ editId ? 'Edit Enclosure' : 'New Enclosure' }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="form.name" label="Enclosure Name" outlined dense class="q-mb-sm" />
          <q-select v-model="form.type" :options="enclosureTypeOptions" label="Type" outlined dense emit-value map-options class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model.number="form.acreage" label="Acreage" type="number" step="0.1" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model.number="form.capacity" label="Capacity (head)" type="number" outlined dense />
            </div>
          </div>
          <q-select v-model="form.fencingType" :options="fencingTypeOptions" label="Fencing Type" outlined dense emit-value map-options class="q-mb-sm" />
          <q-select v-model="form.terrain" :options="terrainTypeOptions" label="Terrain" outlined dense emit-value map-options class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-toggle v-model="form.waterSource" label="Water Source" />
            </div>
            <div class="col-6">
              <q-toggle v-model="form.shelter" label="Shelter" />
            </div>
          </div>
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense rows="2" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Save" @click="doSave" :disable="!form.name.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { enclosures, loadEnclosures, saveEnclosure, deleteEnclosure } from 'src/services/enclosure-service';
import type { Enclosure, EnclosureType, FencingType, TerrainType } from 'src/models/livestock';

const enclosureTypeOptions = [
  { label: 'Pasture', value: 'pasture' },
  { label: 'Pen', value: 'pen' },
  { label: 'Barn', value: 'barn' },
  { label: 'Coop', value: 'coop' },
  { label: 'Stable', value: 'stable' },
  { label: 'Paddock', value: 'paddock' },
  { label: 'Feedlot', value: 'feedlot' },
  { label: 'Run', value: 'run' },
];

const fencingTypeOptions = [
  { label: 'Barbed Wire', value: 'barbed-wire' },
  { label: 'Electric', value: 'electric' },
  { label: 'Board', value: 'board' },
  { label: 'Chain Link', value: 'chain-link' },
  { label: 'Woven Wire', value: 'woven-wire' },
  { label: 'Panel', value: 'panel' },
  { label: 'None', value: 'none' },
];

const terrainTypeOptions = [
  { label: 'Flat', value: 'flat' },
  { label: 'Hilly', value: 'hilly' },
  { label: 'Wooded', value: 'wooded' },
  { label: 'Mixed', value: 'mixed' },
  { label: 'Wetland', value: 'wetland' },
];

function emptyForm(): Enclosure {
  return {
    name: '', type: 'pasture' as EnclosureType, acreage: 1, capacity: 10,
    fencingType: 'board' as FencingType, terrain: 'flat' as TerrainType,
    waterSource: false, shelter: false, notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'EnclosuresPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<Enclosure>(emptyForm());

    onMounted(async () => { await loadEnclosures(); loading.value = false; });

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && enclosures.value[id]) {
        Object.assign(form, enclosures.value[id]);
      } else {
        Object.assign(form, emptyForm());
      }
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveEnclosure(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: editId.value ? 'Enclosure updated' : 'Enclosure created' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Enclosure?', message: 'This cannot be undone.', cancel: true })
        .onOk(() => {
          void deleteEnclosure(id).then(() => $q.notify({ type: 'info', message: 'Enclosure deleted' }));
        });
    }

    return {
      enclosures, loading, showDialog, editId, form,
      enclosureTypeOptions, fencingTypeOptions, terrainTypeOptions,
      openDialog, doSave, doDelete,
    };
  },
});
</script>
