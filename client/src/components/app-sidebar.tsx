import { Database, FileText, FolderOpen, Sparkles, Settings, Container, LogIn, Shield, Wrench, Activity ,Mic,Github,Bot,Bird,Atom,AudioLines} from "lucide-react";

import {
  Sidebar,
  SidebarContent,

  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  
} from "@/components/ui/sidebar";
import { useLocation } from "wouter";



const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: FolderOpen,
  },
  {
    title: "New Schema",
    url: "/new",
    icon: Sparkles,
  },
 
  {
    title: "Exports",
    url: "/exports",
    icon: FileText,
  },
  {
    title: "Docker Export",
    url: "/docker-export",
    icon: Container,
  },
  {
  title:"Voice Chat",
  url:"/voice-chat",
  icon:Mic
 },
 {
  title:"devops-chat",
  url:"/devops-chat",
  icon:AudioLines
 },
 {
  title:"Ui Builder",
  url:"/ui-builder",
  icon:Bot
 },
 {
  title:"database-chat",
  url:"/database-chat",
  icon:Atom
 },
 {
  title:"gen-ai",
  url:"/gen-chat",
icon:Bird
 },
 
 {
  title:"kubernetes-export",
  url:"/kubernetes-export",
  icon:Container
 },
 {
  title:"Migration Safety",
  url:"/migration-safety",
  icon:Shield
 },
 {
  title:"CI/CD Debug",
  url:"/cicd-debug",
  icon:Wrench
 },
 {
  title:"Infra Drift Guardian",
  url:"/infra-drift",
  icon:Activity
 },
 
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Database className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Db_Designer</h2>
            <p className="text-xs text-muted-foreground">Schema Builder</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton data-testid="button-settings">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
