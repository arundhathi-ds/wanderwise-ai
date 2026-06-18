import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Compass } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · Smart Travel Explorer" },
      { name: "description", content: "Sign in or create an account to use Smart Travel Explorer." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");
const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().max(50, "Display name is too long").optional(),
});
const signInSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password") });

type FieldErrors = Partial<Record<"email" | "password" | "displayName", string>>;

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Incorrect email or password.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("email not confirmed")) return "Please confirm your email before signing in.";
  if (m.includes("pwned") || m.includes("compromised"))
    return "This password has appeared in a data breach. Please choose a different one.";
  if (m.includes("weak password") || m.includes("password should"))
    return "Password is too weak. Use at least 8 characters with letters and numbers.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [errors, setErrors] = useState<FieldErrors>({});

  function zodToErrors(err: z.ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
      const key = issue.path[0] as keyof FieldErrors | undefined;
      if (key && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) return setErrors(zodToErrors(parsed.error));
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = signUpSchema.safeParse({ email, password, displayName });
    if (!parsed.success) return setErrors(zodToErrors(parsed.error));
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: parsed.data.displayName || parsed.data.email.split("@")[0] },
      },
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    if (!data.session) {
      toast.success("Account created! Check your email to confirm, then sign in.");
      setMode("signin");
      setPassword("");
      return;
    }
    toast.success("Account created! You're signed in.");
    navigate({ to: "/dashboard" });
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return setErrors({ email: parsed.error.issues[0].message });
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error.message));
    toast.success("Reset link sent — check your inbox.");
    setMode("signin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary/40 via-background to-accent/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Compass className="h-4 w-4 text-primary" /> Smart Travel Explorer
        </Link>

        {mode === "forgot" ? (
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <h1 className="font-display text-2xl">Reset password</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll email you a secure link to set a new password.
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send reset link"}
            </Button>
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="block w-full text-center text-sm text-muted-foreground hover:underline"
            >
              ← Back to sign in
            </button>
          </form>
        ) : (
          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="se">Email</Label>
                  <Input id="se" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sp">Password</Label>
                  <Input id="sp" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:underline"
                  onClick={() => setMode("forgot")}
                >
                  Forgot password?
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="dn">Display name</Label>
                  <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Wanderer" />
                </div>
                <div>
                  <Label htmlFor="ue">Email</Label>
                  <Input id="ue" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="up">Password</Label>
                  <Input id="up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="mt-1 text-xs text-muted-foreground">At least 6 characters.</p>
                </div>
                <Button className="w-full" disabled={loading}>
                  {loading ? "Creating…" : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
