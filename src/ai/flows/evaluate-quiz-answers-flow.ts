'use server';

/**
 * @fileOverview An AI agent for evaluating quiz answers.
 *
 * - evaluateQuiz - A function that handles the quiz evaluation process.
 * - EvaluateQuizInput - The input type for the evaluateQuiz function.
 * - EvaluateQuizOutput - The return type for the evaluateQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Question } from './generate-quiz-flow';

const EvaluationResultSchema = z.object({
  questionIndex: z.number().describe('The index of the question being evaluated.'),
  userAnswer: z.string().describe("The user's submitted answer."),
  isCorrect: z.boolean().describe('Whether the user\'s answer is correct.'),
  score: z.number().describe('The score awarded for the answer.'),
  feedback: z.string().describe('AI-generated feedback on the user\'s answer.'),
});

const EvaluateQuizInputSchema = z.object({
  questions: z.array(z.any()).describe("An array of the original quiz questions, including text, options, correct answer, and marks."),
  userAnswers: z.array(z.string()).describe("An array of the user's submitted answers, in the same order as the questions."),
});

export type EvaluateQuizInput = z.infer<typeof EvaluateQuizInputSchema>;

const EvaluateQuizOutputSchema = z.object({
  totalScore: z.number().describe('The total score obtained by the user.'),
  maxScore: z.number().describe('The maximum possible score for the quiz.'),
  results: z.array(EvaluationResultSchema).describe('An array of evaluation results for each question.'),
});

export type EvaluateQuizOutput = z.infer<typeof EvaluateQuizOutputSchema>;


export async function evaluateQuiz(
  input: EvaluateQuizInput
): Promise<EvaluateQuizOutput> {
  return evaluateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateQuizPrompt',
  input: { schema: z.object({
    question: z.any(),
    userAnswer: z.string(),
  })},
  output: { schema: z.object({
      isCorrect: z.boolean().describe('Whether the user\'s answer is correct.'),
      score: z.number().describe('The score awarded for the answer.'),
      feedback: z.string().describe('AI-generated feedback on the user\'s answer, explaining why it is right or wrong.'),
  })},
  prompt: `You are an expert and fair examiner for Indian schools. Your task is to evaluate a student's answer for a single question and provide constructive feedback.

  **Question Details:**
  - Question: {{{question.questionText}}}
  - Type: {{{question.questionType}}}
  - Correct Answer: {{{question.correctAnswer}}}
  - Marks: {{{question.marks}}}

  **Student's Submitted Answer:**
  {{{userAnswer}}}

  **Evaluation Instructions:**
  1.  **Analyze the Answer:** Carefully compare the student's answer with the provided correct answer.
      -   For **MCQ** and **FillInTheBlank**, the answer must be an exact match (case-insensitive).
      -   For **ShortAnswer** and **LongAnswer** (subjective questions), assess if the student's answer captures the key concepts and ideas of the correct answer, even if the wording is different. Look for understanding of the core topic.

  2.  **Determine Correctness ('isCorrect'):**
      -   Return 'true' if the answer is fully correct.
      -   Return 'false' if the answer is incorrect or only partially correct.

  3.  **Award Score ('score'):**
      -   If the answer is fully correct, award the full marks ({{{question.marks}}}).
      -   For subjective answers, if the answer is partially correct (e.g., covers some but not all key points), award partial marks proportionally. Use your judgment as a fair examiner.
      -   If the answer is incorrect, award 0 marks.
      -   The awarded score cannot exceed the total marks for the question.

  4.  **Provide Feedback ('feedback'):**
      -   Write concise, helpful, and encouraging feedback for the student.
      -   If the answer is correct, briefly affirm why (e.g., "Excellent! You correctly identified the main cause.").
      -   If the answer is partially correct, explain what was good and what was missing.
      -   If the answer is incorrect, gently explain the mistake and guide the student towards the correct concept. Refer to the correct answer if it's helpful.
      -   The feedback should be educational, not just a simple "Correct" or "Incorrect".

  **Output Format:**
  -   The entire output must be a single, valid JSON object, strictly adhering to the output schema.
  -   Ensure all fields (isCorrect, score, feedback) are present.
  `,
});

const evaluateQuizFlow = ai.defineFlow(
  {
    name: 'evaluateQuizFlow',
    inputSchema: EvaluateQuizInputSchema,
    outputSchema: EvaluateQuizOutputSchema,
  },
  async ({ questions, userAnswers }) => {
    let totalScore = 0;
    const maxScore = questions.reduce((sum, q) => sum + q.marks, 0);
    const results: z.infer<typeof EvaluationResultSchema>[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i] as Question;
      const userAnswer = userAnswers[i];

      const { output } = await prompt({
          question: question,
          userAnswer: userAnswer,
      });

      if(output) {
        totalScore += output.score;
        results.push({
          questionIndex: i,
          userAnswer: userAnswer,
          ...output
        });
      }
    }

    return {
      totalScore,
      maxScore,
      results,
    };
  }
);
