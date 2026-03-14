
"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateHyperLocalContentAction } from "@/app/actions/generate-hyper-local-content";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Map as MapIcon } from "lucide-react";
import type { GenerateHyperLocalContentOutput } from "@/ai/flows/generate-hyper-local-content";
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
  concept: z.string().min(3, "Concept must be at least 3 characters."),
  language: z.string().min(2, "Language is required."),
  city: z.string().min(2, "City is required."),
  contentType: z.enum(["story", "example", "explanation"]),
});

const indianLanguages = [
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
  "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
  "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
  "Sindhi", "Tamil", "Telugu", "Urdu"
] as const;

export default function HyperLocalContentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{content: GenerateHyperLocalContentOutput, assetId: string | null} | null>(
    null
  );
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      language: profile?.defaultLanguage || "English",
      city: "",
      contentType: "example",
    },
  });

  useEffect(() => {
    if (profile?.defaultLanguage) {
      form.setValue("language", profile.defaultLanguage);
    }
  }, [profile, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateHyperLocalContentAction(values);
      if (response) {
        const assetId = await addAsset({
            type: "Hyper-Local Content",
            name: `${values.contentType.charAt(0).toUpperCase() + values.contentType.slice(1)} for ${values.concept}`,
            content: response,
        });

        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Content for '${values.concept}' saved to your workspace.`,
            });
        }
        setResult({ content: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description:
          "Failed to generate hyper-local content. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  const markdownContent = `<h4>💧 The Mumbai Water Cycle: From the Arabian Sea to Your Tap</h4><p>Imagine a hot, humid day in Mumbai, with the sun beating down on the vast Arabian Sea. Here's how the water from the sea completes a magical journey to reach you!</p><h4>1. Evaporation (वाष्पीकरण) ☀️</h4><p>The sun's energy heats the water, <em>just like when you boil water for chai</em>. This causes the water on the surface of the sea to turn into an invisible gas called water vapor, which rises into the air. This process is called <strong>evaporation</strong> – it's why the air often feels so sticky and humid before the monsoon arrives!</p><h4>2. Condensation (संघनन) ☁️</h4><p>As this warm, moist air rises higher above the city, it cools down, <em>much like how it gets cooler when you go up the Bandra-Worli Sea Link</em>. This cooling causes the water vapor to change back into tiny liquid water droplets. These droplets clump together to form the familiar grey clouds we see gathering over <strong>Marine Drive</strong>, signaling the approach of heavy rains. This is <strong>condensation</strong>.</p><h4>3. Precipitation (वर्षा) 🌧️</h4><p>When these clouds become too heavy with water droplets, they can't hold any more, and the water falls back to Earth. This is <strong>precipitation</strong> – the spectacular <strong>Mumbai monsoon</strong>! Think of those sudden, heavy downpours that drench the streets of South Mumbai or cause local train delays.</p><h4>4. Collection (संग्रह) 🌊</h4><p>Finally, this rainwater collects.<ul><li>Some of it flows into Mumbai's drains and eventually makes its way back to the Arabian Sea.</li><li>A significant amount also fills up our vital reservoirs and lakes, like <strong>Powai Lake</strong> or <strong>Vihar Lake</strong>, which are crucial sources of drinking water.</li><li>Some water also soaks into the ground, replenishing groundwater.</li></ul></p><p>This collection of water, ready to evaporate again, completes 'the water cycle' – a continuous, life-giving journey of water, essential for our city!</p>`;


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Hyper-Local Content
            </CardTitle>
            <CardDescription>
              Generate examples, stories, or explanations relevant to your
              students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Concept</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., The water cycle, simple interest, photosynthesis"
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Region</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mumbai, rural Bihar" {...field} />
                      </FormControl>
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
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="example">Example</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="explanation">
                            Explanation
                          </SelectItem>
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
                      Generating...
                    </>
                  ) : (
                    "Generate Content"
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
              Generated Content
            </CardTitle>
            <CardDescription>
              Your AI-generated hyper-local content will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && (
              <div className="prose prose-sm max-w-none rounded-md border bg-muted p-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.content.content }} />
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                 <MapIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">Bring learning home for your students.</p>
                <p>Fill out the form and let the AI do the rest.</p>
              </div>
            )}
          </CardContent>
           {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Hyper-Local Content" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
