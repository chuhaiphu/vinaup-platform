import { wireData } from 'fetchwire';

import {
  ManageReceiverSignaturesRequest,
  UpdateSignatureUrlRequest,
  SignatureResponse,
} from '@/interfaces/signature-interfaces';

export async function updateSignatureUrl(id: string, data: UpdateSignatureUrlRequest) {
  return wireData<SignatureResponse>(`/signature/${id}/url`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
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
