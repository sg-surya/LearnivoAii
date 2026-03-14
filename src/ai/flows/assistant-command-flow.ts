'use server';

/**
 * @fileOverview An AI agent for handling voice commands within the Learnivo platform.
 *
 * - assistantCommand - A function that processes user commands.
 * - AssistantCommandInput - The input type for the function.
 * - AssistantCommandOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantCommandInputSchema = z.object({
  command: z.string().describe('The voice command spoken by the user.'),
});
export type AssistantCommandInput = z.infer<typeof AssistantCommandInputSchema>;

const AssistantCommandOutputSchema = z.object({
  responseText: z.string().describe('The text response to be spoken or displayed to the user.'),
  navigationPath: z.string().optional().describe('An optional path to navigate to within the application (e.g., /dashboard).'),
});
export type AssistantCommandOutput = z.infer<typeof AssistantCommandOutputSchema>;

export async function assistantCommand(
  input: AssistantCommandInput
): Promise<AssistantCommandOutput> {
  return assistantCommandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistantCommandPrompt',
  input: {schema: AssistantCommandInputSchema},
  output: {schema: AssistantCommandOutputSchema},
  prompt: `You are Learnivo Assistant, an intelligent and sophisticated voice assistant for an educational platform. Your primary role is to help users navigate the app and understand its powerful AI features based on their voice commands.

  **Task:** Analyze the user's command and determine the most helpful response and action.

  **User Command:** "{{command}}"

  **Available Navigation Paths:**
  - /dashboard (The main hub)
  - /library (Digitized books and resources)
  - /workspace (Saved assets and folders)
  - /lesson-planner (Generate weekly plans)
  - /paper-digitizer (Convert physical papers)
  - /visual-aids (Drawings and charts)
  - /math-helper (Step-by-step problem solving)
  - /hyper-local-content (Localized teaching material)
  - /story-generator (Illustrated stories)
  - /knowledge-base (Simple explanations for students)
  - /parent-communication (Email drafts)
  - /quiz-generator (Create assessments)
  - /rubric-generator (Fair grading criteria)
  - /debate-topic-generator (Critical thinking motions)
  - /settings (Account preferences)
  - /profile (User profile)

  **Instructions:**
  1.  **Professional Tone:** Maintain a helpful, precise, and tech-forward tone as Learnivo Assistant.
  2.  **Navigation:** If the user wants to navigate (e.g., "take me to dashboard," "show me the quiz tool"), set 'navigationPath' accordingly. confirm with a friendly message.
  3.  **App Intelligence:** If the user asks about Learnivo's capabilities (e.g., "what can you do?", "how do I use the digitizer?"), provide a clear, concise explanation focusing on educational value.
  4.  **No Match:** If unclear, apologize politely and suggest 2-3 common features like the Lesson Planner or Workspace.

  **Output Format:**
  - Return a single, valid JSON object with 'responseText' and optional 'navigationPath'.
  `,
});

const assistantCommandFlow = ai.defineFlow(
  {
    name: 'assistantCommandFlow',
    inputSchema: AssistantCommandInputSchema,
    outputSchema: AssistantCommandOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);