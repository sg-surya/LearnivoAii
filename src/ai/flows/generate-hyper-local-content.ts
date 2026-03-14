'use server';

/**
 * @fileOverview A hyper-local content generation AI agent.
 *
 * - generateHyperLocalContent - A function that handles the hyper-local content generation process.
 * - GenerateHyperLocalContentInput - The input type for the generateHyperLocalContent function.
 * - GenerateHyperLocalContentOutput - The return type for the generateHyperLocalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHyperLocalContentInputSchema = z.object({
  concept: z.string().describe('The educational concept to explain.'),
  language: z.string().describe('The local language to use.'),
  city: z.string().describe('The city or region to make the content relevant to.'),
  contentType: z
    .enum(['story', 'example', 'explanation'])
    .describe('The type of content to generate.'),
});
export type GenerateHyperLocalContentInput = z.infer<
  typeof GenerateHyperLocalContentInputSchema
>;

const GenerateHyperLocalContentOutputSchema = z.object({
  content: z.string().describe('The generated hyper-local content as an HTML string.'),
});
export type GenerateHyperLocalContentOutput = z.infer<
  typeof GenerateHyperLocalContentOutputSchema
>;

export async function generateHyperLocalContent(
  input: GenerateHyperLocalContentInput
): Promise<GenerateHyperLocalContentOutput> {
  return generateHyperLocalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHyperLocalContentPrompt',
  input: {schema: GenerateHyperLocalContentInputSchema},
  output: {schema: GenerateHyperLocalContentOutputSchema},
  prompt: `You are an expert in creating culturally and geographically relevant educational content for India. Your goal is to make learning feel personal and relatable to students by generating a well-formatted HTML snippet.

  **Task:** Generate a '{{{contentType}}}' for the given concept, making it hyper-local to '{{city}}' and in the '{{language}}' language.

  **Input:**
  -   Educational Concept: {{{concept}}}
  -   Target City/Region: {{{city}}}
  -   Target Language: {{{language}}}
  -   Content Type: {{{contentType}}}

  **CRITICAL Instructions:**
  1.  **HTML Output:** The entire output content MUST be a single, well-formatted HTML string. Use tags like <h4> for headings, <strong> for bolding key terms, <em> for emphasis (like local references), and <p> for paragraphs. Use <ul> and <li> for lists if needed.
  2.  **Analyze the Location:** Think about the unique characteristics of '{{city}}'. What are its famous landmarks, local foods, common slang, popular markets, historical context, or everyday life scenarios?
  3.  **Weave in Local Context:**
      -   If generating an **example**, use local landmarks or businesses. (e.g., "To understand percentages, let's say you get a 10% discount at the famous <em>Chappan Dukan</em> in Indore...").
      -   If generating a **story**, set it in a recognizable part of the city and have characters use local phrases or talk about local events. (e.g., A story about the water cycle could start with two friends waiting for the <em>Mumbai monsoon</em>...).
      -   If generating an **explanation**, use analogies that resonate with the local culture and environment. (e.g., Explaining computer networks using the analogy of <em>Mumbai's local train network</em>).
  4.  **Language and Tone:**
      -   Write the entire content in the specified '{{{language}}}'.
      -   The tone should be engaging, simple, and easy for a student to understand.
  5.  **Output Format:**
      -   The output must be a JSON object with a single key 'content'.
      -   The value of 'content' should be a single string containing the complete, well-formed HTML. Do not include <html> or <body> tags.

  Your response should feel authentic and demonstrate a genuine understanding of the location, not just a superficial name-drop.
  `,
});

const generateHyperLocalContentFlow = ai.defineFlow(
  {
    name: 'generateHyperLocalContentFlow',
    inputSchema: GenerateHyperLocalContentInputSchema,
    outputSchema: GenerateHyperLocalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
