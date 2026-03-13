<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="map" size="md" color="green" class="q-mr-sm" />
        <h4 class="q-ma-none">Farm Maps</h4>
      </div>

      <p class="text-subtitle1 text-grey q-mb-lg">
        Interactive mapping powered by ArcGIS. Draw pasture boundaries, mark water sources,
        feeders, gates, and shelters.
      </p>

      <q-card flat bordered class="q-mb-lg">
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="map" size="80px" color="grey-5" />
          <div class="text-h6 text-grey q-mt-md">Map functionality coming soon</div>
          <p class="text-body2 text-grey q-mt-sm" style="max-width: 500px; margin: 0 auto">
            This will include pasture boundary drawing, animal location tracking,
            water source mapping, and terrain analysis.
          </p>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-6" v-for="feature in features" :key="feature.title">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-icon :name="feature.icon" :color="feature.color" size="sm" class="q-mr-sm" />
                <div class="text-h6">{{ feature.title }}</div>
              </div>
              <div class="text-body2 text-grey">{{ feature.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const features = [
  {
    icon: 'fence',
    color: 'brown',
    title: 'Pasture Boundaries',
    description:
      'Draw and manage pasture boundaries, paddocks, and grazing zones. Track acreage and rotation schedules.',
  },
  {
    icon: 'water_drop',
    color: 'blue',
    title: 'Water Sources',
    description:
      'Mark wells, troughs, ponds, streams, and other water sources. Monitor access and placement.',
  },
  {
    icon: 'construction',
    color: 'grey',
    title: 'Infrastructure',
    description:
      'Map barns, shelters, feeders, gates, handling facilities, and fencing. Track maintenance needs.',
  },
  {
    icon: 'pets',
    color: 'green',
    title: 'Animal Tracking',
    description:
      'View animal locations by enclosure, track movement history, and plan rotational grazing patterns.',
  },
];

export default defineComponent({
  name: 'MapsPage',

  setup() {
    return { features };
  },
});
</script>
