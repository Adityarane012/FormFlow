"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Mail, Users, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
        toast.error("Please fill in all fields");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      toast.success("Account created successfully!");
      router.push("/builder");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 dark:bg-background">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] border border-border bg-card p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 shadow-lg dark:bg-foreground">
             <span className="text-xl font-bold text-white dark:text-background font-sans">F</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign up</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">Start building beautiful forms today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="John Doe"
                className="pl-10 rounded-xl h-12"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-10 rounded-xl h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                className="pl-10 rounded-xl h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-foreground dark:text-background dark:hover:bg-foreground/90 font-bold shadow-lg flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                   Create account
                   <ArrowRight className="h-4 w-4" />
                </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-gray-900 hover:underline dark:text-foreground">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
