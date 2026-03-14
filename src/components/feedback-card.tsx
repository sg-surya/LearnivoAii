"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const feedbackSchema = z.object({
  comment: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackCardProps {
  assetId: string;
  assetType: string;
}

export function FeedbackCard({ assetId, assetType }: FeedbackCardProps) {
  const [rating, setRating] = useState<"good" | "bad" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      comment: "",
    },
  });

  const handleRating = (newRating: "good" | "bad") => {
    if (rating === newRating) {
      setRating(null); // Allow deselecting
    } else {
      setRating(newRating);
    }
  };

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!rating) {
      toast({
        title: "Rating required",
        description: "Please select thumbs up or thumbs down.",
        variant: "destructive",
      });
      return;
    }
    if (!user || !firestore) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackRef = collection(firestore, 'assetFeedbacks');
      await addDoc(feedbackRef, {
        assetId,
        assetType,
        rating,
        userId: user.uid,
        comment: data.comment || "",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for helping us improve!",
        variant: "success",
      });
      setRating(null);
      form.reset();
    } catch (error) {
      console.error("Feedback submission error:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your feedback. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rate this Generation</CardTitle>
        <CardDescription>Your feedback helps us improve.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={rating === "good" ? "secondary" : "outline"}
              size="icon"
              onClick={() => handleRating("good")}
              className={rating === "good" ? "border-2 border-green-500" : ""}
            >
              <ThumbsUp className="h-5 w-5 text-green-500" />
            </Button>
            <Button
              type="button"
              variant={rating === "bad" ? "destructive" : "outline"}
              size="icon"
              onClick={() => handleRating("bad")}
            >
              <ThumbsDown className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              {rating === "bad" && (
                <Textarea
                  {...form.register("comment")}
                  placeholder="What was wrong with it? (e.g., 'This is scientifically inaccurate', 'The labels are overlapping')"
                />
              )}
            </div>
          </div>
           {rating && (
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
           )}
        </form>
      </CardContent>
    </Card>
  );
}
