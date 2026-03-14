"use client";

import { useState, useRef, type MouseEvent } from "react";
import { PlusCircle, Edit, Trash2, Loader2, Book, Hash, Building, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Textarea } from "@/components/ui/textarea";

// Mock data - in a real app, this would come from a database
const initialSchoolProfile = {
    name: "Sahayak Public School",
    address: "123 Education Lane, Knowledge City, India",
    phone: "+91 98765 43210",
    email: "contact@sahayak.edu.in",
    logo: PlaceHolderImages.find(img => img.id === "auth-graphic")?.imageUrl || ''
};

const initialSessions = [
    { id: "ses1", name: "2024-2025", active: true },
    { id: "ses2", name: "2023-2024", active: false },
];

const initialClasses = [
  { id: "c1", name: "Grade 10", sections: ["A", "B", "C"] },
  { id: "c2", name: "Grade 9", sections: ["A", "B"] },
  { id: "c3", name: "Grade 8", sections: ["A", "B", "C", "D"] },
];

const initialSubjects = [
  { id: "s1", name: "Mathematics" },
  { id: "s2", name: "Science" },
  { id: "s3", name: "English" },
  { id: "s4", name: "Social Studies" },
  { id: "s5", name: "Hindi" },
];

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
  return <Card ref={cardRef} onMouseMove={handleMouseMove} className={cn("spotlight-card", className)} {...props} />;
};


export default function AcademicsPage() {
  const [schoolProfile, setSchoolProfile] = useState(initialSchoolProfile);
  const [sessions, setSessions] = useState(initialSessions);
  const [classes, setClasses] = useState(initialClasses);
  const [subjects, setSubjects] = useState(initialSubjects);
  const { toast } = useToast();

  // Handlers for Classes
  const handleAddClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const className = (form.elements.namedItem("className") as HTMLInputElement).value;
    const sections = (form.elements.namedItem("sections") as HTMLInputElement).value.split(",").map(s => s.trim()).filter(s => s);
    if (className && sections.length > 0) {
      setClasses([...classes, { id: `c${Date.now()}`, name: className, sections }]);
      toast({ title: "Class Added", description: `Successfully added ${className}.` });
      (document.getElementById('close-class-dialog') as HTMLButtonElement)?.click();
    }
  };

  // Handlers for Subjects
  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const form = e.currentTarget;
     const subjectName = (form.elements.namedItem("subjectName") as HTMLInputElement).value;
     if (subjectName) {
         setSubjects([...subjects, { id: `s${Date.now()}`, name: subjectName }]);
         toast({ title: "Subject Added", description: `Successfully added ${subjectName}.` });
         (document.getElementById('close-subject-dialog') as HTMLButtonElement)?.click();
     }
  };
  
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Institute Setup</h1>
        <p className="text-muted-foreground">Manage your school's profile, academic sessions, and master data.</p>
      </div>

       <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile"><Building className="mr-2 h-4 w-4" />School Profile</TabsTrigger>
          <TabsTrigger value="sessions"><Calendar className="mr-2 h-4 w-4" />Sessions</TabsTrigger>
          <TabsTrigger value="master_data"><Hash className="mr-2 h-4 w-4" />Classes & Subjects</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
             <SpotlightCard>
                <CardHeader>
                    <CardTitle>School Profile</CardTitle>
                    <CardDescription>Manage your school's public information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Image src={schoolProfile.logo} alt="School Logo" width={80} height={80} className="rounded-lg" />
                        <div>
                            <h2 className="text-2xl font-bold">{schoolProfile.name}</h2>
                            <p className="text-muted-foreground">{schoolProfile.address}</p>
                        </div>
                    </div>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolName">School Name</Label>
                                <Input id="schoolName" defaultValue={schoolProfile.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolAddress">Address</Label>
                                <Input id="schoolAddress" defaultValue={schoolProfile.address} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="schoolPhone">Phone</Label>
                                <Input id="schoolPhone" defaultValue={schoolProfile.phone} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="schoolEmail">Email</Label>
                                <Input id="schoolEmail" defaultValue={schoolProfile.email} />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Save Changes</Button>
                </CardFooter>
            </SpotlightCard>
        </TabsContent>
         <TabsContent value="sessions">
            <SpotlightCard>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Academic Sessions</CardTitle>
                        <CardDescription>Manage academic years for your school.</CardDescription>
                    </div>
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Session</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {sessions.map(s => (
                            <SpotlightCard key={s.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-semibold text-lg">{s.name}</h3>
                                    {s.active && <Badge><CheckCircle className="mr-2 h-4 w-4" /> Active</Badge>}
                                </div>
                                <div className="flex gap-2">
                                    {!s.active && <Button variant="outline">Set Active</Button>}
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </SpotlightCard>
                        ))}
                    </div>
                </CardContent>
            </SpotlightCard>
        </TabsContent>
        <TabsContent value="master_data">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpotlightCard>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage Classes</CardTitle>
                            <CardDescription>Add or remove classes and their sections.</CardDescription>
                        </div>
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Class</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Class</DialogTitle>
                                    <DialogDescription>Enter the details for the new class.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleAddClass}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="className">Class Name</Label>
                                            <Input id="className" name="className" placeholder="e.g., Grade 10" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="sections">Sections</Label>
                                            <Input id="sections" name="sections" placeholder="e.g., A, B, C" required />
                                            <p className="text-sm text-muted-foreground">Enter section names separated by commas.</p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button id="close-class-dialog" type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="submit">Add Class</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {classes.map(c => (
                                <SpotlightCard key={c.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{c.name}</h3>
                                        <div className="flex gap-2 mt-2">
                                            {c.sections.map(sec => <Badge key={sec} variant="secondary">Section {sec}</Badge>)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </SpotlightCard>
                            ))}
                        </div>
                    </CardContent>
                </SpotlightCard>
                <SpotlightCard>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Manage Subjects</CardTitle>
                            <CardDescription>Add or remove subjects taught.</CardDescription>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Subject</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Subject</DialogTitle>
                                </DialogHeader>
                                 <form onSubmit={handleAddSubject}>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="subjectName">Subject Name</Label>
                                            <Input id="subjectName" name="subjectName" placeholder="e.g., Environmental Science" required />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild><Button id="close-subject-dialog" type="button" variant="outline">Cancel</Button></DialogClose>
                                        <Button type="submit">Add Subject</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                             {subjects.map(s => (
                                <SpotlightCard key={s.id} className="p-3 flex items-center gap-2">
                                    <span className="font-medium">{s.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </SpotlightCard>
                             ))}
                        </div>
                    </CardContent>
                 </SpotlightCard>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
