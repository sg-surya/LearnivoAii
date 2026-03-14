
"use client";

import { useState, useRef, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { User, Mail, Lock, GraduationCap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, signInWithRedirect } from "firebase/auth";
import { doc } from 'firebase/firestore';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SpotlightCard = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    }
  };

  return (
    <Card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("spotlight-card", className)}
      {...props}
    >
      {children}
    </Card>
  );
};


export default function StudentSignupPage() {
  const authGraphic = PlaceHolderImages.find(img => img.id === 'auth-graphic');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
        toast({
            title: "Missing Details",
            description: "Please fill in your name, email, and password.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await sendEmailVerification(user);

      // Create user profile in Firestore
      const userProfileRef = doc(firestore, 'userProfiles', user.uid);
      const userProfileData = {
        id: user.uid,
        email: user.email,
        name: fullName,
        role: 'Student',
        hasCompletedOnboarding: false,
      };
      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account before you continue.",
        variant: "success",
        duration: 8000,
      });
      router.push("/onboarding");

    } catch (error: any) {
      console.error(error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please use at least 6 characters.";
      }
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

       // Create user profile in Firestore
      const userProfileRef = doc(firestore, 'userProfiles', user.uid);
      const userProfileData = {
        id: user.uid,
        email: user.email,
        name: user.displayName || 'Student User',
        role: 'Student',
        hasCompletedOnboarding: false,
        profilePicture: user.photoURL,
      };
      setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });

       toast({
        title: "Signed In",
        description: "Welcome! Let's get you set up.",
        variant: "success",
      });
      router.push("/onboarding");
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        console.log("Popup closed, falling back to redirect.");
        await signInWithRedirect(auth, provider);
      } else {
        console.error("Google Sign-In Error:", error);
        toast({
          title: "Sign In Failed",
          description: error.message || "Could not sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4 sm:p-8">
      <SpotlightCard className="w-full max-w-4xl mx-auto rounded-2xl bg-card shadow-2xl grid md:grid-cols-2 overflow-hidden">
          
        {/* Left Side: Form */}
        <div className="px-8 sm:px-12 py-12">
          <div className="space-y-4">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <h1 className="font-headline text-3xl font-bold text-foreground">
                  Student Signup
                </h1>
                <p className="text-muted-foreground">Join our community of learners.</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleEmailSignUp}>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="fullName" name="fullName" type="text" placeholder="Full Name" required className="h-11 bg-input pl-10" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input id="email" name="email" type="email" placeholder="Email" required className="h-11 bg-input pl-10" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 bg-input pl-10 pr-10"/>
                     {password.length > 0 && (
                      <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                      >
                          {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    )}
                </div>

                <Button type="submit" className="w-full !mt-8 h-11 font-semibold" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>


                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or</span></div>
                </div>
                
                <Button variant="outline" className="w-full h-11" onClick={handleGoogleSignIn} disabled={isLoading}>
                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                   <>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C322 104 288.1 88 248 88c-79.5 0-144 64.5-144 144s64.5 144 144 144c88.8 0 119.2-66.2 122.8-99.1H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
                    </svg>
                    Sign up with Google
                   </>
                  }
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-primary hover:underline">
                        Sign in
                    </Link>
                </div>
            </form>
          </div>
        </div>

        {/* Right Side: Image and Branding */}
        <div className="hidden md:flex relative items-center justify-center p-8 bg-muted/30 rounded-r-2xl">
          {authGraphic && (
            <div className="relative w-full h-full">
              <Image
                src={authGraphic.imageUrl}
                alt={authGraphic.description}
                fill
                className="object-cover"
                data-ai-hint={authGraphic.imageHint}
              />
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}
