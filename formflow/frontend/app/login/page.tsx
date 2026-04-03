"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/builder");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to login");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6 dark:bg-background">
      <div className="w-full max-w-md space-y-8 rounded-[2.5rem] border border-border bg-card p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 shadow-lg dark:bg-foreground">
             <span className="text-xl font-bold text-white dark:text-background">F</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in</h1>
          <p className="mt-3 text-muted-foreground">Welcome back to FormFlow.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
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
                   Sign in
                   <ArrowRight className="h-4 w-4" />
                </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-gray-900 hover:underline dark:text-foreground">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
