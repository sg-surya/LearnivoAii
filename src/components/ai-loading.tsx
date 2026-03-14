"use client";

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const defaultMessages = [
  "Analyzing your request...",
  "Consulting the knowledge base...",
  "Brainstorming creative ideas...",
  "Structuring the content...",
  "Polishing the final output...",
  "Adding a touch of magic...",
];

interface AILoadingProps {
  messages?: string[];
  className?: string;
}

export function AILoading({ messages = defaultMessages, className }: AILoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000); // Change message every 2 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 text-center text-muted-foreground p-8", className)}>
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-primary/20 animate-pulse [animation-delay:0.5s]"></div>
        <Bot className="relative h-16 w-16 text-primary" />
      </div>
      <div className="relative h-5 w-48 overflow-hidden">
        <p key={currentMessageIndex} className="animate-fade-in-out absolute inset-0 w-full text-center font-medium">
          {messages[currentMessageIndex]}
        </p>
      </div>
    </div>
  );
}
