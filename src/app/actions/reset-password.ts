
"use server";

import { getAdminApp } from "@/firebase/server-app";
import { getAuth } from "firebase-admin/auth";

interface ResetPasswordInput {
  email: string;
  newPassword: string;
}

export async function resetPasswordAdminAction({ email, newPassword }: ResetPasswordInput) {
  try {
    const adminApp = getAdminApp();
    const auth = getAuth(adminApp);
    
    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, {
      password: newPassword,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return { 
      success: false, 
      message: error.code === 'auth/user-not-found' ? 'User not found' : 'Failed to update password.' 
    };
  }
}
