import type { ImagePickerAsset } from 'expo-image-picker';
import { wireApi } from 'fetchwire';

import { UploadImageResponse } from '@/interfaces/upload-interfaces';

export async function uploadImage(asset: ImagePickerAsset) {
  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    name: asset.fileName ?? `upload-${Date.now()}.jpg`,
    type: asset.mimeType ?? 'image/jpeg',
  });

  return wireApi<UploadImageResponse>('/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteImage(path: string) {
  return wireApi<void>('/upload', {
    method: 'DELETE',
    body: JSON.stringify({ path }),
  });
}

export async function deleteImageByUrl(url: string) {
  // ─── Derive relative path from a media URL ─────
  // Server build: url = `${mediaBaseUrl}/user_<id>/<file>`, path = `user_<id>/<file>`.
  // Strip scheme + host so it works regardless of the media domain.
  const path = url.replace(/^https?:\/\/[^/]+\//, '');
  return deleteImage(path);
}
