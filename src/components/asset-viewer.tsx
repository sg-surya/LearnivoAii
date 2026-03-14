
"use client";

import React, { memo, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GanttChart,
  HelpCircle,
  Scale,
  GraduationCap,
  BrainCircuit,
  Mail,
  FileText,
  Target,
  ListChecks,
  Paperclip,
  ClipboardCheck,
  Link as LinkIcon,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle2,
  ScanLine,
  Layers,
  BookText,
  Calculator,
} from "lucide-react";
import Image from "next/image";
import type { Asset } from "@/context/workspace-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizResult } from "@/components/quiz-result";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const getIconForAssetType = (type: string, className?: string) => {
  switch (type) {
    case "Lesson Plan": return <GanttChart className={className} />;
    case "Quiz": return <HelpCircle className={className} />;
    case "Rubric": return <Scale className={className} />;
    case "Debate Topic": return <GraduationCap className={className} />;
    case "Hyper-Local Content": return <BrainCircuit className={className} />;
    case "Parent Communication": return <Mail className={className} />;
    case "Quiz Result": return <CheckCircle2 className={className} />;
    case "Digitized Paper": return <ScanLine className={className} />;
    case "Visual Aid": return <Layers className={className} />;
    case "Story": return <BookText className={className} />;
    case "Math Solution": return <Calculator className={className} />;
    default: return <FileText className={className} />;
  }
};

const LessonPlanViewer = memo(({ content }: { content: any }) => {
  const parsedPlan = useMemo(() => typeof content === 'string' ? JSON.parse(content) : content, [content]);
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
      {Object.entries(parsedPlan).map(([day, details]: [string, any], index) => (
        <AccordionItem value={`item-${index}`} key={day}>
          <AccordionTrigger className="font-headline text-lg font-semibold capitalize hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-base">{day.replace("_", " ")}</Badge>
              <span>{details.sub_topic}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                <Target className="h-5 w-5 text-primary" />
                <h4 className="font-headline text-lg font-semibold">Learning Objectives</h4>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ul className="space-y-2">
                  {details.learning_objectives.map((obj: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span className="flex-1 text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                <ListChecks className="h-5 w-5 text-primary" />
                <h4 className="font-headline text-lg font-semibold">Activities</h4>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
                {details.activities.map((act: {name: string, duration: string}, i: number) => (
                  <Badge key={i} variant="outline">{act.name} ({act.duration})</Badge>
                ))}
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                  <Paperclip className="h-5 w-5 text-primary" />
                  <h4 className="font-headline text-lg font-semibold">Resources</h4>
                </CardHeader>
                <CardContent className="space-y-2 p-4 pt-0">
                  {details.resources.map((res: string, i: number) => (
                    <div key={i} className="text-sm text-muted-foreground">
                      {res.startsWith('http') ? <a href={res} target="_blank" className="text-primary underline">{res}</a> : res}
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  <h4 className="font-headline text-lg font-semibold">Assessment</h4>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{details.assessment}</p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
});
LessonPlanViewer.displayName = "LessonPlanViewer";

const ParentCommunicationViewer = memo(({ content }: { content: any }) => {
  const { toast } = useToast();
  const handleCopy = (text: string, language: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${language} draft copied to clipboard.` });
  };
  return (
    <div className="space-y-4">
       <div className="relative mt-4 rounded-md border bg-muted p-4">
         <h3 className="font-headline mb-2">English Draft</h3>
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7" onClick={() => handleCopy(content.emailDraft, "English")}>
          <Copy className="h-4 w-4" />
        </Button>
        <pre className="whitespace-pre-wrap font-sans text-sm">{content.emailDraft}</pre>
      </div>
       <div className="relative mt-4 rounded-md border bg-muted p-4">
        <h3 className="font-headline mb-2">Translated Draft</h3>
        <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7" onClick={() => handleCopy(content.translatedEmailDraft, "Translated")}>
          <Copy className="h-4 w-4" />
        </Button>
        <pre className="whitespace-pre-wrap font-sans text-sm">{content.translatedEmailDraft}</pre>
      </div>
    </div>
  );
});
ParentCommunicationViewer.displayName = "ParentCommunicationViewer";

export function AssetViewer({ asset, open, onOpenChange }: { asset: Asset | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
  if (!asset) return null;

  const content = useMemo(() => {
    switch (asset.type) {
      case "Lesson Plan": return <LessonPlanViewer content={asset.content} />;
      case "Parent Communication": return <ParentCommunicationViewer content={asset.content} />;
      case "Quiz Result": return <QuizResult quiz={asset.content.quiz} evaluation={asset.content.evaluation} userAnswers={asset.content.answers} />;
      case "Digitized Paper": return <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: asset.content.formattedContent }} />;
      case "Visual Aid": return <div className="w-full h-full p-4 rounded-lg bg-slate-800 border border-slate-700" dangerouslySetInnerHTML={{ __html: asset.content.svg }} />;
      case "Math Solution": return (
        <div className="space-y-4">
          <Card><CardHeader><CardTitle className="text-lg">Solution</CardTitle></CardHeader><CardContent><p>{asset.content.solution}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-lg">Explanation</CardTitle></CardHeader><CardContent><p>{asset.content.explanation}</p></CardContent></Card>
        </div>
      );
      default: return <pre className="p-4 bg-muted rounded-md overflow-auto">{JSON.stringify(asset.content, null, 2)}</pre>;
    }
  }, [asset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-3">
            {getIconForAssetType(asset.type, "h-6 w-6")}
            {asset.name}
          </DialogTitle>
          <DialogDescription>{asset.type}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-2">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
