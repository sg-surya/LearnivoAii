'use server';

/**
 * @fileOverview AI agent that generates lesson plans for teachers.
 *
 * - generateLessonPlan - A function that generates lesson plans.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function- GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic of the lesson plan.'),
  grade: z.string().describe('The grade level of the lesson plan.'),
  objectives: z.string().describe('The learning objectives of the lesson plan.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const DailyPlanSchema = z.object({
    sub_topic: z.string().describe("A specific, manageable sub-topic for that day's lesson."),
    learning_objectives: z.array(z.string()).describe("An array of 2-3 clear, measurable learning objectives for the sub-topic."),
    activities: z.array(z.object({
        name: z.string().describe("The name of the classroom activity."),
        duration: z.string().describe("The estimated time for the activity in minutes.")
    })).describe("An array of objects, each representing a classroom activity."),
    resources: z.array(z.string()).describe("An array of strings listing required materials."),
    assessment: z.string().describe("A simple, practical method to check for understanding for that day's lesson.")
});

const GenerateLessonPlanOutputSchema = z.object({
  plan: z.object({
    day_1: DailyPlanSchema,
    day_2: DailyPlanSchema,
    day_3: DailyPlanSchema,
    day_4: DailyPlanSchema,
    day_5: DailyPlanSchema,
  }).describe('A detailed, day-by-day weekly lesson plan as a valid JSON object.'),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;

export async function generateLessonPlan(input: GenerateLessonPlanInput): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonPlanPrompt',
  input: {schema: GenerateLessonPlanInputSchema},
  output: {schema: GenerateLessonPlanOutputSchema},
  prompt: `You are an expert and creative teacher's assistant for Indian schools. Your task is to generate a comprehensive, day-by-day weekly lesson plan. The plan should be practical, engaging, and suitable for the specified grade level.

**Input:**
- Topic: {{{topic}}}
- Grade: {{{grade}}}
- Overall Learning Objectives: {{{objectives}}}

**Instructions:**
1.  **Structure:** Create a detailed plan for a 5-day school week (Day 1 to Day 5).
2.  **Daily Breakdown:** For each day, provide the following details within a JSON structure:
    -   **sub_topic**: A specific, manageable sub-topic derived from the main topic for that day's lesson.
    -   **learning_objectives**: An array of 2-3 clear, measurable learning objectives for the sub-topic. These should be action-oriented (e.g., "Students will be able to define...", "Students will be able to compare...").
    -   **activities**: An array of objects, each representing a classroom activity. Each object must have:
        -   'name': The name of the activity (e.g., "Brainstorming Session", "Group Discussion", "Interactive Quiz").
        -   'duration': The estimated time for the activity (e.g., "10 mins", "25 mins").
        The activities should be a mix of teacher-led instruction, student-led work, and group collaboration.
    -   **resources**: An array of strings listing required materials. Be specific. Include "Textbook, Chapter X" or "Whiteboard". If relevant, suggest links to online resources like PhET simulations (phet.colorado.edu) or specific educational YouTube videos.
    -   **assessment**: A string describing a simple, practical method to check for understanding for that day's lesson (e.g., "Quick 3-question oral quiz," "Exit ticket: Ask students to write one thing they learned," "Observe student participation in group activity").

3.  **Contextual Relevance:** Ensure the content, examples, and suggested activities are culturally and contextually relevant to students in India.

4.  **Output Format:**
    -   The entire output MUST be a single, valid JSON object.
    -   This object must contain a single key: "plan".
    -   The value of the "plan" key must be a JSON **OBJECT** containing keys for "day_1", "day_2", "day_3", "day_4", "day_5".

**Example Output Structure:**
\`\`\`json
{
  "plan": {
    "day_1": {
      "sub_topic": "Introduction to Photosynthesis",
      "learning_objectives": [
        "Define photosynthesis in their own words.",
        "Identify the key inputs and outputs of photosynthesis."
      ],
      "activities": [
        { "name": "Brainstorming: What do plants eat?", "duration": "10 mins" },
        { "name": "Teacher's Explanation with Diagram", "duration": "20 mins" }
      ],
      "resources": [
        "Textbook, Chapter 4",
        "Whiteboard and markers",
        "A potted plant"
      ],
      "assessment": "Ask students to draw a simple diagram of photosynthesis inputs and outputs."
    },
    "day_2": {
        "sub_topic": "The Role of Chlorophyll",
        "learning_objectives": [
            "Explain the function of chlorophyll.",
            "Understand why most plants are green."
        ],
        "activities": [
            { "name": "Video on Chlorophyll", "duration": "15 mins" },
            { "name": "Leaf Rubbing Art Activity", "duration": "20 mins" }
        ],
        "resources": [
            "YouTube video link (e.g., SciShow Kids)",
            "Leaves, paper, crayons"
        ],
        "assessment": "Ask students to explain in one sentence why leaves are green."
    },
    "day_3": {
      "sub_topic": "Inputs: Light, Water, CO2",
      "learning_objectives": [
        "Describe the three main inputs for photosynthesis.",
        "Relate each input to its source."
      ],
      "activities": [
        { "name": "Group Discussion: Where do plants get their 'food' from?", "duration": "15 mins" },
        { "name": "Simple Experiment Demo: Covering a leaf part to block sunlight", "duration": "20 mins" }
      ],
      "resources": [
        "Black paper, paper clips, a healthy plant"
      ],
      "assessment": "Quick quiz: Name the three ingredients for photosynthesis."
    },
     "day_4": {
      "sub_topic": "Outputs: Glucose and Oxygen",
      "learning_objectives": [
        "Identify the two main products of photosynthesis.",
        "Explain the importance of oxygen for living beings."
      ],
      "activities": [
        { "name": "Analogy: Plant as a 'Sugar Factory'", "duration": "10 mins" },
        { "name": "Think-Pair-Share: Why is photosynthesis important for us?", "duration": "25 mins" }
      ],
      "resources": [
        "Chart paper and markers"
      ],
      "assessment": "Exit ticket: Write down one way photosynthesis helps humans."
    },
     "day_5": {
      "sub_topic": "Weekly Review and Fun Quiz",
      "learning_objectives": [
        "Summarize the process of photosynthesis.",
        "Recall key vocabulary from the week."
      ],
      "activities": [
        { "name": "Interactive Kahoot! Quiz", "duration": "20 mins" },
        { "name": "Drawing Contest: Draw the entire process of photosynthesis", "duration": "20 mins" }
      ],
      "resources": [
        "Kahoot! platform or similar quiz tool",
        "Drawing sheets and colors"
      ],
      "assessment": "Review of quiz scores and participation."
    }
  }
}
\`\`\`
`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);