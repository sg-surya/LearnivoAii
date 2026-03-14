
"use server";

import {
  generateStoryWithIllustrations,
  type GenerateStoryInput,
  type StoryWithImages,
} from "@/ai/flows/generate-story-flow";

export async function generateStoryAction(
  input: GenerateStoryInput
): Promise<StoryWithImages> {
  try {
    const output = await generateStoryWithIllustrations(input);
    return output;
  } catch (error) {
    console.error("Error in generateStoryAction:", error);
    throw new Error("Failed to generate the story with illustrations.");
  }
}
