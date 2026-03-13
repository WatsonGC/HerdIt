<template>
  <q-page class="maps-page">
    <!-- Toolbar -->
    <div class="maps-toolbar row items-center q-pa-xs q-gutter-x-sm">
      <q-btn-dropdown flat dense label="Basemap" icon="map" color="primary">
        <q-list dense style="min-width: 200px">
          <q-item
            v-for="bm in basemaps"
            :key="bm.id"
            clickable
            v-close-popup
            @click="changeBasemap(bm.id)"
            :active="currentBasemap === bm.id"
            active-class="text-primary text-weight-bold"
          >
            <q-item-section>{{ bm.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn-dropdown flat dense label="Layers" icon="layers" color="primary">
        <q-list dense style="min-width: 280px; max-height: 400px; overflow-y: auto">
          <template v-for="category in layerCategories" :key="category">
            <q-item-label header class="text-weight-bold text-caption q-pb-none">
              {{ category }}
            </q-item-label>
            <q-item
              v-for="layer in getLayersByCategory(category)"
              :key="layer.id"
              tag="label"
              dense
            >
              <q-item-section side>
                <q-checkbox
                  :model-value="isLayerActive(layer.id)"
                  @update:model-value="toggleLayer(layer.id)"
                  dense
                  size="sm"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ layer.title }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>

          <q-separator />
          <q-item-label header class="text-weight-bold text-caption q-pb-none">
            My Farm Features
          </q-item-label>
          <q-item tag="label" dense v-for="fl in featureLayerToggles" :key="fl.id">
            <q-item-section side>
              <q-checkbox
                :model-value="fl.visible"
                @update:model-value="toggleFeatureLayer(fl.id)"
                dense
                size="sm"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <q-icon :name="fl.icon" :color="fl.color" class="q-mr-xs" size="xs" />
                {{ fl.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn-dropdown flat dense label="Draw" icon="edit" color="primary" :disable="!hasFarm">
        <q-list dense style="min-width: 200px">
          <q-item-label header class="text-weight-bold text-caption q-pb-none">Lines &amp; Areas</q-item-label>
          <q-item clickable v-close-popup @click="startDraw('fence')">
            <q-item-section avatar><q-icon name="fence" color="brown" /></q-item-section>
            <q-item-section>Draw Fence (line)</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('pasture')">
            <q-item-section avatar><q-icon name="grass" color="green" /></q-item-section>
            <q-item-section>Draw Pasture</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('treatment')">
            <q-item-section avatar><q-icon name="science" color="purple" /></q-item-section>
            <q-item-section>Draw Treatment Area</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('outbuilding')">
            <q-item-section avatar><q-icon name="home_work" color="brown" /></q-item-section>
            <q-item-section>Draw Outbuilding</q-item-section>
          </q-item>

          <q-separator />
          <q-item-label header class="text-weight-bold text-caption q-pb-none">Points</q-item-label>
          <q-item clickable v-close-popup @click="startDraw('water-source')">
            <q-item-section avatar><q-icon name="water_drop" color="cyan" /></q-item-section>
            <q-item-section>Place Water Source</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('feeder')">
            <q-item-section avatar><q-icon name="restaurant" color="orange" /></q-item-section>
            <q-item-section>Place Feeder</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('mineral-station')">
            <q-item-section avatar><q-icon name="science" color="teal" /></q-item-section>
            <q-item-section>Place Mineral Station</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('hazard')">
            <q-item-section avatar><q-icon name="warning" color="red" /></q-item-section>
            <q-item-section>Place Hazard</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('gate')">
            <q-item-section avatar><q-icon name="door_front" color="grey" /></q-item-section>
            <q-item-section>Place Gate</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('shelter')">
            <q-item-section avatar><q-icon name="night_shelter" color="brown" /></q-item-section>
            <q-item-section>Place Shelter</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('animal')">
            <q-item-section avatar><q-icon name="pets" color="green" /></q-item-section>
            <q-item-section>Place Animal Marker</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="startDraw('feature')">
            <q-item-section avatar><q-icon name="place" color="blue" /></q-item-section>
            <q-item-section>Place Feature</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn-dropdown flat dense label="Tools" icon="straighten" color="primary">
        <q-list dense style="min-width: 200px">
          <q-item clickable v-close-popup @click="activateMeasureArea">
            <q-item-section avatar><q-icon name="square_foot" /></q-item-section>
            <q-item-section>Measure Area</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="activateMeasureDistance">
            <q-item-section avatar><q-icon name="straighten" /></q-item-section>
            <q-item-section>Measure Distance</q-item-section>
          </q-item>
          <q-separator v-if="measureWidgetActive" />
          <q-item v-if="measureWidgetActive" clickable v-close-popup @click="clearMeasurement">
            <q-item-section avatar><q-icon name="close" color="red" /></q-item-section>
            <q-item-section>Clear Measurement</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

      <q-btn-dropdown flat dense label="Favorites" icon="star" color="primary">
        <q-list dense style="min-width: 250px">
          <q-item clickable v-close-popup @click="openSaveFavoriteDialog">
            <q-item-section avatar><q-icon name="add_location" color="positive" /></q-item-section>
            <q-item-section>Save Current View</q-item-section>
          </q-item>
          <template v-if="sortedFavorites.length > 0">
            <q-separator />
            <q-item
              v-for="fav in sortedFavorites"
              :key="fav.id"
              clickable
              v-close-popup
              @click="goToFavorite(fav)"
            >
              <q-item-section avatar><q-icon name="place" color="amber" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ fav.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round dense size="sm" icon="delete" color="negative" @click.stop="removeFavorite(fav.id)" />
              </q-item-section>
            </q-item>
          </template>
          <template v-else>
            <q-separator />
            <q-item dense>
              <q-item-section class="text-caption text-grey">No favorites saved yet</q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-btn-dropdown>

      <q-btn
        flat dense
        :label="legendVisible ? 'Hide Legend' : 'Legend'"
        icon="info" color="primary"
        @click="toggleLegend"
        :class="{ 'text-weight-bold': legendVisible }"
      />

      <q-space />

      <q-chip v-if="drawMode" dense removable @remove="cancelDraw" color="primary" text-color="white" icon="edit">
        Drawing: {{ drawModeLabel }}
      </q-chip>
      <q-chip v-if="movingFeature" dense removable @remove="cancelMove" color="accent" text-color="white" icon="open_with">
        Moving
      </q-chip>
      <q-chip v-if="splittingFeature" dense removable @remove="cancelSplit" color="warning" text-color="white" icon="content_cut">
        Split: Draw line
      </q-chip>
      <q-chip v-if="joiningFeature" dense removable @remove="cancelJoin" color="info" text-color="white" icon="merge">
        Join: Click target polygon
      </q-chip>
      <q-btn
        v-if="drawMode === 'fence' || drawMode === 'pasture' || drawMode === 'treatment' || drawMode === 'outbuilding' || movingFeature || splittingFeature || joiningFeature"
        dense rounded color="positive" icon="check" label="Done" class="q-ml-xs"
        @click="completeDraw"
      />

      <span class="text-caption text-grey q-mr-sm">{{ currentBasemapLabel }}</span>
    </div>

    <!-- Map container -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- Geofence metadata dialog -->
    <q-dialog v-model="showGeofenceDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ pendingGeofenceType === 'fence' ? 'Fence Details' : pendingGeofenceType === 'outbuilding' ? 'Outbuilding Details' : pendingGeofenceType === 'pasture' ? 'Pasture Details' : 'Treatment Details' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <template v-if="pendingGeofenceType === 'fence'">
            <q-input v-model="geoForm.material" label="Material" dense outlined placeholder="e.g. Barbed Wire, Electric, Board" />
            <q-input v-model="geoForm.fenceType" label="Fence Type" dense outlined placeholder="e.g. Perimeter, Cross, Temporary" />
            <q-input v-model="geoForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else-if="pendingGeofenceType === 'outbuilding'">
            <q-input v-model="geoForm.outbuildingType" label="Building Type" dense outlined placeholder="e.g. Barn, Stable, Coop, Shed" />
            <q-input v-model="geoForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else-if="pendingGeofenceType === 'pasture'">
            <q-select v-model="geoForm.soilType" :options="terrainOptions" label="Terrain" dense outlined emit-value map-options />
            <q-input v-model="geoForm.plotType" label="Pasture Type" dense outlined placeholder="e.g. Rotational, Permanent, Hay Field" />
            <q-input v-model="geoForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>

          <!-- Style options -->
          <q-btn flat dense no-caps :label="showStyleSection ? 'Hide Style Options' : 'Style Options'" icon="palette" color="grey-7" class="q-mt-sm" @click="showStyleSection = !showStyleSection" />
          <template v-if="showStyleSection">
            <q-input v-model="styleForm.label" label="Label" dense outlined placeholder="Display label on map" />
            <div class="row q-gutter-sm">
              <q-input v-model="styleForm.labelColor" label="Label Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="styleForm.labelSize" label="Label Size" dense outlined class="col" type="number" min="8" max="32" suffix="pt" />
            </div>
            <q-toggle v-if="pendingGeofenceType === 'fence'" v-model="styleForm.labelFollowLine" label="Label follows line" dense />
            <template v-if="pendingGeofenceType !== 'fence'">
              <div class="row q-gutter-sm">
                <q-input v-model="styleForm.fillColor" label="Fill Color" dense outlined class="col" :type="('color' as any)" />
                <q-input v-model.number="styleForm.fillOpacity" label="Fill Opacity" dense outlined class="col" type="number" min="0" max="1" step="0.05" />
              </div>
            </template>
            <div class="row q-gutter-sm">
              <q-input v-model="styleForm.borderColor" label="Border Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="styleForm.borderWidth" label="Border Width" dense outlined class="col" type="number" min="1" max="10" suffix="px" />
            </div>
            <q-select v-model="styleForm.borderStyle" :options="lineStyleOptions" label="Border Style" dense outlined emit-value map-options />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelGeofenceSave" />
          <q-btn flat label="Save" color="primary" @click="confirmGeofenceSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Overlap detection dialog -->
    <q-dialog v-model="showOverlapDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ overlapType === 'pasture' ? 'Pasture Overlap Detected' : overlapType === 'outbuilding' ? 'Outbuilding Overlap Detected' : 'Fence Intersection Detected' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="q-mb-sm">
            Would you like to save it as new or append it to an existing feature?
          </p>
          <q-select
            v-if="overlappingFeatures.length > 1"
            v-model="selectedAppendTarget"
            :options="overlappingFeatures"
            option-value="id" option-label="label"
            emit-value map-options label="Append to" dense outlined class="q-mt-sm"
          />
          <div v-else class="text-caption q-mt-xs">
            Overlapping: <strong>{{ overlappingFeatures[0]?.label }}</strong>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelOverlapDialog" />
          <q-btn flat label="Save as New" color="primary" @click="overlapSaveAsNew" />
          <q-btn flat label="Append to Existing" color="secondary" @click="overlapAppendToExisting" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Treatment type dialog -->
    <q-dialog v-model="showTreatmentDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Treatment Details</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <q-select
            v-model="treatmentForm.treatmentType"
            :options="treatmentTypeOptions"
            label="Treatment Type" dense outlined emit-value map-options
          />
          <q-input
            v-if="treatmentForm.treatmentType === 'other'"
            v-model="treatmentForm.customType"
            label="Custom Treatment Type" dense outlined placeholder="e.g. Lime, Herbicide, Reseed"
          />
          <q-input v-model="treatmentForm.treatmentDate" label="Treatment Date" dense outlined mask="####-##-##" placeholder="YYYY-MM-DD">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="treatmentForm.treatmentDate" mask="YYYY-MM-DD">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-input v-model="geoForm.description" label="Description" dense outlined type="textarea" autogrow />

          <q-btn flat dense no-caps :label="showStyleSection ? 'Hide Style Options' : 'Style Options'" icon="palette" color="grey-7" class="q-mt-sm" @click="showStyleSection = !showStyleSection" />
          <template v-if="showStyleSection">
            <q-input v-model="styleForm.label" label="Label" dense outlined placeholder="Display label on map" />
            <div class="row q-gutter-sm">
              <q-input v-model="styleForm.fillColor" label="Fill Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="styleForm.fillOpacity" label="Fill Opacity" dense outlined class="col" type="number" min="0" max="1" step="0.05" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="styleForm.borderColor" label="Border Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="styleForm.borderWidth" label="Border Width" dense outlined class="col" type="number" min="1" max="10" suffix="px" />
            </div>
            <q-select v-model="styleForm.borderStyle" :options="lineStyleOptions" label="Border Style" dense outlined emit-value map-options />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelTreatmentSave" />
          <q-btn flat label="Save" color="primary" @click="confirmTreatmentSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Point metadata dialog -->
    <q-dialog v-model="showPointDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ pointDialogTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <q-input v-model="pointForm.description" label="Description" dense outlined type="textarea" autogrow />
          <q-input
            v-if="pendingPointType === 'animal'"
            v-model.number="pointForm.quantity"
            label="Head Count" dense outlined type="number" min="1"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelPointSave" />
          <q-btn flat label="Save" color="primary" @click="confirmPointSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Feature picker dialog -->
    <q-dialog v-model="showFeaturePicker">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Multiple Items Found</div>
          <div class="text-caption text-grey">Select an item to view its details</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-list dense bordered separator>
            <q-item v-for="item in pickerItems" :key="item.id" clickable v-ripple @click="selectPickerItem(item)">
              <q-item-section avatar><q-icon :name="item.icon" :color="item.color" /></q-item-section>
              <q-item-section>
                <q-item-label>{{ item.typeLabel }}</q-item-label>
                <q-item-label caption>{{ item.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Feature detail / edit / delete dialog -->
    <q-dialog v-model="showFeatureDetail">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ featureDetailTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <template v-if="!editingFeature">
            <div v-for="(val, key) in featureDetailAttrs" :key="key" class="q-mb-xs">
              <span class="text-weight-bold text-caption">{{ key }}:</span> {{ val }}
            </div>
          </template>
          <template v-else>
            <div v-if="selectedFeatureKind === 'geofence'" class="q-gutter-y-sm">
              <template v-if="editForm.geofenceSubtype === 'fence'">
                <q-input v-model="editForm.material" label="Material" dense outlined />
                <q-input v-model="editForm.fenceType" label="Fence Type" dense outlined />
                <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
              </template>
              <template v-else-if="editForm.geofenceSubtype === 'treatment'">
                <q-select v-model="editForm.treatmentType" :options="treatmentTypeOptions" label="Treatment Type" dense outlined emit-value map-options />
                <q-input v-if="editForm.treatmentType === 'other'" v-model="editForm.treatmentCustomType" label="Custom Type" dense outlined />
                <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
              </template>
              <template v-else-if="editForm.geofenceSubtype === 'outbuilding'">
                <q-input v-model="editForm.outbuildingType" label="Building Type" dense outlined />
                <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
              </template>
              <template v-else>
                <q-select v-model="editForm.soilType" :options="terrainOptions" label="Terrain" dense outlined emit-value map-options />
                <q-input v-model="editForm.plotType" label="Pasture Type" dense outlined />
                <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
              </template>

              <q-btn flat dense no-caps :label="showEditStyleSection ? 'Hide Style Options' : 'Style Options'" icon="palette" color="grey-7" @click="showEditStyleSection = !showEditStyleSection" />
              <template v-if="showEditStyleSection">
                <q-input v-model="editForm.style.label" label="Label" dense outlined />
                <div class="row q-gutter-sm">
                  <q-input v-model="editForm.style.labelColor" label="Label Color" dense outlined class="col" :type="('color' as any)" />
                  <q-input v-model.number="editForm.style.labelSize" label="Label Size" dense outlined class="col" type="number" min="8" max="32" suffix="pt" />
                </div>
                <q-toggle v-if="editForm.geofenceSubtype === 'fence'" v-model="editForm.style.labelFollowLine" label="Label follows line" dense />
                <template v-if="editForm.geofenceSubtype !== 'fence'">
                  <div class="row q-gutter-sm">
                    <q-input v-model="editForm.style.fillColor" label="Fill Color" dense outlined class="col" :type="('color' as any)" />
                    <q-input v-model.number="editForm.style.fillOpacity" label="Fill Opacity" dense outlined class="col" type="number" min="0" max="1" step="0.05" />
                  </div>
                </template>
                <div class="row q-gutter-sm">
                  <q-input v-model="editForm.style.borderColor" label="Border Color" dense outlined class="col" :type="('color' as any)" />
                  <q-input v-model.number="editForm.style.borderWidth" label="Border Width" dense outlined class="col" type="number" min="1" max="10" suffix="px" />
                </div>
                <q-select v-model="editForm.style.borderStyle" :options="lineStyleOptions" label="Border Style" dense outlined emit-value map-options />
              </template>
            </div>
            <div v-else class="q-gutter-y-sm">
              <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
              <q-input v-if="editForm.pointSubtype === 'animal'" v-model.number="editForm.quantity" label="Head Count" dense outlined type="number" min="1" />
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <template v-if="!editingFeature">
            <q-btn flat label="Close" v-close-popup />
            <q-btn flat label="Move" color="accent" icon="open_with" @click="startMoveFeature" />
            <q-btn v-if="selectedFeatureKind === 'geofence' && featureDetailTitle !== 'Fence'" flat label="Split" color="warning" icon="content_cut" @click="startSplitFeature" />
            <q-btn v-if="selectedFeatureKind === 'geofence' && featureDetailTitle !== 'Fence'" flat label="Join" color="info" icon="merge" @click="startJoinFeature" />
            <q-btn flat label="Edit" color="primary" icon="edit" @click="startEditFeature" />
            <q-btn flat label="Delete" color="negative" icon="delete" @click="deleteSelectedFeature" />
          </template>
          <template v-else>
            <q-btn flat label="Cancel" @click="editingFeature = false" />
            <q-btn flat label="Save" color="primary" @click="saveEditFeature" />
          </template>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Split review dialog -->
    <q-dialog v-model="showSplitReviewDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Split Result</div>
          <div class="text-caption text-grey">Click each shape to review and edit. Hover to highlight on map.</div>
        </q-card-section>
        <q-card-section class="q-pt-none row q-gutter-md justify-center">
          <q-card
            v-for="(poly, idx) in splitPolygons" :key="idx"
            bordered flat class="cursor-pointer"
            :class="{ 'bg-green-1': splitReviewed[idx] }"
            style="width: 160px"
            @click="openSplitEdit(idx)"
            @mouseenter="onSplitCardHover(idx)"
            @mouseleave="onSplitCardLeave"
          >
            <q-card-section class="text-center q-pa-sm">
              <svg :viewBox="splitSvgData[idx]?.viewBox" width="120" height="90" style="border: 1px solid #ccc; background: #fafafa; border-radius: 4px">
                <path :d="splitSvgData[idx]?.path" :fill="splitPreviewColors.fill" :stroke="splitPreviewColors.stroke" stroke-width="2" />
              </svg>
              <div class="text-caption q-mt-xs">
                Shape {{ idx + 1 }}
                <q-icon v-if="splitReviewed[idx]" name="check_circle" color="positive" size="xs" class="q-ml-xs" />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelSplit" />
          <q-btn flat label="Save Both" color="primary" @click="confirmSplit" :disable="!splitReviewed[0] || !splitReviewed[1]" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Split edit dialog -->
    <q-dialog v-model="showSplitEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Shape {{ splitEditIndex + 1 }} Details</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <template v-if="editForm.geofenceSubtype === 'outbuilding'">
            <q-input v-model="editForm.outbuildingType" label="Building Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else-if="editForm.geofenceSubtype === 'treatment'">
            <q-select v-model="editForm.treatmentType" :options="treatmentTypeOptions" label="Treatment Type" dense outlined emit-value map-options />
            <q-input v-if="editForm.treatmentType === 'other'" v-model="editForm.treatmentCustomType" label="Custom Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else>
            <q-select v-model="editForm.soilType" :options="terrainOptions" label="Terrain" dense outlined emit-value map-options />
            <q-input v-model="editForm.plotType" label="Pasture Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>

          <q-btn flat dense no-caps :label="showEditStyleSection ? 'Hide Style Options' : 'Style Options'" icon="palette" color="grey-7" class="q-mt-sm" @click="showEditStyleSection = !showEditStyleSection" />
          <template v-if="showEditStyleSection">
            <q-input v-model="editForm.style.label" label="Label" dense outlined />
            <div class="row q-gutter-sm">
              <q-input v-model="editForm.style.fillColor" label="Fill Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="editForm.style.fillOpacity" label="Fill Opacity" dense outlined class="col" type="number" min="0" max="1" step="0.05" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="editForm.style.borderColor" label="Border Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="editForm.style.borderWidth" label="Border Width" dense outlined class="col" type="number" min="1" max="10" suffix="px" />
            </div>
            <q-select v-model="editForm.style.borderStyle" :options="lineStyleOptions" label="Border Style" dense outlined emit-value map-options />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Done" color="primary" @click="saveSplitEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Join preview dialog -->
    <q-dialog v-model="showJoinPreviewDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Join Result</div>
          <div class="text-caption text-grey">Click preview to review details before saving.</div>
        </q-card-section>
        <q-card-section class="q-pt-none row justify-center">
          <q-card bordered flat class="cursor-pointer" :class="{ 'bg-green-1': joinConfirmed }" style="width: 200px" @click="openJoinEdit">
            <q-card-section class="text-center q-pa-sm">
              <svg :viewBox="joinSvgData.viewBox" width="160" height="120" style="border: 1px solid #ccc; background: #fafafa; border-radius: 4px">
                <path :d="joinSvgData.path" :fill="joinPreviewColors.fill" :stroke="joinPreviewColors.stroke" stroke-width="2" />
              </svg>
              <div class="text-caption q-mt-xs">
                Joined Shape
                <q-icon v-if="joinConfirmed" name="check_circle" color="positive" size="xs" class="q-ml-xs" />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="cancelJoin" />
          <q-btn flat label="Save" color="primary" @click="confirmJoin" :disable="!joinConfirmed" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Join edit dialog -->
    <q-dialog v-model="showJoinEditDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Edit Joined {{ joinSourceFence?.type ? joinSourceFence.type.charAt(0).toUpperCase() + joinSourceFence.type.slice(1) : 'Polygon' }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none q-gutter-y-sm">
          <template v-if="editForm.geofenceSubtype === 'outbuilding'">
            <q-input v-model="editForm.outbuildingType" label="Building Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else-if="editForm.geofenceSubtype === 'treatment'">
            <q-select v-model="editForm.treatmentType" :options="treatmentTypeOptions" label="Treatment Type" dense outlined emit-value map-options />
            <q-input v-if="editForm.treatmentType === 'other'" v-model="editForm.treatmentCustomType" label="Custom Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>
          <template v-else>
            <q-select v-model="editForm.soilType" :options="terrainOptions" label="Terrain" dense outlined emit-value map-options />
            <q-input v-model="editForm.plotType" label="Pasture Type" dense outlined />
            <q-input v-model="editForm.description" label="Description" dense outlined type="textarea" autogrow />
          </template>

          <q-btn flat dense no-caps :label="showEditStyleSection ? 'Hide Style Options' : 'Style Options'" icon="palette" color="grey-7" class="q-mt-sm" @click="showEditStyleSection = !showEditStyleSection" />
          <template v-if="showEditStyleSection">
            <q-input v-model="editForm.style.label" label="Label" dense outlined />
            <div class="row q-gutter-sm">
              <q-input v-model="editForm.style.fillColor" label="Fill Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="editForm.style.fillOpacity" label="Fill Opacity" dense outlined class="col" type="number" min="0" max="1" step="0.05" />
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="editForm.style.borderColor" label="Border Color" dense outlined class="col" :type="('color' as any)" />
              <q-input v-model.number="editForm.style.borderWidth" label="Border Width" dense outlined class="col" type="number" min="1" max="10" suffix="px" />
            </div>
            <q-select v-model="editForm.style.borderStyle" :options="lineStyleOptions" label="Border Style" dense outlined emit-value map-options />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Done" color="primary" @click="saveJoinEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Save favorite location dialog -->
    <q-dialog v-model="showSaveFavoriteDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save Favorite Location</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="favoriteName" label="Location Name" dense outlined autofocus
            placeholder="e.g. North Pasture, Main Barn" @keyup.enter="confirmSaveFavorite"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Save" color="primary" @click="confirmSaveFavorite" :disable="!favoriteName.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, onBeforeUnmount, computed, watch, toRaw } from 'vue';
import { useQuasar } from 'quasar';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import AreaMeasurement2D from '@arcgis/core/widgets/AreaMeasurement2D';
import DistanceMeasurement2D from '@arcgis/core/widgets/DistanceMeasurement2D';
import Search from '@arcgis/core/widgets/Search';
import Legend from '@arcgis/core/widgets/Legend';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
import '@arcgis/core/assets/esri/themes/light/main.css';
import type Layer from '@arcgis/core/layers/Layer';
import type SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

import type { GeoFence, MapPoint, GeofenceType, MapPointType, MapRing, MapPath, TreatmentType, GeofenceStyle, LineStyleType } from 'src/models/livestock';
import {
  geofences, mapPoints, loadGeofences, saveGeofence, updateGeofence, deleteGeofence,
  loadMapPoints, saveMapPoint, updateMapPoint, deleteMapPoint,
} from 'src/services/map-feature-service';
import { activeFarmId } from 'src/services/farm-service';
import { currentUser } from 'src/boot/firebase';
import {
  favoriteLocations, loadFavoriteLocations, saveFavoriteLocation, deleteFavoriteLocation,
} from 'src/services/favorite-location-service';

interface BasemapOption { id: string; label: string }
interface LayerConfig {
  id: string; title: string; category: string;
  type: 'feature' | 'tile' | 'imagery' | 'map-image';
  url: string; opacity?: number;
}
type DrawMode = GeofenceType | MapPointType;

const TREATMENT_TYPE_OPTIONS: { label: string; value: TreatmentType }[] = [
  { label: 'Fertilizer', value: 'fertilizer' },
  { label: 'Pesticide', value: 'pesticide' },
  { label: 'Other', value: 'other' },
];

const LINE_STYLE_OPTIONS: { label: string; value: LineStyleType }[] = [
  { label: 'Solid', value: 'solid' }, { label: 'Dash', value: 'dash' },
  { label: 'Dot', value: 'dot' }, { label: 'Dash-Dot', value: 'dash-dot' },
  { label: 'Long Dash', value: 'long-dash' }, { label: 'Short Dash', value: 'short-dash' },
];

const DEFAULT_STYLES: Record<GeofenceType, GeofenceStyle> = {
  fence: { fillColor: '#8B5A2B', fillOpacity: 0.25, borderColor: '#8B5A2B', borderWidth: 3, borderStyle: 'dash', label: '', labelColor: '#000000', labelSize: 12, labelFollowLine: false },
  pasture: { fillColor: '#4CAF50', fillOpacity: 0.25, borderColor: '#388E3C', borderWidth: 2, borderStyle: 'solid', label: '', labelColor: '#000000', labelSize: 12, labelFollowLine: false },
  treatment: { fillColor: '#9C27B0', fillOpacity: 0.25, borderColor: '#7B1FA2', borderWidth: 2, borderStyle: 'dash', label: '', labelColor: '#000000', labelSize: 12, labelFollowLine: false },
  outbuilding: { fillColor: '#795548', fillOpacity: 0.35, borderColor: '#4E342E', borderWidth: 2, borderStyle: 'solid', label: '', labelColor: '#000000', labelSize: 12, labelFollowLine: false },
};

function hexToRgba(hex: string, opacity: number): [number, number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16), opacity];
}
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}
function cloneStyle(s: GeofenceStyle): GeofenceStyle { return { ...s }; }

function geofenceStyleToLineSymbol(s: GeofenceStyle): SimpleLineSymbol {
  return new SimpleLineSymbol({ color: hexToRgb(s.borderColor), width: s.borderWidth, style: s.borderStyle });
}
function geofenceStyleToFillSymbol(s: GeofenceStyle): SimpleFillSymbol {
  return new SimpleFillSymbol({ color: hexToRgba(s.fillColor, s.fillOpacity), outline: { color: hexToRgb(s.borderColor), width: s.borderWidth, style: s.borderStyle } });
}

const FENCE_SYMBOL = geofenceStyleToLineSymbol(DEFAULT_STYLES.fence);
const PASTURE_SYMBOL = geofenceStyleToFillSymbol(DEFAULT_STYLES.pasture);
const TREATMENT_SYMBOL = geofenceStyleToFillSymbol(DEFAULT_STYLES.treatment);
const OUTBUILDING_SYMBOL = geofenceStyleToFillSymbol(DEFAULT_STYLES.outbuilding);

const POINT_ICON_PATHS: Record<MapPointType, string> = {
  'water-source': 'M12,2c-5.33,4.55-8,8.48-8,11.8c0,4.98,3.8,8.2,8,8.2s8-3.22,8-8.2C20,10.48,17.33,6.55,12,2z',
  feeder: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
  'mineral-station': 'M7 2v11h3v9l7-12h-4l4-8z',
  hazard: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  gate: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z',
  shelter: 'M12 3L4 9v12h16V9l-8-6zm0 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z',
  animal: 'M4.5 11c-1.38 0-2.5 1.12-2.5 2.5S3.12 16 4.5 16 7 14.88 7 13.5 5.88 11 4.5 11zm15 0c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm-7.5-3c-1.38 0-2.5 1.12-2.5 2.5S10.62 13 12 13s2.5-1.12 2.5-2.5S13.38 8 12 8zM7 5.5C7 4.12 5.88 3 4.5 3S2 4.12 2 5.5 3.12 8 4.5 8 7 6.88 7 5.5zm10 0C17 4.12 15.88 3 14.5 3S12 4.12 12 5.5 13.12 8 14.5 8 17 6.88 17 5.5z',
  feature: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
};

const POINT_ICON_COLORS: Record<MapPointType, string> = {
  'water-source': '#00BCD4', feeder: '#FF9800', 'mineral-station': '#009688',
  hazard: '#F44336', gate: '#757575', shelter: '#795548',
  animal: '#4CAF50', feature: '#2196F3',
};

function buildPointSvgDataUri(type: MapPointType): string {
  const path = POINT_ICON_PATHS[type]; const color = POINT_ICON_COLORS[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="${path}" fill="${color}" stroke="white" stroke-width="1.5" paint-order="stroke"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function createPointIconSymbol(type: MapPointType, size: number = 20): CIMSymbol {
  return new CIMSymbol({
    data: { type: 'CIMSymbolReference', symbol: { type: 'CIMPointSymbol', symbolLayers: [{ type: 'CIMPictureMarker', enable: true, size, url: buildPointSvgDataUri(type) }] } },
  });
}

const POINT_SYMBOLS: Record<MapPointType, CIMSymbol | SimpleMarkerSymbol> = {
  'water-source': createPointIconSymbol('water-source'), feeder: createPointIconSymbol('feeder'),
  'mineral-station': createPointIconSymbol('mineral-station'), hazard: createPointIconSymbol('hazard'),
  gate: createPointIconSymbol('gate'), shelter: createPointIconSymbol('shelter'),
  animal: createPointIconSymbol('animal'), feature: createPointIconSymbol('feature'),
};

function isFencePolyline(geo: GeoFence): geo is GeoFence & { geometry: MapPath } {
  return 'paths' in geo.geometry;
}

const layerConfigs: LayerConfig[] = [
  { id: 'usa-soils', title: 'USA Soils', category: 'Agriculture', type: 'tile', url: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Soils_Map_Units_Tiles_v6/MapServer', opacity: 0.6 },
  { id: 'usa-cropland', title: 'USA Cropland', category: 'Agriculture', type: 'map-image', url: 'https://nassgeodata.gmu.edu/arcgis/rest/services/CropScape/nass_data_cache/MapServer', opacity: 0.6 },
  { id: 'nlcd-land-cover', title: 'USA NLCD Land Cover', category: 'Environment', type: 'imagery', url: 'https://di-nlcd.img.arcgis.com/arcgis/rest/services/USA_NLCD_Annual_LandCover/ImageServer', opacity: 0.6 },
  { id: 'flood-hazard', title: 'USA Flood Hazard Areas', category: 'Environment', type: 'feature', url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Flood_Hazard_Reduced_Set_gdb/FeatureServer/0', opacity: 0.5 },
  { id: 'usa-watersheds', title: 'USA Watersheds', category: 'Environment', type: 'map-image', url: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer', opacity: 0.4 },
  { id: 'usa-water-bodies', title: 'USA Water Bodies', category: 'Environment', type: 'feature', url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Water_Bodies/FeatureServer/0', opacity: 0.5 },
  { id: 'weather-warnings', title: 'NWS Watches & Warnings', category: 'Weather', type: 'feature', url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/6', opacity: 0.6 },
  { id: 'weather-radar', title: 'NOAA Weather Radar', category: 'Weather', type: 'map-image', url: 'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/MapServer', opacity: 0.6 },
  { id: 'world-hillshade', title: 'World Hillshade', category: 'Reference', type: 'tile', url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer', opacity: 0.5 },
  { id: 'world-boundaries', title: 'World Boundaries & Places', category: 'Reference', type: 'tile', url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer', opacity: 0.8 },
  { id: 'usa-parks', title: 'USA Parks & Protected Lands', category: 'Reference', type: 'feature', url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Parks/FeatureServer/0', opacity: 0.5 },
];

const MAP_POSITION_KEY = 'herdit-map-position';
const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283];
const DEFAULT_ZOOM = 5;

function saveMapPosition(longitude: number, latitude: number, zoom: number) {
  localStorage.setItem(MAP_POSITION_KEY, JSON.stringify({ longitude, latitude, zoom }));
}
function getSavedMapPosition(): { center: [number, number]; zoom: number } {
  try {
    const raw = localStorage.getItem(MAP_POSITION_KEY);
    if (raw) {
      const { longitude, latitude, zoom } = JSON.parse(raw);
      if (typeof longitude === 'number' && typeof latitude === 'number' && typeof zoom === 'number')
        return { center: [longitude, latitude], zoom };
    }
  } catch { /* ignore */ }
  return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
}

export default defineComponent({
  name: 'MapsPage',
  setup() {
    const $q = useQuasar();
    const mapContainer = ref<HTMLDivElement>();
    const currentBasemap = ref('hybrid');
    const measureWidgetActive = ref(false);
    const activeLayers = reactive<Record<string, boolean>>({});

    let view: MapView | null = null;
    let map: Map | null = null;
    let areaWidget: AreaMeasurement2D | null = null;
    let distanceWidget: DistanceMeasurement2D | null = null;
    let searchWidget: Search | null = null;
    let sketchVM: SketchViewModel | null = null;
    let legendWidget: Legend | null = null;
    const legendVisible = ref(false);
    const layerInstances: Record<string, Layer> = {};

    // Graphics layers
    const fenceGraphicsLayer = new GraphicsLayer({ title: 'Fences' });
    const pastureGraphicsLayer = new GraphicsLayer({ title: 'Pastures' });
    const treatmentGraphicsLayer = new GraphicsLayer({ title: 'Treatments' });
    const outbuildingGraphicsLayer = new GraphicsLayer({ title: 'Outbuildings' });
    const waterSourceGraphicsLayer = new GraphicsLayer({ title: 'Water Sources' });
    const feederGraphicsLayer = new GraphicsLayer({ title: 'Feeders' });
    const mineralGraphicsLayer = new GraphicsLayer({ title: 'Mineral Stations' });
    const hazardGraphicsLayer = new GraphicsLayer({ title: 'Hazards' });
    const gateGraphicsLayer = new GraphicsLayer({ title: 'Gates' });
    const shelterGraphicsLayer = new GraphicsLayer({ title: 'Shelters' });
    const animalGraphicsLayer = new GraphicsLayer({ title: 'Animals' });
    const featureGraphicsLayer = new GraphicsLayer({ title: 'Features' });
    const sketchLayer = new GraphicsLayer({ title: '_sketch' });

    const graphicsLayerMap: Record<string, GraphicsLayer> = {
      fence: fenceGraphicsLayer, pasture: pastureGraphicsLayer,
      treatment: treatmentGraphicsLayer, outbuilding: outbuildingGraphicsLayer,
      'water-source': waterSourceGraphicsLayer, feeder: feederGraphicsLayer,
      'mineral-station': mineralGraphicsLayer, hazard: hazardGraphicsLayer,
      gate: gateGraphicsLayer, shelter: shelterGraphicsLayer,
      animal: animalGraphicsLayer, feature: featureGraphicsLayer,
    };

    // Draw mode state
    const drawMode = ref<DrawMode | null>(null);
    const movingFeature = ref(false);
    let moveEventHandler: { remove: () => void } | null = null;
    const drawModeLabel = computed(() => {
      const labels: Record<DrawMode, string> = {
        fence: 'Fence', pasture: 'Pasture', treatment: 'Treatment', outbuilding: 'Outbuilding',
        'water-source': 'Water Source', feeder: 'Feeder', 'mineral-station': 'Mineral Station',
        hazard: 'Hazard', gate: 'Gate', shelter: 'Shelter', animal: 'Animal', feature: 'Feature',
      };
      return drawMode.value ? labels[drawMode.value] : '';
    });

    // Geofence form
    const showGeofenceDialog = ref(false);
    const pendingGeofenceType = ref<GeofenceType>('fence');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pendingGeometry: any = null;
    const geoForm = reactive({ material: '', fenceType: '', description: '', soilType: '', plotType: '', outbuildingType: '' });
    const styleForm = reactive<GeofenceStyle>({ ...DEFAULT_STYLES.fence });
    const showStyleSection = ref(false);

    function resetStyleForm(type: GeofenceType) {
      Object.assign(styleForm, cloneStyle(DEFAULT_STYLES[type]));
      showStyleSection.value = false;
    }

    const terrainOptions = [
      { label: 'Flat', value: 'flat' }, { label: 'Hilly', value: 'hilly' },
      { label: 'Wooded', value: 'wooded' }, { label: 'Mixed', value: 'mixed' },
      { label: 'Wetland', value: 'wetland' },
    ];

    // Treatment form
    const showTreatmentDialog = ref(false);
    const treatmentForm = reactive({ treatmentType: 'fertilizer' as TreatmentType, customType: '', treatmentDate: getTodayDate() });
    function resetTreatmentForm() {
      treatmentForm.treatmentType = 'fertilizer'; treatmentForm.customType = '';
      treatmentForm.treatmentDate = getTodayDate(); resetStyleForm('treatment');
    }
    function getTodayDate(): string {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Overlap dialog
    const showOverlapDialog = ref(false);
    const overlapType = ref<'pasture' | 'fence' | 'outbuilding'>('pasture');
    const overlappingFeatures = ref<{ id: string; label: string }[]>([]);
    const selectedAppendTarget = ref<string | null>(null);

    // Point form
    const showPointDialog = ref(false);
    const pendingPointType = ref<MapPointType>('water-source');
    let pendingPointCoords: { longitude: number; latitude: number } | null = null;
    const pointForm = reactive({ description: '', quantity: 1 });
    const pointDialogTitle = computed(() => {
      const titles: Record<MapPointType, string> = {
        'water-source': 'Water Source Details', feeder: 'Feeder Details',
        'mineral-station': 'Mineral Station Details', hazard: 'Hazard Details',
        gate: 'Gate Details', shelter: 'Shelter Details',
        animal: 'Animal Marker Details', feature: 'Feature Details',
      };
      return pendingPointType.value ? titles[pendingPointType.value] : '';
    });

    // Feature detail popup
    const showFeatureDetail = ref(false);
    const featureDetailTitle = ref('');
    const featureDetailAttrs = ref<Record<string, string>>({});
    let selectedFeatureId = '';
    const selectedFeatureKind = ref<'geofence' | 'point'>('geofence');

    // Feature picker
    const showFeaturePicker = ref(false);
    interface PickerItem { id: string; kind: 'geofence' | 'point'; subtype: string; typeLabel: string; description: string; icon: string; color: string }
    const pickerItems = ref<PickerItem[]>([]);

    const GEOFENCE_PICKER_META: Record<string, { icon: string; color: string; label: string }> = {
      fence: { icon: 'fence', color: 'brown', label: 'Fence' },
      pasture: { icon: 'grass', color: 'green', label: 'Pasture' },
      treatment: { icon: 'science', color: 'purple', label: 'Treatment' },
      outbuilding: { icon: 'home_work', color: 'brown', label: 'Outbuilding' },
    };
    const POINT_PICKER_META: Record<string, { icon: string; color: string; label: string }> = {
      'water-source': { icon: 'water_drop', color: 'cyan', label: 'Water Source' },
      feeder: { icon: 'restaurant', color: 'orange', label: 'Feeder' },
      'mineral-station': { icon: 'science', color: 'teal', label: 'Mineral Station' },
      hazard: { icon: 'warning', color: 'red', label: 'Hazard' },
      gate: { icon: 'door_front', color: 'grey', label: 'Gate' },
      shelter: { icon: 'night_shelter', color: 'brown', label: 'Shelter' },
      animal: { icon: 'pets', color: 'green', label: 'Animal' },
      feature: { icon: 'place', color: 'blue', label: 'Feature' },
    };

    function buildPickerItem(id: string, kind: 'geofence' | 'point', subtype: string): PickerItem | null {
      if (kind === 'geofence') {
        const fence = geofences.value[id]; if (!fence) return null;
        const meta = GEOFENCE_PICKER_META[subtype] ?? { icon: 'map', color: 'grey', label: subtype };
        const desc = fence.style?.label || fence.description || fence.fenceType || fence.material || fence.plotType || fence.outbuildingType || id.slice(-6);
        return { id, kind, subtype, typeLabel: meta.label, description: desc, icon: meta.icon, color: meta.color };
      } else {
        const point = mapPoints.value[id]; if (!point) return null;
        const meta = POINT_PICKER_META[subtype] ?? { icon: 'place', color: 'grey', label: subtype };
        return { id, kind, subtype, typeLabel: meta.label, description: point.description || id.slice(-6), icon: meta.icon, color: meta.color };
      }
    }

    function selectPickerItem(item: PickerItem) {
      showFeaturePicker.value = false;
      showFeatureDetailForItem(item.id, item.kind, item.subtype);
    }

    // Edit state
    const editingFeature = ref(false);
    const editForm = reactive({
      description: '', material: '', fenceType: '', soilType: '', plotType: '',
      treatmentType: '' as string, treatmentCustomType: '', outbuildingType: '', quantity: 1,
      geofenceSubtype: '' as string, pointSubtype: '' as string,
      style: { ...DEFAULT_STYLES.fence } as GeofenceStyle,
    });
    const showEditStyleSection = ref(false);

    // Split state
    const showSplitReviewDialog = ref(false);
    const showSplitEditDialog = ref(false);
    const splittingFeature = ref(false);
    let splitSourceId = '';
    const splitSourceFence = ref<GeoFence | null>(null);
    const splitPolygons = ref<{ rings: number[][][] }[]>([]);
    const splitReviewed = reactive([false, false]);
    const splitEditIndex = ref(0);
    const splitHighlightIndex = ref(-1);
    let splitEventHandler: { remove: () => void } | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let splitSavedPolylineSymbol: any = null;

    interface SplitFormData {
      material: string; fenceType: string; description: string; soilType: string; plotType: string;
      outbuildingType: string; treatmentType: string; treatmentCustomType: string; treatmentDate: string;
      style: GeofenceStyle;
    }
    function createEmptySplitForm(): SplitFormData {
      return { material: '', fenceType: '', description: '', soilType: '', plotType: '', outbuildingType: '', treatmentType: '', treatmentCustomType: '', treatmentDate: '', style: { ...DEFAULT_STYLES.pasture } };
    }
    const splitForms = reactive<SplitFormData[]>([createEmptySplitForm(), createEmptySplitForm()]);

    // Join state
    const joiningFeature = ref(false);
    let joinSourceId = '';
    const joinSourceFence = ref<GeoFence | null>(null);
    const showJoinPreviewDialog = ref(false);
    const showJoinEditDialog = ref(false);
    let joinTargetId = '';
    const joinTargetFence = ref<GeoFence | null>(null);
    const joinedPolygon = ref<{ rings: number[][][] } | null>(null);
    const joinConfirmed = ref(false);
    let joinClickHandler: { remove: () => void } | null = null;
    const joinForm = reactive<SplitFormData>({ material: '', fenceType: '', description: '', soilType: '', plotType: '', outbuildingType: '', treatmentType: '', treatmentCustomType: '', treatmentDate: '', style: { ...DEFAULT_STYLES.pasture } });

    // Feature layer toggles
    const featureLayerVisibility = reactive<Record<string, boolean>>({
      fence: true, pasture: true, treatment: true, outbuilding: true,
      'water-source': true, feeder: true, 'mineral-station': true, hazard: true,
      gate: true, shelter: true, animal: true, feature: true,
    });
    const featureLayerToggles = computed(() => [
      { id: 'fence', label: 'Fences', icon: 'fence', color: 'brown', visible: featureLayerVisibility.fence },
      { id: 'pasture', label: 'Pastures', icon: 'grass', color: 'green', visible: featureLayerVisibility.pasture },
      { id: 'outbuilding', label: 'Outbuildings', icon: 'home_work', color: 'brown', visible: featureLayerVisibility.outbuilding },
      { id: 'treatment', label: 'Treatments', icon: 'science', color: 'purple', visible: featureLayerVisibility.treatment },
      { id: 'water-source', label: 'Water Sources', icon: 'water_drop', color: 'cyan', visible: featureLayerVisibility['water-source'] },
      { id: 'feeder', label: 'Feeders', icon: 'restaurant', color: 'orange', visible: featureLayerVisibility.feeder },
      { id: 'mineral-station', label: 'Mineral Stations', icon: 'science', color: 'teal', visible: featureLayerVisibility['mineral-station'] },
      { id: 'hazard', label: 'Hazards', icon: 'warning', color: 'red', visible: featureLayerVisibility.hazard },
      { id: 'gate', label: 'Gates', icon: 'door_front', color: 'grey', visible: featureLayerVisibility.gate },
      { id: 'shelter', label: 'Shelters', icon: 'night_shelter', color: 'brown', visible: featureLayerVisibility.shelter },
      { id: 'animal', label: 'Animals', icon: 'pets', color: 'green', visible: featureLayerVisibility.animal },
      { id: 'feature', label: 'Features', icon: 'place', color: 'blue', visible: featureLayerVisibility.feature },
    ]);
    function toggleFeatureLayer(id: string) {
      featureLayerVisibility[id] = !featureLayerVisibility[id];
      const layer = graphicsLayerMap[id];
      if (layer) layer.visible = featureLayerVisibility[id];
    }

    const hasFarm = computed(() => !!activeFarmId.value);

    // Favorites
    const showSaveFavoriteDialog = ref(false);
    const favoriteName = ref('');
    const sortedFavorites = computed(() =>
      Object.entries(favoriteLocations.value).map(([id, loc]) => ({ id, ...loc })).sort((a, b) => a.name.localeCompare(b.name))
    );

    // Basemaps
    const basemaps: BasemapOption[] = [
      { id: 'topo-vector', label: 'Topographic' }, { id: 'streets-vector', label: 'Streets' },
      { id: 'satellite', label: 'Satellite' }, { id: 'hybrid', label: 'Hybrid' },
      { id: 'dark-gray-vector', label: 'Dark Gray' }, { id: 'gray-vector', label: 'Light Gray' },
      { id: 'osm', label: 'OpenStreetMap' }, { id: 'terrain', label: 'Terrain' },
      { id: 'arcgis-imagery', label: 'Imagery' },
    ];
    const currentBasemapLabel = computed(() => basemaps.find((b) => b.id === currentBasemap.value)?.label ?? currentBasemap.value);
    const layerCategories = computed(() => [...new Set(layerConfigs.map((l) => l.category))]);
    function getLayersByCategory(category: string) { return layerConfigs.filter((l) => l.category === category); }
    function isLayerActive(id: string) { return !!activeLayers[id]; }

    function createLayer(config: LayerConfig): Layer {
      const opts = { url: config.url, title: config.title, opacity: config.opacity ?? 0.7 };
      switch (config.type) {
        case 'feature': return new FeatureLayer(opts);
        case 'tile': return new TileLayer(opts);
        case 'imagery': return new ImageryLayer(opts);
        case 'map-image': return new MapImageLayer(opts);
      }
    }

    function toggleLayer(id: string) {
      if (!map) return;
      if (activeLayers[id]) {
        const layer = layerInstances[id]; if (layer) layer.visible = false;
        activeLayers[id] = false;
      } else {
        const existing = layerInstances[id];
        if (existing) { existing.visible = true; }
        else { const config = layerConfigs.find((l) => l.id === id); if (!config) return; const layer = createLayer(config); layerInstances[id] = layer; map.add(layer); }
        activeLayers[id] = true;
      }
    }

    function changeBasemap(id: string) {
      currentBasemap.value = id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (map) (map as any).basemap = id;
    }

    // Measurement
    function destroyMeasureWidgets() {
      if (areaWidget) { areaWidget.destroy(); areaWidget = null; }
      if (distanceWidget) { distanceWidget.destroy(); distanceWidget = null; }
      measureWidgetActive.value = false;
    }
    function activateMeasureArea() {
      if (!view) return; destroyMeasureWidgets();
      areaWidget = new AreaMeasurement2D({ view }); view.ui.add(areaWidget, 'bottom-right');
      void areaWidget.viewModel.start(); measureWidgetActive.value = true;
    }
    function activateMeasureDistance() {
      if (!view) return; destroyMeasureWidgets();
      distanceWidget = new DistanceMeasurement2D({ view }); view.ui.add(distanceWidget, 'bottom-right');
      void distanceWidget.viewModel.start(); measureWidgetActive.value = true;
    }
    function clearMeasurement() { destroyMeasureWidgets(); }

    // Legend
    function toggleLegend() {
      if (legendVisible.value) {
        if (legendWidget) { view?.ui.remove(legendWidget); legendWidget.destroy(); legendWidget = null; }
        legendVisible.value = false;
      } else {
        if (!view) return;
        legendWidget = new Legend({ view, style: 'classic' }); view.ui.add(legendWidget, 'bottom-left');
        legendVisible.value = true;
      }
    }

    function getUserInfo() {
      const user = currentUser.value;
      return { uid: user?.uid ?? '', displayName: user?.displayName || user?.email || 'Anonymous' };
    }

    // --- Drawing ---
    function startDraw(mode: DrawMode) {
      if (!view || !sketchVM) return;
      drawMode.value = mode; sketchLayer.removeAll();
      if (mode === 'fence') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sketchVM.polylineSymbol = FENCE_SYMBOL.clone() as any;
        void sketchVM.create('polyline');
      } else if (mode === 'pasture' || mode === 'treatment' || mode === 'outbuilding') {
        const symbolMap: Record<string, SimpleFillSymbol> = { pasture: PASTURE_SYMBOL, treatment: TREATMENT_SYMBOL, outbuilding: OUTBUILDING_SYMBOL };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sketchVM.polygonSymbol = symbolMap[mode]!.clone() as any;
        void sketchVM.create('polygon');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sketchVM.pointSymbol = POINT_SYMBOLS[mode as MapPointType]?.clone() as any ?? POINT_SYMBOLS.feature.clone() as any;
        void sketchVM.create('point');
      }
    }
    function cancelDraw() { drawMode.value = null; sketchLayer.removeAll(); if (sketchVM) sketchVM.cancel(); }
    function cancelMove() { movingFeature.value = false; sketchLayer.removeAll(); if (moveEventHandler) { moveEventHandler.remove(); moveEventHandler = null; } if (sketchVM) sketchVM.cancel(); }
    function completeDraw() { if (sketchVM) sketchVM.complete(); }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleSketchCreate(event: any) {
      if (event.state !== 'complete' || !drawMode.value) return;
      const graphic = event.graphic as Graphic;
      const mode = drawMode.value;
      drawMode.value = null;

      if (mode === 'fence') {
        pendingGeofenceType.value = 'fence';
        const rawLine = graphic.geometry as Polyline;
        const line = (rawLine.spatialReference.isWebMercator ? webMercatorUtils.webMercatorToGeographic(rawLine) : rawLine) as Polyline;
        pendingGeometry = { paths: line.paths.map((p: number[][]) => p.map((c: number[]) => [...c])) };
        resetGeoForm();
        const intersecting = findIntersectingFences(line);
        if (intersecting.length > 0) {
          overlapType.value = 'fence'; overlappingFeatures.value = intersecting;
          selectedAppendTarget.value = intersecting[0]!.id; showOverlapDialog.value = true;
        } else { showGeofenceDialog.value = true; }
      } else if (mode === 'pasture') {
        pendingGeofenceType.value = 'pasture';
        const rawPoly = graphic.geometry as Polygon;
        const poly = (rawPoly.spatialReference.isWebMercator ? webMercatorUtils.webMercatorToGeographic(rawPoly) : rawPoly) as Polygon;
        pendingGeometry = { rings: poly.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
        resetGeoForm();
        const overlapping = findOverlappingPolygons(poly, 'pasture');
        if (overlapping.length > 0) {
          overlapType.value = 'pasture'; overlappingFeatures.value = overlapping;
          selectedAppendTarget.value = overlapping[0]!.id; showOverlapDialog.value = true;
        } else { showGeofenceDialog.value = true; }
      } else if (mode === 'treatment') {
        pendingGeofenceType.value = 'treatment';
        const rawPoly = graphic.geometry as Polygon;
        const poly = (rawPoly.spatialReference.isWebMercator ? webMercatorUtils.webMercatorToGeographic(rawPoly) : rawPoly) as Polygon;
        pendingGeometry = { rings: poly.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
        resetTreatmentForm();
        showTreatmentDialog.value = true;
      } else if (mode === 'outbuilding') {
        pendingGeofenceType.value = 'outbuilding';
        const rawPoly = graphic.geometry as Polygon;
        const poly = (rawPoly.spatialReference.isWebMercator ? webMercatorUtils.webMercatorToGeographic(rawPoly) : rawPoly) as Polygon;
        pendingGeometry = { rings: poly.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
        resetGeoForm();
        const overlapping = findOverlappingPolygons(poly, 'outbuilding');
        if (overlapping.length > 0) {
          overlapType.value = 'outbuilding'; overlappingFeatures.value = overlapping;
          selectedAppendTarget.value = overlapping[0]!.id; showOverlapDialog.value = true;
        } else { showGeofenceDialog.value = true; }
      } else {
        pendingPointType.value = mode;
        const pt = graphic.geometry as Point;
        pendingPointCoords = { longitude: pt.longitude ?? 0, latitude: pt.latitude ?? 0 };
        resetPointForm(); showPointDialog.value = true;
      }
      sketchLayer.removeAll();
    }

    function findOverlappingPolygons(newPoly: Polygon, type: GeofenceType): { id: string; label: string }[] {
      const results: { id: string; label: string }[] = [];
      for (const [id, fence] of Object.entries(geofences.value)) {
        if (fence.type !== type || !('rings' in fence.geometry)) continue;
        const existing = new Polygon({ rings: fence.geometry.rings, spatialReference: { wkid: 4326 } });
        if (geometryEngine.intersects(newPoly, existing)) {
          results.push({ id, label: fence.description || fence.plotType || fence.outbuildingType || `${type} ${id.slice(-4)}` });
        }
      }
      return results;
    }

    function findIntersectingFences(newLine: Polyline): { id: string; label: string }[] {
      const results: { id: string; label: string }[] = [];
      for (const [id, fence] of Object.entries(geofences.value)) {
        if (fence.type !== 'fence') continue;
        if ('paths' in fence.geometry) {
          const existing = new Polyline({ paths: fence.geometry.paths, spatialReference: { wkid: 4326 } });
          if (geometryEngine.intersects(newLine, existing)) results.push({ id, label: fence.description || fence.fenceType || `Fence ${id.slice(-4)}` });
        } else if ('rings' in fence.geometry) {
          const existing = new Polygon({ rings: fence.geometry.rings, spatialReference: { wkid: 4326 } });
          if (geometryEngine.intersects(newLine, existing)) results.push({ id, label: fence.description || fence.fenceType || `Fence ${id.slice(-4)}` });
        }
      }
      return results;
    }

    function resetGeoForm() { geoForm.material = ''; geoForm.fenceType = ''; geoForm.description = ''; geoForm.soilType = ''; geoForm.plotType = ''; geoForm.outbuildingType = ''; resetStyleForm(pendingGeofenceType.value); }
    function resetPointForm() { pointForm.description = ''; pointForm.quantity = 1; }

    // Save handlers
    function cancelGeofenceSave() { showGeofenceDialog.value = false; pendingGeometry = null; }
    function cancelTreatmentSave() { showTreatmentDialog.value = false; pendingGeometry = null; }
    function cancelPointSave() { showPointDialog.value = false; pendingPointCoords = null; }
    function cancelOverlapDialog() { showOverlapDialog.value = false; pendingGeometry = null; }
    function overlapSaveAsNew() { showOverlapDialog.value = false; showGeofenceDialog.value = true; }

    async function confirmGeofenceSave() {
      if (!pendingGeometry) return;
      const type = pendingGeofenceType.value;
      const { uid, displayName } = getUserInfo();
      const fence: GeoFence = {
        type, geometry: pendingGeometry, createdAt: Date.now(), createdBy: uid, createdByName: displayName,
        description: geoForm.description, material: geoForm.material, fenceType: geoForm.fenceType,
        soilType: geoForm.soilType, plotType: geoForm.plotType, treatmentType: '', treatmentDate: '',
        treatmentCustomType: '', outbuildingType: geoForm.outbuildingType, style: cloneStyle(styleForm),
      };
      try { const id = await saveGeofence(null, fence); addGeofenceGraphic(id, fence); $q.notify({ type: 'positive', message: `${type.charAt(0).toUpperCase() + type.slice(1)} saved` }); }
      catch { $q.notify({ type: 'negative', message: 'Failed to save' }); }
      showGeofenceDialog.value = false; pendingGeometry = null;
    }

    async function confirmTreatmentSave() {
      if (!pendingGeometry) return;
      const { uid, displayName } = getUserInfo();
      const fence: GeoFence = {
        type: 'treatment', geometry: pendingGeometry, createdAt: Date.now(), createdBy: uid, createdByName: displayName,
        description: geoForm.description, material: '', fenceType: '', soilType: '', plotType: '',
        treatmentType: treatmentForm.treatmentType, treatmentDate: treatmentForm.treatmentDate,
        treatmentCustomType: treatmentForm.treatmentType === 'other' ? treatmentForm.customType : '',
        outbuildingType: '', style: cloneStyle(styleForm),
      };
      try { const id = await saveGeofence(null, fence); addGeofenceGraphic(id, fence); $q.notify({ type: 'positive', message: 'Treatment saved' }); }
      catch { $q.notify({ type: 'negative', message: 'Failed to save treatment' }); }
      showTreatmentDialog.value = false; pendingGeometry = null;
    }

    async function overlapAppendToExisting() {
      if (!pendingGeometry || !selectedAppendTarget.value) return;
      const targetId = selectedAppendTarget.value;
      const targetFence = geofences.value[targetId]; if (!targetFence) return;
      try {
        if ((overlapType.value === 'pasture' || overlapType.value === 'outbuilding') && 'rings' in pendingGeometry && 'rings' in targetFence.geometry) {
          const newPoly = new Polygon({ rings: pendingGeometry.rings, spatialReference: { wkid: 4326 } });
          const existingPoly = new Polygon({ rings: targetFence.geometry.rings, spatialReference: { wkid: 4326 } });
          const unionResult = geometryEngine.union([newPoly, existingPoly]) as Polygon;
          const mergedGeometry = { rings: unionResult.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
          await updateGeofence(targetId, { geometry: mergedGeometry });
          removeGraphicById(targetFence.type, targetId); addGeofenceGraphic(targetId, { ...targetFence, geometry: mergedGeometry });
          $q.notify({ type: 'positive', message: 'Appended successfully' });
        } else if (overlapType.value === 'fence' && 'paths' in pendingGeometry) {
          const mergedGeometry = 'paths' in targetFence.geometry
            ? { paths: [...targetFence.geometry.paths, ...pendingGeometry.paths] }
            : { paths: [...pendingGeometry.paths] };
          await updateGeofence(targetId, { geometry: mergedGeometry });
          removeGraphicById(targetFence.type, targetId); addGeofenceGraphic(targetId, { ...targetFence, geometry: mergedGeometry });
          $q.notify({ type: 'positive', message: 'Fence appended successfully' });
        }
      } catch { $q.notify({ type: 'negative', message: 'Failed to append' }); }
      showOverlapDialog.value = false; pendingGeometry = null;
    }

    async function confirmPointSave() {
      if (!pendingPointCoords) return;
      const type = pendingPointType.value;
      const { uid, displayName } = getUserInfo();
      const point: MapPoint = {
        type, longitude: pendingPointCoords.longitude, latitude: pendingPointCoords.latitude,
        description: pointForm.description, createdAt: Date.now(), createdBy: uid, createdByName: displayName,
        quantity: type === 'animal' ? pointForm.quantity : 0,
      };
      try { const id = await saveMapPoint(null, point); addPointGraphic(id, point); $q.notify({ type: 'positive', message: `${POINT_PICKER_META[type]?.label ?? 'Point'} saved` }); }
      catch { $q.notify({ type: 'negative', message: 'Failed to save point' }); }
      showPointDialog.value = false; pendingPointCoords = null;
    }

    // Rendering
    function addGeofenceGraphic(id: string, fence: GeoFence) {
      const layer = graphicsLayerMap[fence.type]; if (!layer) return;
      const s = fence.style;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let geometry: any; let symbol: any;

      if (fence.type === 'fence' && isFencePolyline(fence)) {
        geometry = new Polyline({ paths: fence.geometry.paths, spatialReference: { wkid: 4326 } });
        symbol = s ? new SimpleLineSymbol({ color: hexToRgb(s.borderColor), width: s.borderWidth, style: s.borderStyle }) : FENCE_SYMBOL.clone();
      } else if (fence.type === 'fence' && 'rings' in fence.geometry) {
        geometry = new Polygon({ rings: fence.geometry.rings, spatialReference: { wkid: 4326 } });
        symbol = s ? new SimpleFillSymbol({ color: hexToRgba(s.fillColor, s.fillOpacity), outline: { color: hexToRgb(s.borderColor), width: s.borderWidth, style: s.borderStyle } })
          : new SimpleFillSymbol({ color: [139, 90, 43, 0.25], outline: { color: [139, 90, 43], width: 2, style: 'dash' } });
      } else {
        geometry = new Polygon({ rings: (fence.geometry as MapRing).rings, spatialReference: { wkid: 4326 } });
        const defaultSym = fence.type === 'treatment' ? TREATMENT_SYMBOL : fence.type === 'outbuilding' ? OUTBUILDING_SYMBOL : PASTURE_SYMBOL;
        symbol = s ? new SimpleFillSymbol({ color: hexToRgba(s.fillColor, s.fillOpacity), outline: { color: hexToRgb(s.borderColor), width: s.borderWidth, style: s.borderStyle } }) : defaultSym.clone();
      }

      layer.add(new Graphic({ geometry, symbol, attributes: { id, kind: 'geofence', subtype: fence.type } }));

      // Label
      if (s?.label) {
        let labelPoint: Point | undefined;
        let labelAngle = 0;
        if (geometry.type === 'polygon') { labelPoint = geometry.centroid ?? undefined; }
        else if (geometry.type === 'polyline' && s.labelFollowLine) {
          const path = geometry.paths[0];
          if (path?.length >= 2) {
            let totalLen = 0; const segLens: number[] = [];
            for (let i = 0; i < path.length - 1; i++) {
              const dx = (path[i + 1]![0] ?? 0) - (path[i]![0] ?? 0);
              const dy = (path[i + 1]![1] ?? 0) - (path[i]![1] ?? 0);
              const len = Math.sqrt(dx * dx + dy * dy); segLens.push(len); totalLen += len;
            }
            const half = totalLen / 2; let acc = 0;
            for (let i = 0; i < segLens.length; i++) {
              if (acc + segLens[i]! >= half) {
                const [ax = 0, ay = 0] = path[i]!; const [bx = 0, by = 0] = path[i + 1]!;
                const t = (half - acc) / segLens[i]!;
                labelPoint = new Point({ x: ax + t * (bx - ax), y: ay + t * (by - ay), spatialReference: geometry.spatialReference });
                labelAngle = -(Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
                if (labelAngle > 90) labelAngle -= 180; if (labelAngle < -90) labelAngle += 180;
                break;
              }
              acc += segLens[i]!;
            }
          }
        } else { labelPoint = geometry.extent?.center; }
        if (labelPoint) {
          const labelGraphic = new Graphic({ geometry: labelPoint, attributes: { id, kind: 'geofence-label', parentId: id } });
          // @ts-expect-error ArcGIS TextSymbol runtime compatibility
          labelGraphic.symbol = new TextSymbol({ text: s.label, color: hexToRgb(s.labelColor), font: { size: s.labelSize, weight: 'bold' }, haloColor: [255, 255, 255], haloSize: 1, angle: labelAngle });
          layer.add(labelGraphic);
        }
      }
    }

    function addPointGraphic(id: string, point: MapPoint) {
      const layer = graphicsLayerMap[point.type]; if (!layer) return;
      const pt = new Point({ longitude: point.longitude, latitude: point.latitude });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      layer.add(new Graphic({ geometry: pt, symbol: POINT_SYMBOLS[point.type].clone() as any, attributes: { id, kind: 'point', subtype: point.type } }));
    }

    function renderAllFeatures() {
      Object.values(graphicsLayerMap).forEach((l) => l.removeAll());
      for (const [id, fence] of Object.entries(geofences.value)) addGeofenceGraphic(id, fence);
      for (const [id, point] of Object.entries(mapPoints.value)) addPointGraphic(id, point);
    }

    function removeGraphicById(layerKey: string, id: string) {
      const layer = graphicsLayerMap[layerKey]; if (!layer) return;
      const toRemove = layer.graphics.filter((g) => g.attributes?.id === id || g.attributes?.parentId === id);
      toRemove.forEach((g) => layer.remove(g));
    }

    // Feature detail
    function showFeatureDetailForItem(id: string, kind: 'geofence' | 'point', subtype: string) {
      selectedFeatureId = id; selectedFeatureKind.value = kind; editingFeature.value = false;
      if (kind === 'geofence') {
        const fence = geofences.value[id]; if (!fence) return;
        const typeLabels: Record<GeofenceType, string> = { fence: 'Fence', pasture: 'Pasture', treatment: 'Treatment', outbuilding: 'Outbuilding' };
        featureDetailTitle.value = typeLabels[fence.type] ?? fence.type;
        const details: Record<string, string> = {};
        if (fence.type === 'fence') { if (fence.material) details['Material'] = fence.material; if (fence.fenceType) details['Fence Type'] = fence.fenceType; }
        else if (fence.type === 'treatment') {
          const dt = fence.treatmentType === 'other' ? fence.treatmentCustomType : fence.treatmentType;
          if (dt) details['Treatment Type'] = dt; if (fence.treatmentDate) details['Treatment Date'] = fence.treatmentDate;
        } else if (fence.type === 'outbuilding') { if (fence.outbuildingType) details['Building Type'] = fence.outbuildingType; }
        else { if (fence.soilType) details['Terrain'] = fence.soilType; if (fence.plotType) details['Pasture Type'] = fence.plotType; }
        if (fence.description) details['Description'] = fence.description;
        if (fence.style?.label) details['Label'] = fence.style.label;
        details['Plotted by'] = fence.createdByName || 'Unknown';
        details['Plotted at'] = new Date(fence.createdAt).toLocaleString();
        featureDetailAttrs.value = details;
      } else {
        const point = mapPoints.value[id]; if (!point) return;
        featureDetailTitle.value = POINT_PICKER_META[subtype]?.label ?? 'Point';
        const details: Record<string, string> = {};
        if (point.description) details['Description'] = point.description;
        if (point.type === 'animal' && point.quantity) details['Head Count'] = String(point.quantity);
        details['Plotted by'] = point.createdByName || 'Unknown';
        details['Plotted at'] = new Date(point.createdAt).toLocaleString();
        featureDetailAttrs.value = details;
      }
      showFeatureDetail.value = true;
    }

    // Click handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleHitTestResult(response: any) {
      const seen = new Set<string>();
      const hits: { id: string; kind: 'geofence' | 'point'; subtype: string }[] = [];
      for (const r of response.results) {
        if (r.type !== 'graphic') continue;
        const attrs = r.graphic.attributes;
        if (!attrs?.kind || attrs.kind === 'geofence-label') continue;
        const id = attrs.id as string; if (seen.has(id)) continue; seen.add(id);
        hits.push({ id, kind: attrs.kind, subtype: attrs.subtype });
      }
      if (hits.length === 0) return;
      if (hits.length === 1) { showFeatureDetailForItem(hits[0]!.id, hits[0]!.kind, hits[0]!.subtype); }
      else {
        const items: PickerItem[] = [];
        for (const h of hits) { const item = buildPickerItem(h.id, h.kind, h.subtype); if (item) items.push(item); }
        if (items.length === 1) showFeatureDetailForItem(items[0]!.id, items[0]!.kind, items[0]!.subtype);
        else if (items.length > 1) { pickerItems.value = items; showFeaturePicker.value = true; }
      }
    }

    // Edit
    function startEditFeature() {
      if (selectedFeatureKind.value === 'geofence') {
        const fence = geofences.value[selectedFeatureId]; if (!fence) return;
        editForm.geofenceSubtype = fence.type; editForm.description = fence.description;
        editForm.material = fence.material; editForm.fenceType = fence.fenceType;
        editForm.soilType = fence.soilType; editForm.plotType = fence.plotType;
        editForm.treatmentType = fence.treatmentType || ''; editForm.treatmentCustomType = fence.treatmentCustomType || '';
        editForm.outbuildingType = fence.outbuildingType || '';
        Object.assign(editForm.style, fence.style ?? cloneStyle(DEFAULT_STYLES[fence.type]));
        showEditStyleSection.value = false;
      } else {
        const point = mapPoints.value[selectedFeatureId]; if (!point) return;
        editForm.pointSubtype = point.type; editForm.description = point.description; editForm.quantity = point.quantity;
      }
      editingFeature.value = true;
    }

    async function saveEditFeature() {
      try {
        if (selectedFeatureKind.value === 'geofence') {
          const fence = geofences.value[selectedFeatureId]; if (!fence) return;
          const updates: Partial<GeoFence> = { description: editForm.description, style: cloneStyle(editForm.style) };
          if (fence.type === 'fence') { updates.material = editForm.material; updates.fenceType = editForm.fenceType; }
          else if (fence.type === 'treatment') { updates.treatmentType = editForm.treatmentType; updates.treatmentCustomType = editForm.treatmentType === 'other' ? editForm.treatmentCustomType : ''; }
          else if (fence.type === 'outbuilding') { updates.outbuildingType = editForm.outbuildingType; }
          else { updates.soilType = editForm.soilType; updates.plotType = editForm.plotType; }
          await updateGeofence(selectedFeatureId, updates);
        } else {
          const updates: Partial<MapPoint> = { description: editForm.description };
          if (editForm.pointSubtype === 'animal') updates.quantity = editForm.quantity;
          await updateMapPoint(selectedFeatureId, updates);
        }
        $q.notify({ type: 'positive', message: 'Updated' });
        editingFeature.value = false; showFeatureDetail.value = false; renderAllFeatures();
      } catch { $q.notify({ type: 'negative', message: 'Failed to update' }); }
    }

    // Move
    function startMoveFeature() {
      if (!view || !sketchVM) return;
      showFeatureDetail.value = false;
      const kind = selectedFeatureKind.value; const id = selectedFeatureId;
      if (kind === 'geofence') {
        const fence = geofences.value[id]; if (!fence) return;
        if (fence.type === 'fence') {
          $q.notify({ type: 'info', message: 'Draw the new fence location' });
          movingFeature.value = true; sketchLayer.removeAll(); void sketchVM.create('polyline');
          const handler = sketchVM.on('create', (event) => {
            if (event.state !== 'complete') return; handler.remove(); moveEventHandler = null; movingFeature.value = false;
            if (!event.graphic) return;
            const line = event.graphic.geometry as Polyline;
            const newGeo: MapPath = { paths: line.paths.map((p: number[][]) => p.map((c: number[]) => [...c])) };
            void updateGeofence(id, { geometry: newGeo }).then(() => { removeGraphicById(fence.type, id); addGeofenceGraphic(id, geofences.value[id]!); $q.notify({ type: 'positive', message: 'Fence moved' }); })
              .catch(() => $q.notify({ type: 'negative', message: 'Failed to move fence' }));
            sketchLayer.removeAll();
          }); moveEventHandler = handler;
        } else {
          $q.notify({ type: 'info', message: `Draw the new ${fence.type} location` });
          movingFeature.value = true; sketchLayer.removeAll(); void sketchVM.create('polygon');
          const handler = sketchVM.on('create', (event) => {
            if (event.state !== 'complete') return; handler.remove(); moveEventHandler = null; movingFeature.value = false;
            if (!event.graphic) return;
            const poly = event.graphic.geometry as Polygon;
            const newGeo = { rings: poly.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
            void updateGeofence(id, { geometry: newGeo }).then(() => { removeGraphicById(fence.type, id); addGeofenceGraphic(id, geofences.value[id]!); $q.notify({ type: 'positive', message: 'Moved' }); })
              .catch(() => $q.notify({ type: 'negative', message: 'Failed to move' }));
            sketchLayer.removeAll();
          }); moveEventHandler = handler;
        }
      } else {
        $q.notify({ type: 'info', message: 'Click the new location' }); sketchLayer.removeAll(); void sketchVM.create('point');
        const handler = sketchVM.on('create', (event) => {
          if (event.state !== 'complete') return; handler.remove(); if (!event.graphic) return;
          const pt = event.graphic.geometry as Point;
          void updateMapPoint(id, { longitude: pt.longitude ?? 0, latitude: pt.latitude ?? 0 }).then(() => {
            const point = mapPoints.value[id]; if (point) { removeGraphicById(point.type, id); addPointGraphic(id, point); }
            $q.notify({ type: 'positive', message: 'Moved' });
          }).catch(() => $q.notify({ type: 'negative', message: 'Failed to move' }));
          sketchLayer.removeAll();
        });
      }
    }

    // Delete
    function deleteSelectedFeature() {
      $q.dialog({ title: 'Confirm Delete', message: `Delete this ${featureDetailTitle.value.toLowerCase()}?`, cancel: true, persistent: true }).onOk(() => {
        void (async () => {
          try {
            if (selectedFeatureKind.value === 'geofence') { const f = geofences.value[selectedFeatureId]; if (f) { await deleteGeofence(selectedFeatureId); removeGraphicById(f.type, selectedFeatureId); } }
            else { const p = mapPoints.value[selectedFeatureId]; if (p) { await deleteMapPoint(selectedFeatureId); removeGraphicById(p.type, selectedFeatureId); } }
            $q.notify({ type: 'positive', message: 'Deleted' });
          } catch { $q.notify({ type: 'negative', message: 'Failed to delete' }); }
          showFeatureDetail.value = false;
        })();
      });
    }

    // Split polygon
    function startSplitFeature() {
      const fence = geofences.value[selectedFeatureId];
      if (!fence || !('rings' in fence.geometry)) return;
      splitSourceId = selectedFeatureId;
      splitSourceFence.value = { ...fence, geometry: { ...fence.geometry }, ...(fence.style ? { style: cloneStyle(fence.style) } : {}) };
      showFeatureDetail.value = false; startSplitDraw();
    }

    function startSplitDraw() {
      if (!view || !sketchVM) return;
      splittingFeature.value = true; sketchLayer.removeAll();
      splitSavedPolylineSymbol = sketchVM.polylineSymbol;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sketchVM.polylineSymbol = new SimpleLineSymbol({ color: [249, 168, 37], width: 3, style: 'dash' }) as any;
      $q.notify({ type: 'info', message: 'Draw a line across the polygon to split it' });
      void sketchVM.create('polyline');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler = sketchVM.on('create', (event: any) => {
        if (event.state !== 'complete') return;
        handler.remove(); splitEventHandler = null; splittingFeature.value = false;
        if (splitSavedPolylineSymbol) { sketchVM!.polylineSymbol = splitSavedPolylineSymbol; splitSavedPolylineSymbol = null; }
        if (!event.graphic) { cancelSplit(); return; }
        handleSplitLineComplete(event.graphic as Graphic); sketchLayer.removeAll();
      });
      splitEventHandler = handler;
    }

    function handleSplitLineComplete(lineGraphic: Graphic) {
      const src = splitSourceFence.value;
      if (!src || !('rings' in src.geometry)) { cancelSplit(); return; }
      const srcPolygon = new Polygon({ rings: src.geometry.rings, spatialReference: { wkid: 4326 } });
      const projectedPoly = webMercatorUtils.geographicToWebMercator(srcPolygon) as Polygon;
      const results = geometryEngine.cut(projectedPoly, lineGraphic.geometry as Polyline);
      if (results.length < 2) { $q.notify({ type: 'warning', message: 'Line must fully cross the polygon.' }); startSplitDraw(); return; }
      if (results.length > 2) { $q.notify({ type: 'warning', message: 'Line creates more than 2 pieces.' }); startSplitDraw(); return; }
      const poly1 = webMercatorUtils.webMercatorToGeographic(results[0]!) as Polygon;
      const poly2 = webMercatorUtils.webMercatorToGeographic(results[1]!) as Polygon;
      splitPolygons.value = [
        { rings: poly1.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) },
        { rings: poly2.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) },
      ];
      populateSplitForms(); updateSplitPreviewGraphics();
      splitReviewed[0] = false; splitReviewed[1] = false; showSplitReviewDialog.value = true;
    }

    function populateSplitForms() {
      const src = splitSourceFence.value; if (!src) return;
      for (let i = 0; i < 2; i++) {
        const form = splitForms[i]!;
        form.material = src.material ?? ''; form.fenceType = src.fenceType ?? '';
        form.description = src.description ?? ''; form.soilType = src.soilType ?? '';
        form.plotType = src.plotType ?? ''; form.outbuildingType = src.outbuildingType ?? '';
        form.treatmentType = src.treatmentType ?? ''; form.treatmentCustomType = src.treatmentCustomType ?? '';
        form.treatmentDate = src.treatmentDate ?? '';
        Object.assign(form.style, src.style ?? cloneStyle(DEFAULT_STYLES[src.type]));
      }
    }

    function updateSplitPreviewGraphics() {
      sketchLayer.removeAll();
      const normalSym = new SimpleFillSymbol({ color: [100, 100, 100, 0.15], outline: { color: [100, 100, 100], width: 2, style: 'dash' } });
      const highlightSym = new SimpleFillSymbol({ color: [255, 235, 59, 0.4], outline: { color: [255, 152, 0], width: 3, style: 'solid' } });
      splitPolygons.value.forEach((poly, idx) => {
        const polygon = new Polygon({ rings: poly.rings, spatialReference: { wkid: 4326 } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sketchLayer.add(new Graphic({ geometry: polygon, symbol: (idx === splitHighlightIndex.value ? highlightSym : normalSym) as any }));
      });
    }

    function onSplitCardHover(idx: number) { splitHighlightIndex.value = idx; updateSplitPreviewGraphics(); }
    function onSplitCardLeave() { splitHighlightIndex.value = -1; updateSplitPreviewGraphics(); }

    function openSplitEdit(idx: number) {
      splitEditIndex.value = idx;
      const form = splitForms[idx]!; const src = splitSourceFence.value; if (!src) return;
      editForm.geofenceSubtype = src.type; editForm.description = form.description;
      editForm.material = form.material; editForm.fenceType = form.fenceType;
      editForm.soilType = form.soilType; editForm.plotType = form.plotType;
      editForm.outbuildingType = form.outbuildingType; editForm.treatmentType = form.treatmentType;
      editForm.treatmentCustomType = form.treatmentCustomType;
      Object.assign(editForm.style, form.style);
      showEditStyleSection.value = false; showSplitEditDialog.value = true;
    }

    function saveSplitEdit() {
      const form = splitForms[splitEditIndex.value]!;
      form.description = editForm.description; form.material = editForm.material;
      form.fenceType = editForm.fenceType; form.soilType = editForm.soilType;
      form.plotType = editForm.plotType; form.outbuildingType = editForm.outbuildingType;
      form.treatmentType = editForm.treatmentType; form.treatmentCustomType = editForm.treatmentCustomType;
      Object.assign(form.style, editForm.style);
      splitReviewed[splitEditIndex.value] = true; showSplitEditDialog.value = false;
    }

    async function confirmSplit() {
      const src = splitSourceFence.value;
      if (!src || splitPolygons.value.length !== 2) return;
      const type = src.type; const { uid, displayName } = getUserInfo();
      try {
        for (let i = 0; i < 2; i++) {
          const form = splitForms[i]!;
          const rawPoly = toRaw(splitPolygons.value[i]!);
          const plainGeometry: MapRing = { rings: rawPoly.rings.map((r: number[][]) => r.map((c: number[]) => [c[0]!, c[1]!])) };
          const fence: GeoFence = {
            type, geometry: plainGeometry, createdAt: Date.now(), createdBy: uid, createdByName: displayName,
            description: form.description ?? '', material: form.material ?? '', fenceType: form.fenceType ?? '',
            soilType: form.soilType ?? '', plotType: form.plotType ?? '', treatmentType: form.treatmentType ?? '',
            treatmentDate: form.treatmentDate ?? '', treatmentCustomType: form.treatmentCustomType ?? '',
            outbuildingType: form.outbuildingType ?? '', style: cloneStyle(form.style),
          };
          const newId = await saveGeofence(null, fence); addGeofenceGraphic(newId, fence);
        }
        const orig = geofences.value[splitSourceId];
        if (orig) { await deleteGeofence(splitSourceId); removeGraphicById(orig.type, splitSourceId); }
        $q.notify({ type: 'positive', message: 'Split successfully' });
      } catch { $q.notify({ type: 'negative', message: 'Failed to split' }); }
      showSplitReviewDialog.value = false; sketchLayer.removeAll();
      splitSourceId = ''; splitSourceFence.value = null; splitPolygons.value = [];
    }

    function cancelSplit() {
      splittingFeature.value = false; showSplitReviewDialog.value = false; showSplitEditDialog.value = false;
      sketchLayer.removeAll();
      if (splitEventHandler) { splitEventHandler.remove(); splitEventHandler = null; }
      if (sketchVM) { sketchVM.cancel(); if (splitSavedPolylineSymbol) { sketchVM.polylineSymbol = splitSavedPolylineSymbol; splitSavedPolylineSymbol = null; } }
      splitSourceId = ''; splitSourceFence.value = null; splitPolygons.value = [];
    }

    const splitSvgData = computed(() => splitPolygons.value.map(poly => {
      if (!poly.rings?.[0]?.length) return { viewBox: '0 0 120 90', path: '' };
      const ring = poly.rings[0]; let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const coord of ring) { const x = coord[0] ?? 0, y = coord[1] ?? 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      const w = maxX - minX || 1, h = maxY - minY || 1, pad = 8, svgW = 120, svgH = 90;
      const scale = Math.min((svgW - 2 * pad) / w, (svgH - 2 * pad) / h);
      const offX = pad + ((svgW - 2 * pad) - w * scale) / 2, offY = pad + ((svgH - 2 * pad) - h * scale) / 2;
      const points = ring.map(c => `${(((c[0] ?? 0) - minX) * scale + offX).toFixed(1)},${(svgH - (((c[1] ?? 0) - minY) * scale + offY)).toFixed(1)}`);
      return { viewBox: `0 0 ${svgW} ${svgH}`, path: `M${points.join('L')}Z` };
    }));
    const splitPreviewColors = computed(() => {
      const src = splitSourceFence.value;
      if (!src) return { fill: 'rgba(76,175,80,0.3)', stroke: '#388E3C' };
      const s = src.style ?? DEFAULT_STYLES[src.type]; const [r, g, b] = hexToRgb(s.fillColor);
      return { fill: `rgba(${r},${g},${b},${s.fillOpacity})`, stroke: s.borderColor };
    });

    // Join
    function startJoinFeature() {
      const fence = geofences.value[selectedFeatureId];
      if (!fence || !('rings' in fence.geometry)) return;
      joinSourceId = selectedFeatureId;
      joinSourceFence.value = { ...fence, geometry: { ...fence.geometry }, ...(fence.style ? { style: cloneStyle(fence.style) } : {}) };
      showFeatureDetail.value = false; joiningFeature.value = true;
      highlightJoinSource();
      $q.notify({ type: 'info', message: 'Click the polygon to join with' });
      if (view) {
        joinClickHandler = view.on('click', (event) => {
          event.stopPropagation();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          void view!.hitTest(event).then((response: any) => handleJoinTargetClick(response));
        });
      }
    }

    function highlightJoinSource() {
      sketchLayer.removeAll();
      const src = joinSourceFence.value; if (!src || !('rings' in src.geometry)) return;
      const highlightSym = new SimpleFillSymbol({ color: [255, 235, 59, 0.4], outline: { color: [255, 152, 0], width: 3, style: 'solid' } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sketchLayer.add(new Graphic({ geometry: new Polygon({ rings: src.geometry.rings, spatialReference: { wkid: 4326 } }), symbol: highlightSym as any }));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleJoinTargetClick(response: any) {
      for (const r of response.results) {
        if (r.type !== 'graphic') continue;
        const attrs = r.graphic.attributes;
        if (!attrs?.kind || attrs.kind === 'geofence-label' || attrs.kind !== 'geofence') continue;
        const id = attrs.id as string; if (id === joinSourceId) continue;
        const targetFence = geofences.value[id];
        if (!targetFence || !('rings' in targetFence.geometry)) continue;
        const src = joinSourceFence.value; if (!src) continue;
        if (targetFence.type !== src.type) { $q.notify({ type: 'warning', message: `Cannot join different types.` }); return; }
        joinTargetId = id;
        joinTargetFence.value = { ...targetFence, geometry: { ...targetFence.geometry }, ...(targetFence.style ? { style: cloneStyle(targetFence.style) } : {}) };
        if (joinClickHandler) { joinClickHandler.remove(); joinClickHandler = null; }
        joiningFeature.value = false; performJoinUnion(); return;
      }
    }

    function performJoinUnion() {
      const src = joinSourceFence.value; const tgt = joinTargetFence.value;
      if (!src || !tgt || !('rings' in src.geometry) || !('rings' in tgt.geometry)) { cancelJoin(); return; }
      const srcPoly = new Polygon({ rings: src.geometry.rings, spatialReference: { wkid: 4326 } });
      const tgtPoly = new Polygon({ rings: tgt.geometry.rings, spatialReference: { wkid: 4326 } });
      const touching = geometryEngine.intersects(srcPoly, tgtPoly);
      let unionResult: Polygon;
      if (touching) { unionResult = geometryEngine.union([srcPoly, tgtPoly]) as Polygon; }
      else { const combined = geometryEngine.union([srcPoly, tgtPoly]) as Polygon; unionResult = geometryEngine.convexHull(combined, true) as Polygon; }
      if (!unionResult?.rings?.length) { $q.notify({ type: 'warning', message: 'Failed to join' }); cancelJoin(); return; }
      joinedPolygon.value = { rings: unionResult.rings.map((r: number[][]) => r.map((c: number[]) => [...c])) };
      joinForm.material = src.material ?? ''; joinForm.fenceType = src.fenceType ?? '';
      joinForm.description = src.description ?? ''; joinForm.soilType = src.soilType ?? '';
      joinForm.plotType = src.plotType ?? ''; joinForm.outbuildingType = src.outbuildingType ?? '';
      Object.assign(joinForm.style, src.style ?? cloneStyle(DEFAULT_STYLES[src.type]));
      updateJoinPreviewGraphic(); joinConfirmed.value = false; showJoinPreviewDialog.value = true;
    }

    function updateJoinPreviewGraphic() {
      sketchLayer.removeAll(); const poly = joinedPolygon.value; if (!poly) return;
      const previewSym = new SimpleFillSymbol({ color: [100, 100, 100, 0.15], outline: { color: [100, 100, 100], width: 2, style: 'dash' } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sketchLayer.add(new Graphic({ geometry: new Polygon({ rings: poly.rings, spatialReference: { wkid: 4326 } }), symbol: previewSym as any }));
    }

    const joinSvgData = computed(() => {
      const poly = joinedPolygon.value;
      if (!poly?.rings?.[0]?.length) return { viewBox: '0 0 120 90', path: '' };
      const ring = poly.rings[0]; let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const coord of ring) { const x = coord[0] ?? 0, y = coord[1] ?? 0; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
      const w = maxX - minX || 1, h = maxY - minY || 1, pad = 8, svgW = 120, svgH = 90;
      const scale = Math.min((svgW - 2 * pad) / w, (svgH - 2 * pad) / h);
      const offX = pad + ((svgW - 2 * pad) - w * scale) / 2, offY = pad + ((svgH - 2 * pad) - h * scale) / 2;
      const points = ring.map(c => `${(((c[0] ?? 0) - minX) * scale + offX).toFixed(1)},${(svgH - (((c[1] ?? 0) - minY) * scale + offY)).toFixed(1)}`);
      return { viewBox: `0 0 ${svgW} ${svgH}`, path: `M${points.join('L')}Z` };
    });
    const joinPreviewColors = computed(() => {
      const src = joinSourceFence.value;
      if (!src) return { fill: 'rgba(76,175,80,0.3)', stroke: '#388E3C' };
      const s = src.style ?? DEFAULT_STYLES[src.type]; const [r, g, b] = hexToRgb(s.fillColor);
      return { fill: `rgba(${r},${g},${b},${s.fillOpacity})`, stroke: s.borderColor };
    });

    function openJoinEdit() {
      const src = joinSourceFence.value; if (!src) return;
      editForm.geofenceSubtype = src.type; editForm.description = joinForm.description;
      editForm.material = joinForm.material; editForm.fenceType = joinForm.fenceType;
      editForm.soilType = joinForm.soilType; editForm.plotType = joinForm.plotType;
      editForm.outbuildingType = joinForm.outbuildingType;
      Object.assign(editForm.style, joinForm.style);
      showEditStyleSection.value = false; showJoinEditDialog.value = true;
    }

    function saveJoinEdit() {
      joinForm.description = editForm.description; joinForm.material = editForm.material;
      joinForm.fenceType = editForm.fenceType; joinForm.soilType = editForm.soilType;
      joinForm.plotType = editForm.plotType; joinForm.outbuildingType = editForm.outbuildingType;
      Object.assign(joinForm.style, editForm.style);
      joinConfirmed.value = true; showJoinEditDialog.value = false;
    }

    async function confirmJoin() {
      const src = joinSourceFence.value; if (!src || !joinedPolygon.value) return;
      const type = src.type; const { uid, displayName } = getUserInfo();
      try {
        const rawPoly = toRaw(joinedPolygon.value);
        const plainGeometry: MapRing = { rings: rawPoly.rings.map((r: number[][]) => r.map((c: number[]) => [c[0]!, c[1]!])) };
        const fence: GeoFence = {
          type, geometry: plainGeometry, createdAt: Date.now(), createdBy: uid, createdByName: displayName,
          description: joinForm.description ?? '', material: joinForm.material ?? '', fenceType: joinForm.fenceType ?? '',
          soilType: joinForm.soilType ?? '', plotType: joinForm.plotType ?? '', treatmentType: joinForm.treatmentType ?? '',
          treatmentDate: joinForm.treatmentDate ?? '', treatmentCustomType: joinForm.treatmentCustomType ?? '',
          outbuildingType: joinForm.outbuildingType ?? '', style: cloneStyle(joinForm.style),
        };
        const newId = await saveGeofence(null, fence); addGeofenceGraphic(newId, fence);
        const origSrc = geofences.value[joinSourceId]; if (origSrc) { await deleteGeofence(joinSourceId); removeGraphicById(origSrc.type, joinSourceId); }
        const origTgt = geofences.value[joinTargetId]; if (origTgt) { await deleteGeofence(joinTargetId); removeGraphicById(origTgt.type, joinTargetId); }
        $q.notify({ type: 'positive', message: 'Joined successfully' });
      } catch { $q.notify({ type: 'negative', message: 'Failed to join' }); }
      showJoinPreviewDialog.value = false; showJoinEditDialog.value = false; sketchLayer.removeAll();
      joinSourceId = ''; joinTargetId = ''; joinSourceFence.value = null; joinTargetFence.value = null;
      joinedPolygon.value = null; joinConfirmed.value = false;
    }

    function cancelJoin() {
      joiningFeature.value = false; showJoinPreviewDialog.value = false; showJoinEditDialog.value = false;
      sketchLayer.removeAll();
      if (joinClickHandler) { joinClickHandler.remove(); joinClickHandler = null; }
      joinSourceId = ''; joinTargetId = ''; joinSourceFence.value = null; joinTargetFence.value = null;
      joinedPolygon.value = null; joinConfirmed.value = false;
    }

    // Favorites
    function openSaveFavoriteDialog() { favoriteName.value = ''; showSaveFavoriteDialog.value = true; }
    async function confirmSaveFavorite() {
      if (!view || !favoriteName.value.trim()) return;
      try { await saveFavoriteLocation({ name: favoriteName.value.trim(), longitude: view.center.longitude ?? 0, latitude: view.center.latitude ?? 0, zoom: view.zoom, createdAt: Date.now() }); $q.notify({ type: 'positive', message: 'Saved' }); }
      catch { $q.notify({ type: 'negative', message: 'Failed to save' }); }
      showSaveFavoriteDialog.value = false;
    }
    function goToFavorite(fav: { longitude: number; latitude: number; zoom: number }) { if (view) void view.goTo({ center: [fav.longitude, fav.latitude], zoom: fav.zoom }); }
    async function removeFavorite(id: string) {
      try { await deleteFavoriteLocation(id); $q.notify({ type: 'positive', message: 'Removed' }); }
      catch { $q.notify({ type: 'negative', message: 'Failed to remove' }); }
    }

    // Load data
    async function loadFeatureData() {
      if (!activeFarmId.value) return;
      try { await Promise.all([loadGeofences(), loadMapPoints()]); renderAllFeatures(); } catch { /* no features yet */ }
    }
    watch(activeFarmId, () => { void loadFeatureData(); });

    // Lifecycle
    onMounted(() => {
      if (!mapContainer.value) return;
      map = new Map({ basemap: currentBasemap.value });
      map.addMany([fenceGraphicsLayer, pastureGraphicsLayer, treatmentGraphicsLayer, outbuildingGraphicsLayer,
        waterSourceGraphicsLayer, feederGraphicsLayer, mineralGraphicsLayer, hazardGraphicsLayer,
        gateGraphicsLayer, shelterGraphicsLayer, animalGraphicsLayer, featureGraphicsLayer, sketchLayer]);

      const savedPos = getSavedMapPosition();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      view = new MapView({ container: mapContainer.value, map: map as any, center: savedPos.center, zoom: savedPos.zoom });
      view.watch('stationary', (stationary: boolean) => { if (stationary && view) saveMapPosition(view.center.longitude ?? 0, view.center.latitude ?? 0, view.zoom); });

      searchWidget = new Search({ view }); view.ui.add(searchWidget, { position: 'top-left', index: 0 });
      sketchVM = new SketchViewModel({
        view, layer: sketchLayer,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        polylineSymbol: FENCE_SYMBOL.clone() as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        polygonSymbol: PASTURE_SYMBOL.clone() as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pointSymbol: POINT_SYMBOLS['water-source'].clone() as any,
      });
      sketchVM.on('create', handleSketchCreate);

      // Click handler
      view.on('click', (event) => {
        if (drawMode.value || joiningFeature.value || measureWidgetActive.value) return;
        void view!.hitTest(event).then(handleHitTestResult);
      });

      void loadFeatureData();
      void loadFavoriteLocations();
    });

    onBeforeUnmount(() => {
      destroyMeasureWidgets();
      if (legendWidget) { legendWidget.destroy(); legendWidget = null; }
      for (const layer of Object.values(layerInstances)) layer.destroy();
      if (sketchVM) { sketchVM.destroy(); sketchVM = null; }
      if (searchWidget) { searchWidget.destroy(); searchWidget = null; }
      if (view) { view.destroy(); view = null; }
    });

    return {
      mapContainer, basemaps, currentBasemap, currentBasemapLabel, measureWidgetActive,
      layerCategories, getLayersByCategory, isLayerActive, toggleLayer, changeBasemap,
      activateMeasureArea, activateMeasureDistance, clearMeasurement,
      legendVisible, toggleLegend,
      drawMode, drawModeLabel, hasFarm, startDraw, cancelDraw, completeDraw,
      showGeofenceDialog, pendingGeofenceType, geoForm, terrainOptions,
      cancelGeofenceSave, confirmGeofenceSave,
      showOverlapDialog, overlapType, overlappingFeatures, selectedAppendTarget,
      overlapSaveAsNew, overlapAppendToExisting, cancelOverlapDialog,
      showTreatmentDialog, treatmentForm, treatmentTypeOptions: TREATMENT_TYPE_OPTIONS,
      cancelTreatmentSave, confirmTreatmentSave,
      showPointDialog, pendingPointType, pointForm, pointDialogTitle,
      cancelPointSave, confirmPointSave,
      showFeatureDetail, featureDetailTitle, featureDetailAttrs,
      deleteSelectedFeature, selectedFeatureKind,
      showFeaturePicker, pickerItems, selectPickerItem,
      editingFeature, editForm, startEditFeature, saveEditFeature,
      styleForm, showStyleSection, showEditStyleSection, lineStyleOptions: LINE_STYLE_OPTIONS,
      movingFeature, cancelMove, startMoveFeature,
      splittingFeature, showSplitReviewDialog, showSplitEditDialog,
      splitPolygons, splitReviewed, splitEditIndex, splitSvgData, splitPreviewColors,
      startSplitFeature, onSplitCardHover, onSplitCardLeave,
      openSplitEdit, saveSplitEdit, confirmSplit, cancelSplit,
      joiningFeature, showJoinPreviewDialog, showJoinEditDialog,
      joinSourceFence, joinConfirmed, joinSvgData, joinPreviewColors,
      startJoinFeature, openJoinEdit, saveJoinEdit, confirmJoin, cancelJoin,
      featureLayerToggles, toggleFeatureLayer,
      showSaveFavoriteDialog, favoriteName, sortedFavorites,
      openSaveFavoriteDialog, confirmSaveFavorite, goToFavorite, removeFavorite,
    };
  },
});
</script>

<style scoped>
.maps-page {
  display: flex;
  flex-direction: column;
}

.maps-toolbar {
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.95);
  z-index: 1;
}

.body--dark .maps-toolbar {
  background: rgba(30, 30, 30, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.map-container {
  flex: 1;
  min-height: 0;
}
</style>
