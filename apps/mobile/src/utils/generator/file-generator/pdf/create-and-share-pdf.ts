import { File } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function createAndSharePdf(html: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error('Sharing not available');
    }
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Lưu hoặc chia sẻ file PDF',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Lỗi không xác định');
  } finally {
    const pdfFile = new File(uri);
    if (pdfFile.exists) {
      pdfFile.delete();
    }
  }
}
