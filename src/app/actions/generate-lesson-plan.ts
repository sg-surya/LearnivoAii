"use server";

import {
  generateLessonPlan,
  type GenerateLessonPlanInput,
  type GenerateLessonPlanOutput,
} from "@/ai/flows/generate-lesson-plan";

export async function generateLessonPlanAction(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput | null> {
  try {
    const output = await generateLessonPlan(input);
    return output;
  } catch (error) {
    console.error("Error in generateLessonPlanAction:", error);
    // Optionally re-throw or return a specific error structure
    throw new Error("Failed to generate lesson plan.");
  }
}
