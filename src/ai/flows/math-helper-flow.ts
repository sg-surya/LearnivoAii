
'use server';

/**
 * @fileOverview An AI agent for solving math problems from images.
 *
 * - mathHelper - A function that handles the math problem-solving process.
 * - MathHelperInput - The input type for the mathHelper function.
 * - MathHelperOutput - The return type for the mathHelper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MathHelperInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().describe('The language for the explanation.'),
});
export type MathHelperInput = z.infer<typeof MathHelperInputSchema>;

const MathHelperOutputSchema = z.object({
  solution: z
    .string()
    .describe('The final answer to the math problem.'),
  explanation: z
    .string()
    .describe('A detailed, step-by-step explanation of how to solve the problem, in the specified language.'),
});
export type MathHelperOutput = z.infer<typeof MathHelperOutputSchema>;

export async function mathHelper(
  input: MathHelperInput
): Promise<MathHelperOutput> {
  return mathHelperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mathHelperPrompt',
  input: {schema: MathHelperInputSchema},
  output: {schema: MathHelperOutputSchema},
  prompt: `You are an expert math teacher and problem solver. Your task is to analyze an image containing a math problem, solve it, and provide a clear, step-by-step explanation in the user's specified language.

**Core Task:**
1.  **Analyze the Image:** Accurately transcribe the mathematical problem from the provided image. This can include anything from algebra and geometry to trigonometry and calculus.
2.  **Solve the Problem:** Calculate the correct answer to the problem.
3.  **Explain the Steps:** Create a detailed, easy-to-follow, step-by-step explanation of the entire process used to reach the solution. The explanation is the most important part.
4.  **Translate:** The entire explanation must be in the specified language.

**Input:**
-   Image of the math problem: {{media url=photoDataUri}}
-   Language for the explanation: {{{language}}}

**Instructions for Explanation:**
-   Start by stating the problem clearly.
-   Break down the solution into logical, numbered steps.
-   For each step, explain the mathematical rule, formula, or concept being applied.
-   Define any key terms if necessary.
-   The tone should be that of a patient and encouraging teacher.
-   The final 'solution' field should contain only the final answer.
-   The 'explanation' field should contain the full, detailed breakdown.

**Output Specification:**
-   The final output must be a single, valid JSON object with two keys: "solution" and "explanation".
`,
});

const mathHelperFlow = ai.defineFlow(
  {
    name: 'mathHelperFlow',
    inputSchema: MathHelperInputSchema,
    outputSchema: MathHelperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
