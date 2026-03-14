"use client";

import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateQuizAction } from "@/app/actions/generate-quiz";
import { evaluateQuizAction } from "@/app/actions/evaluate-quiz";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  HelpCircle,
  Download,
  List,
  CheckCircle,
  Pencil,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import type { GenerateQuizOutput, Question } from "@/ai/flows/generate-quiz-flow";
import type { EvaluateQuizOutput } from "@/ai/flows/evaluate-quiz-answers-flow";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/workspace-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizAttempt } from "@/components/quiz-attempt";
import { QuizResult } from "@/components/quiz-result";
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
  sourceText: z
    .string()
    .min(10, "Source text must be at least 10 characters."),
  numQuestions: z.coerce
    .number()
    .min(1, "Must generate at least 1 question.")
    .max(20, "Cannot generate more than 20 questions."),
  questionTypes: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one question type.",
    }),
  gradeLevel: z.string().min(1, "Grade level is required."),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  language: z.string().min(2, "Language is required."),
  bloomsLevel: z.enum([
    "Remembering",
    "Understanding",
    "Applying",
    "Analyzing",
    "Evaluating",
    "Creating",
  ]),
});

const questionTypes = [
  { id: "MCQ", label: "Multiple Choice" },
  { id: "ShortAnswer", label: "Short Answer" },
  { id: "LongAnswer", label: "Long Answer" },
  { id: "FillInTheBlank", label: "Fill in the Blank" },
] as const;

const difficultyLevels = ["Easy", "Medium", "Hard"] as const;

const bloomsLevels = [
  "Remembering",
  "Understanding",
  "Applying",
  "Analyzing",
  "Evaluating",
  "Creating",
] as const;

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


