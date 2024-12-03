<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>识别</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">识别</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="scan-options">
        <ion-list>
          <ion-item button @click="navigateToFeature('delivery')" detail>
            <ion-icon :icon="receipt" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>签收单</h2>
              <p>快递签收单识别</p>
            </ion-label>
          </ion-item>
          
          <ion-item button @click="navigateToFeature('ereceipt')" detail>
            <ion-icon :icon="receiptOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>电子发票</h2>
              <p>电子发票识别</p>
            </ion-label>
          </ion-item>
          
          <ion-item button @click="navigateToFeature('trainticket')" detail>
            <ion-icon :icon="trainOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>火车票</h2>
              <p>火车票识别</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  useIonRouter
} from '@ionic/vue';
import { receipt, receiptOutline, trainOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToFeature = (feature: string) => {
  router.push(`/tabs/${feature}`);
};
</script>

<style scoped>
.scan-options {
  margin-top: 16px;
}

ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  margin-bottom: 8px;
  border-radius: 8px;
}

ion-item h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

ion-item p {
  font-size: 14px;
  margin: 4px 0 0 0;
  color: var(--ion-color-medium);
}

ion-icon {
  font-size: 24px;
}
</style>
