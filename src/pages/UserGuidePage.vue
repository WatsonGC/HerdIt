<template>
  <q-page class="q-pa-md">
    <div style="max-width: 800px; margin: 0 auto">
      <div class="row items-center q-mb-lg">
        <q-icon name="help_outline" size="md" color="info" class="q-mr-sm" />
        <h4 class="q-ma-none">User Guide</h4>
      </div>

      <q-list>
        <!-- Getting Started -->
        <q-expansion-item
          icon="rocket_launch"
          label="Getting Started"
          header-class="text-h6"
          default-opened
        >
          <q-card flat>
            <q-card-section>
              <p>Welcome to <strong>HerdIt</strong> &mdash; your all-in-one animal husbandry and farm management tool.</p>
              <ol>
                <li><strong>Create a farm</strong> &mdash; Head to <em>My Farms</em> in the sidebar and create your first farm. Give it a name, location, acreage, and farm type.</li>
                <li><strong>Add enclosures</strong> &mdash; Go to <em>Enclosures</em> to define pastures, pens, barns, coops, and other housing with capacity and fencing details.</li>
                <li><strong>Register animals</strong> &mdash; Use the <em>Animals</em> page to add your livestock with species, breed, sex, and status information.</li>
                <li><strong>Explore</strong> &mdash; Check the dashboard for stats, weather, upcoming tasks, and health alerts. Dive into breeding records, health tracking, and production logs.</li>
              </ol>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Dashboard -->
        <q-expansion-item icon="dashboard" label="Dashboard">
          <q-card flat>
            <q-card-section>
              <p>Your at-a-glance farm overview:</p>
              <ul>
                <li><strong>Quick Stats</strong> &mdash; See counts of enclosures, active animals, pending tasks, and production totals.</li>
                <li><strong>Weather</strong> &mdash; Current conditions and forecast for your farm's location.</li>
                <li><strong>Upcoming Tasks</strong> &mdash; Your next pending tasks with quick-complete buttons.</li>
                <li><strong>Health Alerts</strong> &mdash; Animals due for vaccinations, deworming, or vet visits.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- My Farms -->
        <q-expansion-item icon="agriculture" label="My Farms">
          <q-card flat>
            <q-card-section>
              <p>Manage and switch between multiple farms.</p>
              <ul>
                <li><strong>Create</strong> &mdash; Add a new farm with a name, location, acreage, and farm type (ranch, dairy, poultry, mixed, hobby, commercial).</li>
                <li><strong>Switch</strong> &mdash; Click any farm card to make it active. All other pages reflect the selected farm.</li>
                <li><strong>Share access</strong> &mdash; Grant other users access by email, allowing collaborative farm management.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Enclosures -->
        <q-expansion-item icon="fence" label="Enclosures">
          <q-card flat>
            <q-card-section>
              <p>Define your physical enclosures and housing.</p>
              <ul>
                <li><strong>Types</strong> &mdash; Pasture, pen, barn, coop, stable, paddock, feedlot, or run.</li>
                <li><strong>Capacity</strong> &mdash; Set maximum head count for each enclosure to avoid overcrowding.</li>
                <li><strong>Fencing</strong> &mdash; Record fencing type: barbed wire, electric, board, chain-link, woven wire, or panel.</li>
                <li><strong>Amenities</strong> &mdash; Track water source availability, shelter, and terrain type.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Animals -->
        <q-expansion-item icon="pets" label="Animals">
          <q-card flat>
            <q-card-section>
              <p>Track every animal on your farm from birth to sale or beyond.</p>
              <ul>
                <li><strong>Species</strong> &mdash; Cattle, sheep, goats, pigs, chickens, ducks, turkeys, horses, donkeys, rabbits, alpacas, llamas, bees, and more.</li>
                <li><strong>Breeds</strong> &mdash; Detailed breed database with weight, temperament, climate preference, and purpose.</li>
                <li><strong>Status tracking</strong> &mdash; Move animals through stages: active, pregnant, nursing, growing, producing, dry, quarantined, for-sale, sold, or deceased.</li>
                <li><strong>Lineage</strong> &mdash; Record sire and dam to track genetic lines and breeding history.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Breeding -->
        <q-expansion-item icon="favorite" label="Breeding">
          <q-card flat>
            <q-card-section>
              <p>Manage breeding programs and track reproduction.</p>
              <ul>
                <li><strong>Breeding records</strong> &mdash; Log breeding events with sire, dam, date, and method.</li>
                <li><strong>Gestation tracking</strong> &mdash; Automatic due date calculation based on species-specific gestation periods.</li>
                <li><strong>Offspring</strong> &mdash; Record births, litter sizes, and link offspring to parents.</li>
                <li><strong>Status</strong> &mdash; Track breeding status: planned, bred, confirmed pregnant, due soon, delivered, failed, or cancelled.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Health Records -->
        <q-expansion-item icon="medical_services" label="Health Records">
          <q-card flat>
            <q-card-section>
              <p>Maintain comprehensive health histories for every animal.</p>
              <ul>
                <li><strong>Vet visits</strong> &mdash; Log routine checkups, illnesses, injuries, and surgeries with veterinarian details.</li>
                <li><strong>Vaccinations</strong> &mdash; Track vaccination schedules and booster reminders.</li>
                <li><strong>Medications</strong> &mdash; Record treatments, dosages, withdrawal periods, and medication costs.</li>
                <li><strong>Severity</strong> &mdash; Classify events as routine, minor, moderate, serious, or critical.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Tasks -->
        <q-expansion-item icon="checklist" label="Tasks">
          <q-card flat>
            <q-card-section>
              <p>Stay on top of farm chores with task management.</p>
              <ul>
                <li><strong>Task types</strong> &mdash; Feed, water, clean, vet-check, vaccinate, deworm, hoof-trim, shear, breed, move, repair, or general.</li>
                <li><strong>Priority levels</strong> &mdash; Low, medium, high, or urgent with color-coded badges.</li>
                <li><strong>Recurrence</strong> &mdash; Set tasks to repeat daily, every few days, weekly, biweekly, or monthly.</li>
                <li><strong>Filtering</strong> &mdash; Toggle between pending, completed, and all tasks.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Calendar -->
        <q-expansion-item icon="calendar_month" label="Calendar">
          <q-card flat>
            <q-card-section>
              <p>Seasonal calendar generated from your active species.</p>
              <ul>
                <li><strong>Seasonal events</strong> &mdash; Automatic deworming, vaccination, shearing, and breeding season reminders.</li>
                <li><strong>Breeding schedules</strong> &mdash; Species-specific breeding season start dates and gestation milestones.</li>
                <li><strong>Monthly view</strong> &mdash; Filter by month to see upcoming events with color-coded action badges.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Production -->
        <q-expansion-item icon="egg" label="Production">
          <q-card flat>
            <q-card-section>
              <p>Track what your farm produces.</p>
              <ul>
                <li><strong>Milk</strong> &mdash; Log daily milk yields by animal with quality notes.</li>
                <li><strong>Eggs</strong> &mdash; Record daily egg collection counts and grades.</li>
                <li><strong>Wool / Fiber</strong> &mdash; Track shearing yields, fiber quality, and weight.</li>
                <li><strong>Meat</strong> &mdash; Log processing events with hanging weight and cut details.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Feed Inventory -->
        <q-expansion-item icon="inventory_2" label="Feed Inventory">
          <q-card flat>
            <q-card-section>
              <p>Manage feed and supplement stocks.</p>
              <ul>
                <li><strong>Tracking</strong> &mdash; Record feed types, quantities, brands, and purchase dates.</li>
                <li><strong>Expiration</strong> &mdash; Get alerts for feed nearing or past expiration dates.</li>
                <li><strong>Species targeting</strong> &mdash; Tag feeds by which species they are intended for.</li>
                <li><strong>Cost tracking</strong> &mdash; Monitor feed expenses over time.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Farm Journal -->
        <q-expansion-item icon="auto_stories" label="Farm Journal">
          <q-card flat>
            <q-card-section>
              <p>Document your farm operations day by day.</p>
              <ul>
                <li><strong>Daily entries</strong> &mdash; Write dated entries with titles, descriptions, and observations.</li>
                <li><strong>Weather logging</strong> &mdash; Record conditions, high/low temperatures alongside your notes.</li>
                <li><strong>Tags</strong> &mdash; Organize entries with custom tags for easy searching and filtering.</li>
                <li><strong>Timeline view</strong> &mdash; Entries appear in a chronological timeline format.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Compatibility -->
        <q-expansion-item icon="groups" label="Compatibility">
          <q-card flat>
            <q-card-section>
              <p>Plan safe species cohabitation on your farm.</p>
              <ul>
                <li><strong>Species selector</strong> &mdash; Choose a species to see detailed compatibility information.</li>
                <li><strong>Compatible species</strong> &mdash; Green-bordered cards show species that can safely share space.</li>
                <li><strong>Incompatible species</strong> &mdash; Red-bordered cards show species to keep apart, with reasons.</li>
                <li><strong>Reference matrix</strong> &mdash; Quick-reference chip grid showing all species compatibility at a glance.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Maps -->
        <q-expansion-item icon="map" label="Maps">
          <q-card flat>
            <q-card-section>
              <p>Visualize your farm layout with interactive maps powered by ArcGIS.</p>
              <ul>
                <li><strong>Pasture mapping</strong> &mdash; Draw pasture boundaries, paddocks, and grazing zones on the map.</li>
                <li><strong>Infrastructure</strong> &mdash; Mark barns, shelters, feeders, gates, water troughs, and fencing.</li>
                <li><strong>Water sources</strong> &mdash; Map wells, ponds, streams, and troughs for access planning.</li>
                <li><strong>Animal tracking</strong> &mdash; View animal locations by enclosure and plan rotational grazing.</li>
                <li><strong>Terrain analysis</strong> &mdash; Evaluate terrain, elevation, and land use for better farm planning.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-separator />

        <!-- Settings & Theme -->
        <q-expansion-item icon="settings" label="Settings &amp; Theme">
          <q-card flat>
            <q-card-section>
              <p>Customize your HerdIt experience from the user menu (top-right avatar icon).</p>
              <ul>
                <li><strong>Dark / Light mode</strong> &mdash; Toggle between dark and light themes.</li>
                <li><strong>Theme colors</strong> &mdash; Click any color swatch to customize the app's color palette. Use the rainbow button for animated cycling colors.</li>
                <li><strong>Rainbow controls</strong> &mdash; Adjust speed and lightness of rainbow animations per color.</li>
                <li><strong>Reset</strong> &mdash; Restore default farm-green theme colors.</li>
                <li><strong>User Guide</strong> &mdash; Access this guide at any time from the user menu.</li>
                <li><strong>Buy Me a Coffee</strong> &mdash; If you enjoy HerdIt, you can support the developer via PayPal, Venmo, or Cash App from the user menu.</li>
              </ul>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UserGuidePage',
});
</script>
