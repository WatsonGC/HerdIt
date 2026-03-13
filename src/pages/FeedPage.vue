<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg q-col-gutter-sm">
        <div class="col-auto row items-center no-wrap">
          <q-icon name="restaurant" size="md" color="orange" class="q-mr-sm" />
          <h4 class="q-ma-none">Feed Inventory</h4>
        </div>
        <q-space />
        <div class="col-auto">
          <q-btn color="green" icon="add" label="Add Feed" @click="openDialog(null)" />
        </div>
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-table
        v-if="!loading"
        :rows="feedRows"
        :columns="columns"
        class="feed-table"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-expires="props">
          <q-td :props="props">
            <q-badge v-if="props.row.isExpired" color="red">Expired</q-badge>
            <q-badge v-else-if="props.row.expiringSoon" color="orange">Expiring Soon</q-badge>
            <span v-else>{{ props.row.expirationDate || '—' }}</span>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="edit" size="sm" @click="openDialog(props.row.id)" />
            <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(props.row.id)" />
          </q-td>
        </template>
      </q-table>

      <div v-if="!loading && feedRows.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="restaurant" size="xl" class="q-mb-md" /><br />
        No feed in inventory. Start tracking your feed supplies!
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Feed' : 'Add Feed' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="form.name" label="Feed Name" outlined dense class="q-mb-sm" />
          <q-select v-model="form.type" :options="typeOptions" label="Type" outlined dense emit-value map-options class="q-mb-sm" />
          <q-input v-model="form.brand" label="Brand" outlined dense class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.quantity" label="Quantity" type="number" outlined dense />
            </div>
            <div class="col-12 col-sm-4">
              <q-select v-model="form.unit" :options="unitOptions" label="Unit" outlined dense emit-value map-options />
            </div>
            <div class="col-12 col-sm-4">
              <q-input v-model.number="form.costPerUnit" label="Cost/Unit ($)" type="number" step="0.01" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.purchaseDate" label="Purchase Date" type="date" outlined dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input v-model="form.expirationDate" label="Expiration Date" type="date" outlined dense />
            </div>
          </div>
          <q-select
            v-model="form.targetSpecies"
            :options="SPECIES_OPTIONS"
            label="Target Species"
            outlined dense
            multiple use-chips
            emit-value map-options
            class="q-mb-sm"
          />
          <q-input v-model.number="form.proteinPercent" label="Protein %" type="number" step="0.1" outlined dense class="q-mb-sm" />
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
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { feeds, loadFeeds, saveFeed, deleteFeed } from 'src/services/feed-service';
import type { FeedEntry, FeedType, FeedUnit, Species } from 'src/models/livestock';
import { SPECIES_OPTIONS } from 'src/models/livestock';

const typeOptions = [
  { label: 'Hay', value: 'hay' }, { label: 'Grain', value: 'grain' },
  { label: 'Pellets', value: 'pellets' }, { label: 'Silage', value: 'silage' },
  { label: 'Pasture', value: 'pasture' }, { label: 'Supplement', value: 'supplement' },
  { label: 'Mineral', value: 'mineral' }, { label: 'Salt Block', value: 'salt-block' },
  { label: 'Scratch', value: 'scratch' }, { label: 'Mash', value: 'mash' },
  { label: 'Other', value: 'other' },
];

const unitOptions = [
  { label: 'Pounds', value: 'lbs' }, { label: 'Kilograms', value: 'kg' },
  { label: 'Bales', value: 'bales' }, { label: 'Bags', value: 'bags' },
  { label: 'Tons', value: 'tons' }, { label: 'Bushels', value: 'bushels' },
];

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const, sortable: true },
  { name: 'type', label: 'Type', field: 'type', align: 'center' as const, sortable: true },
  { name: 'brand', label: 'Brand', field: 'brand', align: 'left' as const },
  { name: 'quantity', label: 'Qty', field: (row: FeedEntry & { id: string }) => `${row.quantity} ${row.unit}`, align: 'center' as const, sortable: true },
  { name: 'costPerUnit', label: 'Cost/Unit', field: (row: FeedEntry & { id: string }) => row.costPerUnit ? `$${row.costPerUnit.toFixed(2)}` : '—', align: 'center' as const, sortable: true },
  { name: 'targetSpecies', label: 'Species', field: (row: FeedEntry & { id: string }) => row.targetSpecies?.join(', ') || '—', align: 'left' as const },
  { name: 'proteinPercent', label: 'Protein%', field: (row: FeedEntry & { id: string }) => row.proteinPercent ? `${row.proteinPercent}%` : '—', align: 'center' as const, sortable: true },
  { name: 'expires', label: 'Expires', field: 'expirationDate', align: 'center' as const, sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function emptyForm(): FeedEntry {
  return {
    name: '', type: 'hay' as FeedType,
    brand: '', quantity: 0, unit: 'lbs' as FeedUnit,
    costPerUnit: 0, purchaseDate: new Date().toISOString().split('T')[0] ?? '',
    expirationDate: '', targetSpecies: [] as Species[],
    proteinPercent: 0, notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'FeedPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<FeedEntry>(emptyForm());

    onMounted(async () => { await loadFeeds(); loading.value = false; });

    const today = new Date().toISOString().split('T')[0] ?? '';
    const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';

    const feedRows = computed(() =>
      Object.entries(feeds.value).map(([id, f]) => ({
        id, ...f,
        isExpired: f.expirationDate && f.expirationDate < today,
        expiringSoon: f.expirationDate && f.expirationDate >= today && f.expirationDate <= thirtyDaysOut,
      }))
    );

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && feeds.value[id]) Object.assign(form, feeds.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveFeed(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: 'Feed saved!' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Feed?', cancel: true })
        .onOk(() => {
          void deleteFeed(id).then(() => $q.notify({ type: 'info', message: 'Feed removed' }));
        });
    }

    return {
      feeds, loading, showDialog, editId, form,
      columns, typeOptions, unitOptions, feedRows,
      SPECIES_OPTIONS,
      openDialog, doSave, doDelete,
    };
  },
});
</script>

<style lang="scss">
@media (max-width: 599px) {
  .feed-table .q-table__container {
    overflow-x: auto;
  }

  .feed-table table {
    min-width: 700px;
  }
}
</style>
