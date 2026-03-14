
'use server';

/**
 * @fileOverview An AI agent for generating quizzes and question papers.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionSchema = z.object({
  questionText: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string(),
  marks: z.number(),
  questionType: z.enum(['MCQ', 'ShortAnswer', 'LongAnswer', 'FillInTheBlank']),
});

export type Question = z.infer<typeof QuestionSchema>;


const GenerateQuizInputSchema = z.object({
  sourceText: z.string().describe('The source text or topic for the quiz.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
  questionTypes: z
    .array(z.enum(['MCQ', 'ShortAnswer', 'LongAnswer', 'FillInTheBlank']))
    .describe('The types of questions to generate.'),
  gradeLevel: z.string().describe('The grade level of the students.'),
  difficulty: z
    .enum(['Easy', 'Medium', 'Hard'])
    .describe('The difficulty level of the quiz.'),
  language: z.string().describe('The language for the quiz.'),
  bloomsLevel: z
    .enum([
      'Remembering',
      'Understanding',
      'Applying',
      'Analyzing',
      'Evaluating',
      'Creating',
    ])
    .describe(
      "The desired Bloom's Taxonomy level for the questions."
    ),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const GenerateQuizOutputSchema = z.object({
  title: z.string().describe('The title of the generated quiz.'),
  questions: z
    .array(QuestionSchema)
    .describe('The list of generated questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert educator and question paper designer for Indian school boards (like CBSE, ICSE). Your task is to create a high-quality, well-structured quiz based on a detailed blueprint.

  **Quiz Blueprint:**
  -   **Source Material/Topic:** {{{sourceText}}}
  -   **Grade Level:** {{{gradeLevel}}}
  -   **Language:** {{{language}}}
  -   **Total Number of Questions:** {{{numQuestions}}}
  -   **Question Types Requested:** {{{questionTypes}}}
  -   **Difficulty Level:** {{{difficulty}}}
  -   **Cognitive (Bloom's) Level:** {{{bloomsLevel}}}

  **Instructions for Question Generation:**
  1.  **Adherence to Blueprint:** Strictly follow all the parameters defined in the blueprint above. The quiz must be in the specified '{{{language}}}'.
  2.  **Title:** Create a suitable title for the quiz based on the source material.
  3.  **Question Crafting:**
      -   All questions must be based on the provided '{{{sourceText}}}'. Do not use external knowledge.
      -   The complexity of questions should match the '{{{gradeLevel}}}' and '{{{difficulty}}}' level.
      -   Questions should target the specified '{{{bloomsLevel}}}' of thinking. For example, 'Remembering' questions ask for direct information, while 'Analyzing' questions require breaking down information.
      -   Assign reasonable marks to each question based on its type and complexity.
  4.  **Specific Question-Type Rules:**
      -   **MCQ:** Generate four plausible options (one correct, three distinct incorrect distractors). The options should not be too obvious.
      -   **FillInTheBlank:** The question text must contain "_____" to indicate the blank. The 'correctAnswer' should be only the word(s) that fit in the blank.
      -   **ShortAnswer / LongAnswer:** The 'correctAnswer' should be a model answer that covers the key points expected from a student.
  5.  **Explanations:** For every question, provide a clear and concise 'explanation' for the correct answer. This should clarify why the answer is correct, ideally referencing the source text.

  **Output Format:**
  -   The entire output must be a single, valid JSON object in the specified '{{{language}}}'.
  -   The JSON must contain a 'title' (string) and a 'questions' (array of question objects) field, strictly adhering to the output schema.
  -   Do not include any text or formatting outside the JSON object.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
