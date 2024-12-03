<template>
  <ion-menu content-id="main-content">
    <ion-header>
      <ion-toolbar>
        <ion-title>功能列表</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item :router-link="'/tabs/delivery'" :detail="false">
          <ion-icon :icon="receipt" slot="start"></ion-icon>
          <ion-label>签收单</ion-label>
        </ion-item>
        <ion-item :router-link="'/tabs/ereceipt'" :detail="false">
          <ion-icon :icon="receiptOutline" slot="start"></ion-icon>
          <ion-label>电子发票</ion-label>
        </ion-item>
        <ion-item :router-link="'/tabs/trainticket'" :detail="false">
          <ion-icon :icon="trainOutline" slot="start"></ion-icon>
          <ion-label>火车票</ion-label>
        </ion-item>
        <ion-item-divider>
          <ion-label>关于</ion-label>
        </ion-item-divider>
        <ion-item>
          <ion-icon :icon="documentText" slot="start"></ion-icon>
          <ion-label>使用说明</ion-label>
        </ion-item>
        <ion-item>
          <ion-icon :icon="information" slot="start"></ion-icon>
          <ion-label>版本信息</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>

  <ion-page id="main-content">
    <ion-tabs @ionTabsWillChange="handleTabsWillChange" :animated="false">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="scan" :selected="isSelectedTab('scan')" @click="handleScanClick">
          <ion-icon aria-hidden="true" :icon="scanOutline" />
          <ion-label>识别</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="setting" :selected="isSelectedTab('setting')" href="/tabs/setting">
          <ion-icon aria-hidden="true" :icon="settings" />
          <ion-label>设置</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemDivider
} from '@ionic/vue';
import {
  settings,
  receipt,
  receiptOutline,
  trainOutline,
  documentText,
  information,
  scanOutline
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const router = useRouter();
const currentTab = ref('scan');

const isSelectedTab = (tab: string) => currentTab.value === tab;

const handleTabsWillChange = (e: any) => {
  if (e.detail.tab) {
    currentTab.value = e.detail.tab;
  }
};

const isFeaturePage = computed(() => {
  const path = router.currentRoute.value.path;
  return ['/tabs/delivery', '/tabs/ereceipt', '/tabs/trainticket'].includes(path);
});

const handleScanClick = () => {
  // 如果当前在功能页面，跳转到识别页面
  if (isFeaturePage.value) {
    router.push('/tabs/scan');
    currentTab.value = 'scan';
  }
  // 如果当前在设置页面，跳转到识别页面
  else if (router.currentRoute.value.path === '/tabs/setting') {
    router.push('/tabs/scan');
    currentTab.value = 'scan';
  }
  // 如果当前在识别页面，不做任何操作
};
</script>
