"use server";

import {
  generateHyperLocalContent,
  type GenerateHyperLocalContentInput,
  type GenerateHyperLocalContentOutput,
} from "@/ai/flows/generate-hyper-local-content";

export async function generateHyperLocalContentAction(
  input: GenerateHyperLocalContentInput
): Promise<GenerateHyperLocalContentOutput | null> {
  try {
    const output = await generateHyperLocalContent(input);
    return output;
  } catch (error) {
    console.error("Error in generateHyperLocalContentAction:", error);
    throw new Error("Failed to generate hyper-local content.");
  }
}
