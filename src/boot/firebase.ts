import { defineBoot } from '#q-app/wrappers';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import {
  getAuth,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { ref } from 'vue';

const firebaseConfig = {
  apiKey: 'AIzaSyAlD-fU44NoRvfAwOousGlIK2GzoV9nhDs',
  authDomain: 'herdit-livestock-app.firebaseapp.com',
  databaseURL: 'https://herdit-livestock-app-default-rtdb.firebaseio.com',
  projectId: 'herdit-livestock-app',
  storageBucket: 'herdit-livestock-app.firebasestorage.app',
  messagingSenderId: '601926883797',
  appId: '1:601926883797:web:ca42239fc274159e83c55c',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const currentUser = ref<User | null>(null);
const authReady = ref(false);

const authReadyPromise = new Promise<void>((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
    authReady.value = true;
    resolve();
  });
});

export { db, auth, currentUser, authReady, authReadyPromise };

const publicPages = new Set(['/login', '/verify-email']);

function needsEmailVerification(user: User): boolean {
  return !user.emailVerified && user.providerData.some(p => p.providerId === 'password');
}

export default defineBoot(({ router }) => {
  router.beforeEach(async (to) => {
    await authReadyPromise;
    const user = currentUser.value;

    if (!user && !publicPages.has(to.path)) return '/login';
    if (user && to.path === '/login') return '/';
    if (user && to.path === '/verify-email' && !needsEmailVerification(user)) return '/';
    if (user && needsEmailVerification(user) && !publicPages.has(to.path)) return '/verify-email';

    if (user) {
      const { activeFarmId, restoreLastFarm } = await import('src/services/farm-service');
      if (!activeFarmId.value) {
        await restoreLastFarm();
      }
      if (to.meta.requiresFarm && !activeFarmId.value) {
        return '/farms';
      }
    }
  });
});
