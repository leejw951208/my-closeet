// 로컬 개발용 저장소 구현. 사전서명 URL 대신 API가 직접 받는 업로드 경로를 반환한다.
// 운영 환경에서는 S3·MinIO·R2 같은 실제 객체 스토리지 구현으로 교체한다.

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PresignedUploadUrl, StorageProvider } from './storage.types';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly baseUrl = process.env.LOCAL_STORAGE_BASE_URL ?? 'http://localhost:3000/uploads';

  async createPresignedUpload(params: {
    objectKey: string;
    contentType: string;
  }): Promise<PresignedUploadUrl> {
    const token = randomUUID();
    return {
      objectKey: params.objectKey,
      uploadUrl: `${this.baseUrl}/${params.objectKey}?token=${token}`,
      publicUrl: `${this.baseUrl}/${params.objectKey}`,
      expiresInSeconds: 900,
    };
  }

  async delete(_objectKey: string): Promise<void> {
    // 로컬 dev에서는 실제 파일 삭제 구현이 필요 시점에 추가한다.
  }
}
