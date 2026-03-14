
"use client";

import React, { useRef, type MouseEvent } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import type { GenerateQuizOutput } from "@/ai/flows/generate-quiz-flow";
import type { EvaluateQuizOutput } from "@/ai/flows/evaluate-quiz-answers-flow";
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


interface QuizResultProps {
  quiz: GenerateQuizOutput;
  evaluation: EvaluateQuizOutput;
  userAnswers: Record<string, string>;
}

export function QuizResult({ quiz, evaluation, userAnswers }: QuizResultProps) {
  const percentage =
    evaluation.maxScore > 0
      ? (evaluation.totalScore / evaluation.maxScore) * 100
      : 0;

  return (
    <div className="space-y-6">
      <SpotlightCard>
        <CardHeader>
          <CardTitle className="font-headline text-lg">
            Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">{evaluation.totalScore}</span>
            <span className="text-2xl text-muted-foreground">
              / {evaluation.maxScore}
            </span>
          </div>
          <Progress value={percentage} />
          <p className="text-center text-muted-foreground">
            You scored {percentage.toFixed(0)}%
          </p>
        </CardContent>
      </SpotlightCard>

      <Accordion type="single" collapsible className="w-full">
        {quiz.questions.map((q, index) => {
          const result = evaluation.results.find(
            (r) => r.questionIndex === index
          );
          if (!result) return null;

          return (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger>
                <div className="flex w-full items-start justify-between gap-4 text-left">
                    <div className="flex items-start gap-2">
                        {result.isCorrect ? (
                            <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                        )}
                        <span className="flex-1">
                           {index + 1}. {q.questionText}
                        </span>
                    </div>
                    <Badge variant={result.isCorrect ? "default" : "destructive"}>
                        {result.score} / {q.marks} Marks
                    </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <SpotlightCard className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Your Answer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{result.userAnswer || "No answer provided"}</p>
                  </CardContent>
                </SpotlightCard>
                 {!result.isCorrect && (
                   <SpotlightCard>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Correct Answer</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{q.correctAnswer}</p>
                    </CardContent>
                   </SpotlightCard>
                 )}
                 <SpotlightCard>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">AI Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{result.feedback}</p>
                    </CardContent>
                 </SpotlightCard>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
