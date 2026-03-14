"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle, Layers, Map, HelpCircle, ScanLine, Phone, MapPin, Mail as MailIcon, DraftingCompass, MessageCircle, GitBranch, Shield, User, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const DashboardWireframe = () => (
    <div className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-black/40 p-3 shadow-2xl shadow-primary/20 backdrop-blur-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="aspect-[16/9] w-full rounded-2xl bg-[#0a0a0a] p-6 border border-white/5 relative z-10">
            <div className="flex h-full w-full gap-6">
                <div className="w-1/5 rounded-xl bg-white/5 p-4 hidden md:block border border-white/5">
                    <div className="h-6 w-3/4 rounded-full bg-primary/20 mb-8"></div>
                    <div className="space-y-4">
                        <div className="h-2 w-full rounded-full bg-white/10"></div>
                        <div className="h-2 w-full rounded-full bg-white/10"></div>
                        <div className="h-2 w-5/6 rounded-full bg-primary/40"></div>
                        <div className="h-2 w-full rounded-full bg-white/10"></div>
                    </div>
                </div>
                <div className="flex-1 rounded-xl bg-white/5 p-6 border border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-6 w-1/3 rounded-full bg-white/10"></div>
                        <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/30"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="h-24 rounded-2xl bg-black/40 border border-primary/10"></div>
                        <div className="h-24 rounded-2xl bg-black/40 border border-primary/10"></div>
                        <div className="h-24 rounded-2xl bg-black/40 border border-primary/10"></div>
                        <div className="h-32 rounded-2xl bg-primary/5 border border-primary/20 col-span-2"></div>
                        <div className="h-32 rounded-2xl bg-black/40 border border-primary/10"></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute -top-20 -left-20 h-64 w-64 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
    </div>
);

const features = [
  {
    icon: <DraftingCompass className="h-6 w-6" />,
    title: "AI Lesson Planner",
    description: "Automate complex lesson plans in minutes, perfectly aligned with Indian curricula.",
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Visual Aids",
    description: "Generate diagrams and charts instantly to explain abstract concepts visually.",
  },
  {
    icon: <Map className="h-6 w-6" />,
    title: "Hyper-Local Content",
    description: "Explain concepts using local landmarks and regional languages for deeper connection.",
  },
  {
    icon: <HelpCircle className="h-6 w-6" />,
    title: "Quiz Generator",
    description: "Create Bloom's Taxonomy-aligned assessments from any textbook or topic.",
  },
  {
    icon: <MailIcon className="h-6 w-6" />,
    title: "Communication",
    description: "Draft professional, multi-lingual emails to parents with empathy and clarity.",
  },
  {
    icon: <ScanLine className="h-6 w-6" />,
    title: "Paper Digitizer",
    description: "Instantly convert handwritten or printed question papers into editable formats.",
  },
];

const SpotlightCard = ({ children, className, ...props }: { children: React.ReactNode; className?: string, onClick?: () => void }) => {
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
      <div ref={cardRef} onMouseMove={handleMouseMove} className={cn("spotlight-card border border-white/10 overflow-hidden", className)} {...props}>
        {children}
      </div>
    );
};

