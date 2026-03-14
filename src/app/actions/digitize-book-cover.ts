"use server";

import {
  digitizeBookCover,
  type DigitizeBookCoverInput,
  type DigitizeBookCoverOutput,
} from "@/ai/flows/digitize-book-cover-flow";

export async function digitizeBookCoverAction(
  input: DigitizeBookCoverInput
): Promise<DigitizeBookCoverOutput> {
  try {
    const output = await digitizeBookCover(input);
    return output;
  } catch (error) {
    console.error("Error in digitizeBookCoverAction:", error);
    throw new Error("Failed to digitize book cover.");
  }
}
