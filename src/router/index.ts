import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/scan'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/scan'
      },
      {
        path: 'scan',
        component: () => import('@/views/ScanPage.vue'),
        meta: { transition: 'none' }
      },
      {
        path: 'delivery',
        component: () => import('@/views/DeliveryPage.vue'),
        meta: { transition: 'none' }
      },
      {
        path: 'ereceipt',
        component: () => import('@/views/EReceiptPage.vue'),
        meta: { transition: 'none' }
      },
      {
        path: 'trainticket',
        component: () => import('@/views/TrainTicketPage.vue'),
        meta: { transition: 'none' }
      },
      {
        path: 'setting',
        component: () => import('@/views/SettingPage.vue'),
        meta: { transition: 'none' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
