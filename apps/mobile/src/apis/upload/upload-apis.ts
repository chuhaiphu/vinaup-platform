import { File as FsFile, UploadType } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { ApiError, getWireConfig, wireApi, type HttpResponse } from 'fetchwire';

import { UploadImageResponse } from '@/interfaces/upload-interfaces';

/**
 * Upload an image through expo-file-system's native uploader.
 *
 * From Expo SDK 56 the global `fetch` is `expo/fetch`, a spec-compliant Fetch whose FormData part
 * must be a string or a Blob. React Native's `{ uri }` part is neither, so `expo/fetch` throws
 * "Unsupported FormDataPart". Falling back to RN's built-in `fetch` trades that for another failure:
 * the `{ uri }` part is streamed once (non-replayable), and when `fetch` reuses a pooled keep-alive
 * connection the server has since closed, the write to the dead socket cannot be retried on a fresh
 * connection — surfacing as "Network request failed".
 *
 * The native uploader performs the multipart request in native code, reading from the file path — a
 * re-openable source it can replay to retry — sidestepping both failures regardless of which `fetch`
 * is installed as the global.
 */
export async function uploadImage(
  asset: ImagePickerAsset,
): Promise<HttpResponse<UploadImageResponse>> {
  const config = getWireConfig();

  // We run outside wireApi's pipeline, so assemble by hand the headers it would have attached.
  // `config.headers` is a `HeadersInit`; `File.upload` wants a plain, extendable `Record`.
  const headers: Record<string, string> = Object.fromEntries(new Headers(config.headers));

  // Auth token — its getter refreshes proactively when the token is near expiry.
  const accessToken = await config.getToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let result;
  try {
    result = await new FsFile(asset.uri).upload(`${config.baseUrl}/upload`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: asset.mimeType ?? 'image/jpeg',
      headers,
    });
  } catch {
    // Transport-level failure — keep the ApiError shape for downstream generateErrorMessage.
    throw new ApiError('Network request failed', 'NETWORK_ERROR', 520);
  }

  const json = result.body ? JSON.parse(result.body) : {};
  if (result.status < 200 || result.status >= 300) {
    throw config.transformError
      ? config.transformError(json)
      : new ApiError('Upload failed', 'UPLOAD_FAILED', result.status);
  }
  return (
    config.transformResponse
      ? config.transformResponse(json)
      : { status: result.status, data: json, message: '' }
  ) as HttpResponse<UploadImageResponse>;
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
