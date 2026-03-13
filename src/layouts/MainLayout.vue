<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-icon name="fa-solid fa-cow" color="amber" class="q-mr-sm" />
          HerdIt
        </q-toolbar-title>

        <q-chip
          v-if="activeFarmMeta"
          icon="agriculture"
          color="brown-9"
          text-color="white"
          dense
          clickable
          to="/farms"
          class="q-mr-sm"
        >
          {{ activeFarmMeta.name }}
        </q-chip>

        <span class="text-body2 q-mr-sm">{{ userDisplayName }}</span>
        <q-btn flat dense round icon="account_circle">
          <q-menu>
            <q-list style="min-width: 280px">
              <q-item-label header>{{ userDisplayName }}</q-item-label>
              <q-separator />

              <q-item clickable @click="isDark = !isDark">
                <q-item-section avatar>
                  <q-icon :name="isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun'" :color="isDark ? 'amber' : 'orange'" />
                </q-item-section>
                <q-item-section>{{ isDark ? 'Dark Mode' : 'Light Mode' }}</q-item-section>
                <q-item-section side>
                  <q-toggle :model-value="isDark" @update:model-value="isDark = $event" dense />
                </q-item-section>
              </q-item>

              <q-expansion-item icon="palette" label="Theme Colors" dense header-class="q-pl-md">
                <q-item dense>
                  <q-item-section>
                    <q-item-label class="text-caption">Colors</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat dense size="sm" icon="restart_alt" label="Reset" @click="resetColors" />
                  </q-item-section>
                </q-item>
                <template v-for="c in themeColors" :key="c.name">
                  <q-item dense>
                    <q-item-section side>
                      <div
                        class="color-preview"
                        :class="{ 'rainbow-active': c.rainbow }"
                        :style="{ backgroundColor: c.rainbow ? undefined : c.value }"
                      >
                        <q-popup-proxy
                          v-if="!c.rainbow"
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-color
                            v-model="c.value"
                            format-model="hex"
                            no-header
                            no-footer
                            @update:model-value="applyColor(c)"
                          />
                        </q-popup-proxy>
                      </div>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="theme-color-label">{{ c.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat dense round size="sm"
                        icon="fa-solid fa-rainbow"
                        :color="c.rainbow ? 'pink' : 'grey'"
                        @click="c.rainbow = !c.rainbow; toggleRainbow(c)"
                      />
                    </q-item-section>
                  </q-item>
                  <q-item v-if="c.rainbow" dense class="q-pl-lg">
                    <q-item-section>
                      <q-item-label class="text-caption text-grey">Speed</q-item-label>
                      <q-slider v-model="c.speed" :min="1" :max="20" :step="1" label color="pink" dense />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-caption text-grey">Lightness</q-item-label>
                      <q-slider v-model="c.lightness" :min="5" :max="95" :step="5" label color="amber" dense />
                    </q-item-section>
                  </q-item>
                </template>
              </q-expansion-item>

              <q-separator />

              <q-item clickable v-close-popup to="/guide">
                <q-item-section avatar>
                  <q-icon name="help_outline" color="info" />
                </q-item-section>
                <q-item-section>User Guide</q-item-section>
              </q-item>

              <q-expansion-item icon="fa-solid fa-mug-hot" label="Buy Me a Coffee" dense header-class="q-pl-md">
                <q-item clickable v-close-popup tag="a" href="https://paypal.me/Gwatson42069" target="_blank">
                  <q-item-section avatar>
                    <q-icon name="fa-brands fa-paypal" color="blue" />
                  </q-item-section>
                  <q-item-section>PayPal</q-item-section>
                </q-item>
                <q-item clickable v-close-popup tag="a" href="https://venmo.com/Gabriel-Watson-37" target="_blank">
                  <q-item-section avatar>
                    <q-icon name="fa-solid fa-v" color="light-blue" />
                  </q-item-section>
                  <q-item-section>Venmo</q-item-section>
                </q-item>
                <q-item clickable v-close-popup tag="a" href="https://cash.app/$gwatsonc" target="_blank">
                  <q-item-section avatar>
                    <q-icon name="fa-solid fa-dollar-sign" color="green" />
                  </q-item-section>
                  <q-item-section>Cash App</q-item-section>
                </q-item>
              </q-expansion-item>

              <q-separator />

              <q-item clickable v-close-popup @click="signOut">
                <q-item-section avatar>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section>Log Out</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :class="isDark ? 'text-white' : 'text-black'">
      <q-list>
        <q-item-label header class="text-weight-bold">
          <q-icon name="fa-solid fa-cow" color="brown" class="q-mr-sm" />
          {{ activeFarmMeta?.name || 'HerdIt' }}
        </q-item-label>
        <q-separator />

        <q-item clickable to="/" exact class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="dashboard" color="brown" /></q-item-section>
          <q-item-section><q-item-label>Dashboard</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/farms" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="agriculture" color="green" /></q-item-section>
          <q-item-section><q-item-label>My Farms</q-item-label></q-item-section>
        </q-item>

        <q-separator />
        <q-item-label header class="text-caption text-grey">Herd Management</q-item-label>

        <q-item clickable to="/enclosures" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="fence" color="brown" /></q-item-section>
          <q-item-section><q-item-label>Enclosures</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/animals" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="pets" color="deep-orange" /></q-item-section>
          <q-item-section><q-item-label>Animals</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/breeding" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="favorite" color="pink" /></q-item-section>
          <q-item-section><q-item-label>Breeding</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/health" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="medical_services" color="red" /></q-item-section>
          <q-item-section><q-item-label>Health Records</q-item-label></q-item-section>
        </q-item>

        <q-separator />
        <q-item-label header class="text-caption text-grey">Operations</q-item-label>

        <q-item clickable to="/tasks" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="checklist" color="orange" /></q-item-section>
          <q-item-section><q-item-label>Tasks</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/calendar" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="calendar_month" color="blue" /></q-item-section>
          <q-item-section><q-item-label>Calendar</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/production" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="egg" color="amber" /></q-item-section>
          <q-item-section><q-item-label>Production</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/feed" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="restaurant" color="lime" /></q-item-section>
          <q-item-section><q-item-label>Feed Inventory</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/journal" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="auto_stories" color="teal" /></q-item-section>
          <q-item-section><q-item-label>Farm Journal</q-item-label></q-item-section>
        </q-item>

        <q-separator />
        <q-item-label header class="text-caption text-grey">Explore</q-item-label>

        <q-item clickable to="/compatibility" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="groups" color="purple" /></q-item-section>
          <q-item-section><q-item-label>Compatibility</q-item-label></q-item-section>
        </q-item>

        <q-item clickable to="/maps" class="nav-item" :class="isDark ? 'text-white' : 'text-black'">
          <q-item-section avatar><q-icon name="map" color="indigo" /></q-item-section>
          <q-item-section><q-item-label>Maps</q-item-label></q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, reactive, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar, setCssVar } from 'quasar';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth, currentUser } from 'src/boot/firebase';
