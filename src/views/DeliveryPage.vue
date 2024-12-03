<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>签收单</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">签收单</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        <div v-if="loading" class="loading-container">
          <ion-spinner></ion-spinner>
          <p>正在处理...</p>
        </div>

        <div v-else-if="result" class="result-container">
          <ion-list>
            <ion-item>
              <ion-label position="stacked">项目名称</ion-label>
              <ion-input v-model="editedResult.ProjectName" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">被审计单位</ion-label>
              <ion-input v-model="editedResult.AuditedEntity" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">被审计单位经办人</ion-label>
              <ion-input v-model="editedResult.AuditedEntityPerson" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">被审计单位联系电话</ion-label>
              <ion-input v-model="editedResult.AuditedEntityPhone" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">接收单位</ion-label>
              <ion-input v-model="editedResult.ReceivingEntity" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">接收人</ion-label>
              <ion-input v-model="editedResult.Recipient" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">接收单位联系电话</ion-label>
              <ion-input v-model="editedResult.ReceivingEntityPhone" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">文件名称</ion-label>
              <ion-input v-model="editedResult.FileName" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">文件类型</ion-label>
              <ion-input v-model="editedResult.FileType" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">份数</ion-label>
              <ion-input v-model.number="editedResult.FileNum" type="number"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">接收人</ion-label>
              <ion-input v-model="editedResult.FileReceipient" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">移交日期 (YYYY/MM/DD)</ion-label>
              <ion-input v-model="editedResult.HandOverDate" type="text" placeholder="YYYY/MM/DD"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label position="stacked">接收日期 (YYYY/MM/DD)</ion-label>
              <ion-input v-model="editedResult.ReceivedDate" type="text" placeholder="YYYY/MM/DD"></ion-input>
            </ion-item>
          </ion-list>
          <!-- 添加底部空间，防止最后的输入框被按钮遮挡 -->
          <div class="bottom-space"></div>
        </div>
      </div>
    </ion-content>

    <!-- 将按钮移到 ion-content 外面 -->
    <div class="action-button">
      <ion-fab-button v-if="!result" @click="takePicture" class="camera-button">
        <ion-icon :icon="camera"></ion-icon>
      </ion-fab-button>
      <ion-fab-button v-else @click="submitToFeishu" class="submit-button" color="success">
        <ion-icon :icon="checkmark"></ion-icon>
      </ion-fab-button>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSpinner,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  toastController
} from '@ionic/vue';
import { camera, checkmark } from 'ionicons/icons';
import { PhotoService } from '@/services/photo.service';
import { Preferences } from '@capacitor/preferences';

const loading = ref(false);
const result = ref<any>(null);
const editedResult = reactive<any>({});

const photoService = new PhotoService();

const takePicture = async () => {
  loading.value = true;
  try {
    const response = await photoService.takePhoto();
    if (response) {
      result.value = response;
      // 复制结果到可编辑对象
      Object.assign(editedResult, response);
    } else {
      throw new Error('识别失败，请重试');
    }
  } catch (error) {
    console.error('Error taking picture:', error);
    const toast = await toastController.create({
      message: error instanceof Error ? error.message : '处理失败，请重试',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  }
  loading.value = false;
};

const submitToFeishu = async () => {
  loading.value = true;
  try {
    // 获取飞书配置
    const [
      { value: appToken },
      { value: tableId },
      { value: apiToken }
    ] = await Promise.all([
      Preferences.get({ key: 'feishuAppToken' }),
      Preferences.get({ key: 'feishuTableId' }),
      Preferences.get({ key: 'feishuApiToken' })
    ]);

    if (!appToken || !tableId || !apiToken) {
      throw new Error('请先在设置页面配置飞书参数');
    }

    const response = await fetch(
      `/api/feishu/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        },
        body: JSON.stringify({
          records: [{
            fields: editedResult
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error('提交失败: ' + await response.text());
    }

    const toast = await toastController.create({
      message: '提交成功',
      duration: 2000,
      color: 'success'
    });
    toast.present();

    // 重置状态
    result.value = null;
    Object.keys(editedResult).forEach(key => delete editedResult[key]);
  } catch (error) {
    const toast = await toastController.create({
      message: (error as Error).message,
      duration: 2000,
      color: 'danger'
    });
    toast.present();
  }
  loading.value = false;
};
</script>

<style scoped>
.container {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.result-container {
  padding-bottom: 80px; /* 为底部按钮留出空间 */
}

.bottom-space {
  height: 80px; /* 与按钮高度相同 */
}

.action-button {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

/* 适配 iPhone 底部安全区域 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .action-button {
    bottom: calc(16px + env(safe-area-inset-bottom));
  }
}
</style>
