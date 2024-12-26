import { useState } from "react";
import { Link } from "react-router-dom";

// First, let's add proper typing for the user profile
interface UserProfile {
  email: string;
  discord: {
    connected: boolean;
    username: string;
    avatar: string;
  };
  ogcBalance: string;
  walletConnected: boolean;
  walletAddress: string | null;
}

// Add new interface for available games
interface GameMenuItem {
  id: string;
  name: string;
  status: "LIVE" | "BETA" | "UPCOMING";
  description: string;
  currentPlayers?: number;
  minPlayers: number;
  maxPlayers: number;
  entryFee?: string;
  thumbnail: string;
}

// Update the game history interface
interface GameHistoryItem {
  id: string;
  gameId: string;
  name: string;
  date: string;
  result: string;
  earnings: string;
  position: string;
  matchUrl: string; // Make this required
}

// Update the activity interface
interface ActivityItem {
  id: number;
  type: "AIRDROP" | "VEST";
  amount: string;
  timestamp: string;
  details: string;
  status: string;
  txHash: string;
  txUrl: string; // Make this required
}

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock data for active and historical games
  const activeGames = [
    {
      id: 1,
      name: "Trivia Jam",
      status: "LIVE",
      lastPlayed: "2024-03-10T15:30:00",
      players: 12500,
      userStats: {
        rank: 23,
        score: 1250,
        earnings: "2,500 OGC",
      },
    },
    {
      id: 2,
      name: "Run Set Jimmy",
      status: "BETA",
      lastPlayed: "2024-03-09T20:15:00",
      players: 500,
      userStats: {
        rank: 5,
        matches: 12,
        earnings: "5,000 OGC",
      },
    },
  ];

  // Update the mock data to ensure all items have URLs
  const gameHistory: GameHistoryItem[] = [
    {
      id: "match_abc123",
      gameId: "trivia-jam",
      name: "Trivia Jam",
      date: "2024-03-08T19:00:00",
      result: "Won",
      earnings: "1,000 OGC",
      position: "1st of 25",
      matchUrl: `/games/trivia-jam/results/abc123`,
    },
    {
      id: "match_def456",
      gameId: "run-set-jimmy",
      name: "Run Set Jimmy",
      date: "2024-03-07T18:30:00",
      result: "2nd Place",
      earnings: "750 OGC",
      position: "2nd of 12",
      matchUrl: `/games/run-set-jimmy/results/def456`,
    },
    // ... other history items
  ];

  const upcomingTournaments = [
    {
      id: 1,
      name: "Weekend Trivia Championship",
      game: "Trivia Jam",
      date: "2024-03-15T18:00:00",
      prizePool: "100,000 OGC",
      entryFee: "500 OGC",
      registered: true,
    },
    {
      id: 2,
      name: "Run Set Jimmy Beta Tournament",
      game: "Run Set Jimmy",
      date: "2024-03-16T20:00:00",
      prizePool: "50,000 OGC",
      entryFee: "250 OGC",
      registered: false,
    },
  ];

  // Update the userProfile with proper typing
  const userProfile: UserProfile = {
    email: "user@example.com",
    discord: {
      connected: true,
      username: "User#1234",
      avatar: "https://cdn.discordapp.com/avatars/123456789/abcdef.png",
    },
    ogcBalance: "32,500",
    walletConnected: false,
    walletAddress: null,
  };

  const handleConnectWallet = () => {
    // Implement wallet connection logic here
    console.log("Connecting wallet...");
  };

  const handleDisconnectDiscord = () => {
    // Implement Discord disconnect logic
    console.log("Disconnecting Discord...");
  };

  const handleConnectDiscord = () => {
    // Implement Discord connect logic
    console.log("Connecting Discord...");
  };

  // Update the activity items to ensure all have URLs
  const recentActivity: ActivityItem[] = [
    {
      id: 1,
      type: "AIRDROP",
      amount: "5,000 OGC",
      timestamp: "2024-03-10T14:30:00",
      details: "Community Discord Role Airdrop",
      status: "completed",
      txHash:
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      txUrl: `/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
    },
    {
      id: 2,
      type: "VEST",
      amount: "25,000 OGC",
      timestamp: "2024-03-09T10:00:00",
      details: "Team Token Vesting - March Distribution",
      status: "completed",
      txHash:
        "0x8765432109abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      txUrl: `/tx/0x8765432109abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
    },
    {
      id: 3,
      type: "AIRDROP",
      amount: "2,500 OGC",
      timestamp: "2024-03-08T16:45:00",
      details: "Alpha Tester Bonus",
      status: "completed",
      txHash:
        "0x9876543210abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      txUrl: `/tx/0x9876543210abcdef1234567890abcdef1234567890abcdef1234567890abcdef`,
    },
  ];

  // Add available games data
  const availableGames: GameMenuItem[] = [
    {
      id: "trivia-jam",
      name: "Trivia Jam",
      status: "LIVE",
      description: "Host or join live trivia games with friends",
      currentPlayers: 12500,
      minPlayers: 2,
      maxPlayers: 100,
      entryFee: "100 OGC",
      thumbnail: "https://placehold.co/128x128/232323/31C48D?text=Trivia+Jam",
    },
    {
      id: "run-set-jimmy",
      name: "Run Set Jimmy",
      status: "BETA",
      description: "Strategic card game with a twist",
      currentPlayers: 500,
      minPlayers: 2,
      maxPlayers: 4,
      entryFee: "50 OGC",
      thumbnail:
        "https://placehold.co/128x128/232323/818CF8?text=Run+Set+Jimmy",
    },
    {
      id: "little-vigilantes",
      name: "Little Vigilantes",
      status: "UPCOMING",
      description: "Social deduction game coming soon",
      minPlayers: 5,
      maxPlayers: 10,
      thumbnail:
        "https://placehold.co/128x128/232323/DB2777?text=Little+Vigilantes",
    },
  ];

  // For now, we'll hardcode this to false. Later it will come from your wallet state
  const isWalletConnected = false;

  return (
    <>
      <header className="sticky top-0 z-10 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-12 lg:ml-0">
          Dashboard
        </h1>
      </header>

      <div className="flex-1 flex">
        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                Total Earnings
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                32,500 OGC
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                Games Played
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                147
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                Win Rate
              </h3>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                64%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
              <h3 className="text-sm text-gray-500 dark:text-gray-400">
                Tournament Wins
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                7
              </p>
            </div>
          </div>

          {/* Active Games Hero Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Games
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://placehold.co/128x128/232323/31C48D?text=${game.name}`}
                        alt={game.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {game.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Last played{" "}
                          {new Date(game.lastPlayed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Rank</div>
                      <div className="font-bold text-indigo-600">
                        #{game.userStats.rank}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {game.players.toLocaleString()} players online
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Resume Game
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Games Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Available Games
              </h2>
              <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">
                See all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableGames.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex flex-col"
                >
                  {/* Game Info Section */}
                  <div className="flex items-start gap-3 mb-4 flex-1">
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {game.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            game.status === "LIVE"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : game.status === "BETA"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          }`}
                        >
                          {game.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {game.currentPlayers && (
                          <span>
                            {game.currentPlayers.toLocaleString()} playing
                          </span>
                        )}
                        <span>
                          {game.minPlayers}-{game.maxPlayers} players
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Button Section - Now consistently positioned at bottom */}
                  {game.status !== "UPCOMING" ? (
                    <button className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-auto">
                      Create New Game
                    </button>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mt-auto">
                      Get Notified
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Column - Wallet */}
        <div className="hidden lg:flex flex-col w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
          {/* Wallet Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Wallet
              </h2>
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                Limited Time
              </span>
            </div>
            {!isWalletConnected ? (
              <>
                <Link
                  to="/wallet"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Connect Wallet to Claim
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  5,000 OGC airdrop for first 10k users
                </p>
              </>
            ) : (
              <>
                <Link
                  to="/wallet"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                  Claim Beta Airdrop
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  5,000 OGC for first 10k users
                </p>
              </>
            )}
          </div>

          {/* Wallet Balance */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              32,500 OGC
            </p>
          </div>

          {/* Recent Activity */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-500">
                Recent Activity
              </h3>
              <Link
                to="/transactions"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <Link
                  to={activity.txUrl}
                  key={activity.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        activity.type === "AIRDROP"
                          ? "bg-blue-100 dark:bg-blue-900/20"
                          : "bg-purple-100 dark:bg-purple-900/20"
                      }`}
                    >
                      {activity.type === "AIRDROP" ? (
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        activity.type === "AIRDROP"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      +{activity.amount}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
