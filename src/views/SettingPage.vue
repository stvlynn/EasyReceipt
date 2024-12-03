<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>设置</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">设置</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="settings-container">
        <!-- Dify 配置 -->
        <div class="settings-group">
          <div class="settings-group-header">
            <h2>Dify 配置</h2>
            <p>配置 Dify API 相关参数</p>
          </div>
          <ion-list class="settings-list">
            <ion-item>
              <ion-label position="stacked">Base URL</ion-label>
              <ion-input
                v-model="difyBaseUrl"
                placeholder="https://api.dify.ai"
                type="url"
              ></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">API Key</ion-label>
              <div class="api-key-input">
                <ion-input
                  :type="showApiKey ? 'text' : 'password'"
                  v-model="difyApiKey"
                  placeholder="请输入API Key"
                ></ion-input>
                <ion-icon
                  :icon="showApiKey ? 'eye-outline' : 'eye-off-outline'"
                  @click="toggleApiKeyVisibility"
                  class="eye-icon"
                ></ion-icon>
              </div>
            </ion-item>
          </ion-list>
        </div>

        <!-- 飞书配置 -->
        <div class="settings-group">
          <div class="settings-group-header">
            <h2>飞书配置</h2>
            <p>配置飞书多维表格相关参数</p>
          </div>
          <ion-list class="settings-list">
            <ion-item>
              <ion-label position="stacked">App Token</ion-label>
              <ion-input
                v-model="feishuAppToken"
                placeholder="请输入飞书App Token"
                type="text"
              ></ion-input>
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Table ID</ion-label>
              <ion-input
                v-model="feishuTableId"
                placeholder="请输入飞书Table ID"
                type="text"
              ></ion-input>
            </ion-item>

            <ion-item lines="none">
              <ion-label position="stacked">API Token</ion-label>
              <div class="api-key-input">
                <ion-input
                  :type="showFeishuToken ? 'text' : 'password'"
                  v-model="feishuApiToken"
                  placeholder="请输入飞书API Token"
                ></ion-input>
                <ion-icon
                  :icon="showFeishuToken ? 'eye-outline' : 'eye-off-outline'"
                  @click="toggleFeishuTokenVisibility"
                  class="eye-icon"
                ></ion-icon>
              </div>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonButtons,
  IonMenuButton
} from '@ionic/vue';
import { eye, eyeOff } from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';

const difyBaseUrl = ref('https://api.dify.ai');
const difyApiKey = ref('');
const showApiKey = ref(false);
const feishuAppToken = ref('');
const feishuTableId = ref('');
const feishuApiToken = ref('');
const showFeishuToken = ref(false);

const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value;
};

const toggleFeishuTokenVisibility = () => {
  showFeishuToken.value = !showFeishuToken.value;
};

// 监听变化并保存到Preferences
watch([difyBaseUrl, difyApiKey, feishuAppToken, feishuTableId, feishuApiToken], async ([newBaseUrl, newDifyKey, newAppToken, newTableId, newApiToken]) => {
  await Promise.all([
    Preferences.set({ key: 'difyBaseUrl', value: newBaseUrl }),
    Preferences.set({ key: 'difyApiKey', value: newDifyKey }),
    Preferences.set({ key: 'feishuAppToken', value: newAppToken }),
    Preferences.set({ key: 'feishuTableId', value: newTableId }),
    Preferences.set({ key: 'feishuApiToken', value: newApiToken })
  ]);
});

// 页面加载时从Preferences读取数据
onMounted(async () => {
  const [
    { value: baseUrl },
    { value: difyKey },
    { value: appToken },
    { value: tableId },
    { value: apiToken }
  ] = await Promise.all([
    Preferences.get({ key: 'difyBaseUrl' }),
    Preferences.get({ key: 'difyApiKey' }),
    Preferences.get({ key: 'feishuAppToken' }),
    Preferences.get({ key: 'feishuTableId' }),
    Preferences.get({ key: 'feishuApiToken' })
  ]);

  if (baseUrl) difyBaseUrl.value = baseUrl;
  if (difyKey) difyApiKey.value = difyKey;
  if (appToken) feishuAppToken.value = appToken;
  if (tableId) feishuTableId.value = tableId;
  if (apiToken) feishuApiToken.value = apiToken;
});
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
}

.settings-group {
  background: var(--ion-color-light);
  border-radius: 16px;
  overflow: hidden;
}

.settings-group-header {
  padding: 16px 16px 8px 16px;
}

.settings-group-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.settings-group-header p {
  margin: 4px 0 0 0;
  font-size: 0.9rem;
  color: var(--ion-color-medium);
}

.settings-list {
  background: transparent;
  padding: 0;
}

.settings-list ion-item {
  --background: transparent;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --border-color: var(--ion-color-light-shade);
}

.settings-list ion-item:last-child {
  --border-color: transparent;
}

.api-key-input {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.eye-icon {
  font-size: 1.5rem;
  color: var(--ion-color-medium);
  cursor: pointer;
  padding: 8px;
}

ion-input {
  --padding-start: 0;
  font-size: 0.9rem;
}

ion-label {
  margin-bottom: 4px;
  color: var(--ion-color-medium) !important;
}
</style>
