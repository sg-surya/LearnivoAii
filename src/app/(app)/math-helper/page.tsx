"use client";

import { useState, useCallback, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { mathHelperAction } from "@/app/actions/math-helper";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, X, Calculator } from "lucide-react";
import type { MathHelperOutput } from "@/ai/flows/math-helper-flow";
import { useWorkspace } from "@/context/workspace-context";
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
  photo: z.custom<File>((v) => v instanceof File, "Please upload an image."),
  language: z.string().min(2, "Language is required."),
});

const indianLanguages = [
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
  "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
  "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
  "Sindhi", "Tamil", "Telugu", "Urdu"
] as const;

export default function MathHelperPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{solution: MathHelperOutput, assetId: string | null} | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: profile?.defaultLanguage || "English",
    },
  });

  useEffect(() => {
    if (profile?.defaultLanguage) {
      form.setValue("language", profile.defaultLanguage);
    }
  }, [profile, form]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      form.setValue("photo", acceptedFiles[0]);
      setPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const clearPhoto = () => {
    form.resetField("photo");
    setPreview(null);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(values.photo);
        });

      const response = await mathHelperAction({
        photoDataUri: fileData,
        language: values.language,
      });

      if (response) {
        const assetId = await addAsset({
            type: 'Math Solution',
            name: `Solution for uploaded math problem`,
            content: response,
        });

        if (profile?.autoSave && assetId) {
            toast({
                title: 'Auto-Saved!',
                description: `Math solution has been saved to your workspace.`,
            });
        }
        setResult({ solution: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to solve the math problem. Please try again.",
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
            <CardTitle className="font-headline text-2xl">Math Helper</CardTitle>
            <CardDescription>
              Upload a photo of a math problem to get a step-by-step solution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Problem Photo</FormLabel>
                      <div
                        {...getRootProps()}
                        className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50 transition-colors"
                      >
                        <input {...getInputProps()} />
                        {preview ? (
                          <>
                            <Image src={preview} alt="Problem preview" layout="fill" objectFit="contain" className="p-2"/>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); clearPhoto(); }}
                            >
                                <X className="h-4 w-4"/>
                            </Button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center">
                            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {isDragActive ? "Drop the image here..." : "Click or drag to upload"}
                            </p>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Explanation Language</FormLabel>
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

                <Button type="submit" className="w-full" disabled={isLoading || !form.watch('photo')}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Solving...
                    </>
                  ) : (
                    "Solve Problem"
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
            <CardTitle className="font-headline text-2xl">Solution & Explanation</CardTitle>
            <CardDescription>
              The AI-generated solution will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 flex-col items-center justify-center">
                <AILoading />
              </div>
            )}
            {result ? (
              <div className="space-y-6">
                <SpotlightCard>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Solution</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-lg max-w-none dark:prose-invert font-bold">
                        <p>{result.solution.solution}</p>
                    </CardContent>
                </SpotlightCard>
                <SpotlightCard>
                    <CardHeader>
                        <CardTitle className="font-headline text-lg">Step-by-Step Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.solution.explanation.replace(/\n/g, '<br />') }}/>
                </SpotlightCard>
              </div>
            ) : !isLoading && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <Calculator className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">
                  Stuck on a math problem?
                </p>
                <p>
                  Upload a photo to get an instant, detailed solution.
                </p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Math Solution" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