export default function QuizGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{quiz: GenerateQuizOutput, assetId: string | null} | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluateQuizOutput | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string> | null>(null);
  const [view, setView] = useState<"form" | "attend" | "result">("form");
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceText: "",
      numQuestions: 5,
      questionTypes: ["MCQ", "ShortAnswer"],
      gradeLevel: profile?.defaultGrade || "Grade 8",
      difficulty: "Medium",
      language: profile?.defaultLanguage || "English",
      bloomsLevel: "Understanding",
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValue("gradeLevel", profile.defaultGrade || "Grade 8");
      form.setValue("language", profile.defaultLanguage || "English");
    }
  }, [profile, form]);

  useEffect(() => {
    if (evaluationResult && userAnswers && result && profile?.autoSave) {
      addAsset({
        type: "Quiz Result",
        name: `Result for: ${result.quiz.title}`,
        content: {
          quiz: result.quiz,
          answers: userAnswers,
          evaluation: evaluationResult
        },
      });
       toast({
        title: "Result Saved!",
        description: `Quiz result for '${result.quiz.title}' saved to your workspace.`,
      });
    }
  }, [evaluationResult, userAnswers, result, profile?.autoSave, addAsset, toast]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    setEvaluationResult(null);
    setView("form");
    try {
      const response = await generateQuizAction({
        ...values,
        questionTypes: values.questionTypes as Array<"MCQ" | "ShortAnswer" | "LongAnswer" | "FillInTheBlank">,
      });

      if (response) {
        let assetId = null;
         if (profile?.autoSave) {
            assetId = await addAsset({
              type: "Quiz",
              name: response.title || `Quiz on ${form.getValues("sourceText").substring(0, 20)}...`,
              content: response,
            });
            toast({
              title: "Auto-Saved!",
              description: `Quiz '${response.title}' saved to your workspace.`,
            });
        }
        setResult({ quiz: response, assetId });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Something went wrong",
        description: "Failed to generate quiz. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    if (!result) return;
    
    setIsEvaluating(true);
    setView("result");
    setUserAnswers(answers);

    try {
      const orderedAnswers = result.quiz.questions.map((q, index) => answers[`question-${index}`] || "");
      const evaluation = await evaluateQuizAction({
        questions: result.quiz.questions,
        userAnswers: orderedAnswers,
      });
      setEvaluationResult(evaluation);
    } catch (error) {
        console.error(error);
        toast({
            title: "Evaluation Failed",
            description: "AI failed to evaluate the quiz. Please try again.",
            variant: "destructive",
        });
        setView("attend"); // Go back to attend view on failure
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestart = () => {
    setResult(null);
    setEvaluationResult(null);
    setUserAnswers(null);
    setView("form");
    form.reset();
  }

  if (view === 'attend' && result) {
    return (
      <QuizAttempt 
        quiz={result.quiz} 
        onSubmit={handleQuizSubmit} 
        onBack={() => setView("form")}
      />
    );
  }

  if (view === 'result' && (isEvaluating || (result && evaluationResult && userAnswers))) {
    return (
      <SpotlightCard>
        <CardHeader>
           <CardTitle className="font-headline text-2xl">Quiz Result</CardTitle>
           <CardDescription>Review the AI-powered evaluation of the quiz attempt.</CardDescription>
        </CardHeader>
        <CardContent>
          {isEvaluating ? (
            <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <AILoading messages={["Evaluating answers...", "Cross-referencing with key...", "Providing feedback...", "Calculating score..."]} />
            </div>
          ) : (
            <QuizResult
              quiz={result!.quiz}
              evaluation={evaluationResult!}
              userAnswers={userAnswers!}
            />
          )}
        </CardContent>
         <CardFooter className="border-t pt-6 justify-between items-center">
            {evaluationResult && evaluationResult.results && (
              <FeedbackCard assetId={result?.assetId} assetType="Quiz Result" />
            )}
            <Button onClick={() => setView("form")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Quiz
            </Button>
        </CardFooter>
      </SpotlightCard>
    );
  }
  
  const questionTypeLabels: { [key: string]: string } = {
    MCQ: "Multiple Choice Questions",
    ShortAnswer: "Short Answer Questions",
    LongAnswer: "Long Answer Questions",
    FillInTheBlank: "Fill in the Blanks",
  };

  const groupedQuestions = result?.quiz.questions.reduce((acc, question) => {
    const type = question.questionType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(question);
    return acc;
  }, {} as Record<string, Question[]>);
  
  const questionOrder = ["MCQ", "ShortAnswer", "FillInTheBlank", "LongAnswer"];


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard className="sticky top-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl">
                  Advanced Quiz Generator
                </CardTitle>
                <CardDescription>
                  Create highly customized assessments.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRestart}>
                  <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sourceText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Text or Topic</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste content or describe a topic, e.g., 'The Mughal Empire' or 'Chapter 5 of the science textbook...'"
                          {...field}
                          rows={6}
                          disabled={!!result}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="numQuestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Questions</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} disabled={!!result} />
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!result}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {indianLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gradeLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade Level</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!!result}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {gradeLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!result}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            {difficultyLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bloomsLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bloom's Taxonomy Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!result}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {bloomsLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="questionTypes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Question Types</FormLabel>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {questionTypes.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="questionTypes"
                            render={({ field }) => (
                              <FormItem key={item.id} className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(field.value?.filter((value) => value !== item.id));
                                    }}
                                    disabled={!!result}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading || !!result}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    "Generate Quiz"
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="font-headline text-2xl">
                  {result?.quiz.title || "Generated Quiz"}
                </CardTitle>
                <CardDescription>
                  The AI-generated quiz and answer key will appear here.
                </CardDescription>
              </div>
              {result && (
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={() => setView("attend")}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Attend Quiz
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
            {result && groupedQuestions && (
              <Tabs defaultValue="quiz">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quiz">
                    <List className="mr-2 h-4 w-4" />
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger value="answer-key">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Answer Key
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="quiz" className="mt-6">
                  <div className="space-y-8">
                     {questionOrder.map(type => (
                      groupedQuestions[type] && (
                        <div key={type} className="space-y-4">
                          <h3 className="font-headline text-lg font-semibold border-b pb-2">
                             {questionTypeLabels[type] || type}
                          </h3>
                          <div className="space-y-6">
                            {groupedQuestions[type].map((q, index) => (
                              <div key={index} className="space-y-2">
                                <p className="font-semibold flex items-start gap-2">
                                  <span>{index + 1}.</span>
                                  <span>{q.questionText}</span>
                                  <span className="text-right text-sm text-muted-foreground ml-auto">
                                    ({q.marks} Marks)
                                  </span>
                                </p>
                                {q.questionType === "MCQ" && q.options && (
                                  <ul className="space-y-2 pl-6 text-muted-foreground">
                                    {q.options.map((opt, i) => (
                                      <li key={i}>
                                        {String.fromCharCode(97 + i)}) {opt}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="answer-key" className="mt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {result.quiz.questions.map((q, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-3">
                            <span className="mt-1">{index + 1}.</span>
                            <span className="flex-1">{q.questionText}</span>
                            <Badge variant="outline">{q.marks} Marks</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="mt-4">
                            <strong>Answer:</strong> {q.correctAnswer}
                          </p>
                          <p>
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
              </Tabs>
            )}
            {!isLoading && !result && (
              <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="font-semibold">
                  Ready to test your students' knowledge?
                </p>
                <p>Fill out the form to create a custom quiz.</p>
              </div>
            )}
          </CardContent>
           {result && result.assetId && (
            <CardFooter>
                <FeedbackCard assetId={result.assetId} assetType="Quiz" />
            </CardFooter>
          )}
        </SpotlightCard>
      </div>
    </div>
  );
}
