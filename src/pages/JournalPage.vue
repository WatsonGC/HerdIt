<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="auto_stories" size="md" color="amber" class="q-mr-sm" />
        <h4 class="q-ma-none">Farm Journal</h4>
        <q-space />
        <q-btn color="green" icon="add" label="New Entry" @click="openDialog(null)" />
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-timeline v-if="!loading && sortedEntries.length > 0" color="green">
        <q-timeline-entry
          v-for="[id, entry] in sortedEntries"
          :key="id"
          :title="entry.title"
          :subtitle="entry.date"
          icon="agriculture"
        >
          <div>{{ entry.text }}</div>
          <div v-if="entry.weather || entry.tempHigh !== null" class="q-mt-sm">
            <q-chip v-if="entry.weather" dense size="sm" icon="cloud">{{ entry.weather }}</q-chip>
            <q-chip v-if="entry.tempHigh !== null" dense size="sm" icon="thermostat" color="red-4" text-color="white">
              H: {{ entry.tempHigh }}&deg;F
            </q-chip>
            <q-chip v-if="entry.tempLow !== null" dense size="sm" icon="thermostat" color="blue-4" text-color="white">
              L: {{ entry.tempLow }}&deg;F
            </q-chip>
          </div>
          <div v-if="entry.tags?.length" class="q-mt-xs">
            <q-chip v-for="tag in entry.tags" :key="tag" dense size="sm" outline color="green">{{ tag }}</q-chip>
          </div>
          <div class="q-mt-sm">
            <q-btn flat dense size="sm" icon="edit" @click="openDialog(id)" />
            <q-btn flat dense size="sm" icon="delete" color="negative" @click="doDelete(id)" />
          </div>
        </q-timeline-entry>
      </q-timeline>

      <div v-if="!loading && sortedEntries.length === 0" class="text-grey text-center q-pa-xl">
        <q-icon name="auto_stories" size="xl" class="q-mb-md" /><br />
        Your farm journal is empty. Start documenting your farm journey!
      </div>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Entry' : 'New Journal Entry' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="form.date" label="Date" type="date" outlined dense class="q-mb-sm" />
          <q-input v-model="form.title" label="Title" outlined dense class="q-mb-sm" />
          <q-input v-model="form.text" label="What happened on the farm today?" type="textarea" outlined dense rows="4" class="q-mb-sm" />
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-12 col-sm">
              <q-input v-model="form.weather" label="Weather" outlined dense />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="form.tempHigh" label="High &deg;F" type="number" outlined dense />
            </div>
            <div class="col-6 col-sm-3">
              <q-input v-model.number="form.tempLow" label="Low &deg;F" type="number" outlined dense />
            </div>
          </div>
          <q-select
            v-model="form.tags"
            label="Tags"
            outlined dense
            multiple use-input use-chips
            new-value-mode="add-unique"
            class="q-mb-sm"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="green" label="Save" @click="doSave" :disable="!form.title.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { journalEntries, loadJournal, saveJournalEntry, deleteJournalEntry } from 'src/services/journal-service';
import type { JournalEntry } from 'src/models/livestock';

function emptyForm(): JournalEntry {
  return {
    date: new Date().toISOString().split('T')[0] ?? '',
    title: '', text: '', weather: '',
    tempHigh: null, tempLow: null,
    tags: [], createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'JournalPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const form = reactive<JournalEntry>(emptyForm());

    onMounted(async () => { await loadJournal(); loading.value = false; });

    const sortedEntries = computed(() =>
      Object.entries(journalEntries.value).sort(([, a], [, b]) => b.date.localeCompare(a.date))
    );

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && journalEntries.value[id]) Object.assign(form, journalEntries.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveJournalEntry(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: 'Journal entry saved' });
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Entry?', cancel: true })
        .onOk(() => {
          void deleteJournalEntry(id).then(() => $q.notify({ type: 'info', message: 'Entry deleted' }));
        });
    }

    return { loading, showDialog, editId, form, sortedEntries, openDialog, doSave, doDelete };
  },
});
</script>
