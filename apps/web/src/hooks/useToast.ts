import { useToastStore, type ToastVariant } from '@/store/toastStore';

export function useToast() {
  const show = useToastStore((state) => state.show);

  return {
    toast: (title: string, description?: string, variant: ToastVariant = 'info') =>
      show({ title, description, variant }),
    success: (title: string, description?: string) => show({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => show({ title, description, variant: 'error' }),
  };
}
