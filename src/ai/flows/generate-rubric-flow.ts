
'use server';

/**
 * @fileOverview An AI agent for generating grading rubrics.
 *
 * - generateRubric - A function that handles the rubric generation process.
 * - GenerateRubricInput - The input type for the generateRubric function.
 * - GenerateRubricOutput - The return type for the generateRubric function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CriteriaLevelSchema = z.object({
  level: z.string().describe("The name of the performance level (e.g., 'Exemplary', 'Proficient')."),
  description: z.string().describe("The detailed description of what this level of performance looks like."),
});

const CriteriaSchema = z.object({
  criteria: z.string().describe("The name of the evaluation criterion (e.g., 'Clarity', 'Use of Evidence')."),
  levels: z.array(CriteriaLevelSchema),
});

const GenerateRubricInputSchema = z.object({
  assignmentTitle: z.string().describe('The title of the assignment.'),
  description: z.string().describe('A brief description of the assignment requirements.'),
  maxScore: z.number().describe('The maximum score for each criterion.'),
});
export type GenerateRubricInput = z.infer<typeof GenerateRubricInputSchema>;

const GenerateRubricOutputSchema = z.object({
  title: z.string().describe('The title of the rubric.'),
  criteria: z.array(CriteriaSchema).describe('The list of evaluation criteria.'),
});
export type GenerateRubricOutput = z.infer<typeof GenerateRubricOutputSchema>;

export async function generateRubric(
  input: GenerateRubricInput
): Promise<GenerateRubricOutput> {
  return generateRubricFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRubricPrompt',
  input: {schema: GenerateRubricInputSchema},
  output: {schema: GenerateRubricOutputSchema},
  prompt: `You are an expert in educational assessment and curriculum design. Your task is to create a detailed, clear, and fair grading rubric for a given assignment.

  **Assignment Details:**
  -   Title: {{{assignmentTitle}}}
  -   Description: {{{description}}}
  -   Maximum Score per Criterion: {{{maxScore}}}

  **Instructions for Rubric Generation:**
  1.  **Create Title:** Generate a clear title for the rubric, such as "Grading Rubric for: {{{assignmentTitle}}}".
  2.  **Identify Criteria:** Based on the assignment description, identify 3-5 key evaluation criteria. These should be the most important aspects of the assignment (e.g., 'Content & Accuracy', 'Structure & Organization', 'Clarity & Language', 'Use of Evidence').
  3.  **Define Performance Levels:** For each criterion, you must define exactly 4 performance levels with the following names:
      -   **Exemplary:** Describes the highest level of achievement. This is for work that exceeds expectations.
      -   **Proficient:** Describes solid, competent work that meets all the requirements.
      -   **Developing:** Describes work that is partially successful but has some notable flaws or omissions.
      -   **Beginning:** Describes work that fails to meet the basic requirements of the criterion.
  4.  **Write Descriptions:** For each level within each criterion, write a clear, concise, and objective description of what performance at that level looks like. The descriptions should be parallel across levels, showing a clear progression of quality. Use action-oriented language.
  5.  **Scoring:** Although you don't need to include scores in the descriptions, the levels should correspond to a scoring scale (e.g., Exemplary = {{{maxScore}}}, Proficient = ~75%, Developing = ~50%, Beginning = 25% or less).

  **Output Format:**
  -   The entire output must be a single, valid JSON object.
  -   The root object must contain 'title' (string) and 'criteria' (an array of criteria objects).
  -   Each object in the 'criteria' array must contain 'criteria' (the name of the criterion) and 'levels' (an array of 4 level objects).
  -   Each level object must contain 'level' (the name of the level) and 'description' (the performance description).
  `,
});

const generateRubricFlow = ai.defineFlow(
  {
    name: 'generateRubricFlow',
    inputSchema: GenerateRubricInputSchema,
    outputSchema: GenerateRubricOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
