"use server";

import {
  evaluateQuiz,
  type EvaluateQuizInput,
  type EvaluateQuizOutput,
} from "@/ai/flows/evaluate-quiz-answers-flow";

export async function evaluateQuizAction(
  input: EvaluateQuizInput
): Promise<EvaluateQuizOutput> {
  try {
    const output = await evaluateQuiz(input);
    return output;
  } catch (error) {
    console.error("Error in evaluateQuizAction:", error);
    throw new Error("Failed to evaluate quiz.");
  }
}
