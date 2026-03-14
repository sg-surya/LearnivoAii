
"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, X, User, Palette, Bot, FolderKanban, KeyRound, Edit } from "lucide-react";
import React, { useCallback, useState, useEffect, useRef, type MouseEvent } from "react";
import { ImageAdjuster } from "@/components/image-adjuster";
import { useUser, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
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


const profileSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  instituteName: z.string().optional(),
  subjects: z.string().optional(),
  experience: z.string().optional(),
  qualification: z.string().optional(),
  class: z.string().optional(),
  stream: z.string().optional(),
  profilePicture: z.string().optional(),
  coverUrl: z.string().optional(),
});

const aiSettingsSchema = z.object({
  defaultLanguage: z.string(),
  defaultGrade: z.string(),
  creativityLevel: z.enum(['precise', 'balanced', 'creative']),
});

const workspaceSettingsSchema = z.object({
  autoSave: z.boolean(),
});

const combinedSchema = profileSchema.merge(aiSettingsSchema).merge(workspaceSettingsSchema);

type AllSettings = z.infer<typeof combinedSchema>;


const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", 
  "Grade 11", "Grade 12",
] as const;

const indianLanguages = [
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", 
  "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", 
  "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", 
  "Sindhi", "Tamil", "Telugu", "Urdu"
] as const;


// Reusable ImageDropzone component
const ImageDropzone = ({
  label,
  value,
  onImageSelect,
  onClear,
  aspectRatio,
}: {
  label: string;
  value?: string;
  onImageSelect: (file: File) => void;
  onClear: () => void;
  aspectRatio: number;
}) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <div
        {...getRootProps()}
        className="relative w-full rounded-md overflow-hidden border-2 border-dashed bg-muted transition-colors"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        <input {...getInputProps()} />
        
        {value ? (
          <>
            <Image src={value} alt="Preview" layout="fill" objectFit="cover" unoptimized={value.startsWith('blob:')} />
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={open}><Edit className="mr-2 h-4 w-4" />Change</Button>
                <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.preventDefault(); onClear(); }}><X className="mr-2 h-4 w-4"/>Clear</Button>
            </div>
          </>
        ) : (
            <div
                onClick={open}
                className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/50"
            >
                <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                    {isDragActive ? "Drop file here..." : "Click or drag to upload"}
                    </p>
                </div>
            </div>
        )}
      </div>
    </FormItem>
  );
};


