"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateDebateTopicsAction } from "@/app/actions/generate-debate-topics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, GraduationCap, ThumbsUp, ThumbsDown } from "lucide-react";
import type { GenerateDebateTopicsOutput } from "@/ai/flows/generate-debate-topics-flow";
import { useWorkspace } from "@/context/workspace-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { FeedbackCard } from "@/components/feedback-card";
import { AILoading } from "@/components/ai-loading";

const SpotlightCard = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    }
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("spotlight-card", className)}
      {...props}
    >
      {children}
    </Card>
  );
};


const formSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters."),
  gradeLevel: z.string().min(1, "Grade level is required."),
  numTopics: z.coerce.number().min(1, "Must generate at least 1 topic.").max(5),
});

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", 
  "Grade 11", "Grade 12",
] as const;

export default function DebateTopicGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{topics: GenerateDebateTopicsOutput, assetId: string | null} | null>(
    null
  );
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      gradeLevel: "Grade 10",
      numTopics: 3,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateDebateTopicsAction(values);
      if (response) {
        const assetId = await addAsset({
            type: "Debate Topic",
            name: `Debate topics for ${values.subject}`,
            content: response,
        });
        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Debate topics for '${values.subject}' saved to your workspace.`,
            });
        }
        setResult({ topics: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to generate debate topics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard className="sticky top-6">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Debate Topic Generator
            </CardTitle>
            <CardDescription>
              Generate engaging topics and research starting points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject / Theme</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Technology, Environment, History"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a grade level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {gradeLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numTopics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Topics (Max 5)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Topics"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </SpotlightCard>
      </div>

      <div className="lg:col-span-2">
        <SpotlightCard className="min-h-[calc(100vh-10rem)]">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Generated Topics
            </CardTitle>
            <CardDescription>
              Your AI-generated debate topics will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && result.topics.topics && (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue="item-0"
              >
                {result.topics.topics.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">
                      {item.topic}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SpotlightCard>
                          <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-3">
                            <ThumbsUp className="h-5 w-5 text-green-500" />
                            <h4 className="font-bold">For</h4>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {item.forPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </SpotlightCard>
                        <SpotlightCard>
                          <CardHeader className="flex flex-row items-center gap-2 space-y-0 p-3">
                            <ThumbsDown className="h-5 w-5 text-red-500" />
                            <h4 className="font-bold">Against</h4>
                          </CardHeader>
                          <CardContent className="p-3 pt-0">
                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {item.againstPoints.map((point, i) => (
                                <li key={i}>{point}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </SpotlightCard>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">
                  Spark critical thinking in your classroom.
                </p>
                <p>
                  Enter a subject to generate engaging debate topics.
                </p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Debate Topic" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
