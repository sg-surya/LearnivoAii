
'use server';

/**
 * @fileOverview An AI agent for generating creative ideas for stories.
 *
 * - generateStoryIdea - A function that handles the idea generation process.
 * - GenerateStoryIdeaInput - The input type for the function.
 * - GenerateStoryIdeaOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStoryIdeaInputSchema = z.object({
  suggestionType: z.enum(['topic', 'characters', 'setting']),
  context: z.object({
    topic: z.string().optional(),
    characters: z.string().optional(),
    setting: z.string().optional(),
  }),
});
export type GenerateStoryIdeaInput = z.infer<typeof GenerateStoryIdeaInputSchema>;

const GenerateStoryIdeaOutputSchema = z.object({
  suggestion: z
    .string()
    .describe('A single, creative suggestion for the specified story element.'),
});
export type GenerateStoryIdeaOutput = z.infer<typeof GenerateStoryIdeaOutputSchema>;

export async function generateStoryIdea(
  input: GenerateStoryIdeaInput
): Promise<GenerateStoryIdeaOutput> {
  return generateStoryIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStoryIdeaPrompt',
  input: {schema: GenerateStoryIdeaInputSchema},
  output: {schema: GenerateStoryIdeaOutputSchema},
  prompt: `You are a creative brainstorming partner for a children's storyteller in India. Your task is to provide a single, short, and imaginative suggestion for a specific part of a story.

**Task:** Generate a creative suggestion for the '{{{suggestionType}}}' of a story.

**Context (what is already known, may be empty):**
-   Topic/Moral: {{{context.topic}}}
-   Characters: {{{context.characters}}}
-   Setting: {{{context.setting}}}

**Instructions:**
1.  **Analyze the Request:** Focus on generating an idea ONLY for the '{{{suggestionType}}}'.
2.  **Use Context:** If context is provided for other fields, use it to make your suggestion more relevant. For example, if the setting is 'a magical forest', and you need to suggest characters, you might suggest 'a timid firefly and a wise old owl'.
3.  **Be Creative and Concise:** Provide a single, interesting, and brief suggestion. Do not provide a list of options.
    -   If suggesting a **topic**, make it a short, intriguing concept (e.g., "The mystery of the missing river").
    -   If suggesting **characters**, describe 1-2 characters with a simple, defining trait (e.g., "A curious little girl named Ananya and her talking parrot, Mitthu").
    -   If suggesting a **setting**, paint a quick, vivid picture (e.g., "A vibrant floating market in the backwaters of Kerala").
4.  **Keep it Culturally Relevant:** The ideas should feel at home in an Indian context where possible.

**Output Format:**
-   The entire output must be a single, valid JSON object with one key: "suggestion".
-   The value of "suggestion" must be a single string containing your creative idea.
`,
});

const generateStoryIdeaFlow = ai.defineFlow(
  {
    name: 'generateStoryIdeaFlow',
    inputSchema: GenerateStoryIdeaInputSchema,
    outputSchema: GenerateStoryIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
