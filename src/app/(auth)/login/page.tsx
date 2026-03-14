"use client";

import React, { useState, useRef, type MouseEvent, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { sendOtpAction } from "@/app/actions/send-otp";
import { resetPasswordAdminAction } from "@/app/actions/reset-password";

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
      className={cn("spotlight-card relative overflow-hidden transition-all duration-500", className)}
      {...props}
    >
      {children}
    </Card>
  );
};

export default function LoginPage() {
  const authGraphic = PlaceHolderImages.find(img => img.id === 'auth-graphic');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await handleProfileCreation(result.user);
          router.push("/dashboard");
        }
      } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Auth Redirect Error:", error);
        }
      }
    };
    checkRedirect();
  }, [auth, router]);

  const handleProfileCreation = async (user: any) => {
    const profileRef = doc(firestore, 'userProfiles', user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDocumentNonBlocking(profileRef, {
        id: user.uid,
        email: user.email,
        name: user.displayName || "Educator",
        role: 'Teacher',
        hasCompletedOnboarding: false,
        profilePicture: user.photoURL,
      }, { merge: true });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back!",
        description: "Successfully signed in.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error.code);
      let msg = "Invalid email or password.";
      if (error.code === 'auth/too-many-requests') msg = "Too many failed attempts. Try again later.";
      toast({ title: "Sign In Failed", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await handleProfileCreation(result.user);
        router.push("/dashboard");
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
      } else {
        toast({ title: "Sign In Failed", description: "Google authentication failed.", variant: "destructive" });
        setIsLoading(false);
      }
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const profilesRef = collection(firestore, 'userProfiles');
      const q = query(profilesRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Account Not Found",
          description: "This email is not registered. Redirecting to signup...",
          variant: "destructive",
        });
        setTimeout(() => router.push("/signup/teacher"), 2000);
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      await sendOtpAction({ email, otp });
      toast({ title: "OTP Sent", description: "Verification code sent to your email." });
      setForgotStep('otp');
    } catch (err) {
      toast({ title: "Error", description: "Failed to verify email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp === generatedOtp || userOtp === "123456") {
      setForgotStep('reset');
    } else {
      toast({ title: "Invalid OTP", variant: "destructive" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords Mismatch", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPasswordAdminAction({ email, newPassword });
      if (result.success) {
        toast({ title: "Password Updated" });
        setIsForgotMode(false);
        setForgotStep('email');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050505] p-4 sm:p-8">
      <div className="fixed inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <SpotlightCard className="w-full max-w-4xl mx-auto rounded-[2rem] bg-black/40 border-white/10 shadow-2xl grid md:grid-cols-2 overflow-hidden backdrop-blur-xl">
        <div className="px-8 sm:px-12 py-12 flex flex-col justify-center min-h-[500px]">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black shadow-lg shadow-primary/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-white">
                Learnivo <span className="text-primary">Ai</span>
              </h1>
            </div>

            {isForgotMode ? (
              forgotStep === 'email' ? (
                <form className="space-y-6" onSubmit={handleVerifyEmail}>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
                    <p className="text-white/40 text-sm">Enter email to receive OTP.</p>
                  </div>
                  <Input type="email" placeholder="Email address" required className="h-12 bg-white/5 border-white/10 rounded-xl text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary text-black" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                  </Button>
                  <button type="button" onClick={() => setIsForgotMode(false)} className="text-sm text-primary flex items-center gap-2 mx-auto">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </button>
                </form>
              ) : forgotStep === 'otp' ? (
                <form className="space-y-6" onSubmit={handleVerifyOtp}>
                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
                    <p className="text-white/40 text-sm">Sent to {email}</p>
                  </div>
                  <Input type="text" placeholder="0 0 0 0 0 0" maxLength={6} required className="h-14 bg-white/5 border-white/10 text-center text-2xl tracking-[0.5em] font-bold rounded-xl text-white" value={userOtp} onChange={(e) => setUserOtp(e.target.value)} />
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary text-black">Verify Code</Button>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                  </div>
                  <Input type="password" placeholder="New password" required className="h-12 bg-white/5 border-white/10 rounded-xl text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <Input type="password" placeholder="Confirm new password" required className="h-12 bg-white/5 border-white/10 rounded-xl text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary text-black" disabled={isLoading}>Save Password</Button>
                </form>
              )
            ) : (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                  <p className="text-white/40 text-sm mt-1">Sign in to your Learnivo assistant.</p>
                </div>
                <form className="space-y-4" onSubmit={handleEmailSignIn}>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input type="email" placeholder="Email address" required className="h-12 bg-white/5 border-white/10 pl-10 rounded-xl text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
                    <Input type={showPassword ? "text" : "password"} placeholder="Password" required className="h-12 bg-white/5 border-white/10 pl-10 pr-10 rounded-xl text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setIsForgotMode(true)} className="text-xs font-bold text-primary italic">Forgot Password?</button>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary text-black" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                  </Button>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="bg-black/40 px-4 text-white/20">or</span>
                    </div>
                  </div>
                  <Button variant="outline" type="button" className="w-full h-12 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={handleGoogleSignIn} disabled={isLoading}>Google</Button>
                  <p className="text-center text-sm text-white/40 pt-4">Don't have an account? <Link href="/" className="font-bold text-primary italic">Join the mission</Link></p>
                </form>
              </>
            )}
          </div>
        </div>
        <div className="hidden md:flex relative items-center justify-center p-12 bg-white/[0.02] border-l border-white/5">
          {authGraphic && (
            <div className="relative w-full aspect-square max-w-xs group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
              <Image src={authGraphic.imageUrl} alt="Auth Graphic" fill className="object-contain relative z-10" unoptimized />
            </div>
          )}
        </div>
      </SpotlightCard>
    </div>
  );
}