export default function SettingsPage() {
  const { user, profile } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [adjusterState, setAdjusterState] = useState<{
      file: File,
      type: 'profilePicture' | 'coverUrl',
      aspectRatio: number,
  } | null>(null);

  const form = useForm<AllSettings>({
    resolver: zodResolver(combinedSchema),
    defaultValues: {
      name: '',
      instituteName: '',
      subjects: '',
      experience: '',
      qualification: '',
      class: '',
      stream: '',
      profilePicture: '',
      coverUrl: '',
      defaultLanguage: 'English',
      defaultGrade: 'Grade 8',
      creativityLevel: 'balanced',
      autoSave: true,
    },
  });

   useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        instituteName: profile.instituteName || '',
        subjects: profile.subjects || '',
        experience: profile.experience || '',
        qualification: profile.qualification || '',
        class: profile.class || '',
        stream: profile.stream || '',
        profilePicture: profile.profilePicture || '',
        coverUrl: profile.coverUrl || '',
        defaultLanguage: profile.defaultLanguage || 'English',
        defaultGrade: profile.defaultGrade || 'Grade 8',
        creativityLevel: profile.creativityLevel || 'balanced',
        autoSave: profile.autoSave === false ? false : true,
      });
    }
  }, [profile, form]);

  
  const handleImageSave = (dataUrl: string) => {
    if (adjusterState?.type) {
      form.setValue(adjusterState.type, dataUrl);
    }
    setAdjusterState(null);
  }
  
  const handleFormSubmit = (data: AllSettings) => {
      if (!user || !firestore) return;
      const userProfileRef = doc(firestore, 'userProfiles', user.uid);
      updateDocumentNonBlocking(userProfileRef, data);
      toast({
        title: "Settings Updated",
        description: "Your changes have been saved successfully.",
      });
  };

  return (
    <>
    <ImageAdjuster
        state={adjusterState}
        onClose={() => setAdjusterState(null)}
        onSave={handleImageSave}
    />
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, appearance, and application preferences.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile</TabsTrigger>
                <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
                <TabsTrigger value="ai"><Bot className="mr-2 h-4 w-4" />AI Assistant</TabsTrigger>
                <TabsTrigger value="workspace"><FolderKanban className="mr-2 h-4 w-4" />Workspace</TabsTrigger>
                <TabsTrigger value="account"><KeyRound className="mr-2 h-4 w-4" />Account</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <SpotlightCard>
                        <CardHeader>
                        <CardTitle className="font-headline text-xl">Public Profile</CardTitle>
                        <CardDescription>
                            This information will be displayed on your profile page.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                            <div className="md:col-span-1">
                                <ImageDropzone 
                                label="Profile Photo"
                                value={form.watch('profilePicture')}
                                onImageSelect={(file) => setAdjusterState({ file, type: 'profilePicture', aspectRatio: 1 })}
                                onClear={() => form.setValue('profilePicture', '')}
                                aspectRatio={1}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <ImageDropzone 
                                label="Cover Image"
                                value={form.watch('coverUrl')}
                                onImageSelect={(file) => setAdjusterState({ file, type: 'coverUrl', aspectRatio: 16/9 })}
                                onClear={() => form.setValue('coverUrl', '')}
                                aspectRatio={16/9}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="instituteName" render={({ field }) => (
                            <FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="e.g., Delhi Public School" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        {profile?.role === 'Teacher' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="subjects" render={({ field }) => (
                                <FormItem><FormLabel>Subjects Taught</FormLabel><FormControl><Input placeholder="e.g., Mathematics, Science" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="experience" render={({ field }) => (
                                <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input placeholder="e.g., 5 years" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            </div>
                        )}
                        {profile?.role === 'Student' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="class" render={({ field }) => (
                                <FormItem><FormLabel>Class</FormLabel><FormControl><Input placeholder="e.g., 12th" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="stream" render={({ field }) => (
                                <FormItem><FormLabel>Stream</FormLabel><FormControl><Input placeholder="e.g., Science" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            </div>
                        )}
                        </CardContent>
                    </SpotlightCard>
                </TabsContent>

                <TabsContent value="appearance">
                <SpotlightCard>
                    <CardHeader>
                    <CardTitle className="font-headline text-xl">Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h3 className="text-base font-medium">Theme</h3>
                        <p className="text-sm text-muted-foreground">Select your preferred light or dark theme.</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    </CardContent>
                </SpotlightCard>
                </TabsContent>

                <TabsContent value="ai">
                    <SpotlightCard>
                        <CardHeader>
                        <CardTitle className="font-headline text-xl">AI Assistant</CardTitle>
                        <CardDescription>Customize the default behavior of the AI assistant.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <FormField control={form.control} name="defaultLanguage" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div><FormLabel className="font-medium">Default Language</FormLabel><p className="text-sm text-muted-foreground">Set the default language for generated content.</p></div>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="w-[180px]"><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>{indianLanguages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                            )} />
                        <FormField control={form.control} name="defaultGrade" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div><FormLabel className="font-medium">Default Grade Level</FormLabel><p className="text-sm text-muted-foreground">Set a default grade for all AI tools.</p></div>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{gradeLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}</SelectContent>
                            </Select>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="creativityLevel" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                            <div><FormLabel className="font-medium">AI Creativity Level</FormLabel><p className="text-sm text-muted-foreground">Control the creativity of the AI responses.</p></div>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="precise">Precise</SelectItem><SelectItem value="balanced">Balanced</SelectItem><SelectItem value="creative">Creative</SelectItem></SelectContent>
                            </Select>
                            </FormItem>
                        )} />
                        </CardContent>
                    </SpotlightCard>
                </TabsContent>

                <TabsContent value="workspace">
                    <SpotlightCard>
                        <CardHeader>
                        <CardTitle className="font-headline text-xl">Workspace</CardTitle>
                        <CardDescription>Manage your content and storage preferences.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <FormField control={form.control} name="autoSave" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                <FormLabel className="font-medium">Auto-save Content</FormLabel>
                                <p className="text-sm text-muted-foreground">Automatically save all generated content to your workspace.</p>
                                </div>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                            )} />
                        </CardContent>
                    </SpotlightCard>
                </TabsContent>
                
                <TabsContent value="account">
                <SpotlightCard>
                    <CardHeader>
                    <CardTitle className="font-headline text-xl">Account & Security</CardTitle>
                    <CardDescription>Manage your account password.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-6">
                        <Button>Change Password</Button>
                        <div className="w-full border-t pt-6">
                            <h3 className="text-lg font-semibold text-destructive">Delete Account</h3>
                            <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all your data. This action cannot be undone.</p>
                            <Button variant="destructive">Delete My Account</Button>
                        </div>
                    </CardFooter>
                </SpotlightCard>
                </TabsContent>

            </Tabs>
            <div className="mt-6 flex justify-end">
                <Button type="submit">Save All Settings</Button>
            </div>
        </form>
      </Form>
    </div>
    </>
  );
}
