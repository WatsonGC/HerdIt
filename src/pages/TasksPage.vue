<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg q-col-gutter-sm">
        <div class="col-auto row items-center no-wrap">
          <q-icon name="checklist" size="md" color="orange" class="q-mr-sm" />
          <h4 class="q-ma-none">Tasks</h4>
        </div>
        <q-space />
        <div class="col-12 col-sm-auto row items-center justify-end q-gutter-sm">
          <q-btn-toggle
            v-model="filter"
            toggle-color="primary"
            :options="[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
              { label: 'All', value: 'all' },
            ]"
            dense flat
          />
          <q-btn color="green" icon="add" label="Add Task" @click="openDialog(null)" />
        </div>
      </div>

      <q-spinner v-if="loading" size="lg" color="primary" class="q-mt-lg block q-mx-auto" />

      <q-list v-if="!loading" separator bordered class="rounded-borders">
        <q-item v-for="(task, id) in filteredTasks" :key="id">
          <q-item-section avatar>
            <q-icon :name="taskIcons[task.type]" :color="taskColors[task.type]" />
          </q-item-section>
          <q-item-section>
            <q-item-label :class="{ 'text-strike text-grey': task.completed }">{{ task.title }}</q-item-label>
            <q-item-label caption>
              <q-chip dense size="sm" class="text-capitalize">{{ task.type.replace(/-/g, ' ') }}</q-chip>
              <q-chip dense size="sm" :color="priorityColor(task.priority)" text-color="white">{{ task.priority }}</q-chip>
              Due: {{ task.dueDate }}
              <span v-if="task.recurrence !== 'none'"> &bull; Repeats {{ task.recurrence.replace(/-/g, ' ') }}</span>
              <span v-if="task.enclosureId && enclosureMap[task.enclosureId]"> &bull; {{ enclosureMap[task.enclosureId] }}</span>
              <span v-if="task.animalId && animalMap[task.animalId]"> &bull; {{ animalMap[task.animalId] }}</span>
            </q-item-label>
            <q-item-label v-if="task.notes" caption class="text-grey">{{ task.notes }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn
                flat dense round
                :icon="task.completed ? 'undo' : 'check'"
                :color="task.completed ? 'grey' : 'positive'"
                @click="toggleComplete(id, task.completed)"
              />
              <q-btn flat dense round icon="edit" size="sm" @click="openDialog(id)" />
              <q-btn flat dense round icon="delete" size="sm" color="negative" @click="doDelete(id)" />
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="Object.keys(filteredTasks).length === 0">
          <q-item-section class="text-grey text-center q-pa-lg">
            {{ filter === 'completed' ? 'No completed tasks.' : 'No pending tasks. Great job!' }}
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <q-dialog v-model="showDialog">
      <q-card class="dialog-card">
        <q-card-section><div class="text-h6">{{ editId ? 'Edit Task' : 'New Task' }}</div></q-card-section>
        <q-card-section>
          <q-input v-model="form.title" label="Title" outlined dense class="q-mb-sm" />
          <q-select v-model="form.type" :options="taskTypeOptions" label="Type" outlined dense emit-value map-options class="q-mb-sm" />
          <q-select v-model="form.priority" :options="priorityOptions" label="Priority" outlined dense emit-value map-options class="q-mb-sm" />
          <q-input v-model="form.dueDate" label="Due Date" type="date" outlined dense class="q-mb-sm" />
          <q-select v-model="form.recurrence" :options="recurrenceOptions" label="Recurrence" outlined dense emit-value map-options class="q-mb-sm" />
          <q-select v-model="form.enclosureId" :options="enclosureOptions" label="Enclosure (optional)" outlined dense emit-value map-options clearable class="q-mb-sm" />
          <q-select v-model="form.animalId" :options="animalOptions" label="Animal (optional)" outlined dense emit-value map-options clearable class="q-mb-sm" />
          <q-input v-model="form.notes" label="Notes" type="textarea" outlined dense rows="2" />
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
import { tasks, loadTasks, saveTask, deleteTask, completeTask, uncompleteTask } from 'src/services/task-service';
import { enclosures, loadEnclosures } from 'src/services/enclosure-service';
import { animals, loadAnimals } from 'src/services/animal-service';
import { TASK_TYPE_ICONS, TASK_TYPE_COLORS } from 'src/models/livestock';
import type { FarmTask, TaskType, TaskPriority, TaskRecurrence } from 'src/models/livestock';

const taskTypeOptions = [
  { label: 'Feed', value: 'feed' }, { label: 'Water', value: 'water' },
  { label: 'Clean', value: 'clean' }, { label: 'Vet Check', value: 'vet-check' },
  { label: 'Vaccinate', value: 'vaccinate' }, { label: 'Deworm', value: 'deworm' },
  { label: 'Hoof Trim', value: 'hoof-trim' }, { label: 'Shear', value: 'shear' },
  { label: 'Breed', value: 'breed' }, { label: 'Move', value: 'move' },
  { label: 'Repair', value: 'repair' }, { label: 'General', value: 'general' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' },
];

const recurrenceOptions = [
  { label: 'None', value: 'none' }, { label: 'Daily', value: 'daily' },
  { label: 'Every 2 Days', value: 'every-2-days' }, { label: 'Every 3 Days', value: 'every-3-days' },
  { label: 'Weekly', value: 'weekly' }, { label: 'Biweekly', value: 'biweekly' },
  { label: 'Monthly', value: 'monthly' }, { label: 'Quarterly', value: 'quarterly' },
  { label: 'Annually', value: 'annually' },
];

function emptyForm(): FarmTask {
  return {
    title: '', type: 'general' as TaskType, priority: 'medium' as TaskPriority,
    enclosureId: '', animalId: '', dueDate: new Date().toISOString().split('T')[0] ?? '',
    completed: false, completedAt: null,
    recurrence: 'none' as TaskRecurrence, notes: '', createdAt: Date.now(),
  };
}

export default defineComponent({
  name: 'TasksPage',

  setup() {
    const $q = useQuasar();
    const loading = ref(true);
    const showDialog = ref(false);
    const editId = ref<string | null>(null);
    const filter = ref<'pending' | 'completed' | 'all'>('pending');
    const form = reactive<FarmTask>(emptyForm());

    onMounted(async () => {
      await Promise.all([loadTasks(), loadEnclosures(), loadAnimals()]);
      loading.value = false;
    });

    const enclosureOptions = computed(() =>
      Object.entries(enclosures.value).map(([k, v]) => ({ label: v.name, value: k }))
    );

    const animalOptions = computed(() =>
      Object.entries(animals.value).map(([k, a]) => ({ label: `${a.name} (${a.tagId})`, value: k }))
    );

    const enclosureMap = computed(() => {
      const map: Record<string, string> = {};
      for (const [k, v] of Object.entries(enclosures.value)) map[k] = v.name;
      return map;
    });

    const animalMap = computed(() => {
      const map: Record<string, string> = {};
      for (const [k, a] of Object.entries(animals.value)) map[k] = a.name;
      return map;
    });

    const filteredTasks = computed(() => {
      const entries = Object.entries(tasks.value)
        .filter(([, t]) => {
          if (filter.value === 'pending') return !t.completed;
          if (filter.value === 'completed') return t.completed;
          return true;
        })
        .sort(([, a], [, b]) => a.dueDate.localeCompare(b.dueDate));
      return Object.fromEntries(entries);
    });

    function priorityColor(p: string): string {
      return { low: 'blue-grey', medium: 'blue', high: 'orange', urgent: 'red' }[p] || 'grey';
    }

    function openDialog(id: string | null) {
      editId.value = id;
      if (id && tasks.value[id]) Object.assign(form, tasks.value[id]);
      else Object.assign(form, emptyForm());
      showDialog.value = true;
    }

    async function doSave() {
      if (!editId.value) form.createdAt = Date.now();
      await saveTask(editId.value, { ...form });
      showDialog.value = false;
      $q.notify({ type: 'positive', message: editId.value ? 'Task updated' : 'Task created' });
    }

    async function toggleComplete(id: string, isCompleted: boolean) {
      if (isCompleted) await uncompleteTask(id);
      else await completeTask(id);
    }

    function doDelete(id: string) {
      $q.dialog({ title: 'Delete Task?', cancel: true })
        .onOk(() => {
          void deleteTask(id).then(() => $q.notify({ type: 'info', message: 'Task deleted' }));
        });
    }

    return {
      tasks, loading, showDialog, editId, filter, form,
      taskTypeOptions, priorityOptions, recurrenceOptions,
      enclosureOptions, animalOptions, enclosureMap, animalMap,
      filteredTasks, taskIcons: TASK_TYPE_ICONS, taskColors: TASK_TYPE_COLORS,
      priorityColor, openDialog, doSave, toggleComplete, doDelete,
    };
  },
});
</script>
