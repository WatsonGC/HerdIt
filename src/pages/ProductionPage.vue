<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="inventory" size="md" color="teal" class="q-mr-sm" />
        <h4 class="q-ma-none">Production Log</h4>
        <q-space />
        <q-btn color="green" icon="add" label="Log Production" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <!-- Summary Stats -->
      <div v-if="!loading && Object.keys(productions).length > 0" class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-sm">
            <div class="text-h5">{{ totalEntries }}</div>
            <div class="text-caption text-grey">Total Entries</div>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-sm">
            <div class="text-h5">{{ uniqueAnimals }}</div>
            <div class="text-caption text-grey">Unique Animals</div>
          </q-card>
        </div>
      </div>

      <q-table
        v-if="!loading"
        :rows="productionRows"
        :columns="columns"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-quality="props">
          <q-td :props="props">
            <q-rating :model-value="props.row.quality" size="xs" color="amber" readonly />
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="edit" size="sm" @click="openDialog(props.row.id)" />
            <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(props.row.id)" />
          </q-td>
        </template>
      </q-table>

      <div v-if="!loading && productionRows.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="inventory" size="xl" class="q-mb-md" /><br />
        No production logged yet. Start tracking your farm output!
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Production' : 'Log Production' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="form.animalName" label="Animal Name" outlined dense class="q-mb-sm" />
          <q-select v-model="form.type" :options="typeOptions" label="Production Type" outlined dense emit-value map-options class="q-mb-sm" />
          <q-input v-model="form.date" label="Date" type="date" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model.number="form.quantity" label="Quantity" type="number" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-select v-model="form.unit" :options="unitOptions" label="Unit" outlined dense emit-value map-options />
            </div>
          </div>
          <div class="q-mb-sm">
            <div class="text-caption text-grey q-mb-xs">Quality</div>
            <q-rating v-model="form.quality" size="md" color="amber" />
          </div>
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
import { productions, loadProductions, saveProduction, deleteProduction } from 'src/services/production-service';
import type { ProductionEntry, ProductionType, ProductionUnit } from 'src/models/livestock';

const typeOptions = [
  { label: 'Milk', value: 'milk' }, { label: 'Eggs', value: 'eggs' },
  { label: 'Wool', value: 'wool' }, { label: 'Meat', value: 'meat' },
  { label: 'Honey', value: 'honey' }, { label: 'Fiber', value: 'fiber' },
  { label: 'Hide', value: 'hide' }, { label: 'Manure', value: 'manure' },
  { label: 'Other', value: 'other' },
];

const unitOptions = [
  { label: 'Gallons', value: 'gallons' }, { label: 'Liters', value: 'liters' },
  { label: 'Pounds', value: 'lbs' }, { label: 'Kilograms', value: 'kg' },
  { label: 'Dozen', value: 'dozen' }, { label: 'Count', value: 'count' },
  { label: 'Bales', value: 'bales' }, { label: 'Bushels', value: 'bushels' },
];

const columns = [
  { name: 'animalName', label: 'Animal', field: 'animalName', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'center' as const, sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'left' as const, sortable: true },
  { name: 'amount', label: 'Amount', field: 'amountStr', align: 'center' as const, sortable: true },
  { name: 'quality', label: 'Quality', field: 'quality', align: 'center' as const, sortable: true },
  { name: 'notes', label: 'Notes', field: 'notes', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function emptyForm(): ProductionEntry {
  return {
    animalId: '', animalName: '', type: 'milk' as ProductionType,
    date: new Date().toISOString().split('T')[0] ?? '',
    quantity: 0, unit: 'gallons' as ProductionUnit,
    quality: 3 as 1 | 2 | 3 | 4 | 5, notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'ProductionPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<ProductionEntry>(emptyForm());

    onMounted(async () => { await loadProductions(); loading.value = false; });

    const productionRows = computed(() =>
      Object.entries(productions.value)
        .map(([id, p]) => ({ id, ...p, amountStr: `${p.quantity} ${p.unit}` }))
        .sort((a, b) => b.date.localeCompare(a.date))
    );

    const totalEntries = computed(() => Object.keys(productions.value).length);
    const uniqueAnimals = computed(() => new Set(Object.values(productions.value).map(p => p.animalName)).size);

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && productions.value[id]) Object.assign(form, productions.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveProduction(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: 'Production logged!' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Production?', cancel: true })
        .onOk(() => {
          void deleteProduction(id).then(() => $q.notify({ type: 'info', message: 'Production deleted' }));
        });
    }

    return {
      productions, loading, showDialog, editId, form,
      columns, typeOptions, unitOptions, productionRows,
      totalEntries, uniqueAnimals,
      openDialog, doSave, doDelete,
    };
  },
});
</script>
