"use server";

import {
  generateVisualAid,
  type GenerateVisualAidInput,
  type GenerateVisualAidOutput,
} from "@/ai/flows/generate-visual-aid-flow";

export async function generateVisualAidAction(
  input: GenerateVisualAidInput
): Promise<GenerateVisualAidOutput> {
  try {
    const output = await generateVisualAid(input);
    return output;
  } catch (error) {
    console.error("Error in generateVisualAidAction:", error);
    throw new Error("Failed to generate visual aid.");
  }
}
