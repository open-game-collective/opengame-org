import { useState } from "react";
import { ProviderAuthContext } from "../root";

// Define types for the linked accounts
interface LinkedAccount {
  gameId: string;
  gameUserId: string;
  linkedAt: string;
  gameName?: string;
}

// Define types for the render props
interface LinkedAccountsListProps {
  accounts: LinkedAccount[];
  isLoading: boolean;
  error: string | null;
}

interface UnlinkAccountProps {
  onUnlink: () => Promise<boolean>;
  isUnlinking: boolean;
  error: string | null;
}

interface InitiateLinkingProps {
  onInitiate: () => Promise<{ linkToken: string }>;
  isInitiating: boolean;
  error: string | null;
}

export function AccountLinking() {
  const [showQRCode, setShowQRCode] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState("");

  // List of available games for linking
  const availableGames = [
    { id: "standardelectric", name: "Standard Electric" },
    { id: "trivia", name: "Trivia Game" },
    // Add more games as needed
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Account Linking</h2>

      {/* Display linked accounts */}
      <ProviderAuthContext.LinkedAccounts>
        <h3 className="text-lg font-medium mb-3">Your Linked Accounts</h3>

        <ProviderAuthContext.LinkedAccountsList>
          {({ accounts, isLoading, error }: LinkedAccountsListProps) => (
            <div>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : accounts.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {accounts.map((account: LinkedAccount) => (
                    <li
                      key={account.gameId}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">
                          {account.gameName || account.gameId}
                        </span>
                        <p className="text-sm text-gray-500">
                          Linked on{" "}
                          {new Date(account.linkedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ProviderAuthContext.UnlinkAccount
                        gameId={account.gameId}
                      >
                        {({
                          onUnlink,
                          isUnlinking,
                          error,
                        }: UnlinkAccountProps) => (
                          <button
                            onClick={onUnlink}
                            disabled={isUnlinking}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            {isUnlinking ? "Unlinking..." : "Unlink"}
                          </button>
                        )}
                      </ProviderAuthContext.UnlinkAccount>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 py-2">No linked accounts yet.</p>
              )}
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
          )}
        </ProviderAuthContext.LinkedAccountsList>
      </ProviderAuthContext.LinkedAccounts>

      {/* Link new account section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium mb-3">Link New Account</h3>

        {showQRCode ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Scan QR Code or Use Link</h4>
              <button
                onClick={() => {
                  setShowQRCode(false);
                  setLinkToken(null);
                  setLinkUrl(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>

            {linkToken && linkUrl && (
              <div className="flex flex-col items-center">
                {/* QR Code would go here - you can use a QR code library */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <div className="text-center text-sm text-gray-500 mb-2">
                    QR Code Placeholder
                  </div>
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">QR Code</span>
                  </div>
                </div>

                <div className="w-full">
                  <p className="text-sm text-gray-500 mb-2">
                    Or use this link:
                  </p>
                  <div className="flex">
                    <input
                      type="text"
                      value={linkUrl}
                      readOnly
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(linkUrl);
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-r-md text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This link will expire in 15 minutes.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label
                htmlFor="gameSelect"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Game
              </label>
              <select
                id="gameSelect"
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select a game...</option>
                {availableGames.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            <ProviderAuthContext.InitiateLinking gameId={selectedGameId}>
              {({ onInitiate, isInitiating, error }: InitiateLinkingProps) => (
                <div>
                  <button
                    onClick={async () => {
                      if (!selectedGameId) {
                        alert("Please select a game first");
                        return;
                      }

                      try {
                        const { linkToken } = await onInitiate();
                        setLinkToken(linkToken);

                        // Create a link URL for the selected game
                        // In production, use the actual game URL
                        const gameUrl =
                          selectedGameId === "standardelectric"
                            ? "https://standardelectric.opengame.org"
                            : `https://${selectedGameId}.opengame.org`;

                        setLinkUrl(`${gameUrl}/link?token=${linkToken}`);
                        setShowQRCode(true);
                      } catch (err) {
                        console.error("Error initiating linking:", err);
                      }
                    }}
                    disabled={isInitiating || !selectedGameId}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {isInitiating ? "Generating Link..." : "Generate Link"}
                  </button>
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                </div>
              )}
            </ProviderAuthContext.InitiateLinking>
          </div>
        )}
      </div>
    </div>
  );
}
