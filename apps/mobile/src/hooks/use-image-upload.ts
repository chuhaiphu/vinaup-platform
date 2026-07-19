import type { ImagePickerAsset } from 'expo-image-picker';
import { useMutationFn, type ApiError, type HttpResponse } from 'fetchwire';
import { useState } from 'react';
import { Alert } from 'react-native';

import type { UploadImageResponse } from '@/interfaces/upload-interfaces';
import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface UseImageUploadParams {
  /** Upload request, injected by the caller so the hook stays decoupled from any endpoint. */
  uploadFn: (asset: ImagePickerAsset) => Promise<HttpResponse<UploadImageResponse>>;
  /** Storage-delete request keyed by URL. Optional: only callers that own persisted images need it. */
  deleteFn?: (url: string) => Promise<HttpResponse<void>>;
}

/**
 * Orchestrates image upload/removal while owning the in-progress UI state.
 *
 * useImageUpload is endpoint-agnostic: the caller injects `uploadFn`/`deleteFn`.
 *
 * useImageUpload drives both the immediate-upload case and the deferred-upload case.
 *
 * Tracked state, exposed so an image grid can render per-tile loaders without holding its own:
 * - `isUploading`  — an add is in flight (covers upload and the optional onUploaded step).
 * - `deletingImage` — URL currently being removed, or `null`.
 *
 * @param params.uploadFn - Performs the upload and resolves to the created image record.
 * @param params.deleteFn - Removes the stored file by URL; omit when there is nothing to clean up.
 * @returns Upload/remove actions plus the in-progress flags.
 */
export function useImageUpload({ uploadFn, deleteFn }: UseImageUploadParams) {
  const { executeMutationFn: runUpload } = useMutationFn(uploadFn);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  // Run the upload mutation and surface failures to the user, resolves to null on error.
  const performUpload = (asset: ImagePickerAsset) =>
    runUpload(asset, {
      onError: (error: ApiError) =>
        Alert.alert('Lỗi', generateErrorMessage(error, 'Tải ảnh lên thất bại. Vui lòng thử lại.')),
    });

  const upload = async (
    asset: ImagePickerAsset,
    onUploaded?: (url: string) => Promise<unknown> | void,
  ): Promise<string | null> => {
    setIsUploading(true);
    try {
      const response = await performUpload(asset);
      const url = response?.data?.url ?? null;
      if (url) await onUploaded?.(url);
      return url;
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (url: string, onRemoved: () => Promise<unknown> | void) => {
    setDeletingImage(url);
    try {
      await onRemoved();
      // Best effort to clean up the stored file, but don't block the UI.
      void deleteFn?.(url)?.catch(() => {});
    } finally {
      setDeletingImage(null);
    }
  };

  return { upload, remove, isUploading, deletingImage };
}
