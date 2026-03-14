
"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { digitizePaperAction } from "@/app/actions/digitize-paper";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud, FileText, FileDown, ScanLine, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useWorkspace } from "@/context/workspace-context";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase";
import { FeedbackCard } from "@/components/feedback-card";
import { AILoading } from "@/components/ai-loading";
import { SpotlightCard } from "@/components/shared/spotlight-card";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  isProcessed: boolean;
}

export default function PaperDigitizerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ content: string, assetId: string | null} | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();
  const { addAsset } = useWorkspace();
  const { profile } = useUser();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      preview: URL.createObjectURL(file),
      isProcessed: false,
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const processFiles = async () => {
    const filesToProcess = files.filter(f => !f.isProcessed);
    if (filesToProcess.length === 0) {
      toast({ title: "No new files to process." });
      return;
    }

    setIsLoading(true);
    let currentContent = result?.content || "";
    let finalAssetId: string | null = null;

    for (const uploadedFile of filesToProcess) {
      try {
        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile.file);
        });

        const response = await digitizePaperAction({
          photoDataUri: fileData,
          existingContent: currentContent,
        });

        currentContent = response.formattedContent;
        setResult({ content: currentContent, assetId: null });
        setFiles(prev => prev.map(f => f.id === uploadedFile.id ? { ...f, isProcessed: true } : f));
      } catch (error) {
        console.error(error);
        toast({
          title: "Something went wrong",
          description: `Failed to digitize ${uploadedFile.file.name}.`,
          variant: "destructive",
        });
        break;
      }
    }
    
    if (currentContent) {
        finalAssetId = await addAsset({
            type: "Digitized Paper",
            name: `Digitized Paper - ${new Date().toLocaleString()}`,
            content: { formattedContent: currentContent },
        });
    }

    setResult({ content: currentContent, assetId: finalAssetId });
    setIsLoading(false);
  };
  
  const exportAsTxt = async () => {
    if (!result?.content) return;
    const { htmlToText } = await import("html-to-text");
    const { saveAs } = await import("file-saver");
    const text = htmlToText(result.content, { wordwrap: 130 });
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "digitized-paper.txt");
  };

  const exportAsDocx = async () => {
    if (!result?.content) return;
    const htmlDocx = (await import('html-docx-js/dist/html-docx')).default;
    const { saveAs } = await import("file-saver");
    const content = `<!DOCTYPE html><html><body>${result.content}</body></html>`;
    const fileData = htmlDocx.asBlob(content);
    saveAs(fileData, 'digitized-paper.docx');
  };

  const exportAsPdf = async () => {
    if (!result?.content) return;
    const input = document.getElementById('pdf-content');
    if (input) {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      let width = pdfWidth;
      let height = width / ratio;
      if (height > pdfHeight) {
          height = pdfHeight;
          width = height * ratio;
      }
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save("digitized-paper.pdf");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <SpotlightCard className="sticky top-6 bg-black/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Paper Digitizer</CardTitle>
            <CardDescription>Upload handwritten paper pages to convert them into clean digital assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/50">
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center text-muted-foreground">
                    <UploadCloud className="w-10 h-10 mb-3" />
                    <p className="mb-2 text-sm">{isDragActive ? "Drop files here..." : "Click or drag to add pages"}</p>
                </div>
              </div>
            <div className="space-y-2">
              <Label>Uploaded Pages</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {files.map((uploadedFile, index) => (
                  <div key={uploadedFile.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                    <div className="flex items-center gap-3">
                      <Image src={uploadedFile.preview} alt={uploadedFile.file.name} width={40} height={40} className="object-cover rounded-sm aspect-square"/>
                      <span className="text-sm font-medium truncate flex-1">{index + 1}. {uploadedFile.file.name}</span>
                       {uploadedFile.isProcessed && <Badge variant="secondary">Processed</Badge>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFile(uploadedFile.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={processFiles} className="w-full" disabled={isLoading || files.filter(f => !f.isProcessed).length === 0}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><ScanLine className="mr-2 h-4 w-4" />Digitize Pages</>}
            </Button>
          </CardContent>
        </SpotlightCard>
      </div>
      <div className="lg:col-span-2">
        <SpotlightCard className="min-h-[calc(100vh-10rem)] bg-black/40 border-white/10 rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-2xl">Digitized Result</CardTitle>
                    <CardDescription>Review and export your digitized content.</CardDescription>
                </div>
                {result?.content && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportAsTxt}><FileText className="mr-2 h-4 w-4" /> TXT</Button>
                        <Button variant="outline" onClick={exportAsDocx}>DOCX</Button>
                        <Button variant="outline" onClick={exportAsPdf}><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
                    </div>
                )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && !result?.content ? <div className="flex h-96 items-center justify-center"><AILoading /></div> : 
             result?.content ? <div id="pdf-content" className="prose prose-sm max-w-none rounded-md border bg-muted p-4 dark:prose-invert" dangerouslySetInnerHTML={{ __html: result.content }} /> :
             <div className="flex h-96 flex-col items-center justify-center text-center text-muted-foreground">
                <FileText className="mb-4 h-12 w-12 opacity-50" />
                <p className="font-semibold">Your digitized content will appear here.</p>
             </div>
            }
          </CardContent>
          {result?.assetId && <CardFooter><FeedbackCard assetId={result.assetId} assetType="Digitized Paper" /></CardFooter>}
        </SpotlightCard>
      </div>
    </div>
  );
}
