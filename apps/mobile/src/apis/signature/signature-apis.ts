import type { ImagePickerAsset } from 'expo-image-picker';
import { wireData } from 'fetchwire';

import { uploadImageTo } from '@/apis/upload/upload-apis';
import {
  ManageReceiverSignaturesRequest,
  SignatureResponse,
} from '@/interfaces/signature-interfaces';

export async function uploadSignatureImage(id: string, asset: ImagePickerAsset) {
  return uploadImageTo<SignatureResponse>(`/signature/${id}/image`, asset);
}

export async function manageReceiverSignatures(data: ManageReceiverSignaturesRequest) {
  return wireData<SignatureResponse[]>('/signature/manage-receiver-signatures', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function signSignature(id: string) {
  return wireData<SignatureResponse>(`/signature/${id}/sign`, {
    method: 'POST',
  });
}

export async function cancelSignature(id: string) {
  return wireData<SignatureResponse>(`/signature/${id}/cancel`, {
    method: 'POST',
  });
}

export async function getSignaturesByDocumentId(documentId: string) {
  return wireData<SignatureResponse[]>(`/signature/document/${documentId}`, {
    method: 'GET',
  });
}

export async function getSignatureById(id: string) {
  return wireData<SignatureResponse>(`/signature/${id}`, {
    method: 'GET',
  });
}
