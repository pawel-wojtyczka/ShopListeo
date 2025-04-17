import { toast } from "sonner";

// Typy powiadomień
export type ToastType = "success" | "error" | "info" | "warning";

// Opcje powiadomień
export interface ToastOptions {
  id?: string;
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Wyświetla powiadomienie o sukcesie
 * @param message Treść powiadomienia
 * @param options Opcje powiadomienia
 */
export function showSuccessToast(message: string, options?: ToastOptions): void {
  toast.success(message, {
    id: options?.id,
    duration: options?.duration || 3000,
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Wyświetla powiadomienie o błędzie
 * @param message Treść powiadomienia
 * @param options Opcje powiadomienia
 */
export function showErrorToast(message: string, options?: ToastOptions): void {
  toast.error(message, {
    id: options?.id,
    duration: options?.duration || 5000, // Dłuższy czas dla błędów
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Wyświetla powiadomienie informacyjne
 * @param message Treść powiadomienia
 * @param options Opcje powiadomienia
 */
export function showInfoToast(message: string, options?: ToastOptions): void {
  toast.info(message, {
    id: options?.id,
    duration: options?.duration || 3000,
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Wyświetla powiadomienie ostrzegawcze
 * @param message Treść powiadomienia
 * @param options Opcje powiadomienia
 */
export function showWarningToast(message: string, options?: ToastOptions): void {
  toast.warning(message, {
    id: options?.id,
    duration: options?.duration || 4000,
    description: options?.description,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Usuwa powiadomienie o określonym ID
 * @param id ID powiadomienia do usunięcia
 */
export function dismissToast(id: string): void {
  toast.dismiss(id);
}

/**
 * Usuwa wszystkie powiadomienia
 */
export function dismissAllToasts(): void {
  toast.dismiss();
}
