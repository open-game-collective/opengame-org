import { useEffect, useState } from "react";
import { EmailVerification } from "./EmailVerification";

export function UserDrawer({ 
  userId,
  sessionToken,
}: { 
  userId: string;
  sessionToken: string;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEmail() {
      try {
        const response = await fetch(`/api/user/${userId}/email`);
        if (response.ok) {
          const data = await response.json() as { email: string | null };
          setEmail(data.email);
        }
      } catch (error) {
        console.error('Failed to fetch email:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmail();
  }, [userId]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Account Settings</h2>
      
      {/* User ID section */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">User ID</label>
        <div className="text-sm text-gray-600">{userId}</div>
      </div>

      {/* Email section - only show if we're done loading */}
      {!isLoading && (
        <div className="mb-6">
          {email ? (
            // Show verified email
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {email}
                <span className="text-green-500 text-xs">(verified)</span>
              </div>
            </div>
          ) : (
            // Show email verification UI
            <div>
              <h3 className="text-sm font-medium mb-2">Verify Email</h3>
              <EmailVerification
                sessionToken={sessionToken}
                onVerify={(verifiedEmail: string) => setEmail(verifiedEmail)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 