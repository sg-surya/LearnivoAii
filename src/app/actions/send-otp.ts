"use server";

import { sendOtp, type SendOtpInput, type SendOtpOutput } from "@/ai/flows/send-otp-flow";

export async function sendOtpAction(input: SendOtpInput): Promise<SendOtpOutput> {
  try {
    return await sendOtp(input);
  } catch (error) {
    console.error("Error in sendOtpAction:", error);
    throw new Error("Failed to send verification code.");
  }
}