import { isAdmin, checkAdmin } from 'src/services/admin-service';
import { activeFarmMeta } from 'src/services/farm-service';
import { registerCurrentUser } from 'src/services/user-directory-service';

interface ThemeColor {
  name: string;
  label: string;
  value: string;
  rainbow: boolean;
  hueOffset: number;
  speed: number;
  lightness: number;
}

const THEME_STORAGE_KEY = 'herdit-theme';
const DARK_STORAGE_KEY = 'herdit-dark-mode';

interface SavedThemeColor {
  value: string;
  rainbow: boolean;
  speed: number;
  lightness: number;
}

function saveTheme(colors: ThemeColor[], isDark: boolean) {
  const data: Record<string, SavedThemeColor> = {};
  for (const c of colors) {
    data[c.name] = { value: c.value, rainbow: c.rainbow, speed: c.speed, lightness: c.lightness };
  }
  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(DARK_STORAGE_KEY, JSON.stringify(isDark));
}

function loadTheme(colors: ThemeColor[]) {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  if (!raw) return;
  try {
    const data: Record<string, SavedThemeColor> = JSON.parse(raw);
    for (const c of colors) {
      const saved = data[c.name];
      if (saved) {
        c.value = saved.value;
        c.rainbow = saved.rainbow;
        c.speed = saved.speed;
        c.lightness = saved.lightness;
      }
    }
  } catch { /* ignore corrupt data */ }
}

