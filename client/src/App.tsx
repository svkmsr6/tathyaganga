import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import { TranslationsProvider } from "./hooks/use-translations";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import EditorPage from "@/pages/editor-page";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/editor" component={EditorPage} />
        <ProtectedRoute path="/editor/:id" component={EditorPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  // Get initial theme from localStorage or default to light
  const defaultTheme = (localStorage.getItem("theme") as "light" | "dark") || "light";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={defaultTheme}>
        <TranslationsProvider>
          <AuthProvider>
            <Router />
            <Toaster />
          </AuthProvider>
        </TranslationsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;