import { File as FsFile, UploadType } from 'expo-file-system';
import type { ImagePickerAsset } from 'expo-image-picker';
import { ApiError, getWireConfig, wireData } from 'fetchwire';

import type { CarWithMeta } from '@/interfaces/car-interfaces';

/**
 *
 * From Expo SDK 56 the global `fetch` is `expo/fetch`, a spec-compliant Fetch:
 * a FormData part must be a string or a Blob.
 * React Native's `{ uri }` part is not, so `expo/fetch` throws — "Unsupported FormDataPart".
 *
 * ─── Why not just fall back to RN's built-in `fetch`? ───
 * From the bottom up:
 *   a. As default, the part is streamed from disk: read once, never buffered, so it cannot be replayed.
 *   b. `fetch` reuses a pooled keep-alive connection. After idle pause, server closes that connection,
 *       yet the client still picks it and writes to the now-dead socket.
 *   c. The client would normally recover by retrying on a fresh connection,
 *      but the one-shot stream from (a) is already consumed and can't be rewound, so it can't.
 *      No retry → "Network request failed.
 *
 * ─── The fix: expo-file-system's native uploader ───
 * It performs the multipart request in native code:
 *   - It uploads from the file path — a re-openable source it can re-read to retry.
 *    (the same way a browser re-reads a Blob).
 *
 */
export async function uploadImageTo<TResponse>(
  path: string,
  asset: ImagePickerAsset,
): Promise<TResponse> {
  const config = getWireConfig();

  // We run outside wireApi's pipeline, so assemble by hand the headers it would have attached.
  //
  // `config.headers` is typed `HeadersInit` — a `[key, value][]` tuple array, or a `Headers` instance.
  // but `File.upload` wants a plain, mutable `Record<string, string>`.
  // so we use `Object.fromEntries` to turns that iterable back into a plain object we can extend.
  const headers: Record<string, string> = Object.fromEntries(new Headers(config.headers));

  // Auth token — its getter refreshes proactively when the token is near expiry.
  const accessToken = await config.getToken();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let result;
  try {
    result = await new FsFile(asset.uri).upload(`${config.baseUrl}${path}`, {
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

  const json: unknown = JSON.parse(result.body);

  if (result.status < 200 || result.status >= 300) {
    throw config.transformError?.(json) ?? new ApiError('Upload failed', 'UPLOAD_FAILED');
  }
  return (config.transformResponse ? config.transformResponse(json) : json) as TResponse;
}

export function uploadCarFeatureImage(carId: string, asset: ImagePickerAsset) {
  return uploadImageTo<CarWithMeta>(`/car/${carId}/feature-image`, asset);
}

export function uploadCarAdditionalImage(carId: string, asset: ImagePickerAsset) {
  return uploadImageTo<CarWithMeta>(`/car/${carId}/additional-images`, asset);
}

// The client only ever holds public URLs, so removal names the image by URL and the server
// resolves it back to the stored key.
export function removeCarAdditionalImage(carId: string, imageUrl: string) {
  return wireData<CarWithMeta>(`/car/${carId}/additional-images`, {
    method: 'DELETE',
    body: JSON.stringify({ imageUrl }),
  });
}
