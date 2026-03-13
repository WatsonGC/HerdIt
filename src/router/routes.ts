import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/verify-email',
    component: () => import('pages/VerifyEmailPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/DashboardPage.vue'), meta: { requiresFarm: true } },
      { path: 'farms', component: () => import('pages/FarmsPage.vue') },
      { path: 'enclosures', component: () => import('pages/EnclosuresPage.vue'), meta: { requiresFarm: true } },
      { path: 'animals', component: () => import('pages/AnimalsPage.vue'), meta: { requiresFarm: true } },
      { path: 'calendar', component: () => import('pages/CalendarPage.vue'), meta: { requiresFarm: true } },
      { path: 'tasks', component: () => import('pages/TasksPage.vue'), meta: { requiresFarm: true } },
      { path: 'journal', component: () => import('pages/JournalPage.vue'), meta: { requiresFarm: true } },
      { path: 'production', component: () => import('pages/ProductionPage.vue'), meta: { requiresFarm: true } },
      { path: 'breeding', component: () => import('pages/BreedingPage.vue'), meta: { requiresFarm: true } },
      { path: 'health', component: () => import('pages/HealthPage.vue'), meta: { requiresFarm: true } },
      { path: 'feed', component: () => import('pages/FeedPage.vue'), meta: { requiresFarm: true } },
      { path: 'compatibility', component: () => import('pages/CompatibilityPage.vue'), meta: { requiresFarm: true } },
      { path: 'maps', component: () => import('pages/MapsPage.vue') },
      { path: 'guide', component: () => import('pages/UserGuidePage.vue') },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
