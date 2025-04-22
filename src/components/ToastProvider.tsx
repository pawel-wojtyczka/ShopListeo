import { Toaster } from "../components/ui/sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        closeButton
        richColors
        expand={false}
        visibleToasts={3}
        toastOptions={{
          className: "toast-notification",
          style: {
            background: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          },
        }}
      />
    </>
  );
}
