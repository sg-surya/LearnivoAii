
"use server";

import {
  assistantCommand,
  type AssistantCommandInput,
  type AssistantCommandOutput,
} from "@/ai/flows/assistant-command-flow";

export async function assistantCommandAction(
  input: AssistantCommandInput
): Promise<AssistantCommandOutput> {
  try {
    const output = await assistantCommand(input);
    return output;
  } catch (error) {
    console.error("Error in assistantCommandAction:", error);
    throw new Error("Failed to process assistant command.");
  }
}
