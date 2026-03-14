
"use client";

import React, { useState, useRef, type MouseEvent, useCallback, useEffect } from "react";
import Image from "next/image";
import { PlusCircle, Camera, Loader2, Book, X, Upload, ScanLine } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useWorkspace } from "@/context/workspace-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { digitizeBookCoverAction } from "@/app/actions/digitize-book-cover";

const SpotlightCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const card = internalRef.current;
        if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);
        }
    };

    return (
        <Card
            ref={(node) => {
                internalRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
            }}
            onMouseMove={handleMouseMove}
            className={cn("spotlight-card", className)}
            {...props}
        >
            {children}
        </Card>
    );
});
SpotlightCard.displayName = "SpotlightCard";

type Book = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  publisher?: string;
  coverImage: string;
  imageHint?: string;
};

const initialBooks: Book[] = [
  {
    id: "1",
    title: "Science for Grade 6",
    subject: "Science",
    grade: "6",
    publisher: "NCERT",
    coverImage: PlaceHolderImages.find((img) => img.id === "book-cover-1")!.imageUrl,
    imageHint: PlaceHolderImages.find((img) => img.id === "book-cover-1")!.imageHint,
  },
  {
    id: "2",
    title: "Mathematics Today",
    subject: "Math",
    grade: "8",
    publisher: "S. Chand",
    coverImage: PlaceHolderImages.find((img) => img.id === "book-cover-2")!.imageUrl,
    imageHint: PlaceHolderImages.find((img) => img.id === "book-cover-2")!.imageHint,
  },
  {
    id: "3",
    title: "Our Past - History",
    subject: "History",
    grade: "7",
    publisher: "NCERT",
    coverImage: PlaceHolderImages.find((img) => img.id === "book-cover-3")!.imageUrl,
    imageHint: PlaceHolderImages.find((img) => img.id === "book-cover-3")!.imageHint,
  },
];

function CameraCapture({ onCapture }: { onCapture: (dataUri: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream;
    async function setupCamera() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
    setupCamera();

    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      onCapture(canvas.toDataURL('image/jpeg'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
        {!stream && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                {error ? <p className="text-destructive">{error}</p> : <p>Starting camera...</p>}
            </div>
        )}
      </div>
      <Button onClick={handleCapture} className="w-full" disabled={!stream}>
        <Camera className="mr-2 h-4 w-4" />
        Capture Cover
      </Button>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

const bookFormSchema = z.object({
    title: z.string().min(1, "Book title is required."),
    subject: z.string().min(1, "Subject is required."),
    grade: z.string().min(1, "Please select a grade."),
});

const gradeLevels = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", 
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", 
  "Grade 11", "Grade 12",
] as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const { addFolder } = useWorkspace();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof bookFormSchema>>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: "",
      subject: "",
      grade: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      const file = acceptedFiles[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const resetDialog = () => {
    form.reset();
    setCoverFile(null);
    setCoverPreview(null);
    setIsLoading(false);
  }

  useEffect(() => {
    if(coverFile) {
        handleImageProcess(coverFile);
    }
  }, [coverFile]);
  
  const handleImageProcess = async (fileOrDataUri: File | string) => {
    setIsLoading(true);
    let dataUri: string;

    if (typeof fileOrDataUri === 'string') {
        dataUri = fileOrDataUri;
    } else {
        dataUri = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileOrDataUri);
        });
    }

    setCoverPreview(dataUri);

    try {
      const details = await digitizeBookCoverAction({ photoDataUri: dataUri });
      form.setValue("title", details.title);
      form.setValue("subject", details.subject);
      if (gradeLevels.some(g => g.includes(details.grade))) {
        const matchingGrade = gradeLevels.find(g => g.endsWith(details.grade));
        if (matchingGrade) {
          form.setValue("grade", matchingGrade);
        }
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "AI Detection Failed",
        description: "Could not automatically detect book details. Please enter them manually.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = (values: z.infer<typeof bookFormSchema>) => {
    if (!coverPreview) {
        toast({
            title: "Missing Cover Image",
            description: "Please upload or scan a book cover.",
            variant: "destructive",
        });
        return;
    }

    const newBook: Book = {
        id: `book-${Date.now()}`,
        title: values.title,
        subject: values.subject,
        grade: values.grade,
        coverImage: coverPreview,
    };
    setBooks(prev => [newBook, ...prev]);
    addFolder(`Topic: ${values.title}`, `Content related to the book "${values.title}"`);
    toast({
      title: "Book Added!",
      description: `Successfully added "${values.title}" to your library.`,
    });
    setIsDialogOpen(false);
  };
  
  useEffect(() => {
    if (!isDialogOpen) {
      resetDialog();
    }
  }, [isDialogOpen]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground">
            Manage your digitized textbooks and resources.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Add New Book</DialogTitle>
              <DialogDescription>
                Enter the details of the book you want to digitize.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                    <TabsTrigger value="scan"><ScanLine className="mr-2 h-4 w-4"/>Scan</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload">
                     <div {...getRootProps()} className="mt-4 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50 relative">
                        <input {...getInputProps()} />
                         {coverPreview ? (
                            <Image src={coverPreview} alt="Cover preview" layout="fill" objectFit="contain" className="p-2"/>
                         ) : (
                            <div className="text-center text-muted-foreground">
                                <Upload className="mx-auto h-8 w-8 mb-2" />
                                {isDragActive ? <p>Drop the file here...</p> : <p>Drag 'n' drop or click to upload</p>}
                            </div>
                         )}
                         {isLoading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                         )}
                    </div>
                  </TabsContent>
                  <TabsContent value="scan">
                    <div className="mt-4">
                      {isLoading && coverPreview ? (
                         <div className="flex flex-col items-center justify-center gap-4 text-center h-40">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="font-semibold">Analyzing Book Cover...</p>
                        </div>
                      ) : (
                        <CameraCapture onCapture={handleImageProcess} />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Book Title</FormLabel><FormControl><Input placeholder="e.g., NCERT Science" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                 <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem><FormLabel>Subject</FormLabel><FormControl><Input placeholder="e.g., Science" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="grade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeLevels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                       {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Add Book
                    </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {books.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <SpotlightCard
              key={book.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div className="relative aspect-[3/4] w-full bg-muted">
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={book.imageHint}
                    unoptimized={book.coverImage.startsWith('blob:')}
                  />
                </div>
              </CardContent>
              <div className="p-4">
                <p className="truncate font-semibold">{book.title}</p>
                <p className="text-sm text-muted-foreground">
                  Grade {book.grade}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
            <Book className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Your Library is Empty</h3>
            <p className="mt-2 text-muted-foreground">Click "Add Book" to start digitizing your textbooks.</p>
        </div>
      )}
    </div>
  );
}
