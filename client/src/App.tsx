import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import ConnectionToggle from "./components/ConnectionToggle";
import Home from "./pages/Home";
import { TemplatesPage } from "./pages/TemplatesPage";
import Dashboard from "./pages/Dashboard";
import VideoEditor from "./pages/VideoEditor";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/editor/:id" component={VideoEditor} />
      <Route path="/templates" component={TemplatesPage} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: Design Philosophy - Modern Creative Studio
// Dark professional interface with cyan accents
// Theme is set to dark to match the design system

function App() {
  return (
    <ErrorBoundary>
      <ConnectionProvider>
        <ThemeProvider
          defaultTheme="dark"
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            <ConnectionToggle />
          </TooltipProvider>
        </ThemeProvider>
      </ConnectionProvider>
    </ErrorBoundary>
  );
}

export default App;
