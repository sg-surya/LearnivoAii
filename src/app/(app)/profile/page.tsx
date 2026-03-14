
"use client";

import Image from "next/image";
import { useUser } from "@/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Building, Edit, GraduationCap, Book, Star, Hash } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";
import { useEffect, useState, useRef, type MouseEvent } from "react";
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


export default function ProfilePage() {
  const { profile } = useUser();
  const [coverUrl, setCoverUrl] = useState<string | undefined>();

  useEffect(() => {
    const defaultCover = PlaceHolderImages.find((img) => img.id === "hero-image");
    setCoverUrl(profile?.coverUrl || defaultCover?.imageUrl);
  }, [profile]);


  return (
    <div className="flex flex-col gap-6">
      <SpotlightCard className="overflow-hidden">
        <div className="relative h-48 w-full bg-muted">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt="Profile cover"
              fill
              className="object-cover"
              data-ai-hint="abstract background"
              unoptimized={coverUrl.startsWith('blob:') ? true : undefined}
            />
          )}
        </div>
        <div className="p-6">
          <div className="relative -mt-20 flex items-end gap-6">
            <Avatar className="h-28 w-28 border-4 border-card">
              {profile?.profilePicture && <AvatarImage src={profile.profilePicture} unoptimized={profile.profilePicture.startsWith('blob:') ? true : undefined} />}
              <AvatarFallback className="text-4xl">
                {profile?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full items-center justify-between">
                <div>
                    <h1 className="font-headline text-3xl font-bold">{profile?.name}</h1>
                    <p className="text-lg text-muted-foreground">{profile?.instituteName}</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/settings">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <SpotlightCard>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        {profile?.role === 'Teacher' 
                          ? `Dedicated and passionate educator with a focus on creating engaging and effective learning environments. Experienced in teaching ${profile?.subjects || 'various subjects'}.`
                          : `Enthusiastic and curious learner, currently enrolled in ${profile?.class || 'a class'} and exploring the world of ${profile?.stream || 'academics'}.`
                        }
                    </p>
                </CardContent>
            </SpotlightCard>
        </div>
        <div className="lg:col-span-1">
            <SpotlightCard>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">{profile?.instituteName || "School name not set"}</span>
                    </div>
                    {profile?.role === 'Teacher' ? (
                      <>
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{profile?.subjects || "Subjects not set"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{profile?.experience || "Experience not set"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{profile?.qualification || "Qualification not set"}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{profile?.class || "Class not set"}</span>
                        </div>
                         <div className="flex items-center gap-3">
                          <Book className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">{profile?.stream || "Stream not set"}</span>
                        </div>
                      </>
                    )}
                </CardContent>
            </SpotlightCard>
        </div>
      </div>
    </div>
  );
}
