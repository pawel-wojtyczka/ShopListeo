import * as React from "react";
import AuthStatus from "@/components/auth/AuthStatus";
import { ToastProvider } from "@/components/ToastProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";

interface MainLayoutContentProps {
  children: React.ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutContentProps> = ({ children }) => {
  // This component renders the structure previously in MainLayout.astro's body,
  // but now within a single React component tree.
  return (
    <AuthProvider>
      <div className="flex h-full min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-64 border-r hidden md:block p-4 flex flex-col justify-between">
          <div>
            <div className="text-xl font-bold mb-6">ShopListeo</div>
            <nav className="space-y-2">
              <a href="/" className="flex items-center p-2 rounded-lg hover:bg-muted text-foreground">
                Listy zakupów
              </a>
              {/* Add more nav links here */}
            </nav>
          </div>

          {/* Auth Status Area - Now rendered directly within the React tree */}
          <div id="auth-status-area" className="mt-auto text-sm text-muted-foreground p-2 border-t">
            <AuthStatus /> {/* No client directive needed here */}
          </div>
        </div>

        {/* Main Content Area - Wrapped with ToastProvider */}
        <main className="flex-1 overflow-auto p-6">
          <ToastProvider>{children}</ToastProvider> {/* Wrap children (slot content) */}
        </main>
      </div>
    </AuthProvider>
  );
};

export default MainLayoutContent;