export default function LandingPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | "admin" | null>(null);
  const router = useRouter();

  const handleRoleSelect = (role: "teacher" | "student" | "admin") => {
    setSelectedRole(role);
    router.push(`/signup/${role}`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#050505] text-white font-sans">
      <div className="fixed inset-0 -z-10 bg-grid-pattern opacity-[0.03]"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_60%)]"></div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight">
              Learnivo <span className="text-primary">Ai</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
              {["Features", "Pricing", "Enterprise"].map((item) => (
                  <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 hover:text-primary transition-colors">
                      {item}
                  </Link>
              ))}
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="rounded-full font-bold text-white/70 hover:text-white">
              <Link href="/login">Login</Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full px-8 font-bold shadow-xl shadow-primary/20 bg-primary text-black hover:bg-primary/90">Get Started</Button>
              </DialogTrigger>
              <DialogContent className="p-0 border-none sm:max-w-2xl bg-transparent">
                <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-10 text-center space-y-4 bg-primary/5 border-b border-white/5">
                        <Badge className="font-bold tracking-widest uppercase px-4 py-1 bg-primary text-black">Step 1</Badge>
                        <DialogTitle className="font-headline text-5xl font-bold tracking-tight">Choose Your <span className="text-primary">Journey</span></DialogTitle>
                        <DialogDescription className="text-xl text-white/50">Unlock specialized AI tools tailored for your role.</DialogDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
                         {[
                            { id: 'teacher' as const, label: 'Teacher', icon: User, desc: 'Automate content & admin' },
                            { id: 'student' as const, label: 'Student', icon: GraduationCap, desc: 'Personalized AI learning' },
                            { id: 'admin' as const, label: 'Admin', icon: Shield, desc: 'Manage institution scale' }
                         ].map((role) => (
                            <button
                                key={role.id}
                                className={cn(
                                    "group p-8 flex flex-col items-center text-center gap-6 rounded-[2.5rem] border transition-all duration-500 hover:scale-105",
                                    selectedRole === role.id ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'bg-white/[0.02] border-white/5 hover:border-primary/40'
                                )}
                                onClick={() => handleRoleSelect(role.id)}
                            >
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 transition-all duration-500 group-hover:bg-primary/20 group-hover:text-primary group-hover:rotate-6">
                                    <role.icon className="h-10 w-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-headline text-2xl font-bold">{role.label}</h3>
                                    <p className="text-xs text-white/40 font-medium leading-relaxed">{role.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container relative py-24 md:py-40">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto space-y-10">
              <Badge variant="outline" className="px-6 py-1.5 border-primary/30 text-primary font-bold tracking-widest uppercase bg-primary/5 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <Sparkles className="mr-2 h-3.5 w-3.5 fill-primary" /> The Future of Intelligent Education
              </Badge>
              <h1 className="font-headline text-7xl md:text-[9rem] font-bold tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  Teach with <br/>
                  <span className="text-primary italic relative">
                      Intelligence.
                      <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/30 blur-sm"></div>
                  </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/50 max-w-3xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                  Learnivo Ai is the ultimate intelligence layer for Indian educators. Automate administration, generate hyper-local content, and unlock student potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 w-full justify-center pt-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-700">
                  <Button size="lg" className="rounded-full h-16 px-12 text-xl font-bold shadow-2xl shadow-primary/40 bg-primary text-black hover:scale-[1.02] transition-transform" onClick={() => setIsDialogOpen(true)}>
                      Start Free Trial <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full h-16 px-12 text-xl font-bold border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all">
                      Explore Tools
                  </Button>
              </div>
              <div className="pt-20 w-full flex justify-center perspective-[2000px] animate-in fade-in zoom-in-95 duration-1000 delay-1000">
                  <div className="rotate-x-12 hover:rotate-x-0 transition-transform duration-1000 ease-out">
                      <DashboardWireframe />
                  </div>
              </div>
          </div>
        </section>

        <section id="features" className="container py-32 border-t border-white/5">
            <div className="text-center mb-24 space-y-4">
                <h2 className="font-headline text-5xl font-bold">Designed for <span className="text-primary">Impact.</span></h2>
                <p className="text-white/50 text-xl max-w-2xl mx-auto">We've automated the heavy lifting so you can focus on what matters most: teaching.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                    <SpotlightCard key={i} className="bg-white/[0.02] p-8 rounded-[2.5rem] hover:bg-white/[0.05] transition-all hover:translate-y-[-8px] group">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            {feature.icon}
                        </div>
                        <h3 className="font-headline text-2xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-white/40 text-base leading-relaxed">{feature.description}</p>
                    </SpotlightCard>
                ))}
            </div>
        </section>

        <section id="pricing" className="container py-32 bg-primary/[0.02] rounded-[4rem] border border-white/5">
          <div className="text-center space-y-4 mb-20">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-primary/20">Pricing</Badge>
              <h2 className="font-headline text-6xl font-bold">Simple <span className="text-primary">Economics.</span></h2>
              <p className="text-white/50 text-xl">Empowering schools of all sizes across India.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                  { name: "Basic", price: "Free", desc: "For individual educators", features: ["10 AI generations / month", "Core Academic Tools", "Community Support", "Basic Workspace"] },
                  { name: "Pro", price: "₹499", desc: "For power teachers", popular: true, features: ["Unlimited generations", "Premium Visual Aids", "AI Answer Evaluation", "Advanced Paper Digitizer", "Priority Support"] },
                  { name: "Enterprise", price: "Custom", desc: "For entire institutions", features: ["Unlimited users", "Custom Branding", "Admin Management Suite", "API Access", "Dedicated Onboarding"] }
              ].map((plan, i) => (
                  <SpotlightCard key={i} className={cn("flex flex-col p-12 rounded-[3rem] bg-black/40 backdrop-blur-2xl transition-all", plan.popular && "border-primary/50 border-2 shadow-2xl shadow-primary/10 relative scale-105 z-10")}>
                      {plan.popular && <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1.5 font-bold uppercase tracking-widest bg-primary text-black">Most Popular</Badge>}
                      <h3 className="font-headline text-3xl font-bold">{plan.name}</h3>
                      <p className="text-white/40 text-sm mt-3">{plan.desc}</p>
                      <div className="my-10">
                          <span className="text-6xl font-bold tracking-tighter">{plan.price}</span>
                          {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-white/40 text-lg ml-2">/ month</span>}
                      </div>
                      <ul className="space-y-5 mb-12 flex-1">
                          {plan.features.map(f => (
                              <li key={f} className="flex items-center gap-4 font-medium text-sm text-white/70">
                                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                      <CheckCircle className="h-3 w-3 text-primary" />
                                  </div>
                                  {f}
                              </li>
                          ))}
                      </ul>
                      <Button variant={plan.popular ? "default" : "outline"} className={cn("rounded-full h-14 font-bold text-lg", plan.popular ? "bg-primary text-black hover:bg-primary/90" : "border-white/10 hover:border-primary/50")}>
                          Get Started
                      </Button>
                  </SpotlightCard>
              ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 mt-32 py-24 bg-black/40">
        <div className="container grid md:grid-cols-4 gap-16">
          <div className="space-y-8">
              <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black">
                      <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="font-headline text-2xl font-bold">Learnivo <span className="text-primary">Ai</span></span>
              </Link>
              <p className="text-base text-white/40 leading-relaxed">
                  The intelligent infrastructure for modern Indian classrooms. Designed and engineered in Bengaluru.
              </p>
              <div className="flex gap-4">
                  <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 text-white/50 hover:text-primary transition-colors"><MessageCircle className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 text-white/50 hover:text-primary transition-colors"><GitBranch className="h-5 w-5" /></Button>
              </div>
          </div>
          <div className="space-y-8 pt-2">
              <h4 className="font-headline font-bold uppercase tracking-[0.2em] text-xs text-primary">Platform</h4>
              <ul className="space-y-4 text-sm font-medium text-white/50">
                  <li><Link href="#" className="hover:text-white transition-colors">Academic Tools</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Visual AI</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              </ul>
          </div>
          <div className="space-y-8 pt-2">
              <h4 className="font-headline font-bold uppercase tracking-[0.2em] text-xs text-primary">Resources</h4>
              <ul className="space-y-4 text-sm font-medium text-white/50">
                  <li><Link href="#" className="hover:text-white transition-colors">Case Studies</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="#" className="hover:text-white transition-colors">Support Center</Link></li>
              </ul>
          </div>
          <div className="space-y-8 pt-2">
              <h4 className="font-headline font-bold uppercase tracking-[0.2em] text-xs text-primary">Contact</h4>
              <ul className="space-y-5 text-sm font-medium text-white/50">
                  <li className="flex items-center gap-4 hover:text-white transition-colors"><Phone className="h-4 w-4 text-primary" /> +91 98765 43210</li>
                  <li className="flex items-center gap-4 hover:text-white transition-colors"><MailIcon className="h-4 w-4 text-primary" /> hello@learnivo.app</li>
                  <li className="flex items-center gap-4 hover:text-white transition-colors"><MapPin className="h-4 w-4 text-primary" /> Bengaluru, KA</li>
              </ul>
          </div>
        </div>
        <div className="container mt-24 pt-10 border-t border-white/5 text-center text-xs font-bold uppercase tracking-[0.3em] text-white/20">
            © {new Date().getFullYear()} Learnivo Ai. Empowering India's Future.
        </div>
      </footer>
    </div>
  );
}
