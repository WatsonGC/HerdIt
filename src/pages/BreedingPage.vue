<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="favorite" size="md" color="pink" class="q-mr-sm" />
        <h4 class="q-ma-none">Breeding Records</h4>
        <q-space />
        <q-btn color="green" icon="add" label="New Record" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-table
        v-if="!loading"
        :rows="breedingRows"
        :columns="columns"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip dense size="sm" :color="BREEDING_STATUS_COLORS[props.row.status as BreedingStatus] ?? 'grey'" text-color="white">
              {{ props.row.status }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="edit" size="sm" @click="openDialog(props.row.id)" />
            <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(props.row.id)" />
          </q-td>
        </template>
      </q-table>

      <div v-if="!loading && breedingRows.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="favorite" size="xl" class="q-mb-md" /><br />
        No breeding records yet. Start tracking your breeding program!
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Breeding Record' : 'New Breeding Record' }}</div></q-card-section>
        <q-card-section>
          <q-select
            v-model="form.damId"
            :options="femaleAnimalOptions"
            label="Dam (Female)"
            outlined dense emit-value map-options
            class="q-mb-sm"
            @update:model-value="onDamSelected"
          />
          <q-input v-model="form.damName" label="Dam Name" outlined dense class="q-mb-sm" />
          <q-select
            v-model="form.sireId"
            :options="maleAnimalOptions"
            label="Sire (Male)"
            outlined dense emit-value map-options
            class="q-mb-sm"
            @update:model-value="onSireSelected"
          />
          <q-input v-model="form.sireName" label="Sire Name" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.breedingDate" label="Bred Date" type="date" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.expectedDueDate" label="Expected Due Date" type="date" outlined dense />
            </div>
          </div>
          <q-input v-model="form.actualDeliveryDate" label="Actual Delivery Date" type="date" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-select v-model="form.method" :options="methodOptions" label="Method" outlined dense emit-value map-options />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="form.status" :options="statusOptions" label="Status" outlined dense emit-value map-options />
            </div>
          </div>
          <q-input v-model.number="form.offspringCount" label="Offspring Count" type="number" outlined dense class="q-mb-sm" />
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense rows="2" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Save" @click="doSave" :disable="!form.damName.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { breedingRecords, loadBreedingRecords, saveBreedingRecord, deleteBreedingRecord } from 'src/services/breeding-service';
import { animals, loadAnimals } from 'src/services/animal-service';
import type { BreedingRecord, BreedingStatus, BreedingMethod } from 'src/models/livestock';
import { BREEDING_STATUS_COLORS } from 'src/models/livestock';

const methodOptions = [
  { label: 'Natural', value: 'natural' },
  { label: 'Artificial Insemination', value: 'artificial-insemination' },
  { label: 'Embryo Transfer', value: 'embryo-transfer' },
];

const statusOptions = [
  { label: 'Planned', value: 'planned' }, { label: 'Bred', value: 'bred' },
  { label: 'Confirmed Pregnant', value: 'confirmed-pregnant' },
  { label: 'Due Soon', value: 'due-soon' }, { label: 'Delivered', value: 'delivered' },
  { label: 'Failed', value: 'failed' }, { label: 'Cancelled', value: 'cancelled' },
];

const columns = [
  { name: 'damName', label: 'Dam', field: 'damName', align: 'left' as const, sortable: true },
  { name: 'sireName', label: 'Sire', field: 'sireName', align: 'left' as const, sortable: true },
  { name: 'breedingDate', label: 'Bred Date', field: 'breedingDate', align: 'left' as const, sortable: true },
  { name: 'expectedDueDate', label: 'Expected Due', field: 'expectedDueDate', align: 'left' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const, sortable: true },
  { name: 'method', label: 'Method', field: 'method', align: 'center' as const },
  { name: 'offspringCount', label: 'Offspring', field: 'offspringCount', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function emptyForm(): BreedingRecord {
  return {
    damId: '', damName: '', sireId: '', sireName: '',
    breedingDate: new Date().toISOString().split('T')[0] ?? '',
    expectedDueDate: '', actualDeliveryDate: '',
    method: 'natural' as BreedingMethod,
    status: 'planned' as BreedingStatus,
    offspringCount: 0, offspringIds: [],
    notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'BreedingPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<BreedingRecord>(emptyForm());

    onMounted(async () => {
      await Promise.all([loadBreedingRecords(), loadAnimals()]);
      loading.value = false;
    });

    const breedingRows = computed(() =>
      Object.entries(breedingRecords.value)
        .map(([id, r]) => ({ id, ...r }))
        .sort((a, b) => b.breedingDate.localeCompare(a.breedingDate))
    );

    const femaleAnimalOptions = computed(() =>
      Object.entries(animals.value)
        .filter(([, a]) => a.sex === 'female')
        .map(([id, a]) => ({ label: `${a.name} (${a.tagId})`, value: id }))
    );

    const maleAnimalOptions = computed(() =>
      Object.entries(animals.value)
        .filter(([, a]) => a.sex === 'male')
        .map(([id, a]) => ({ label: `${a.name} (${a.tagId})`, value: id }))
    );

    function onDamSelected(id: string) {
      const animal = animals.value[id];
      if (animal) form.damName = animal.name;
    }

    function onSireSelected(id: string) {
      const animal = animals.value[id];
      if (animal) form.sireName = animal.name;
    }

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && breedingRecords.value[id]) Object.assign(form, breedingRecords.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveBreedingRecord(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: 'Breeding record saved!' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Breeding Record?', cancel: true })
        .onOk(() => {
          void deleteBreedingRecord(id).then(() => $q.notify({ type: 'info', message: 'Record deleted' }));
        });
    }

    return {
      loading, showDialog, editId, form,
      columns, methodOptions, statusOptions,
      breedingRows, femaleAnimalOptions, maleAnimalOptions,
      BREEDING_STATUS_COLORS, BreedingStatus: undefined as unknown as BreedingStatus,
      onDamSelected, onSireSelected, openDialog, doSave, doDelete,
    };
  },
});
</script>
