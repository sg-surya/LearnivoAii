'use server';

/**
 * @fileOverview An AI agent for "sending" (simulating) OTP emails.
 * In a production app, this would integrate with SendGrid or Twilio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendOtpInputSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  name: z.string().optional(),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendOtpPrompt',
  input: {schema: SendOtpInputSchema},
  output: {schema: z.object({ body: z.string() })},
  prompt: `You are Learnivo Security Assistant. Draft a professional and urgent OTP verification email for {{{email}}}.
  
  Details:
  - Recipient Name: {{#if name}}{{{name}}}{{else}}Educator{{/if}}
  - OTP Code: {{{otp}}}
  - Purpose: Password Reset Request
  
  The email should be clear, concise, and follow the Learnivo brand tone (tech-forward, helpful). 
  Warn the user not to share this code.
  
  Return only the email body text.`,
});

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    // In a real app, you'd call a mail API here.
    // For this prototype, we simulate the 'sent' status.
    console.log(`[PROTOTYPE] OTP ${input.otp} sent to ${input.email}`);
    console.log(`[EMAIL BODY]: ${output?.body}`);
    
    return {
      success: true,
      message: `OTP has been sent to ${input.email}`,
    };
  }
);
