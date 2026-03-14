"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { draftParentCommunicationAction } from "@/app/actions/draft-parent-communication";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy } from "lucide-react";
import type { DraftParentCommunicationOutput } from "@/ai/flows/draft-parent-communications";
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
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  gradeLevel: z.string().min(1, "Grade level is required."),
  context: z.string().min(10, "Context must be at least 10 characters."),
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

export default function ParentCommunicationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{draft: DraftParentCommunicationOutput, assetId: string | null} | null>(
    null
  );
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      gradeLevel: profile?.defaultGrade || "Grade 8",
      context: "",
      localLanguage: profile?.defaultLanguage || "Hindi",
    },
  });
  
  useEffect(() => {
    if (profile) {
      form.setValue("gradeLevel", profile.defaultGrade || "Grade 8");
      form.setValue("localLanguage", profile.defaultLanguage || "English");
    }
  }, [profile, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await draftParentCommunicationAction(values);
      if (response) {
        const assetId = await addAsset({
            type: "Parent Communication",
            name: `Email: ${values.topic}`,
            content: response,
        });

        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Email draft for '${values.topic}' saved to your workspace.`,
            });
        }
        setResult({ draft: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to draft email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = (text: string, language: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${language} draft copied to clipboard.`,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Parent Communication
            </CardTitle>
            <CardDescription>
              Draft professional emails to parents in seconds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Topic</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Upcoming Parent-Teacher Meeting"
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
                  name="context"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context / Key Points</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Meeting on Friday at 4 PM to discuss midterm results..."
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
                  name="localLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Translate to</FormLabel>
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
                      Drafting...
                    </>
                  ) : (
                    "Draft Email"
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
              Email Drafts
            </CardTitle>
            <CardDescription>
              Your generated email drafts will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && (
              <Tabs defaultValue="english">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="english">English</TabsTrigger>
                  <TabsTrigger value="translated" className="capitalize">
                    {form.getValues("localLanguage") || "Translated"}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="english">
                  <div className="relative mt-4 rounded-md border bg-muted p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7"
                      onClick={() =>
                        handleCopy(result.draft.emailDraft, "English")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {result.draft.emailDraft}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="translated">
                  <div className="relative mt-4 rounded-md border bg-muted p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7"
                      onClick={() =>
                        handleCopy(
                          result.draft.translatedEmailDraft,
                          form.getValues("localLanguage")
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {result.draft.translatedEmailDraft}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <p>Keep parents informed effortlessly.</p>
                <p>Provide some context to draft a professional email.</p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Parent Communication" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
