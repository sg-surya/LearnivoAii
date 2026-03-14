'use server';

/**
 * @fileOverview An AI agent for drafting professional and translated emails to parents.
 *
 * - draftParentCommunication - A function that handles the email drafting process.
 * - DraftParentCommunicationInput - The input type for the draftParentCommunication function.
 * - DraftParentCommunicationOutput - The return type for the draftParentCommunication function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DraftParentCommunicationInputSchema = z.object({
  topic: z.string().describe('The topic of the email.'),
  gradeLevel: z.string().describe('The grade level of the student.'),
  context: z.string().describe('Additional context or details for the email.'),
  localLanguage: z.string().describe('The local language to translate the email into.'),
});

export type DraftParentCommunicationInput = z.infer<
  typeof DraftParentCommunicationInputSchema
>;

const DraftParentCommunicationOutputSchema = z.object({
  emailDraft: z.string().describe('The drafted email to parents.'),
  translatedEmailDraft: z
    .string()
    .describe('The translated email draft in the local language.'),
});

export type DraftParentCommunicationOutput = z.infer<
  typeof DraftParentCommunicationOutputSchema
>;

export async function draftParentCommunication(
  input: DraftParentCommunicationInput
): Promise<DraftParentCommunicationOutput> {
  return draftParentCommunicationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'draftParentCommunicationPrompt',
  input: {schema: DraftParentCommunicationInputSchema},
  output: {schema: DraftParentCommunicationOutputSchema},
  prompt: `You are an expert teacher's assistant, skilled in drafting professional and empathetic emails for Indian school parents. Your tone should be respectful, clear, and supportive.

  **Task:** Draft a professional email to parents and then translate it into the specified local language.

  **Instructions:**
  1.  **Analyze the Input:**
      -   Topic: {{{topic}}}
      -   Grade Level: {{{gradeLevel}}}
      -   Context/Key Points: {{{context}}}
      -   Local Language for Translation: {{{localLanguage}}}

  2.  **Draft the English Email:**
      -   Start with a polite and respectful greeting (e.g., "Dear Parents,").
      -   Clearly state the purpose of the email in the opening sentence.
      -   Incorporate all the key points from the context in a logical flow.
      -   Maintain a professional, warm, and empathetic tone.
      -   Conclude with a clear call to action or next step, if any.
      -   End with a professional closing (e.g., "Sincerely," or "Warm regards," followed by "The Teacher").
      -   The email should be well-structured with proper paragraphs.

  3.  **Translate the Email:**
      -   Accurately translate the entire English email into the specified '{{{localLanguage}}}'.
      -   Ensure the translation maintains the original tone and meaning. Pay attention to cultural nuances.

  4.  **Output Format:**
      -   The entire output must be a single, valid JSON object.
      -   The JSON object must have two keys: "emailDraft" (containing the English version) and "translatedEmailDraft" (containing the translated version).
  `,
});

const draftParentCommunicationFlow = ai.defineFlow(
  {
    name: 'draftParentCommunicationFlow',
    inputSchema: DraftParentCommunicationInputSchema,
    outputSchema: DraftParentCommunicationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
