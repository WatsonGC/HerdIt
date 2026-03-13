<template>
  <q-page class="q-pa-md">
    <div style="max-width: 900px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="groups" size="md" color="purple" class="q-mr-sm" />
        <h4 class="q-ma-none">Species Compatibility Guide</h4>
      </div>

      <p class="text-subtitle1 text-grey q-mb-lg">
        Select a species to see which animals can safely share space and which to keep apart.
      </p>

      <q-select
        v-model="selectedSpecies"
        :options="SPECIES_OPTIONS"
        label="Choose a Species"
        outlined
        emit-value
        map-options
        class="q-mb-lg"
        style="max-width: 400px"
      />

      <div v-if="selectedSpecies && compatInfo" class="row q-col-gutter-md">
        <!-- Species Info Card -->
        <div class="col-12">
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h5 text-capitalize">{{ selectedSpecies }}</div>
              <div class="text-body2 q-mt-sm">{{ compatInfo.notes }}</div>
            </q-card-section>
            <q-card-section class="q-pt-none" v-if="speciesBreeds.length > 0">
              <div class="text-subtitle2 q-mb-sm">Breeds</div>
              <div class="row q-col-gutter-sm">
                <div class="col-6 col-md-4" v-for="[id, breed] in speciesBreeds" :key="id">
                  <q-card flat bordered>
                    <q-card-section class="q-pa-sm">
                      <div class="text-subtitle2">{{ breed.name }}</div>
                      <div class="text-caption text-grey text-capitalize">{{ breed.purpose }}</div>
                      <div class="text-caption">{{ breed.avgWeightLbs }} lbs &bull; {{ breed.temperament }}</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Compatible Species -->
        <div class="col-12 col-md-6">
          <q-card flat bordered style="border-color: #4caf50">
            <q-card-section>
              <div class="text-h6 text-positive">
                <q-icon name="check_circle" class="q-mr-sm" />Compatible Species
              </div>
            </q-card-section>
            <q-list separator>
              <q-item v-for="sp in compatInfo.compatible" :key="sp">
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-capitalize">{{ sp }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="compatInfo.compatible.length === 0">
                <q-item-section class="text-grey text-caption">No known compatible species.</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- Incompatible Species -->
        <div class="col-12 col-md-6">
          <q-card flat bordered style="border-color: #f44336">
            <q-card-section>
              <div class="text-h6 text-negative">
                <q-icon name="cancel" class="q-mr-sm" />Incompatible Species
              </div>
            </q-card-section>
            <q-list separator>
              <q-item v-for="sp in compatInfo.incompatible" :key="sp">
                <q-item-section avatar>
                  <q-icon name="cancel" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-capitalize">{{ sp }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="compatInfo.incompatible.length === 0">
                <q-item-section class="text-grey text-caption">No known incompatible species.</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>

      <!-- Full Compatibility Matrix -->
      <q-card flat bordered class="q-mt-lg">
        <q-card-section>
          <div class="text-h6">Quick Reference</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div v-for="[species, info] in allSpecies" :key="species" class="q-mb-sm">
            <span class="text-weight-bold text-capitalize">{{ species }}:</span>
            <q-chip
              v-for="c in info.compatible" :key="'g-' + c"
              dense size="sm" color="green-2" text-color="green-10"
              class="q-ml-xs text-capitalize"
            >{{ c }}</q-chip>
            <q-chip
              v-for="c in info.incompatible" :key="'r-' + c"
              dense size="sm" color="red-2" text-color="red-10"
              class="q-ml-xs text-capitalize"
            >{{ c }}</q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import {
  SPECIES_OPTIONS,
  SPECIES_COMPATIBILITY,
  DEFAULT_BREEDS,
} from 'src/models/livestock';
import type { Species } from 'src/models/livestock';

export default defineComponent({
  name: 'CompatibilityPage',

  setup() {
    const selectedSpecies = ref<Species | null>(null);

    const compatInfo = computed(() =>
      selectedSpecies.value ? SPECIES_COMPATIBILITY[selectedSpecies.value] : null,
    );

    const speciesBreeds = computed(() =>
      selectedSpecies.value
        ? Object.entries(DEFAULT_BREEDS).filter(([, b]) => b.species === selectedSpecies.value)
        : [],
    );

    const allSpecies = computed(() =>
      Object.entries(SPECIES_COMPATIBILITY) as [Species, typeof SPECIES_COMPATIBILITY[Species]][],
    );

    return {
      selectedSpecies,
      SPECIES_OPTIONS,
      compatInfo,
      speciesBreeds,
      allSpecies,
    };
  },
});
</script>
