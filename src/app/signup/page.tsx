
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignupPage() {
  const router = useRouter();
  
  // This page just acts as a hub. Redirect to the landing page's role selection dialog.
  useEffect(() => {
    router.replace("/#signup");
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <p>Redirecting to role selection...</p>
    </div>
  );
}
