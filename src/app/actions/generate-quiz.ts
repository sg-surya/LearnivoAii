"use server";

import {
  generateQuiz,
  type GenerateQuizInput,
  type GenerateQuizOutput,
} from "@/ai/flows/generate-quiz-flow";

export async function generateQuizAction(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput | null> {
  try {
    const output = await generateQuiz(input);
    return output;
  } catch (error) {
    console.error("Error in generateQuizAction:", error);
    throw new Error("Failed to generate quiz.");
  }
}
