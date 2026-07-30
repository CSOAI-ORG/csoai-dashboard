import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function EmailPasswordLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = trpc.emailAuth.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful!");
      // Use replace to avoid back button issues on mobile
      window.location.replace("/dashboard");
    },
    onError: (err) => {
      console.error("[Login] Error:", err);
      // Provide user-friendly error messages
      if (err.message.includes("UNAUTHORIZED") || err.message.includes("Invalid")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("TOO_MANY_REQUESTS")) {
        setError("Too many login attempts. Please wait 15 minutes and try again.");
      } else if (err.message.includes("fetch") || err.message.includes("network")) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Basic validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    
    loginMutation.mutate({ email: email.trim().toLowerCase(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
      {error && (
        <Alert variant="destructive" className="text-sm" data-testid="login-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription data-testid="login-error-message">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loginMutation.isPending}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="h-11 text-base"
          data-testid="login-email-input"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <a
            href="/forgot-password"
            className="text-xs text-primary hover:underline touch-manipulation"
            data-testid="login-forgot-password-link"
          >
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loginMutation.isPending}
          autoComplete="current-password"
          className="h-11 text-base"
          data-testid="login-password-input"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 text-base font-medium touch-manipulation"
        disabled={loginMutation.isPending}
        data-testid="login-submit-button"
      >
        {loginMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Don't have an account?{" "}
        <a href="/signup" className="text-primary hover:underline touch-manipulation" data-testid="login-signup-link">
          Create one
        </a>
      </p>
    </form>
  );
}
