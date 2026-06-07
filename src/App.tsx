import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./providers/auth-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-keys";
import AppRoutingSetup from "./app-routing-setup";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster richColors position="top-right" closeButton />
          <AppRoutingSetup />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
