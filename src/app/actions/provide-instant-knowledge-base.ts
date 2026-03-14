"use server";

import {
  provideInstantKnowledgeBase,
  type ProvideInstantKnowledgeBaseInput,
  type ProvideInstantKnowledgeBaseOutput,
} from "@/ai/flows/provide-instant-knowledge-base";

export async function provideInstantKnowledgeBaseAction(
  input: ProvideInstantKnowledgeBaseInput
): Promise<ProvideInstantKnowledgeBaseOutput | null> {
  try {
    const output = await provideInstantKnowledgeBase(input);
    return output;
  } catch (error) {
    console.error("Error in provideInstantKnowledgeBaseAction:", error);
    throw new Error("Failed to get an answer.");
  }
}
