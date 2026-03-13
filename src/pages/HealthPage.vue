<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="medical_services" size="md" color="red" class="q-mr-sm" />
        <h4 class="q-ma-none">Health Records</h4>
        <q-space />
        <q-btn color="green" icon="add" label="New Record" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-table
        v-if="!loading"
        :rows="healthRows"
        :columns="columns"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-eventType="props">
          <q-td :props="props">
            <q-icon :name="HEALTH_EVENT_ICONS[props.row.eventType as HealthEventType] ?? 'note_add'" size="xs" class="q-mr-xs" />
            {{ props.row.eventType }}
          </q-td>
        </template>
        <template #body-cell-severity="props">
          <q-td :props="props">
            <q-chip dense size="sm" :color="HEALTH_SEVERITY_COLORS[props.row.severity as HealthSeverity] ?? 'grey'" text-color="white">
              {{ props.row.severity }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-resolved="props">
          <q-td :props="props">
            <q-icon :name="props.row.resolved ? 'check_circle' : 'pending'" :color="props.row.resolved ? 'green' : 'orange'" size="sm" />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="edit" size="sm" @click="openDialog(props.row.id)" />
            <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(props.row.id)" />
          </q-td>
        </template>
      </q-table>

      <div v-if="!loading && healthRows.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="medical_services" size="xl" class="q-mb-md" /><br />
        No health records yet. Start tracking your animals' health!
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Health Record' : 'New Health Record' }}</div></q-card-section>
        <q-card-section>
          <q-select
            v-model="form.animalId"
            :options="animalOptions"
            label="Animal"
            outlined dense emit-value map-options
            class="q-mb-sm"
            @update:model-value="onAnimalSelected"
          />
          <q-input v-model="form.animalName" label="Animal Name" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-select v-model="form.eventType" :options="eventTypeOptions" label="Event Type" outlined dense emit-value map-options />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.date" label="Date" type="date" outlined dense />
            </div>
          </div>
          <q-select v-model="form.severity" :options="severityOptions" label="Severity" outlined dense emit-value map-options class="q-mb-sm" />
          <q-input v-model="form.description" label="Description" type="textarea" outlined dense rows="2" class="q-mb-sm" />
          <q-input v-model="form.treatment" label="Treatment" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.medication" label="Medication" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.dosage" label="Dosage" outlined dense />
            </div>
          </div>
          <q-input v-model="form.veterinarian" label="Veterinarian" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.followUpDate" label="Follow-Up Date" type="date" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.cost" label="Cost ($)" type="number" step="0.01" outlined dense />
            </div>
          </div>
          <q-toggle v-model="form.resolved" label="Resolved" class="q-mb-sm" />
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense rows="2" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Save" @click="doSave" :disable="!form.animalName.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { healthRecords, loadHealthRecords, saveHealthRecord, deleteHealthRecord } from 'src/services/health-service';
import { animals, loadAnimals } from 'src/services/animal-service';
import type { HealthRecord, HealthEventType, HealthSeverity } from 'src/models/livestock';
import { HEALTH_EVENT_ICONS, HEALTH_SEVERITY_COLORS } from 'src/models/livestock';

const eventTypeOptions = [
  { label: 'Vaccination', value: 'vaccination' }, { label: 'Deworming', value: 'deworming' },
  { label: 'Illness', value: 'illness' }, { label: 'Injury', value: 'injury' },
  { label: 'Surgery', value: 'surgery' }, { label: 'Dental', value: 'dental' },
  { label: 'Hoof Care', value: 'hoof-care' }, { label: 'Routine Checkup', value: 'routine-checkup' },
  { label: 'Medication', value: 'medication' }, { label: 'Weight Check', value: 'weight-check' },
  { label: 'Other', value: 'other' },
];

const severityOptions = [
  { label: 'Routine', value: 'routine' }, { label: 'Minor', value: 'minor' },
  { label: 'Moderate', value: 'moderate' }, { label: 'Serious', value: 'serious' },
  { label: 'Critical', value: 'critical' },
];

const columns = [
  { name: 'animalName', label: 'Animal', field: 'animalName', align: 'left' as const, sortable: true },
  { name: 'eventType', label: 'Event Type', field: 'eventType', align: 'left' as const, sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'severity', label: 'Severity', field: 'severity', align: 'center' as const, sortable: true },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'treatment', label: 'Treatment', field: 'treatment', align: 'left' as const },
  { name: 'veterinarian', label: 'Vet', field: 'veterinarian', align: 'left' as const },
  { name: 'resolved', label: 'Resolved', field: 'resolved', align: 'center' as const, sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function emptyForm(): HealthRecord {
  return {
    animalId: '', animalName: '',
    eventType: 'routine-checkup' as HealthEventType,
    date: new Date().toISOString().split('T')[0] ?? '',
    severity: 'routine' as HealthSeverity,
    description: '', treatment: '', medication: '', dosage: '',
    veterinarian: '', followUpDate: '', cost: 0,
    resolved: false, notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'HealthPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<HealthRecord>(emptyForm());

    onMounted(async () => {
      await Promise.all([loadHealthRecords(), loadAnimals()]);
      loading.value = false;
    });

    const healthRows = computed(() =>
      Object.entries(healthRecords.value)
        .map(([id, r]) => ({ id, ...r }))
        .sort((a, b) => b.date.localeCompare(a.date))
    );

    const animalOptions = computed(() =>
      Object.entries(animals.value)
        .map(([id, a]) => ({ label: `${a.name} (${a.tagId})`, value: id }))
    );

    function onAnimalSelected(id: string) {
      const animal = animals.value[id];
      if (animal) form.animalName = animal.name;
    }

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && healthRecords.value[id]) Object.assign(form, healthRecords.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveHealthRecord(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: 'Health record saved!' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Health Record?', cancel: true })
        .onOk(() => {
          void deleteHealthRecord(id).then(() => $q.notify({ type: 'info', message: 'Record deleted' }));
        });
    }

    return {
      loading, showDialog, editId, form,
      columns, eventTypeOptions, severityOptions,
      healthRows, animalOptions,
      HEALTH_EVENT_ICONS, HEALTH_SEVERITY_COLORS,
      HealthEventType: undefined as unknown as HealthEventType,
      HealthSeverity: undefined as unknown as HealthSeverity,
      onAnimalSelected, openDialog, doSave, doDelete,
    };
  },
});
</script>
