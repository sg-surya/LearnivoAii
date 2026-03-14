
"use server";

import {
  mathHelper,
  type MathHelperInput,
  type MathHelperOutput,
} from "@/ai/flows/math-helper-flow";

export async function mathHelperAction(
  input: MathHelperInput
): Promise<MathHelperOutput> {
  try {
    const output = await mathHelper(input);
    return output;
  } catch (error) {
    console.error("Error in mathHelperAction:", error);
    throw new Error("Failed to solve the math problem.");
  }
}
