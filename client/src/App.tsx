import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Database } from "lucide-react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import NewSchema from "@/pages/new-schema";
import Exports from "@/pages/exports";
import DockerExport from "@/pages/docker-export";
import NotFound from "@/pages/not-found";
import DevOpsChat from "@/pages/devops-chat";
import Uibuilder from "./pages/Ui-generator";
import GenAIChat from "./pages/Genai";
import KubernetesExport from "./pages/kubernetes-export";
import DatabaseAdvisorChatbot from "./pages/Database-chat";
import MigrationSafety from "./pages/migration-safety";
import CICDDebug from "./pages/ci-cddebug";
import InfraDrift from "./pages/infra-drift";
import VoiceChat from "./pages/voice-chat";

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="dark">
          <SidebarProvider style={style as React.CSSProperties}>
            <Switch>
              <Route path="/">
                <div className="flex flex-col min-h-screen">
                  <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-lg border-b border-border">
                    <div className="flex items-center gap-2">
                      <Database className="h-6 w-6 text-primary" />
                      <span className="text-xl font-bold">Db_design</span>
                    </div>
                    <ThemeToggle />
                  </header>
                  <main className="flex-1">
                    <Landing />
                  </main>
                </div>
              </Route>
              <Route>
                <div className="flex h-screen w-full">
                  <AppSidebar />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                      <SidebarTrigger data-testid="button-sidebar-toggle" />
                      <ThemeToggle />
                    </header>
                    <main className="flex-1 overflow-auto">
                      <Switch>
                        <Route path="/dashboard" component={Dashboard} />
                        <Route path="/new" component={NewSchema} />
                        <Route path="/exports" component={Exports} />
                        <Route path="/docker-export" component={DockerExport} />
                       <Route path='/devops-chat' component={DevOpsChat} />
                       <Route path='/ui-builder' component={Uibuilder} />
                          <Route path='/voice-chat' component={VoiceChat} />
                       <Route path='/database-chat' component={DatabaseAdvisorChatbot} />
                       <Route path='/gen-chat' component={GenAIChat} />
                       <Route path='/kubernetes-export' component={KubernetesExport} />
                       <Route path='/migration-safety' component={MigrationSafety} />
                       <Route path='/cicd-debug' component={CICDDebug} />
                       <Route path='/infra-drift' component={InfraDrift} />
                        
                    
                        <Route component={NotFound} />
                      </Switch>
                    </main>
                  </div>
                </div>
              </Route>
            </Switch>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
