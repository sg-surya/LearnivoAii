
"use client";

import { useUser } from "@/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCopy, BarChart, BrainCircuit, Home, DraftingCompass, Layers, View, Calculator, Map, BookText, HelpCircle, Scale, GraduationCap, Notebook, Library, ScanLine, Mail } from "lucide-react";
import Link from "next/link";
import React, { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/workspace-context";

const SpotlightCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const card = internalRef.current;
        if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        }
    };

    return (
        <Card
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            onMouseMove={handleMouseMove}
            className={cn("spotlight-card", className)}
            {...props}
        >
            {children}
        </Card>
    );
});
SpotlightCard.displayName = "SpotlightCard";


const tools = [
    {
        href: "/student/assignments",
        icon: <BookCopy className="h-8 w-8" />,
        title: "My Assignments",
        description: "View and submit your homework.",
    },
    {
        href: "/student/grades",
        icon: <BarChart className="h-8 w-8" />,
        title: "My Grades",
        description: "Check your recent scores and progress.",
    },
     {
    title: "Lesson Planner",
    description: "Generate comprehensive weekly lesson plans.",
    href: "/lesson-planner",
    icon: <DraftingCompass className="h-8 w-8" />,
  },
  {
    title: "Visual Aids",
    description: "Create simple drawings or charts for your lessons.",
    href: "/visual-aids",
    icon: <Layers className="h-8 w-8" />,
  },
  {
    title: "Math Helper",
    description: "Solve math problems from a photo with explanations.",
    href: "/math-helper",
    icon: <Calculator className="h-8 w-8" />,
  },
  {
    title: "Hyper-Local Content",
    description: "Create content tailored to your students' region.",
    href: "/hyper-local-content",
    icon: <Map className="h-8 w-8" />,
  },
    {
    title: "Story Generator",
    description: "Generate creative stories for any topic or moral.",
    href: "/story-generator",
    icon: <BookText className="h-8 w-8" />,
  },
  {
    title: "Instant Knowledge Base",
    description: "Get simple answers for complex student questions.",
    href: "/knowledge-base",
    icon: <BrainCircuit className="h-8 w-8" />,
  },
  {
    title: "Paper Digitizer",
    description: "Turn physical question papers into digital format.",
    href: "/paper-digitizer",
    icon: <ScanLine className="h-8 w-8" />,
  },
  {
    title: "Quiz Generator",
    description: "Create quizzes from topics or pasted text content.",
    href: "/quiz-generator",
    icon: <HelpCircle className="h-8 w-8" />,
  },
  {
    title: "Rubric Generator",
    description: "Create detailed grading rubrics for any assignment.",
    href: "/rubric-generator",
    icon: <Scale className="h-8 w-8" />,
  },
  {
    title: "Debate Topic Generator",
    description: "Generate engaging debate topics and materials.",
    href: "/debate-topic-generator",
    icon: <GraduationCap className="h-8 w-8" />,
  },
  {
    title: "My Library",
    description: "Manage your digital textbooks and resources.",
    href: "/library",
    icon: <Library className="h-8 w-8" />,
  },
  {
    title: "My Workspace",
    description: "Organize all your generated lesson plans and assets.",
    href: "/workspace",
    icon: <Notebook className="h-8 w-8" />,
  },
];

const SummaryCard = ({ title, value }: { title: string, value: string | number }) => (
  <SpotlightCard>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-4xl font-bold">{value}</CardTitle>
    </CardContent>
  </SpotlightCard>
);

export default function StudentDashboardPage() {
  const { user, profile } = useUser();
  const { folders } = useWorkspace();

  const assetTypeFolders = folders.filter(f => f.id !== 'folder-sahayak-assets');
  const totalAssets = assetTypeFolders.reduce((sum, folder) => sum + folder.assets.length, 0);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const assetsThisWeek = assetTypeFolders.reduce((sum, folder) => {
    return sum + folder.assets.filter(asset => new Date(asset.createdAt) >= oneWeekAgo).length;
  }, 0);
  const totalTopics = folders.filter(folder => folder.name.startsWith("Topic:")).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Welcome, {profile?.name || 'Student'}!</h1>
        <p className="text-muted-foreground">
          Your learning journey starts here. Let's make today productive.
        </p>
      </div>

       <SpotlightCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl font-bold">Your Weekly Summary</CardTitle>
          </div>
          <CardDescription>
            Your progress in the last 7 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <SummaryCard title="Total Topics Explored" value={totalTopics} />
            <SummaryCard title="Total Assets Created" value={totalAssets} />
            <SummaryCard title="Assets This Week" value={assetsThisWeek} />
          </div>
        </CardContent>
      </SpotlightCard>
      
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block">
            <SpotlightCard className="h-full flex flex-col transition-all duration-300">
              <CardHeader className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {tool.icon}
                </div>
                <CardTitle className="font-headline text-xl text-foreground">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">{tool.description}</CardDescription>
              </CardHeader>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
