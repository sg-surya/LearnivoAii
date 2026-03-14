"use server";

import {
  generateRubric,
  type GenerateRubricInput,
  type GenerateRubricOutput,
} from "@/ai/flows/generate-rubric-flow";

export async function generateRubricAction(
  input: GenerateRubricInput
): Promise<GenerateRubricOutput | null> {
  try {
    const output = await generateRubric(input);
    return output;
  } catch (error) {
    console.error("Error in generateRubricAction:", error);
    throw new Error("Failed to generate rubric.");
  }
}
