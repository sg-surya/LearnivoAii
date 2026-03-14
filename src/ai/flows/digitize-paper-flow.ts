
'use server';

/**
 * @fileOverview An AI agent for digitizing and formatting question papers from images.
 *
 * - digitizePaper - A function that handles the paper digitization process.
 * - DigitizePaperInput - The input type for the digitizePaper function.
 * - DigitizePaperOutput - The return type for the digitizePaper function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DigitizePaperInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question paper page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  existingContent: z.string().optional().describe('The already digitized HTML content from previous pages, if any.')
});
export type DigitizePaperInput = z.infer<typeof DigitizePaperInputSchema>;

const DigitizePaperOutputSchema = z.object({
  formattedContent: z
    .string()
    .describe('The formatted question paper as a complete HTML string, including the new page.'),
});
export type DigitizePaperOutput = z.infer<typeof DigitizePaperOutputSchema>;

export async function digitizePaper(
  input: DigitizePaperInput
): Promise<DigitizePaperOutput> {
  return digitizePaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'digitizePaperPrompt',
  input: {schema: DigitizePaperInputSchema},
  output: {schema: DigitizePaperOutputSchema},
  prompt: `You are an expert document formatter and digitizer specializing in creating premium, print-ready educational materials from handwritten or printed papers. Your task is to accurately transcribe the content from an image and format it into a clean, well-structured, and professional-looking HTML document. You MUST NOT answer the questions in the paper; your only job is to digitize and format it.

**Core Task:** Analyze the provided image of a question paper page. Transcribe its content with 99% accuracy across all languages (including English, Hindi, Marathi, etc.). Then, format it into a beautifully structured HTML document. If there is existing content from a previous page, intelligently merge the new content with it.

**Input:**
- Image of the new page: {{media url=photoDataUri}}
- Existing HTML Content (from previous pages, if any): {{{existingContent}}}

**Formatting and Structuring Instructions (This is CRITICAL):**
1.  **Transcription:**
    -   Perform OCR with the highest accuracy. Capture all text, symbols, and numbers correctly.
    -   **DO NOT, under any circumstances, answer any of the questions.** Your role is to transcribe, not to solve.

2.  **Structural HTML Tags:** Use semantic and structural HTML to create a clean layout.
    -   **Headings:** Use <h2> for the main title of the paper (e.g., "Mid-Term Examination") and <h3> for section titles (e.g., "Section A: Multiple Choice Questions").
    -   **Questions:** Each question should be a separate paragraph, wrapped in <p> tags. The question number and text (e.g., "Q.1. What is photosynthesis?") should be wrapped in a <strong> tag to make it bold and prominent.
    -   **Options:** For Multiple Choice Questions (MCQ), use an ordered list (<ol type="a">) for the options (a, b, c, d). Each option should be an <li> element.
    -   **Marks:** For each question, display the marks on the far right of the line. Wrap the marks in a span with a float style, like this: <span style="float:right;">(5 Marks)</span>. Place this span *inside* the <p> tag of the question but after the <strong> tag.

3.  **Stylistic Formatting:**
    -   **Emphasis:** Use <em> (italic) for important keywords or phrases within a question that need emphasis.
    -   **Clarity:** Ensure there is clear visual separation between questions. Use appropriate spacing.

4.  **Merging Logic (If 'existingContent' is provided):**
    -   Analyze the {{{existingContent}}} to find the last question number.
    -   Continue the numbering sequence seamlessly. If the last question was Q.5, the first question from the new image must be Q.6.
    -   Append the newly formatted HTML to the existing content, ensuring the final output is one single, coherent HTML string.

5.  **Output Specification:**
    -   The final output must be a single, valid JSON object with one key: "formattedContent".
    -   The value of "formattedContent" must be a single string containing the complete, well-formed HTML.
    -   **Do not include** <html>, <head>, or <body> tags in the output string. The content should be ready to be injected into a <div>.

**Example of a single formatted question:**
<p><strong>Q.3. Explain the process of <em>photosynthesis</em> in plants.</strong><span style="float:right;">(10 Marks)</span></p>
`,
});

const digitizePaperFlow = ai.defineFlow(
  {
    name: 'digitizePaperFlow',
    inputSchema: DigitizePaperInputSchema,
    outputSchema: DigitizePaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
