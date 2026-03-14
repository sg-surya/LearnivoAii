"use client";

import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { generateStoryAction } from "@/app/actions/generate-story";
import { generateStoryIdeaAction } from "@/app/actions/generate-story-idea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookText, FileText, FileType, Wand2 } from "lucide-react";
import type { StoryWithImages } from "@/ai/flows/generate-story-flow";
import { useWorkspace } from "@/context/workspace-context";
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";
import { useUser } from "@/firebase";
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
  topic: z.string().min(5, "Topic must be at least 5 characters."),
  characters: z.string().min(3, "Characters description is required."),
  setting: z.string().min(3, "Setting is required."),
  gradeLevel: z.string().min(1, "Grade level is required."),
  language: z.string().min(2, "Language is required."),
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


export default function StoryGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingIdea, setIsGeneratingIdea] = useState<null | 'topic' | 'characters' | 'setting'>(null);
  const [result, setResult] = useState<{story: StoryWithImages, assetId: string | null} | null>(null);
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      characters: "",
      setting: "",
      gradeLevel: profile?.defaultGrade || "Grade 4",
      language: profile?.defaultLanguage || "Hindi",
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValue("gradeLevel", profile.defaultGrade || "Grade 4");
      form.setValue("language", profile.defaultLanguage || "Hindi");
    }
  }, [profile, form]);

  const handleGenerateIdea = async (ideaType: 'topic' | 'characters' | 'setting') => {
    setIsGeneratingIdea(ideaType);
    try {
      const currentValues = form.getValues();
      const response = await generateStoryIdeaAction({ 
          suggestionType: ideaType,
          context: {
              topic: currentValues.topic,
              characters: currentValues.characters,
              setting: currentValues.setting
          }
       });
      if (response && response.suggestion) {
        form.setValue(ideaType, response.suggestion);
      }
    } catch (error) {
      toast({
        title: "Suggestion Failed",
        description: "Could not generate a suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingIdea(null);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateStoryAction({
          ...values,
          subscriptionPlan: 'premium' // This should be dynamic based on user's plan
      });
      if (response && response.pages && response.pages.length > 0) {
        const assetId = await addAsset({
            type: "Story",
            name: response.title,
            content: response,
        });

        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Story "${response.title}" saved to your workspace.`,
            });
        }
        setResult({ story: response, assetId });
      } else {
        toast({
            title: "Story Generation Failed",
            description: "The AI failed to return a valid story. Please try again.",
            variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to generate the story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const exportToPdf = async () => {
    if (!result) return;
    const { default: html2canvas } = await import('html2canvas');
    const pdf = new jsPDF('p', 'pt', 'a4');
    
    // Add title page
    const titleElement = document.createElement('div');
    titleElement.style.width = `${pdf.internal.pageSize.getWidth()}px`;
    titleElement.style.height = `${pdf.internal.pageSize.getHeight()}px`;
    titleElement.style.display = 'flex';
    titleElement.style.alignItems = 'center';
    titleElement.style.justifyContent = 'center';
    titleElement.style.textAlign = 'center';
    titleElement.innerHTML = `<h1 style="font-size: 24pt;">${result.story.title}</h1>`;
    document.body.appendChild(titleElement);

    const titleCanvas = await html2canvas(titleElement);
    const titleImgData = titleCanvas.toDataURL('image/png');
    pdf.addImage(titleImgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    document.body.removeChild(titleElement);

    for (const page of result.story.pages) {
      pdf.addPage();
      if (page.imageDataUri) {
        try {
          // Add image
          await new Promise<void>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => {
              const imgWidth = pdf.internal.pageSize.getWidth() - 80;
              const imgHeight = (img.height * imgWidth) / img.width;
              pdf.addImage(img, 'PNG', 40, 40, imgWidth, imgHeight);
              
              // Add text
              pdf.setFontSize(12);
              const splitText = pdf.splitTextToSize(page.text, pdf.internal.pageSize.getWidth() - 80);
              pdf.text(splitText, 40, 60 + imgHeight);
              
              resolve();
            };
            img.onerror = reject;
            img.src = page.imageDataUri!;
          });
        } catch (e) {
          console.error("Error adding image to PDF, adding text only.");
          pdf.text(page.text, 40, 40);
        }
      } else {
        pdf.text(page.text, 40, 40);
      }
    }
    
    pdf.save(`${result.story.title || 'story'}.pdf`);
  };

  const exportToDocx = async () => {
    if (!result) return;
    const htmlDocx = (await import('html-docx-js/dist/html-docx')).default;
    
    let htmlContent = `<h1>${result.story.title}</h1>`;
    for (const page of result.story.pages) {
        if(page.imageDataUri) {
             htmlContent += `<p><img src="${page.imageDataUri}" width="500" /></p>`;
        }
        htmlContent += `<p>${page.text}</p><br style="page-break-after: always;"/>`;
    }

    const blob = htmlDocx.asBlob(htmlContent);
    saveAs(blob, `${result.story.title || 'story'}.docx`);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard className="sticky top-6">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Story Generator</CardTitle>
            <CardDescription>
              Create engaging stories with illustrations for your students.
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
                      <FormLabel>Story Topic or Moral</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'A magical tree that grants wishes' or 'The importance of honesty'"
                            {...field}
                            rows={2}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("absolute bottom-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary", isGeneratingIdea === 'topic' && "animate-spin")}
                            onClick={() => handleGenerateIdea('topic')}
                            disabled={isGeneratingIdea !== null}
                          >
                            <Wand2 className="h-4 w-4" />
                          </Button>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="characters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Characters</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="e.g., A clever rabbit and a slow tortoise"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn("absolute bottom-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary", isGeneratingIdea === 'characters' && "animate-spin")}
                          onClick={() => handleGenerateIdea('characters')}
                          disabled={isGeneratingIdea !== null}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="setting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setting / Environment</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="e.g., A dense forest, a bustling city"
                            {...field}
                            className="pr-10"
                          />
                        </FormControl>
                         <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                           className={cn("absolute bottom-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary", isGeneratingIdea === 'setting' && "animate-spin")}
                          onClick={() => handleGenerateIdea('setting')}
                          disabled={isGeneratingIdea !== null}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                    name="language"
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
                </div>
                <Button type="submit" className="w-full" disabled={isLoading || isGeneratingIdea !== null}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Weaving a tale...
                    </>
                  ) : (
                    "Generate Story"
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
            <div className="flex items-start justify-between">
                <div>
                    <CardTitle className="font-headline text-2xl">{result?.story.title || 'Generated Story'}</CardTitle>
                    <CardDescription>
                    Your AI-generated illustrated story will appear here.
                    </CardDescription>
                </div>
                {result && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportToPdf}><FileText className="mr-2 h-4 w-4" /> PDF</Button>
                        <Button variant="outline" onClick={exportToDocx}><FileType className="mr-2 h-4 w-4" /> DOCX</Button>
                    </div>
                )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && (
              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                    {result.story.pages.map((page) => (
                        <CarouselItem key={page.pageNumber}>
                            <div className="p-1">
                                <Card className="overflow-hidden">
                                    <CardContent className="flex flex-col aspect-video items-center justify-center p-6 gap-4">
                                        <div className="relative w-full h-3/5 bg-muted rounded-md">
                                          {page.imageDataUri ? (
                                            <Image src={page.imageDataUri} alt={`Illustration for page ${page.pageNumber}`} layout="fill" objectFit="contain" />
                                          ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                              <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                          )}
                                        </div>
                                       <p className="text-center text-lg md:text-xl h-2/5 overflow-y-auto">{page.text}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="ml-12" />
                <CarouselNext className="mr-12" />
              </Carousel>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <BookText className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">Ready to spark imagination?</p>
                <p>Fill out the form to create a unique story for your class.</p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Story" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
