
'use server';

/**
 * @fileOverview An AI agent for generating simple visual aids (drawings or charts) as SVG.
 *
 * - generateVisualAid - A function that handles the visual aid generation process.
 * - GenerateVisualAidInput - The input type for the generateVisualAid function.
 * - GenerateVisualAidOutput - The return type for the generateVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Assume a function exists to get feedback. In a real app, this would query Firestore.
// For this example, we'll define a tool that the AI can "call".
const getVisualAidFeedback = ai.defineTool(
  {
    name: 'getVisualAidFeedback',
    description: 'Retrieves past user feedback for a given visual aid concept to learn from mistakes.',
    inputSchema: z.object({
      concept: z.string().describe('The concept to retrieve feedback for.'),
    }),
    outputSchema: z.array(z.object({
        rating: z.enum(['good', 'bad']),
        comment: z.string().optional(),
    })),
  },
  async ({ concept }) => {
    // This is a mock implementation. In a real application, you would
    // query your Firestore 'visualAidFeedbacks' collection here.
    // e.g., `const feedbacks = await query(collection(db, 'visualAidFeedbacks'), where('concept', '==', concept), limit(3)).get();`
    console.log(`(Mock) Fetching feedback for: ${concept}`);
    return []; // Return empty array as we can't query DB here.
  }
);


const GenerateVisualAidInputSchema = z.object({
  concept: z.string().describe('The concept to visualize.'),
  visualType: z
    .enum([
      'Simple Drawing',
      'Flow Chart',
      'Mind Map',
      'Bar Chart',
      'Venn Diagram',
      'Cycle Diagram',
    ])
    .describe('The type of visual to generate.'),
  data: z
    .string()
    .optional()
    .describe(
      'Optional data for charts, e.g., "Label1,Value1;Label2,Value2"'
    ),
  primaryColor: z.string().describe('The primary color for the SVG strokes and text.'),
  secondaryColor: z.string().describe('The secondary color for less important elements.'),
  handDrawn: z.boolean().describe('If true, apply a hand-drawn, sketchy style.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  svg: z
    .string()
    .describe('The generated visual aid as a complete, valid SVG string.'),
});
export type GenerateVisualAidOutput = z.infer<
  typeof GenerateVisualAidOutputSchema
>;

export async function generateVisualAid(
  input: GenerateVisualAidInput
): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualAidPrompt',
  input: {schema: GenerateVisualAidInputSchema},
  output: {schema: GenerateVisualAidOutputSchema},
  tools: [getVisualAidFeedback],
  prompt: `You are an expert Biology teacher, skilled at creating clear, simple, and scientifically accurate blackboard-style diagrams to explain concepts. Your task is to generate a visual representation of a concept as an SVG. You learn from past feedback to improve your drawings.

**Core Task:** Generate a '{{{visualType}}}' for the concept: '{{{concept}}}'.

**LEARN FROM PAST FEEDBACK:** Before you draw, use the 'getVisualAidFeedback' tool to see what users liked or disliked about previous attempts for this same concept. Pay close attention to comments on what was wrong.

**Input:**
- Concept: {{{concept}}}
- Visual Type: {{{visualType}}}
- Data (optional, for charts): {{{data}}}
- Primary Color: {{{primaryColor}}}
- Secondary Color: {{{secondaryColor}}}
- Hand-drawn Style: {{{handDrawn}}}

**CRITICAL Instructions:**
1.  **Scientific Accuracy is Priority #1:** Your drawing MUST be a scientifically accurate representation, simplified for a blackboard. It should NOT be a decorative icon. For example, a 'human heart' must look like the actual organ, not a symmetrical ❤️ symbol.
2.  **Clarity and Simplicity:** Use basic shapes (circles, rectangles, lines, arrows) and clear text.
3.  **Color and Style:**
    -   Use the '{{{primaryColor}}}' for main lines and critical text.
    -   Use the '{{{secondaryColor}}}' for annotations, secondary lines, or less important labels.
    -   The background will be dark, so **DO NOT use any fill colors** (use 'transparent' or 'none' for fill). The visual should be composed of lines and text only.
    -   If '{{{handDrawn}}}' is true, use a slightly thicker stroke width (e.g., 2) and apply the sketchy filter **ONLY to shapes and paths, NOT to text**, to keep labels readable. Use a simple 'sans-serif' font for all text.
    -   If '{{{handDrawn}}}' is false, use a standard stroke width (e.g., 1.5) and a clean 'sans-serif' font.
4.  **Content and Data Handling:**
    -   **Simple Drawing:** Illustrate key components clearly. For "water cycle," show clouds, rain, ocean, and sun with arrows labeled "Evaporation", "Condensation", "Precipitation".
    -   **Flow Chart/Mind Map/Cycle Diagram:** Create simple diagrams with boxes and arrows. Label elements clearly but sparingly.
    -   **Bar Chart/Venn Diagram:** If data is provided, use it. Otherwise, create a simple illustrative chart with 2-4 example items.
5.  **SVG Output Rules:**
    -   The entire output must be a single, valid JSON object with one key: "svg".
    -   The value of "svg" must be a single string containing the complete, well-formed SVG code.
    -   Ensure the SVG has a 'viewBox="0 0 400 300"' attribute to be scalable.
    -   Ensure all text labels are placed carefully to be fully visible inside the viewBox and do not overlap with each other or critical parts of the drawing. Add a small margin from the edges.
    -   If hand-drawn style is requested, add this filter: \`<defs><filter id='sketchy'><feTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='2' result='noise'/><feDisplacementMap in='SourceGraphic' in2='noise' scale='2'/></filter></defs>\`. Apply it to shape elements with \`filter='url(#sketchy)'\`.
    -   Do not include any XML prolog or comments in the SVG string.
6.  **Error Handling:** If you cannot create a simple visual, return an SVG with a text element saying "Concept too abstract to visualize".

**High-Quality Example for "human heart" with hand-drawn style:**
This example demonstrates a more anatomically correct, yet simplified, shape.

\`\`\`xml
<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id='sketchy'><feTurbulence type='fractalNoise' baseFrequency='0.05' numOctaves='2' result='noise'/><feDisplacementMap in='SourceGraphic' in2='noise' scale='2'/></filter></defs>
  <g style="stroke:{{{primaryColor}}}; stroke-width:2; fill:none; font-family:sans-serif;">
    <!-- Main heart outline (asymmetrical) -->
    <path d="M 200,280 C 200,280 80,220 80,150 C 80,100 120,60 170,80 C 190,40 250,40 270,80 C 320,60 360,100 360,150 C 360,220 200,280 200,280 Z" filter="url(#sketchy)" style="stroke-width:3;" />

    <!-- Internal dividers -->
    <path d="M 200,100 V 280" filter="url(#sketchy)" />
    <path d="M 120,180 H 280" filter="url(#sketchy)" />

    <!-- Chamber Labels (No filter for readability) -->
    <text x="160" y="150" text-anchor="middle" font-size="20" style="stroke-width:1;">RA</text>
    <text x="240" y="150" text-anchor="middle" font-size="20" style="stroke-width:1;">LA</text>
    <text x="160" y="220" text-anchor="middle" font-size="20" style="stroke-width:1;">RV</text>
    <text x="240" y="220" text-anchor="middle" font-size="20" style="stroke-width:1;">LV</text>
    
    <!-- Vessels and Labels -->
    <path d="M 160 100 Q 150 60 130 50" filter="url(#sketchy)" />
    <text x="125" y="40" text-anchor="middle" font-size="12" style="stroke:{{{secondaryColor}}}; stroke-width:0.5;">Vena Cava</text>
    
    <path d="M 240 100 Q 250 60 270 50" filter="url(#sketchy)" />
    <text x="275" y="40" text-anchor="middle" font-size="12" style="stroke:{{{secondaryColor}}}; stroke-width:0.5;">Pulmonary Vein</text>
    
    <path d="M 200 40 A 40 40 0 0 1 280 80" filter="url(#sketchy)" />
    <text x="220" y="30" text-anchor="middle" font-size="12" style="stroke:{{{secondaryColor}}}; stroke-width:0.5;">Aorta</text>

    <path d="M 170 80 A 30 30 0 0 1 200 50" filter="url(#sketchy)" />
    <text x="160" y="40" text-anchor="end" font-size="12" style="stroke:{{{secondaryColor}}}; stroke-width:0.5;">Pulmonary Artery</text>
  </g>
</svg>
\`\`\`
`,
});

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
