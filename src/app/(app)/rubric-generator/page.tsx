"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateRubricAction } from "@/app/actions/generate-rubric";
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
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Loader2, Scale } from "lucide-react";
import type { GenerateRubricOutput } from "@/ai/flows/generate-rubric-flow";
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
  assignmentTitle: z
    .string()
    .min(5, "Title must be at least 5 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  maxScore: z.coerce.number().min(1, "Max score must be at least 1."),
});

export default function RubricGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{rubric: GenerateRubricOutput, assetId: string | null} | null>(null);
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignmentTitle: "",
      description: "",
      maxScore: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateRubricAction(values);
      if (response) {
        const assetId = await addAsset({
            type: "Rubric",
            name: response.title || `Rubric for ${values.assignmentTitle}`,
            content: response,
        });
        if (profile?.autoSave && assetId) {
            toast({
                title: "Auto-Saved!",
                description: `Rubric '${response.title}' saved to your workspace.`,
            });
        }
        setResult({ rubric: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to generate rubric. Please try again later.",
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
              Rubric Generator
            </CardTitle>
            <CardDescription>
              Create detailed grading rubrics for any assignment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="assignmentTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Essay on the Freedom Struggle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignment Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the assignment requirements. e.g., 'A 500-word essay on the key events...'"
                          {...field}
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Score per Criterion</FormLabel>
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
                    "Generate Rubric"
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
              Generated Rubric
            </CardTitle>
            <CardDescription>
              Your AI-generated rubric will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex h-96 items-center justify-center">
                <AILoading />
              </div>
            )}
            {result && result.rubric.criteria && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">{result.rubric.title}</h2>
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px] font-bold">
                          Criteria
                        </TableHead>
                        {result.rubric.criteria[0]?.levels.map((level) => (
                          <TableHead key={level.level} className="font-bold">
                            {level.level}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rubric.criteria.map((criterion, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-semibold">
                            {criterion.criteria}
                          </TableCell>
                          {criterion.levels.map((level) => (
                            <TableCell key={level.level} className="text-sm">
                              {level.description}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <Scale className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">
                  Standardize your grading with clear criteria.
                </p>
                <p>Describe your assignment to generate a fair rubric.</p>
              </div>
            )}
          </CardContent>
          {result && result.assetId && (
            <CardFooter>
              <FeedbackCard assetId={result.assetId} assetType="Rubric" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
