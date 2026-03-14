
'use server';

/**
 * @fileOverview An AI agent for generating debate topics and materials.
 *
 * - generateDebateTopics - A function that handles the debate topic generation.
 * - GenerateDebateTopicsInput - The input type for the function.
 * - GenerateDebateTopicsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebateTopicSchema = z.object({
  topic: z.string().describe('The debate topic statement.'),
  forPoints: z.array(z.string()).describe('Key arguments for the motion.'),
  againstPoints: z.array(z.string()).describe('Key arguments against the motion.'),
});

const GenerateDebateTopicsInputSchema = z.object({
  subject: z.string().describe('The subject or general area for the debate.'),
  gradeLevel: z.string().describe('The grade level of the students.'),
  numTopics: z.number().describe('The number of debate topics to generate.'),
});
export type GenerateDebateTopicsInput = z.infer<typeof GenerateDebateTopicsInputSchema>;

const GenerateDebateTopicsOutputSchema = z.object({
  topics: z.array(DebateTopicSchema).describe('The list of generated debate topics with materials.'),
});
export type GenerateDebateTopicsOutput = z.infer<typeof GenerateDebateTopicsOutputSchema>;

export async function generateDebateTopics(
  input: GenerateDebateTopicsInput
): Promise<GenerateDebateTopicsOutput> {
  return generateDebateTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDebateTopicsPrompt',
  input: {schema: GenerateDebateTopicsInputSchema},
  output: {schema: GenerateDebateTopicsOutputSchema},
  prompt: `You are an expert high-school debate coach and curriculum designer for Indian schools. Your task is to generate engaging, age-appropriate, and thought-provoking debate topics.

  **Task:** Generate a list of debate topics based on the following criteria.

  **Input:**
  -   Subject/Theme: {{{subject}}}
  -   Grade Level: {{{gradeLevel}}}
  -   Number of Topics to Generate: {{{numTopics}}}

  **Instructions:**
  1.  **Topic Generation:**
      -   Create topics that are clear, debatable, and phrased as motions (e.g., "This house believes that...").
      -   Ensure the topics are age-appropriate for the specified '{{{gradeLevel}}}'.
      -   Where possible, make the topics relevant to a modern Indian context to increase student engagement.

  2.  **Argument Generation:**
      -   For each topic, provide 3-4 distinct and well-reasoned key arguments for the 'For' side (the proposition).
      -   For each topic, provide 3-4 distinct and well-reasoned key arguments for the 'Against' side (the opposition).
      -   These points should serve as solid starting points for student research, covering different angles like social, economic, ethical, and practical aspects.

  3.  **Output Format:**
      -   The entire output must be a single, valid JSON object.
      -   The root of the object should be a 'topics' key, which is an array of debate topic objects.
      -   Each object in the array must contain:
          -   'topic': The debate motion string.
          -   'forPoints': An array of strings, each being an argument for the motion.
          -   'againstPoints': An array of strings, each being an argument against the motion.

  Example of a single topic object:
  \`\`\`json
  {
    "topic": "This house believes that online classes are a better alternative to traditional classrooms.",
    "forPoints": [
      "Provides flexibility in learning schedule and pace.",
      "Access to a wider range of resources and teachers from anywhere.",
      "Develops digital literacy and self-discipline in students."
    ],
    "againstPoints": [
      "Lacks face-to-face interaction, hindering social skills development.",
      "Digital divide creates inequality in access to education.",
      "Difficult to monitor student engagement and prevent cheating."
    ]
  }
  \`\`\`
  `,
});

const generateDebateTopicsFlow = ai.defineFlow(
  {
    name: 'generateDebateTopicsFlow',
    inputSchema: GenerateDebateTopicsInputSchema,
    outputSchema: GenerateDebateTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
