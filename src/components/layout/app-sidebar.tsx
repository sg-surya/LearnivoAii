"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  Notebook,
  DraftingCompass,
  ScanLine,
  Layers,
  Calculator,
  Map,
  BookText,
  BrainCircuit,
  Mail,
  HelpCircle,
  Scale,
  GraduationCap,
  Home,
  BookCopy,
  BarChart,
  Users,
  Shield,
  Building,
  Sparkles,
} from "lucide-react";

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  Sidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";

const teacherMenuItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/library", icon: Library, label: "My Library" },
  { href: "/workspace", icon: Notebook, label: "My Workspace" },
  { href: "/lesson-planner", icon: DraftingCompass, label: "Lesson Planner" },
  { href: "/paper-digitizer", icon: ScanLine, label: "Paper Digitizer" },
  { href: "/visual-aids", icon: Layers, label: "Visual Aids" },
  { href: "/math-helper", icon: Calculator, label: "Math Helper" },
  { href: "/hyper-local-content", icon: Map, label: "Hyper-Local" },
  { href: "/story-generator", icon: BookText, label: "Story Generator" },
  { href: "/knowledge-base", icon: BrainCircuit, label: "Knowledge Base" },
  { href: "/parent-communication", icon: Mail, label: "Parent Mails" },
  { href: "/quiz-generator", icon: HelpCircle, label: "Quiz Generator" },
  { href: "/rubric-generator", icon: Scale, label: "Rubric Generator" },
  { href: "/debate-topic-generator", icon: GraduationCap, label: "Debate Topics" },
];

const studentMenuItems = [
    { href: "/student/dashboard", icon: Home, label: "Dashboard" },
    { href: "/library", icon: Library, label: "My Library" },
    { href: "/workspace", icon: Notebook, label: "My Workspace" },
    { href: "/student/assignments", icon: BookCopy, label: "Assignments" },
    { href: "/student/grades", icon: BarChart, label: "Grades" },
    { href: "/knowledge-base", icon: BrainCircuit, label: "Knowledge Base" },
];

const adminMenuItems = [
    { href: "/admin/dashboard", icon: Shield, label: "Admin Dashboard" },
    { href: "/admin/users", icon: Users, label: "User Management" },
    { href: "/admin/academics", icon: Building, label: "Institute Setup" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useUser();

  const getMenuItems = () => {
      switch (profile?.role) {
          case 'Student': return studentMenuItems;
          case 'Admin': return adminMenuItems;
          default: return teacherMenuItems;
      }
  }

  const menuItems = getMenuItems();
  const homePath = profile?.role === 'Student' ? '/student/dashboard' : profile?.role === 'Admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <>
      <SidebarHeader className="h-16 flex items-center px-6">
        <Link href={homePath} className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-headline text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            Learnivo <span className="text-primary">Ai</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={cn(
                    "rounded-xl h-11 px-4 transition-all duration-300",
                    pathname === item.href 
                      ? "bg-primary text-black shadow-lg shadow-primary/20 font-bold" 
                      : "text-white/50 hover:bg-white/5 hover:text-white"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
          <div className="rounded-2xl bg-white/5 p-5 group-data-[collapsible=icon]:hidden border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20"><Sparkles className="h-10 w-10 text-primary" /></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-1">Account Level</p>
              <p className="text-sm font-bold text-white">Pro Educator</p>
              <div className="mt-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-2/3 bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
              </div>
              <p className="mt-2 text-[10px] text-white/30 font-bold uppercase tracking-widest text-center">67 / 100 Cycles Used</p>
          </div>
      </SidebarFooter>
    </>
  );
}
