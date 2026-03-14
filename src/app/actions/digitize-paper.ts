
"use server";

import {
  digitizePaper,
  type DigitizePaperInput,
  type DigitizePaperOutput,
} from "@/ai/flows/digitize-paper-flow";

export async function digitizePaperAction(
  input: DigitizePaperInput
): Promise<DigitizePaperOutput> {
  try {
    const output = await digitizePaper(input);
    return output;
  } catch (error) {
    console.error("Error in digitizePaperAction:", error);
    throw new Error("Failed to digitize paper.");
  }
}

    