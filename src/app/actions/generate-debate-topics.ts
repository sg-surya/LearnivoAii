"use server";

import {
  generateDebateTopics,
  type GenerateDebateTopicsInput,
  type GenerateDebateTopicsOutput,
} from "@/ai/flows/generate-debate-topics-flow";

export async function generateDebateTopicsAction(
  input: GenerateDebateTopicsInput
): Promise<GenerateDebateTopicsOutput | null> {
  try {
    const output = await generateDebateTopics(input);
    return output;
  } catch (error) {
    console.error("Error in generateDebateTopicsAction:", error);
    throw new Error("Failed to generate debate topics.");
  }
}
