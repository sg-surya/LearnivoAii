'use server';

/**
 * @fileOverview An AI agent for digitizing book covers to extract details.
 *
 * - digitizeBookCover - A function that handles the book cover digitization process.
 * - DigitizeBookCoverInput - The input type for the function.
 * - DigitizeBookCoverOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitizeBookCoverInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a book cover, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DigitizeBookCoverInput = z.infer<typeof DigitizeBookCoverInputSchema>;

const DigitizeBookCoverOutputSchema = z.object({
  title: z.string().describe('The main title of the book.'),
  subject: z.string().describe('The subject of the book (e.g., Mathematics, Science, History).'),
  grade: z.string().describe('The grade or class level the book is for (e.g., "6", "10", "12").'),
  publisher: z.string().optional().describe('The publisher of the book (e.g., NCERT, S. Chand).'),
});
export type DigitizeBookCoverOutput = z.infer<typeof DigitizeBookCoverOutputSchema>;

export async function digitizeBookCover(
  input: DigitizeBookCoverInput
): Promise<DigitizeBookCoverOutput> {
  return digitizeBookCoverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitizeBookCoverPrompt',
  input: {schema: DigitizeBookCoverInputSchema},
  output: {schema: DigitizeBookCoverOutputSchema},
  prompt: `You are an expert librarian AI specializing in cataloging Indian textbooks. Your task is to analyze an image of a book cover and extract key information with high accuracy.

**Core Task:** Analyze the provided image of a book cover. Extract the following details and return them in a structured JSON format.

**Input:**
- Image of the book cover: {{media url=photoDataUri}}

**Extraction Instructions:**
1.  **Title:** Identify the main title of the book. Be precise.
2.  **Subject:** Determine the subject of the book (e.g., "Physics", "Social Science", "English", "Mathematics").
3.  **Grade:** Find the grade or class number. This is often written as "Class 10", "Grade 8", or just a number on the cover. Standardize the output to be just the number (e.g., "8", "10", "12").
4.  **Publisher:** Identify the publisher's name (e.g., "NCERT", "S. Chand", "Arihant"). This might be at the bottom of the cover. This field is optional.

**Output Specification:**
- The entire output MUST be a single, valid JSON object.
- The JSON must strictly adhere to the output schema, containing 'title', 'subject', 'grade', and optionally 'publisher'.
`,
});

const digitizeBookCoverFlow = ai.defineFlow(
  {
    name: 'digitizeBookCoverFlow',
    inputSchema: DigitizeBookCoverInputSchema,
    outputSchema: DigitizeBookCoverOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