function loadDarkMode(): boolean | null {
  const raw = localStorage.getItem(DARK_STORAGE_KEY);
  if (raw === null) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  s /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const router = useRouter();

    const savedDark = loadDarkMode();
    const isDark = ref(savedDark !== null ? savedDark : $q.dark.isActive);
    $q.dark.set(isDark.value);

    const themeColors: ThemeColor[] = reactive([
      { name: 'primary', label: 'Primary', value: '#5d4037', rainbow: false, hueOffset: 0, speed: 5, lightness: 50 },
      { name: 'secondary', label: 'Secondary', value: '#2e7d32', rainbow: false, hueOffset: 51, speed: 5, lightness: 50 },
      { name: 'accent', label: 'Accent', value: '#bf360c', rainbow: false, hueOffset: 102, speed: 5, lightness: 50 },
      { name: 'positive', label: 'Positive', value: '#43a047', rainbow: false, hueOffset: 153, speed: 5, lightness: 50 },
      { name: 'negative', label: 'Negative', value: '#c62828', rainbow: false, hueOffset: 204, speed: 5, lightness: 50 },
      { name: 'info', label: 'Info', value: '#0288d1', rainbow: false, hueOffset: 255, speed: 5, lightness: 50 },
      { name: 'warning', label: 'Warning', value: '#f9a825', rainbow: false, hueOffset: 306, speed: 5, lightness: 50 },
      { name: 'dark', label: 'Dark Body', value: '#2c1e17', rainbow: false, hueOffset: 0, speed: 5, lightness: 50 },
      { name: 'dark-page', label: 'Dark Page', value: '#1a120d', rainbow: false, hueOffset: 30, speed: 5, lightness: 50 },
    ]);

    loadTheme(themeColors);

    const defaultColors: Record<string, string> = {
      primary: '#5d4037', secondary: '#2e7d32', accent: '#bf360c',
      positive: '#43a047', negative: '#c62828', info: '#0288d1',
      warning: '#f9a825', dark: '#2c1e17', 'dark-page': '#1a120d',
    };

    const anyRainbow = computed(() => themeColors.some((c) => c.rainbow));

    function resetColors() {
      stopAnimation();
      for (const c of themeColors) {
        c.value = defaultColors[c.name] ?? c.value;
        c.rainbow = false;
        c.speed = 5;
        c.lightness = 50;
        setCssVar(c.name, c.value);
      }
      localStorage.removeItem(THEME_STORAGE_KEY);
    }

    function applyColor(c: ThemeColor) { setCssVar(c.name, c.value); }

    function applyAllColors() {
      for (const c of themeColors) {
        if (!c.rainbow) setCssVar(c.name, c.value);
      }
    }

    let animFrameId: number | null = null;
    let startTime = 0;

    function animateRainbows(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      for (const c of themeColors) {
        if (c.rainbow) {
          const cycleDuration = (21 - c.speed) * 1000;
          const progress = (elapsed % cycleDuration) / cycleDuration;
          const hue = (progress * 360 + c.hueOffset) % 360;
          setCssVar(c.name, hslToHex(hue, 100, c.lightness));
        }
      }
      animFrameId = requestAnimationFrame(animateRainbows);
    }

    function startAnimation() {
      if (animFrameId === null) {
        startTime = 0;
        animFrameId = requestAnimationFrame(animateRainbows);
      }
    }

    function stopAnimation() {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }

    function toggleRainbow(c: ThemeColor) {
      if (!c.rainbow) setCssVar(c.name, c.value);
      if (themeColors.some((tc) => tc.rainbow)) startAnimation();
      else stopAnimation();
    }

    watch(isDark, (val) => { $q.dark.set(val); saveTheme(themeColors, val); });
    watch(themeColors, () => { saveTheme(themeColors, isDark.value); }, { deep: true });

    onMounted(() => {
      applyAllColors();
      if (anyRainbow.value) startAnimation();
      void checkAdmin();
      void registerCurrentUser();
    });

    onBeforeUnmount(() => { stopAnimation(); });

    async function signOut() {
      await firebaseSignOut(auth);
      await router.push('/login');
    }

    const userDisplayName = computed(() => currentUser.value?.displayName || 'Rancher');

    return {
      leftDrawerOpen,
      isDark,
      themeColors,
      anyRainbow,
      applyColor,
      toggleRainbow,
      resetColors,
      toggleLeftDrawer() { leftDrawerOpen.value = !leftDrawerOpen.value; },
      signOut,
      isAdmin,
      userDisplayName,
      activeFarmMeta,
    };
  },
});
</script>
