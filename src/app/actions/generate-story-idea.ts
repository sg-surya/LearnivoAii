
"use server";

import {
  generateStoryIdea,
  type GenerateStoryIdeaInput,
  type GenerateStoryIdeaOutput,
} from "@/ai/flows/generate-story-idea-flow";

export async function generateStoryIdeaAction(
  input: GenerateStoryIdeaInput
): Promise<GenerateStoryIdeaOutput> {
  try {
    const output = await generateStoryIdea(input);
    return output;
  } catch (error) {
    console.error("Error in generateStoryIdeaAction:", error);
    throw new Error("Failed to generate a story idea.");
  }
}
