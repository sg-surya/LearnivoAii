
"use client";

import React, { useState, useRef, type MouseEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { GenerateQuizOutput, Question } from "@/ai/flows/generate-quiz-flow";
import { cn } from "@/lib/utils";

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


interface QuizAttemptProps {
  quiz: GenerateQuizOutput;
  onSubmit: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export function QuizAttempt({ quiz, onSubmit, onBack }: QuizAttemptProps) {
  const { control, handleSubmit, formState } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionMap = new Map(quiz.questions.map((q, i) => [`question-${i}`, q]));

  const handleFormSubmit = (data: Record<string, any>) => {
    setIsSubmitting(true);
    // We will implement result calculation later
    onSubmit(data);
    setIsSubmitting(false);
  };
  
  const questionTypeLabels: { [key: string]: string } = {
    MCQ: "Multiple Choice Questions",
    ShortAnswer: "Short Answer Questions",
    LongAnswer: "Long Answer Questions",
    FillInTheBlank: "Fill in the Blanks",
  };

  const groupedQuestions = quiz.questions.reduce((acc, question, index) => {
    const type = question.questionType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push({ ...question, originalIndex: index });
    return acc;
  }, {} as Record<string, (Question & { originalIndex: number })[]>);

  const questionOrder = ["MCQ", "ShortAnswer", "FillInTheBlank", "LongAnswer"];

  return (
    <SpotlightCard className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
            <CardDescription>Answer the questions below to the best of your ability.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {questionOrder.map(type => (
            groupedQuestions[type] && (
              <div key={type} className="space-y-6">
                <h3 className="font-headline text-xl font-semibold border-b pb-2">
                    {questionTypeLabels[type] || type}
                </h3>
                {groupedQuestions[type].map((question, index) => (
                  <div key={question.originalIndex} className="p-4 border rounded-lg">
                    <p className="font-semibold mb-4 flex justify-between">
                      <span>{index + 1}. {question.questionText}</span>
                      <span className="text-sm text-muted-foreground">({question.marks} Marks)</span>
                    </p>
                    <Controller
                      name={`question-${question.originalIndex}`}
                      control={control}
                      rules={{ required: "This question is required." }}
                      render={({ field }) => {
                        switch (question.questionType) {
                          case 'MCQ':
                            return (
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="space-y-2"
                              >
                                {question.options?.map((option, i) => (
                                  <div key={i} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`q-${question.originalIndex}-opt-${i}`} />
                                    <Label htmlFor={`q-${question.originalIndex}-opt-${i}`}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            );
                          case 'ShortAnswer':
                          case 'LongAnswer':
                          case 'FillInTheBlank':
                            return (
                              <Textarea
                                {...field}
                                placeholder={question.questionType === 'FillInTheBlank' ? "Your answer here..." : "Type your answer..."}
                                rows={question.questionType === 'LongAnswer' ? 5 : 2}
                              />
                            );
                          default:
                            return null;
                        }
                      }}
                    />
                    {formState.errors[`question-${question.originalIndex}`] && (
                        <p className="text-sm font-medium text-destructive mt-2">
                          {formState.errors[`question-${question.originalIndex}`]?.message?.toString()}
                        </p>
                    )}
                  </div>
                ))}
              </div>
            )
          ))}

          <CardFooter className="px-0">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </SpotlightCard>
  );
}
