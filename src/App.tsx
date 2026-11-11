import "./App.css";
import { AuthProvider } from "./providers/auth-provider";
import { ThemeProvider } from "./providers/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-keys";
import AppRoutingSetup from "./app-routing-setup";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" closeButton />
        <AuthProvider>
          <AppRoutingSetup />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
