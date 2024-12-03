import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
  base64Data?: string;
}

export interface ReceiptInfo {
  ProjectName: string;
  AuditedEntity: string;
  AuditedEntityPerson: string;
  AuditedEntityPhone: string;
  ReceivingEntity: string;
  Recipient: string;
  ReceivingEntityPhone: string;
  FileName: string;
  FileType: string;
  FileNum: number;
  FileReceipient: string;
  HandOverDate: string;  // YYYY/MM/DD format
  ReceivedDate: string;  // YYYY/MM/DD format
}

export class PhotoService {
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photos';
  private difyApiKey: string = '';
  private difyBaseUrl: string = '/api/dify';  // 修改为使用代理

  constructor() {
    this.loadSettings();
  }

  private async loadSettings() {
    const [
      { value: apiKey },
      { value: baseUrl }
    ] = await Promise.all([
      Preferences.get({ key: 'difyApiKey' }),
      Preferences.get({ key: 'difyBaseUrl' })
    ]);

    this.difyApiKey = apiKey || '';
    // 如果用户配置了自定义的 baseUrl，使用用户配置的，否则使用代理
    this.difyBaseUrl = baseUrl || '/api/dify';

    if (!this.difyApiKey) {
      throw new Error('请先在设置页面配置Dify API Key');
    }
  }

  public async addNewPhoto() {
    await this.loadSettings();  // 确保有最新的API Key

    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // 上传到Dify并识别
    return await this.processWithDify(savedImageFile);
  }

  public async takePhoto(): Promise<ReceiptInfo> {
    await this.loadSettings();  // 确保有最新的API Key

    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos),
    });

    // 上传到Dify并识别
    return await this.processWithDify(savedImageFile);
  }

  private async savePicture(photo: Photo) {
    // Convert photo to base64 format
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = Date.now() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath,
      base64Data: base64Data
    };
  }

  private async readAsBase64(photo: Photo) {
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
    this.photos = (value ? JSON.parse(value) : []) as UserPhoto[];

    for (let photo of this.photos) {
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data,
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  private async uploadToDify(photo: UserPhoto): Promise<string> {
    // 从base64数据创建文件
    const base64Data = photo.base64Data!.split(',')[1]; // 移除 "data:image/jpeg;base64," 前缀
    const binaryData = atob(base64Data);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([array], { type: 'image/jpeg' });
    
    // 创建FormData
    const formData = new FormData();
    formData.append('file', blob, photo.filepath);

    const response = await fetch(`${this.difyBaseUrl}/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.difyApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to upload image to Dify: ${errorText}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async processWithDify(photo: UserPhoto): Promise<ReceiptInfo> {
    // 首先上传文件
    const uploadResponse = await fetch(`${this.difyBaseUrl}/v1/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.difyApiKey}`
      },
      body: this.createFormData(photo.base64Data!)
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`文件上传失败: ${errorText}`);
    }

    const uploadResult = await uploadResponse.json();
    const fileId = uploadResult.id;

    // 然后运行工作流
    const workflowResponse = await fetch(`${this.difyBaseUrl}/v1/workflows/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.difyApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          file: {
            transfer_method: 'local_file',
            upload_file_id: fileId,
            type: 'image'
          },
          type: 'AcknowledgementReceipt'
        },
        response_mode: 'blocking',
        user: 'default'
      })
    });

    if (!workflowResponse.ok) {
      const errorText = await workflowResponse.text();
      console.error('Dify API Error:', errorText);  // 添加更详细的错误日志
      throw new Error(`Failed to process image with Dify: ${errorText}`);
    }

    const data = await workflowResponse.json();
    return data.data.outputs as ReceiptInfo;
  }

  private createFormData(base64Data: string) {
    const formData = new FormData();
    const blob = this.base64ToBlob(base64Data);
    formData.append('file', blob, 'image.jpg');
    return formData;
  }

  private base64ToBlob(base64Data: string) {
    const binaryData = atob(base64Data.split(',')[1]);
    const array = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      array[i] = binaryData.charCodeAt(i);
    }
    return new Blob([array], { type: 'image/jpeg' });
  }
}
