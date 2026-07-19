import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

// ─── Toast identity ───
let nextToastId = 0;

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toast: ToastState | null;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>()((set) => ({
  toast: null,
  showToast: (message, type = 'success') => set({ toast: { id: ++nextToastId, message, type } }),
  hideToast: () => set({ toast: null }),
}));
