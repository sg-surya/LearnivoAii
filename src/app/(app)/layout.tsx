"use client";

import React, { useState, useEffect, useMemo, type ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import { Search, Bot, Menu, Sparkles, Loader2, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { WorkspaceProvider } from "@/context/workspace-context";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { AIAssistant } from "@/components/ai-assistant";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/firebase";

function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { profile } = useUser();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-4 border-b border-white/5 bg-black/60 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-white/50" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-headline text-lg font-bold hidden sm:inline-block text-white">
            Learnivo <span className="text-primary">Ai</span>
          </span>
        </Link>
      </div>
      
      <div className="flex flex-1 max-w-xl items-center gap-4 px-4">
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            placeholder="Search tools, workspace..."
            className="w-full bg-white/5 pl-10 border-white/10 focus:border-primary/50 transition-all rounded-full h-9 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{profile?.role || 'User'}</span>
        </div>
        <UserNav />
      </div>
    </header>
  );
}

function RightSidebarPanel({ onAssistantClick }: { onAssistantClick: () => void }) {
  return (
    <div className="fixed top-16 right-0 hidden h-[calc(100vh-4rem)] w-14 flex-col items-center gap-4 border-l border-white/5 bg-black/40 py-4 lg:flex backdrop-blur-xl">
      <ThemeToggle />
      <NotificationPanel />
      <Button variant="ghost" size="icon" asChild className="hover:text-primary text-white/50">
        <Link href="/settings">
            <Settings className="h-5 w-5" />
        </Link>
      </Button>
      <div className="mt-auto pb-4">
        <Button 
            variant="default" 
            size="icon" 
            onClick={onAssistantClick}
            className="rounded-full shadow-lg shadow-primary/20 hover:scale-110 transition-transform bg-primary text-black"
        >
          <Bot className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, profile, isUserLoading, isProfileLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    const isLoading = isUserLoading || isProfileLoading;
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }
    
    if (profile && !profile.hasCompletedOnboarding && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }
  }, [isUserLoading, isProfileLoading, user, profile, router, pathname]);

  const showLoader = useMemo(() => {
    return isUserLoading || isProfileLoading || !user || (user && !profile) || (profile && !profile.hasCompletedOnboarding && pathname !== '/onboarding');
  }, [isUserLoading, isProfileLoading, user, profile, pathname]);

  if (showLoader) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#050505] gap-6 text-white">
        <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 animate-bounce">
            <Sparkles className="h-8 w-8 text-black" />
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm font-bold uppercase tracking-widest text-primary">Learnivo Ai</span>
            </div>
            <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.2em] animate-pulse">Initializing</span>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-[#050505] bg-grid-pattern overflow-x-hidden text-white">
          <AppHeader />
          <div className="flex flex-1">
            <div className="hidden lg:block w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl">
              <AppSidebar />
            </div>
            <main className="flex flex-1 justify-center w-full min-h-[calc(100vh-4rem)] lg:pr-14">
              <div className="w-full max-w-7xl p-4 sm:p-6 lg:p-10">
                {children}
              </div>
            </main>
            <RightSidebarPanel onAssistantClick={() => setIsAssistantOpen(true)} />
          </div>
        </div>
        <AIAssistant isOpen={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
