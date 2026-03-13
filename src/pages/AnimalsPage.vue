<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="pets" size="md" color="brown" class="q-mr-sm" />
        <h4 class="q-ma-none">Animals</h4>
        <q-space />
        <q-btn color="green" icon="add" label="Add Animal" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-table
        v-if="!loading"
        :rows="animalRows"
        :columns="columns"
        row-key="id"
        flat bordered
        :pagination="{ rowsPerPage: 20 }"
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              dense size="sm"
              :color="statusColors[props.row.status as AnimalStatus]"
              text-color="white"
              class="text-capitalize"
            >
              {{ props.row.status.replace(/-/g, ' ') }}
            </q-chip>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn-dropdown flat dense size="sm" icon="more_vert" no-icon-animation>
              <q-list dense>
                <q-item clickable v-close-popup @click="openDialog(props.row.id)">
                  <q-item-section>Edit</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section>
                    <q-select
                      v-model="props.row.status"
                      :options="statusOptions"
                      label="Status"
                      dense borderless emit-value map-options
                      @update:model-value="doUpdateStatus(props.row.id, $event)"
                    />
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup @click="doDelete(props.row.id)">
                  <q-item-section class="text-negative">Delete</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
        </template>
      </q-table>

      <div v-if="!loading && animalRows.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="pets" size="xl" class="q-mb-md" /><br />
        No animals yet. Start adding animals to your herd!
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Animal' : 'Add Animal' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="form.name" label="Name" outlined dense class="q-mb-sm" />
          <q-input v-model="form.tagId" label="Tag ID" outlined dense class="q-mb-sm" />
          <q-select
            v-model="form.species"
            :options="speciesOptions"
            label="Species"
            outlined dense emit-value map-options
            class="q-mb-sm"
            @update:model-value="onSpeciesChange"
          />
          <q-select
            v-model="form.breedId"
            :options="breedOptions"
            label="Breed"
            outlined dense emit-value map-options
            class="q-mb-sm"
          />
          <q-select
            v-model="form.sex"
            :options="sexOptions"
            label="Sex"
            outlined dense emit-value map-options
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-input v-model="form.dateOfBirth" label="Date of Birth" type="date" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="form.acquisitionDate" label="Acquisition Date" type="date" outlined dense />
            </div>
          </div>
          <q-select
            v-model="form.acquisitionMethod"
            :options="acquisitionOptions"
            label="Acquisition Method"
            outlined dense emit-value map-options
            class="q-mb-sm"
          />
          <q-select
            v-model="form.enclosureId"
            :options="enclosureOptions"
            label="Enclosure"
            outlined dense emit-value map-options clearable
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-6">
              <q-select
                v-model="form.sireId"
                :options="sireOptions"
                label="Sire (Father)"
                outlined dense emit-value map-options clearable
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="form.damId"
                :options="damOptions"
                label="Dam (Mother)"
                outlined dense emit-value map-options clearable
              />
            </div>
          </div>
          <q-select
            v-model="form.status"
            :options="statusOptions"
            label="Status"
            outlined dense emit-value map-options
            class="q-mb-sm"
          />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <q-input v-model.number="form.weightLbs" label="Weight (lbs)" type="number" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model="form.color" label="Color" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model="form.markings" label="Markings" outlined dense />
            </div>
          </div>
          <q-input v-model="form.registrationNumber" label="Registration Number" outlined dense class="q-mb-sm" />
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
import { animals, loadAnimals, saveAnimal, deleteAnimal, updateAnimalStatus } from 'src/services/animal-service';
import { enclosures, loadEnclosures } from 'src/services/enclosure-service';
import { SPECIES_OPTIONS, DEFAULT_BREEDS, ANIMAL_STATUS_COLORS } from 'src/models/livestock';
import type { AnimalEntry, AnimalStatus, AnimalSex, Species } from 'src/models/livestock';

const statusOptions = [
  'active', 'pregnant', 'nursing', 'growing', 'producing',
  'dry', 'quarantined', 'for-sale', 'sold', 'deceased',
].map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '), value: s }));

const sexOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Castrated', value: 'castrated' },
  { label: 'Unknown', value: 'unknown' },
];

const acquisitionOptions = [
  { label: 'Born on Farm', value: 'born-on-farm' },
  { label: 'Purchased', value: 'purchased' },
  { label: 'Rescued', value: 'rescued' },
  { label: 'Traded', value: 'traded' },
];

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const, sortable: true },
  { name: 'tagId', label: 'Tag ID', field: 'tagId', align: 'left' as const, sortable: true },
  { name: 'species', label: 'Species', field: 'speciesLabel', align: 'left' as const, sortable: true },
  { name: 'breed', label: 'Breed', field: 'breedName', align: 'left' as const, sortable: true },
  { name: 'sex', label: 'Sex', field: 'sex', align: 'center' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const, sortable: true },
  { name: 'enclosure', label: 'Enclosure', field: 'enclosureName', align: 'left' as const, sortable: true },
  { name: 'weight', label: 'Weight', field: 'weightLbs', align: 'right' as const, sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

function emptyForm(): AnimalEntry {
  return {
    name: '', tagId: '', species: 'cattle' as Species, breedId: '', sex: 'unknown' as AnimalSex,
    dateOfBirth: '', acquisitionDate: new Date().toISOString().split('T')[0] ?? '',
    acquisitionMethod: 'purchased', enclosureId: '', sireId: '', damId: '',
    status: 'active' as AnimalStatus, weightLbs: 0, color: '', markings: '',
    registrationNumber: '', notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'AnimalsPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<AnimalEntry>(emptyForm());

    onMounted(async () => {
      await Promise.all([loadAnimals(), loadEnclosures()]);
      loading.value = false;
    });

    const speciesOptions = SPECIES_OPTIONS;

    const breedOptions = computed(() =>
      Object.entries(DEFAULT_BREEDS)
        .filter(([, b]) => b.species === form.species)
        .map(([k, b]) => ({ label: b.name, value: k }))
    );

    const enclosureOptions = computed(() =>
      Object.entries(enclosures.value).map(([k, v]) => ({ label: v.name, value: k }))
    );

    const sireOptions = computed(() =>
      Object.entries(animals.value)
        .filter(([, a]) => a.sex === 'male')
        .map(([k, a]) => ({ label: `${a.name} (${a.tagId})`, value: k }))
    );

    const damOptions = computed(() =>
      Object.entries(animals.value)
        .filter(([, a]) => a.sex === 'female')
        .map(([k, a]) => ({ label: `${a.name} (${a.tagId})`, value: k }))
    );

    const animalRows = computed(() =>
      Object.entries(animals.value).map(([id, a]) => ({
        id,
        ...a,
        speciesLabel: SPECIES_OPTIONS.find(s => s.value === a.species)?.label || a.species,
        breedName: DEFAULT_BREEDS[a.breedId]?.name || a.breedId || '\u2014',
        enclosureName: enclosures.value[a.enclosureId]?.name || '\u2014',
      }))
    );

    function onSpeciesChange() {
      form.breedId = '';
    }

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && animals.value[id]) Object.assign(form, animals.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveAnimal(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: editId.value ? 'Animal updated' : 'Animal added' });
    }

    async function doUpdateStatus(id: string, status: AnimalStatus) {
      await updateAnimalStatus(id, status);
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Remove Animal?', message: 'This cannot be undone.', cancel: true })
        .onOk(() => {
          void deleteAnimal(id).then(() => $q.notify({ type: 'info', message: 'Animal removed' }));
        });
    }

    return {
      animals, loading, showDialog, editId, form,
      columns, statusOptions, sexOptions, acquisitionOptions,
      speciesOptions, breedOptions, enclosureOptions, sireOptions, damOptions,
      animalRows, statusColors: ANIMAL_STATUS_COLORS,
      onSpeciesChange, openDialog, doSave, doUpdateStatus, doDelete,
    };
  },
});
</script>
