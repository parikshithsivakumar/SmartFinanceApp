import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/ProtectedRoute";

// Pages
import DashboardPage from "@/pages/DashboardPage";
import UploadPage from "@/pages/UploadPage";
import HistoryPage from "@/pages/HistoryPage";
import ComparisonPage from "@/pages/ComparisonPage";
import NotFound from "@/pages/not-found";
import AuthPage from "./pages/auth-page";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Switch>
        <Route path="/">
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/auth">
          <PublicOnlyRoute>
            <AuthPage />
          </PublicOnlyRoute>
        </Route>
        
        <Route path="/upload">
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/history">
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        </Route>
        
        <Route path="/compare">
          <ProtectedRoute>
            <ComparisonPage />
          </ProtectedRoute>
        </Route>
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </TooltipProvider>
  );
}

export default App;