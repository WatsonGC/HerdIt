<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="dashboard" size="md" color="brown" class="q-mr-sm" />
        <h4 class="q-ma-none">{{ farmMeta?.name || 'Dashboard' }}</h4>
        <q-space />
        <q-chip v-if="farmMeta" outline color="brown">
          {{ farmTypeLabel(farmMeta.farmType) }} &bull; {{ farmMeta.location || 'Unknown' }}
        </q-chip>
      </div>

      <!-- Quick Stats -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-md">
            <q-icon name="fence" size="md" color="brown" />
            <div class="text-h5 q-mt-sm">{{ enclosureCount }}</div>
            <div class="text-caption text-grey">Enclosures</div>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-md">
            <q-icon name="fa-solid fa-cow" size="md" color="deep-orange" />
            <div class="text-h5 q-mt-sm">{{ activeAnimalCount }}</div>
            <div class="text-caption text-grey">Active Animals</div>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-md">
            <q-icon name="checklist" size="md" color="orange" />
            <div class="text-h5 q-mt-sm">{{ pendingTaskCount }}</div>
            <div class="text-caption text-grey">Pending Tasks</div>
          </q-card>
        </div>
        <div class="col-6 col-md-3">
          <q-card flat bordered class="text-center q-pa-md">
            <q-icon name="inventory_2" size="md" color="teal" />
            <div class="text-h5 q-mt-sm">{{ productionCount }}</div>
            <div class="text-caption text-grey">Production Entries</div>
          </q-card>
        </div>
      </div>

      <!-- Current Weather (from Open-Meteo) -->
      <q-card flat bordered class="q-mb-lg" v-if="weatherData">
        <q-card-section>
          <div class="row items-center">
            <div class="text-h6"><q-icon name="wb_sunny" color="orange" class="q-mr-sm" />Current Weather</div>
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md items-center">
            <div class="col-auto text-center">
              <q-icon :name="weatherIcon(weatherData.current.weatherCode)" size="lg" :color="weatherData.current.isDay ? 'amber' : 'blue-grey'" />
              <div class="text-h5">{{ weatherData.current.temperature }}&deg;F</div>
              <div class="text-caption">{{ weatherData.current.weatherLabel }}</div>
            </div>
            <div class="col">
              <div class="row q-col-gutter-xs">
                <div v-for="day in weatherData.daily.slice(0, 5)" :key="day.date" class="col text-center">
                  <div class="text-caption text-grey">{{ formatDayName(day.date) }}</div>
                  <q-icon :name="weatherIcon(day.weatherCode)" size="xs" color="grey-7" />
                  <div class="text-caption">
                    <span class="text-red">{{ day.tempMax }}&deg;</span> /
                    <span class="text-blue">{{ day.tempMin }}&deg;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Upcoming Tasks -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6"><q-icon name="checklist" color="orange" class="q-mr-sm" />Upcoming Tasks</div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="(task, id) in upcomingTasks" :key="id">
            <q-item-section avatar>
              <q-icon :name="taskIcons[task.type]" :color="taskColors[task.type]" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ task.title }}</q-item-label>
              <q-item-label caption>Due: {{ task.dueDate }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense round icon="check" color="positive" @click="doCompleteTask(id)" />
            </q-item-section>
          </q-item>
          <q-item v-if="Object.keys(upcomingTasks).length === 0">
            <q-item-section class="text-grey text-center">No pending tasks. Nice work!</q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- Recent Health Alerts -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6"><q-icon name="medical_services" color="red" class="q-mr-sm" />Recent Health Alerts</div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="(record, id) in unresolvedHealthRecords" :key="id">
            <q-item-section avatar>
              <q-icon :name="healthEventIcons[record.eventType]" :color="healthSeverityColors[record.severity]" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ record.animalName }} &mdash; {{ record.eventType }}</q-item-label>
              <q-item-label caption>{{ record.date }} &bull; {{ record.severity }} &bull; {{ record.description }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="Object.keys(unresolvedHealthRecords).length === 0">
            <q-item-section class="text-grey text-center">No unresolved health alerts. Herd is healthy!</q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- Upcoming Breeding Due Dates -->
      <q-card flat bordered class="q-mb-lg">
        <q-card-section>
          <div class="text-h6"><q-icon name="favorite" color="pink" class="q-mr-sm" />Upcoming Breeding Due Dates</div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="(record, id) in upcomingBreedings" :key="id">
            <q-item-section avatar>
              <q-icon name="child_care" :color="breedingStatusColors[record.status]" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ record.damName }} x {{ record.sireName }}</q-item-label>
              <q-item-label caption>Due: {{ record.expectedDueDate }} &bull; {{ record.status }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-if="Object.keys(upcomingBreedings).length === 0">
            <q-item-section class="text-grey text-center">No upcoming breeding due dates.</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { activeFarmMeta } from 'src/services/farm-service';
import { loadEnclosures, enclosures } from 'src/services/enclosure-service';
import { loadAnimals, animals } from 'src/services/animal-service';
import { loadTasks, tasks, completeTask } from 'src/services/task-service';
import { loadProductions, productions } from 'src/services/production-service';
import { loadHealthRecords, healthRecords } from 'src/services/health-service';
import { loadBreedingRecords, breedingRecords } from 'src/services/breeding-service';
import { fetchWeather, WMO_ICONS } from 'src/services/weather-service';
import type { WeatherData } from 'src/services/weather-service';
import {
  TASK_TYPE_ICONS,
  TASK_TYPE_COLORS,
  HEALTH_EVENT_ICONS,
  HEALTH_SEVERITY_COLORS,
  BREEDING_STATUS_COLORS,
  FARM_TYPE_OPTIONS,
} from 'src/models/livestock';

export default defineComponent({
  name: 'DashboardPage',

  setup() {
    const loading = ref(true);
    const farmMeta = activeFarmMeta;
    const weatherData = ref<WeatherData | null>(null);

    onMounted(async () => {
      await Promise.all([
        loadEnclosures(),
        loadAnimals(),
        loadTasks(),
        loadProductions(),
        loadHealthRecords(),
        loadBreedingRecords(),
      ]);
      loading.value = false;

      // Try to fetch weather using farm location
      if (farmMeta.value?.location) {
        const zipMatch = farmMeta.value.location.match(/\b(\d{5})\b/);
        if (zipMatch) {
          try {
            // Use a simple geocoding approach — fetch weather by ZIP coordinates
            // For now we attempt Open-Meteo with a geocode lookup
            const geoResp = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farmMeta.value.location)}&count=1&language=en&format=json`
            );
            const geoData = await geoResp.json();
            if (geoData.results && geoData.results.length > 0) {
              const { latitude, longitude } = geoData.results[0];
              weatherData.value = await fetchWeather(latitude, longitude);
            }
          } catch { /* weather widget is optional */ }
        } else {
          // Try geocoding by location name
          try {
            const geoResp = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farmMeta.value.location)}&count=1&language=en&format=json`
            );
            const geoData = await geoResp.json();
            if (geoData.results && geoData.results.length > 0) {
              const { latitude, longitude } = geoData.results[0];
              weatherData.value = await fetchWeather(latitude, longitude);
            }
          } catch { /* weather widget is optional */ }
        }
      }
    });

    const enclosureCount = computed(() => Object.keys(enclosures.value).length);
    const activeAnimalCount = computed(() =>
      Object.values(animals.value).filter(a => !['sold', 'deceased'].includes(a.status)).length
    );
    const pendingTaskCount = computed(() =>
      Object.values(tasks.value).filter(t => !t.completed).length
    );
    const productionCount = computed(() => Object.keys(productions.value).length);

    const upcomingTasks = computed(() => {
      const today = new Date().toISOString().split('T')[0] ?? '';
      const entries = Object.entries(tasks.value)
        .filter(([, t]) => !t.completed && t.dueDate >= today)
        .sort(([, a], [, b]) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5);
      return Object.fromEntries(entries);
    });

    const unresolvedHealthRecords = computed(() => {
      const entries = Object.entries(healthRecords.value)
        .filter(([, r]) => !r.resolved)
        .sort(([, a], [, b]) => b.date.localeCompare(a.date));
      return Object.fromEntries(entries);
    });

    const upcomingBreedings = computed(() => {
      const today = new Date().toISOString().split('T')[0] ?? '';
      const entries = Object.entries(breedingRecords.value)
        .filter(([, r]) => ['bred', 'confirmed-pregnant', 'due-soon'].includes(r.status) && r.expectedDueDate >= today)
        .sort(([, a], [, b]) => a.expectedDueDate.localeCompare(b.expectedDueDate));
      return Object.fromEntries(entries);
    });

    function farmTypeLabel(type: string): string {
      const opt = FARM_TYPE_OPTIONS.find((o) => o.value === type);
      return opt ? opt.label : type;
    }

    async function doCompleteTask(id: string) {
      await completeTask(id);
    }

    function weatherIcon(code: number): string {
      return WMO_ICONS[code] ?? 'cloud';
    }

    function formatDayName(dateStr: string): string {
      const d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }

    return {
      farmMeta, loading,
      enclosureCount, activeAnimalCount, pendingTaskCount, productionCount,
      upcomingTasks, unresolvedHealthRecords, upcomingBreedings,
      taskIcons: TASK_TYPE_ICONS,
      taskColors: TASK_TYPE_COLORS,
      healthEventIcons: HEALTH_EVENT_ICONS,
      healthSeverityColors: HEALTH_SEVERITY_COLORS,
      breedingStatusColors: BREEDING_STATUS_COLORS,
      farmTypeLabel, doCompleteTask,
      weatherData, weatherIcon, formatDayName,
    };
  },
});
</script>
