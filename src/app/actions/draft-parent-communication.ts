"use server";

import {
  draftParentCommunication,
  type DraftParentCommunicationInput,
  type DraftParentCommunicationOutput,
} from "@/ai/flows/draft-parent-communications";

export async function draftParentCommunicationAction(
  input: DraftParentCommunicationInput
): Promise<DraftParentCommunicationOutput | null> {
  try {
    const output = await draftParentCommunication(input);
    return output;
  } catch (error) {
    console.error("Error in draftParentCommunicationAction:", error);
    throw new Error("Failed to draft parent communication.");
  }
}
