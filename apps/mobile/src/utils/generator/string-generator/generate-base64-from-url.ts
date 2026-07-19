import { ImageManipulator } from 'expo-image-manipulator';

/**
 * Converts a remote image URL to a base64 data URI (JPEG) using Expo ImageManipulator.
 * Returns an empty string if the URL is falsy or if the conversion fails.
 *
 * @param url - Remote image URL. Accepts null or undefined.
 * @returns Promise resolving to 'data:image/jpeg;base64,...' or ''.
 * @example
 * const b64 = await generateBase64FromUrl(organization.avatarUrl);
 */
export async function generateBase64FromUrl(url?: string | null): Promise<string> {
  if (!url) return '';

  const context = ImageManipulator.manipulate(url);
  try {
    const imageRef = await context.renderAsync();
    const result = await imageRef.saveAsync({
      compress: 0.8,
      base64: true,
    });

    return `data:image/jpeg;base64,${result.base64}`;
  } catch (error) {
    console.warn('Lỗi khi convert image sang base64', error);
    return '';
  }
}
