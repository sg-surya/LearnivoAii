"use client";

import { useState, useRef, type MouseEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { provideInstantKnowledgeBaseAction } from "@/app/actions/provide-instant-knowledge-base";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2 } from "lucide-react";
import type { ProvideInstantKnowledgeBaseOutput } from "@/ai/flows/provide-instant-knowledge-base";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
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
  question: z.string().min(5, "Question must be at least 5 characters."),
  gradeLevel: z.string().min(1, "Grade level is required."),
  localLanguage: z.string().min(2, "Language is required."),
});

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", 
  "Grade 11", "Grade 12",
] as const;

const indianLanguages = [
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
  "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
  "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
  "Sindhi", "Tamil", "Telugu", "Urdu"
] as const;


export default function KnowledgeBasePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ProvideInstantKnowledgeBaseOutput | null>(
    null
  );
  const { toast } = useToast();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      gradeLevel: profile?.defaultGrade || "Grade 6",
      localLanguage: profile?.defaultLanguage || "English",
    },
  });
  
  useEffect(() => {
    if (profile) {
      form.setValue("gradeLevel", profile.defaultGrade || "Grade 6");
      form.setValue("localLanguage", profile.defaultLanguage || "English");
    }
  }, [profile, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await provideInstantKnowledgeBaseAction(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to get an answer. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Instant Knowledge Base
            </CardTitle>
            <CardDescription>
              Get simple, age-appropriate answers to student questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student's Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Why is the sky blue?"
                          {...field}
                          rows={4}
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                  name="localLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {indianLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Get Answer
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </SpotlightCard>
      </div>

      <div className="lg:col-span-2">
        <SpotlightCard className="min-h-[600px]">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Simple Answer
            </CardTitle>
            <CardDescription>
              The AI-generated answer will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && (
              <div className="prose prose-lg max-w-none rounded-md border bg-muted p-6 dark:prose-invert">
                <p>{result.answer}</p>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <p>Curiosity is the spark of learning.</p>
                <p>Enter a question to get a simple, clear explanation.</p>
              </div>
            )}
          </CardContent>
        </SpotlightCard>
      </div>
    </div>
  );
}
