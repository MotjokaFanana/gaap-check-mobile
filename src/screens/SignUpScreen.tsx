import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppHeader from "@/components/AppHeader";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const updateHeadSEO = () => {
  document.title = "Sign Up | GAAP Prototype";
  const desc = "Create your GAAP Prototype inspector account.";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + "/signup");
};

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    updateHeadSEO();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (error) {
      toast({ title: "Sign up failed", description: error.message });
      return;
    }

    if (data?.session) {
      toast({ title: "Account created", description: "Welcome!" });
      const redirect = params.get("redirect") || "/";
      navigate(redirect);
    } else {
      toast({ title: "Confirm your email", description: "Check your inbox to verify your account." });
      navigate("/login");
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-md mx-auto p-6">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Sign up to start performing inspections</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating account..." : "Create Account"}</Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account? <Link to="/login" className="underline">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SignUpScreen;
