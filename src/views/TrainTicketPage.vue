<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>火车票</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">火车票</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <div class="coming-soon">
          <ion-icon :icon="trainOutline" class="coming-soon-icon"></ion-icon>
          <h2>即将推出</h2>
          <p>火车票识别功能正在开发中...</p>
        </div>
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
  IonIcon,
} from '@ionic/vue';
import { trainOutline } from 'ionicons/icons';
</script>

<style scoped>
.container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coming-soon {
  text-align: center;
  color: var(--ion-color-medium);
}

.coming-soon-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.coming-soon h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.coming-soon p {
  margin: 8px 0 0 0;
  font-size: 16px;
}
</style>
