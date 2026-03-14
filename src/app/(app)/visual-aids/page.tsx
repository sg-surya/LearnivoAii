"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateVisualAidAction } from "@/app/actions/generate-visual-aid";
import { submitVisualAidFeedbackAction } from "@/app/actions/submit-visual-aid-feedback";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Layers, Download, Image as ImageIcon, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import type { GenerateVisualAidOutput } from "@/ai/flows/generate-visual-aid-flow";
import { useWorkspace } from "@/context/workspace-context";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import { AILoading } from "@/components/ai-loading";
import { FeedbackCard } from "@/components/feedback-card";

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
  visualType: z.enum([
    "Simple Drawing",
    "Flow Chart",
    "Mind Map",
    "Bar Chart",
    "Venn Diagram",
    "Cycle Diagram",
  ]),
  data: z.string().optional(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  handDrawn: z.boolean(),
});

export default function VisualAidsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ aid: GenerateVisualAidOutput, assetId: string | null } | null>(null);

  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { user, profile } = useUser();
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      visualType: "Simple Drawing",
      data: "",
      primaryColor: "#FFFFFF",
      secondaryColor: "#8E8E8E",
      handDrawn: true,
    },
  });

  const visualType = form.watch("visualType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateVisualAidAction(values);
       if (response) {
        const assetId = await addAsset({
            type: "Visual Aid",
            name: `${values.visualType} for ${values.concept}`,
            content: response,
        });

        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Visual aid for '${values.concept}' saved to your workspace.`,
            });
        }
        setResult({ aid: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to generate visual aid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const downloadSvg = () => {
    if (result) {
      const svgBlob = new Blob([result.aid.svg], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `${form
        .getValues("concept")
        .replace(/ /g, "_")}_visual_aid.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  const downloadPng = () => {
    if (svgContainerRef.current?.querySelector('svg')) {
      const svgElement = svgContainerRef.current.querySelector('svg')!;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement("a");
        downloadLink.href = pngFile;
        downloadLink.download = `${form
        .getValues("concept")
        .replace(/ /g, "_")}_visual_aid.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard className="sticky top-6">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Visual Aids Designer
            </CardTitle>
            <CardDescription>
              Describe a concept to generate a simple drawing or chart.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concept to Visualize</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Water Cycle, Parts of a flower"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visualType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visual Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a visual type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Simple Drawing">Simple Drawing</SelectItem>
                          <SelectItem value="Flow Chart">Flow Chart</SelectItem>
                          <SelectItem value="Mind Map">Mind Map</SelectItem>
                          <SelectItem value="Bar Chart">Bar Chart</SelectItem>
                          <SelectItem value="Venn Diagram">Venn Diagram</SelectItem>
                          <SelectItem value="Cycle Diagram">Cycle Diagram</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {visualType.includes("Chart") && (
                   <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data (for charts)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional. E.g. for Bar Chart: Apples,10; Oranges,15; Grapes,8"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="text-sm font-medium">Style Options</h4>
                   <FormField
                    control={form.control}
                    name="handDrawn"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <FormLabel>Hand-drawn Style</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4">
                     <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Secondary Color</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Visual"
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
                <CardTitle className="font-headline text-2xl">
                  Generated Visual
                </CardTitle>
                <CardDescription>
                  A simple visual for your blackboard or presentation.
                </CardDescription>
              </div>
              {result && (
                <div className="flex gap-2">
                    <Button variant="outline" onClick={downloadSvg}>
                        <Download className="mr-2 h-4 w-4" />
                        SVG
                    </Button>
                    <Button variant="outline" onClick={downloadPng}>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        PNG
                    </Button>
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
              <div
                ref={svgContainerRef}
                className="w-full h-full p-4 rounded-lg bg-slate-800 border border-slate-700"
                dangerouslySetInnerHTML={{ __html: result.aid.svg }}
              />
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <Layers className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">
                  Bring concepts to life visually.
                </p>
                <p>
                  Enter a topic to generate a simple drawing or chart.
                </p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Visual Aid" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
