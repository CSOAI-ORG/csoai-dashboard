import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Medium", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-green-500" };
}

export function EmailPasswordSignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const registerMutation = trpc.emailAuth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created — you're signed in.");
      // Registration now issues a session, so land the user in the app directly.
      window.location.replace("/dashboard");
    },
    onError: (err) => {
      console.error("[Signup] Error:", err);
      // Provide user-friendly error messages
      if (err.message.includes("CONFLICT") || err.message.includes("already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (err.message.includes("fetch") || err.message.includes("network")) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    },
  });

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    registerMutation.mutate({ 
      email: email.trim().toLowerCase(), 
      password, 
      name: name.trim() 
    });
  };

  const requirements = [
    { met: password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(password), text: "One uppercase letter" },
    { met: /[a-z]/.test(password), text: "One lowercase letter" },
    { met: /[0-9]/.test(password), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "One special character" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col" data-testid="signup-form">
      {error && (
        <Alert variant="destructive" className="text-sm" data-testid="signup-error-alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription data-testid="signup-error-message">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={registerMutation.isPending}
          autoComplete="name"
          autoCapitalize="words"
          className="h-11 text-base"
          data-testid="signup-name-input"
        />
      </div>

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
          disabled={registerMutation.isPending}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck="false"
          className="h-11 text-base"
          data-testid="signup-email-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={registerMutation.isPending}
          autoComplete="new-password"
          className="h-11 text-base"
          data-testid="signup-password-input"
        />
        
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {passwordStrength.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  {req.met ? (
                    <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={req.met ? "text-green-600" : "text-muted-foreground"}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={registerMutation.isPending}
          autoComplete="new-password"
          className="h-11 text-base"
          data-testid="signup-confirm-password-input"
        />
        {confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            {passwordsMatch ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-green-600">Passwords match</span>
              </>
            ) : (
              <>
                <X className="h-3 w-3 text-red-500" />
                <span className="text-red-600">Passwords do not match</span>
              </>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full h-11 text-base font-medium mt-4 mb-2 touch-manipulation"
        disabled={registerMutation.isPending || (confirmPassword.length > 0 && !passwordsMatch)}
        data-testid="signup-submit-button"
      >
        {registerMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline touch-manipulation" data-testid="signup-login-link">
          Sign in
        </a>
      </p>
    </form>
  );
}
