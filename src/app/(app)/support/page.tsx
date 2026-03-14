
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare } from "lucide-react";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "You can reset your password by clicking on the 'Forgot Password' link on the login page. An email will be sent to you with instructions.",
  },
  {
    question: "How do I use the Lesson Planner tool?",
    answer:
      "Navigate to the Lesson Planner from the sidebar, fill in the topic, grade, and objectives, and click 'Generate Plan'. The AI will create a week-long plan for you.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security very seriously. All your data is encrypted and stored securely. We follow industry best practices to protect your information.",
  },
    {
    question: "Can I use Sahayak AI on multiple devices?",
    answer:
      "Absolutely! Sahayak AI is a web-based platform, so you can access your account from any device with an internet browser, including your desktop, laptop, tablet, or smartphone.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold">Support & Help Center</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          We're here to help. Find answers to your questions below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Can't find an answer? Send us a message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Describe your issue..." rows={5} />
              </div>
              <Button type="submit" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Other Ways to Reach Us</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-md border p-4">
            <Mail className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-muted-foreground">info@sahayak.ai</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-md border p-4">
            <Phone className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-muted-foreground">+91 98765 43210</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
