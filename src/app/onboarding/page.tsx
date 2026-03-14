
'use client';

import { useState, useEffect, useRef, type MouseEvent } from 'react';
import { useUser, useFirestore, useAuth, updateDocumentNonBlocking } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, MailCheck, LogOut, Sparkles, ArrowLeft, ArrowRight, User, GraduationCap, School, Phone, Book, Star, Hash, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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


const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required.'),
  instituteName: z.string().optional(),
  qualification: z.string().optional(),
  gender: z.string().optional(),
  experience: z.string().optional(),
  subjects: z.string().optional(),
  phone: z.string().optional(),
  class: z.string().optional(),
  stream: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const { user, profile, isUserLoading, isProfileLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const totalSteps = 3;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      instituteName: '',
      qualification: '',
      gender: '',
      experience: '',
      subjects: '',
      phone: '',
      class: '',
      stream: ''
    },
  });

  useEffect(() => {
    if (user && profile) {
      form.reset({
        fullName: profile.name || user.displayName || '',
        instituteName: profile.instituteName || '',
        qualification: profile.qualification || '',
        gender: profile.gender || '',
        experience: profile.experience || '',
        subjects: profile.subjects || '',
        phone: profile.phone || '',
        class: profile.class || '',
        stream: profile.stream || '',
      });
    }
  }, [user, profile, form]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const onDetailsSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    try {
      const userProfileRef = doc(firestore, 'userProfiles', user.uid);
      const updateData = {
        name: data.fullName,
        instituteName: data.instituteName,
        phone: data.phone,
        gender: data.gender,
        ...(profile?.role === 'Teacher' && {
          qualification: data.qualification,
          experience: data.experience,
          subjects: data.subjects,
        }),
        ...(profile?.role === 'Student' && {
          class: data.class,
          stream: data.stream,
        }),
         ...(profile?.role === 'Admin' && {
          // Admin specific fields can be added here
        }),
      };
      
      updateDocumentNonBlocking(userProfileRef, updateData);
      
      nextStep();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    await user.reload(); 
    if (user.emailVerified) {
        const userProfileRef = doc(firestore, 'userProfiles', user.uid);
        updateDocumentNonBlocking(userProfileRef, { hasCompletedOnboarding: true });
        toast({
            title: "Welcome to Sahayak AI!",
            description: "Your setup is complete.",
            variant: "success",
        });
        let redirectPath = '/dashboard';
        if (profile?.role === 'Student') redirectPath = '/student/dashboard';
        if (profile?.role === 'Admin') redirectPath = '/admin/dashboard';
        router.push(redirectPath);
    } else {
        toast({
            title: "Email Not Verified",
            description: "Please check your inbox and verify your email before continuing.",
            variant: "destructive",
        });
    }
    setIsSubmitting(false);
  }

  const handleResend = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox (and spam folder).',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send verification email. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };
  
   const renderStepContent = () => {
      switch(step) {
          case 1:
              return (
                 <>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <CardTitle className="font-headline text-3xl">Welcome to Sahayak AI!</CardTitle>
                        <CardDescription>Let's get your account set up in a few simple steps to personalize your experience.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center min-h-[240px]">
                       
                    </CardContent>
                </>
              );
          case 2:
              return (
                <>
                  <CardHeader className="text-center">
                    <p className="font-semibold text-primary">Onboarding</p>
                    <CardTitle className="font-headline text-3xl">Tell Us About Yourself</CardTitle>
                    <CardDescription>This helps us personalize your experience.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form id="details-form" onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-4">
                        {profile?.role === 'Teacher' && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Institute Name</FormLabel><FormControl><Input placeholder="e.g., Delhi Public School" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="qualification" render={({ field }) => (<FormItem><FormLabel>Qualification</FormLabel><FormControl><Input placeholder="e.g., B.Ed, M.Sc. in Physics" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabel>Experience</FormLabel><FormControl><Input placeholder="e.g., 5 years" {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="subjects" render={({ field }) => (<FormItem><FormLabel>Subjects Taught</FormLabel><FormControl><Input placeholder="e.g., Mathematics, Science" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </>
                        )}
                        {profile?.role === 'Student' && (
                           <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Institute Name</FormLabel><FormControl><Input placeholder="e.g., Delhi Public School" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="class" render={({ field }) => (<FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="e.g., 12th" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                             </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="stream" render={({ field }) => (<FormItem><FormLabel>Stream</FormLabel><FormControl><Input placeholder="e.g., Science, Commerce" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             </div>
                           </>
                        )}
                        {profile?.role === 'Admin' && (
                           <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Institute Name</FormLabel><FormControl><Input placeholder="e.g., Delhi Public School" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="Your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                             </div>
                           </>
                        )}
                      </form>
                    </Form>
                  </CardContent>
                </>
              );
          case 3:
              return (
                 <CardContent className="flex flex-col items-center text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MailCheck className="h-8 w-8" />
                    </div>
                    <h2 className="font-headline text-3xl font-bold">Verify Your Email</h2>
                    <p className="mt-2 max-w-md text-muted-foreground">
                        A verification link has been sent to <span className="font-semibold text-foreground">{user?.email}</span>. Please verify your email to complete your setup.
                    </p>
                    <div className="mt-8 flex flex-col gap-3 w-full max-w-sm">
                        <Button onClick={handleFinishOnboarding} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "I've Verified, Continue"}
                        </Button>
                        <Button onClick={handleResend} variant="outline" disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Resend Verification Email'}
                        </Button>
                    </div>
                </CardContent>
              );
          default:
              return null;
      }
  }

  const handleContinue = () => {
    if (step === 1) {
        nextStep();
    }
    if (step === 2) {
        form.handleSubmit(onDetailsSubmit)();
    }
    if (step === 3) {
        handleFinishOnboarding();
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background onboarding-bg">
        <SpotlightCard className="w-full max-w-2xl shadow-2xl">
            {renderStepContent()}
            <CardFooter className="flex justify-between items-center border-t pt-6">
                <div className="flex items-center gap-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={cn("h-2 w-8 rounded-full transition-colors", i + 1 === step ? 'bg-primary' : 'bg-muted')}></div>
                    ))}
                </div>
                <div className="flex gap-4">
                     {step > 1 && step < totalSteps && (
                        <Button variant="outline" onClick={prevStep}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                     )}
                     {step < totalSteps && (
                        <Button onClick={handleContinue} disabled={(step === 2 && isSubmitting)}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Continue'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                     )}
                </div>
            </CardFooter>
        </SpotlightCard>
    </div>
  );
}
