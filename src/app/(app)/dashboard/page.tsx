
"use client";

import Link from "next/link";
import React, { memo } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  DraftingCompass,
  GraduationCap,
  Library,
  Mail,
  Map,
  Notebook,
  Scale,
  Layers,
  ScanLine,
  BookText,
  Calculator,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useWorkspace } from "@/context/workspace-context";
import { useUser } from "@/firebase";
import { SpotlightCard } from "@/components/shared/spotlight-card";

const tools = [
  {
    title: "Lesson Planner",
    description: "Generate comprehensive, curriculum-aligned weekly plans.",
    href: "/lesson-planner",
    icon: <DraftingCompass className="h-6 w-6" />,
    category: "Academic"
  },
  {
    title: "Visual Aids",
    description: "Create simple diagrams and charts for your blackboards.",
    href: "/visual-aids",
    icon: <Layers className="h-6 w-6" />,
    category: "Creative"
  },
  {
    title: "Math Helper",
    description: "Instant step-by-step solutions for photographed problems.",
    href: "/math-helper",
    icon: <Calculator className="h-6 w-6" />,
    category: "Utility"
  },
  {
    title: "Hyper-Local Content",
    description: "Personalize content with local context and languages.",
    href: "/hyper-local-content",
    icon: <Map className="h-6 w-6" />,
    category: "Creative"
  },
  {
    title: "Story Generator",
    description: "Generate creative illustrated stories for any topic.",
    href: "/story-generator",
    icon: <BookText className="h-6 w-6" />,
    category: "Creative"
  },
  {
    title: "Knowledge Base",
    description: "Age-appropriate simple answers for complex questions.",
    href: "/knowledge-base",
    icon: <BrainCircuit className="h-6 w-6" />,
    category: "Utility"
  },
  {
    title: "Parent Mailer",
    description: "Draft professional, multi-lingual emails to parents.",
    href: "/parent-communication",
    icon: <Mail className="h-6 w-6" />,
    category: "Administrative"
  },
  {
    title: "Paper Digitizer",
    description: "Turn physical papers into clean digital assets instantly.",
    href: "/paper-digitizer",
    icon: <ScanLine className="h-6 w-6" />,
    category: "Utility"
  },
  {
    title: "Quiz Generator",
    description: "Create Bloom's-aligned quizzes from source text.",
    href: "/quiz-generator",
    icon: <HelpCircle className="h-6 w-6" />,
    category: "Assessment"
  },
  {
    title: "Rubric Designer",
    description: "Build fair grading rubrics for any assignment.",
    href: "/rubric-generator",
    icon: <Scale className="h-6 w-6" />,
    category: "Assessment"
  },
  {
    title: "Debate Topics",
    description: "Generate engaging debate motions and research points.",
    href: "/debate-topic-generator",
    icon: <GraduationCap className="h-6 w-6" />,
    category: "Academic"
  },
];

const SummaryCard = memo(({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) => (
  <SpotlightCard className="flex-1 min-w-[220px] rounded-3xl group hover:shadow-2xl hover:shadow-primary/5 border-white/5 bg-white/[0.02] hover:bg-white/[0.04]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-widest text-white/40">{title}</CardTitle>
      <Icon className="h-4 w-4 text-primary/50" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold tracking-tighter">{value}</div>
    </CardContent>
  </SpotlightCard>
));
SummaryCard.displayName = "SummaryCard";

export default function DashboardPage() {
  const { folders } = useWorkspace();
  const { profile } = useUser();

  const totalAssets = React.useMemo(() => folders.reduce((sum, folder) => sum + folder.assets.length, 0), [folders]);
  const totalTopics = React.useMemo(() => folders.filter(folder => folder.name.startsWith("Topic:")).length, [folders]);

  return (
    <div className="flex flex-col gap-12 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="font-headline text-5xl font-bold tracking-tighter">
            Welcome, <span className="text-primary italic">{profile?.name?.split(' ')[0] || 'Educator'}</span>
          </h1>
          <p className="text-white/40 text-xl font-medium">
            Ready to amplify your teaching with <span className="text-white font-bold">Learnivo Intelligence?</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
            <Link href="/workspace" className="flex-1 sm:flex-none">
                <SummaryCard title="Total Assets" value={totalAssets} icon={Notebook} />
            </Link>
            <div className="flex-1 sm:flex-none">
                <SummaryCard title="Topics Explored" value={totalTopics} icon={Library} />
            </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-headline font-bold tracking-tight">
                AI Intelligence Suite
            </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group block">
                <SpotlightCard className="h-full flex flex-col transition-all duration-500 border-white/5 relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] rounded-[2rem]">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    {React.cloneElement(tool.icon as React.ReactElement, { className: "h-24 w-24" })}
                </div>
                <CardHeader className="p-6 pb-2 relative z-10">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-black">
                    {tool.icon}
                    </div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                        <CardTitle className="font-headline text-xl leading-tight font-bold">
                        {tool.title}
                        </CardTitle>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5 group-hover:border-primary/30 group-hover:text-primary transition-colors">
                            {tool.category}
                        </span>
                    </div>
                    <CardDescription className="text-sm leading-relaxed text-white/40 group-hover:text-white/60 transition-colors line-clamp-2">
                        {tool.description}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto p-6 pt-4 relative z-10">
                    <div className="flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary/50 group-hover:text-primary transition-all translate-x-[-10px] group-hover:translate-x-0 group-hover:opacity-100 opacity-0">
                    <span>Invoke Tool</span>
                    <ArrowRight className="h-3 w-3" />
                    </div>
                </CardFooter>
                </SpotlightCard>
            </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
