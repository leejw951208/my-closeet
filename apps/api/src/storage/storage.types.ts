// 사진 저장소 추상화에 사용되는 공통 타입.

export interface PresignedUploadUrl {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresInSeconds: number;
}

export interface StorageProvider {
  createPresignedUpload(params: { objectKey: string; contentType: string }): Promise<PresignedUploadUrl>;
  delete(objectKey: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
