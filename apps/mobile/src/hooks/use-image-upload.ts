import type { ImagePickerAsset } from 'expo-image-picker';
import { useMutationFn, type ApiError } from 'fetchwire';
import { useState } from 'react';
import { Alert } from 'react-native';

import { generateErrorMessage } from '@/utils/generator/string-generator/generate-error-message';

interface UseImageUploadParams {
  /** Upload request, injected by the caller so the hook stays decoupled from any endpoint. */
  uploadFn: (asset: ImagePickerAsset) => Promise<unknown>;
  /** Removal request keyed by the image's public URL. Optional. */
  deleteFn?: (url: string) => Promise<unknown>;
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
 * @param params.uploadFn - Performs the upload; the endpoint persists it on the owning entity.
 * @param params.deleteFn - Removes the image by its public URL; omit when nothing to clean up.
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
    onUploaded?: () => Promise<unknown> | void,
  ): Promise<boolean> => {
    setIsUploading(true);
    try {
      await performUpload(asset);
      await onUploaded?.();
      return true;
    } finally {
      setIsUploading(false);
    }
  };

  const remove = async (url: string, onRemoved: () => Promise<unknown> | void) => {
    setDeletingImage(url);
    try {
      // The endpoint both detaches the image and deletes the stored file.
      await deleteFn?.(url);
      await onRemoved();
    } finally {
      setDeletingImage(null);
    }
  };

  return { upload, remove, isUploading, deletingImage };
}
