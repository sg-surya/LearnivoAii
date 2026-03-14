"use client";

import React, { useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Book,
  Calendar,
  Megaphone,
  ArrowRight,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";

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

const adminTools = [
  {
    href: "/admin/users",
    icon: <Users className="h-8 w-8" />,
    title: "User Management",
    description: "Onboard and manage teachers, students, and parents.",
  },
  {
    href: "/admin/academics",
    icon: <Book className="h-8 w-8" />,
    title: "Academic Setup",
    description: "Create and manage classes, sections, and subjects.",
  },
  {
    href: "/admin/timetable",
    icon: <Calendar className="h-8 w-8" />,
    title: "Timetable Management",
    description: "Design and publish class and teacher schedules.",
  },
  {
    href: "/admin/announcements",
    icon: <Megaphone className="h-8 w-8" />,
    title: "Announcements",
    description: "Broadcast notices to the entire school or specific groups.",
  },
];

const SummaryCard = ({
  title,
  value,
  change,
}: {
  title: string;
  value: string | number;
  change?: string;
}) => (
  <SpotlightCard>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
    </CardHeader>
    <CardContent>
      <CardTitle className="text-4xl font-bold">{value}</CardTitle>
      {change && (
        <p className="text-xs text-muted-foreground pt-2">{change}</p>
      )}
    </CardContent>
  </SpotlightCard>
);

export default function AdminDashboardPage() {
  const { profile } = useUser();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome, {profile?.name || "Admin"}. Here's an overview of your
          school.
        </p>
      </div>

      <SpotlightCard>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-2xl font-bold">
              School Analytics
            </CardTitle>
          </div>
          <CardDescription>
            A snapshot of your school's key metrics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <SummaryCard title="Total Students" value="1,250" change="+5% from last month" />
            <SummaryCard title="Total Teachers" value="85" change="+2 from last month" />
            <SummaryCard title="Classes" value="45" />
          </div>
        </CardContent>
      </SpotlightCard>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {adminTools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group block h-full">
            <SpotlightCard className="flex h-full flex-col transition-all duration-300">
              <CardHeader className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {tool.icon}
                </div>
                <CardTitle className="font-headline text-xl text-foreground">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto p-6 pt-0">
                <div className="flex w-full items-center justify-between text-sm font-medium text-primary">
                  <span>Go to Section</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  );
}
