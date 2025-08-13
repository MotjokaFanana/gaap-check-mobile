import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import AppHeader from "@/components/AppHeader";
import { toast } from "@/hooks/use-toast";

const LoginScreen = () => {
  const { signIn, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const redirect = params.get("redirect") || "/";
      navigate(redirect);
    }
  }, [user, navigate, params]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error });
    } else {
      toast({ title: "Welcome" });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <AppHeader />
      <section className="max-w-md mx-auto p-6">
        <Card className="shadow-[var(--shadow-elegant)]">
          <CardHeader>
            <CardTitle>Inspector Login</CardTitle>
            <CardDescription>Sign in with your email and password</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing in..." : "Sign In"}</Button>
              <p className="text-sm text-muted-foreground text-center">
                Don’t have an account? <Link to="/signup" className="underline">Create one</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default LoginScreen;
