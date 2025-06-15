import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import QRScanner from "@/pages/QRScanner";
import Transactions from "@/pages/Transactions";
import Alerts from "@/pages/Alerts";
import Flagged from "@/pages/Flagged";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" nest>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/qr-scanner" component={QRScanner} />
            <Route path="/transactions" component={Transactions} />
            <Route path="/alerts" component={Alerts} />
            <Route path="/flagged" component={Flagged} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster />
            <Router />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
