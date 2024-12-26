import { useState } from "react";

interface EmailVerificationProps {
  sessionToken: string;
  onVerify: (email: string) => void;
}

interface EmailResponse {
  error?: string;
  retryAfter?: number;
}

export function EmailVerification({ sessionToken, onVerify }: EmailVerificationProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const requestCode = async () => {
    try {
      setIsResending(true);
      setError(null);
      
      const response = await fetch("/auth/email/code", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as EmailResponse;

      if (!response.ok) {
        if (response.status === 429 && data.retryAfter) {
          setCooldown(data.retryAfter);
          startCooldownTimer(data.retryAfter);
        }
        throw new Error(data.error || "Failed to send code");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsResending(false);
    }
  };

  const verifyCode = async () => {
    try {
      setError(null);
      
      const response = await fetch("/auth/email/verify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json() as EmailResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify code");
      }

      onVerify(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    }
  };

  const startCooldownTimer = (seconds: number) => {
    const interval = setInterval(() => {
      setCooldown((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {email && (
        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium">
            Verification Code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            placeholder="Enter 6-digit code"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      <div className="flex gap-4">
        {email && code ? (
          <button
            onClick={verifyCode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Verify
          </button>
        ) : (
          <button
            onClick={requestCode}
            disabled={isResending || cooldown > 0 || !email}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : isResending
              ? "Sending..."
              : "Send Code"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
} 