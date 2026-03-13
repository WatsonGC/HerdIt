<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="calendar_month" size="md" color="brown" class="q-mr-sm" />
        <h4 class="q-ma-none">Seasonal Calendar</h4>
        <q-space />
        <q-chip outline color="teal" v-if="farmMeta">{{ farmMeta.name }}</q-chip>
      </div>

      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="pets" color="brown" class="q-mr-sm" />Active Species ({{ year }})
          </div>
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-auto" v-for="sp in activeSpecies" :key="sp">
              <q-chip dense color="teal" text-color="white" class="text-capitalize">{{ sp }}</q-chip>
            </div>
            <div v-if="activeSpecies.length === 0" class="col-12 text-grey text-body2">
              No animals registered. Add animals to generate seasonal events.
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Month filter -->
      <q-tabs v-model="selectedMonth" dense active-color="primary" class="q-mb-md">
        <q-tab v-for="m in months" :key="m.value" :name="m.value" :label="m.label" />
      </q-tabs>

      <q-list separator bordered class="rounded-borders">
        <q-item v-for="(evt, idx) in filteredEvents" :key="idx">
          <q-item-section avatar>
            <q-icon :name="actionIcon(evt.action)" :color="actionColor(evt.action)" size="sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ evt.label }}</q-item-label>
            <q-item-label caption>{{ formatDate(evt.eventDate) }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-chip
              dense
              size="sm"
              :color="actionColor(evt.action)"
              text-color="white"
              class="text-capitalize"
            >
              {{ evt.action.replace(/-/g, ' ') }}
            </q-chip>
          </q-item-section>
        </q-item>
        <q-item v-if="filteredEvents.length === 0">
          <q-item-section class="text-grey text-center q-pa-md"
            >No seasonal events this month.</q-item-section
          >
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { generateSeasonalCalendar } from 'src/services/calendar-service';
import type { CalendarEvent } from 'src/services/calendar-service';
import { animals } from 'src/services/animal-service';
import { activeFarmMeta } from 'src/services/farm-service';
import type { Species } from 'src/models/livestock';

const months = [
  { label: 'Jan', value: 0 },
  { label: 'Feb', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Apr', value: 3 },
  { label: 'May', value: 4 },
  { label: 'Jun', value: 5 },
  { label: 'Jul', value: 6 },
  { label: 'Aug', value: 7 },
  { label: 'Sep', value: 8 },
  { label: 'Oct', value: 9 },
  { label: 'Nov', value: 10 },
  { label: 'Dec', value: 11 },
];

export default defineComponent({
  name: 'CalendarPage',

  setup() {
    const farmMeta = activeFarmMeta;
    const year = new Date().getFullYear();
    const selectedMonth = ref(new Date().getMonth());

    const activeSpecies = computed((): Species[] => {
      const speciesSet = new Set<Species>();
      for (const a of Object.values(animals.value)) {
        if (a.species) speciesSet.add(a.species);
      }
      return [...speciesSet];
    });

    const allEvents = computed((): CalendarEvent[] => {
      if (activeSpecies.value.length === 0) return [];
      return generateSeasonalCalendar(activeSpecies.value, year);
    });

    const filteredEvents = computed(() =>
      allEvents.value.filter((e) => e.eventDate.getMonth() === selectedMonth.value),
    );

    function formatDate(d: Date): string {
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    function actionIcon(action: string): string {
      return (
        {
          'breeding-season': 'favorite',
          'gestation-check': 'pregnant_woman',
          'expected-birth': 'child_care',
          'vaccination-due': 'vaccines',
          shearing: 'content_cut',
          deworming: 'medication',
        }[action] || 'event'
      );
    }

    function actionColor(action: string): string {
      return (
        {
          'breeding-season': 'pink',
          'gestation-check': 'purple',
          'expected-birth': 'deep-purple',
          'vaccination-due': 'blue',
          shearing: 'amber',
          deworming: 'teal',
        }[action] || 'grey'
      );
    }

    return {
      farmMeta,
      year,
      selectedMonth,
      months,
      activeSpecies,
      filteredEvents,
      formatDate,
      actionIcon,
      actionColor,
    };
  },
});
</script>
