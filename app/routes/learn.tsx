import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

interface GuideCategory {
  title: string;
  description: string;
  iconType: 'lightning' | 'game' | 'token';
  articles: {
    id: string;
    title: string;
    description: string;
    path: string;
  }[];
}

function CategoryIcon({ type }: { type: GuideCategory['iconType'] }) {
  switch (type) {
    case 'lightning':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'game':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      );
    case 'token':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const categories: GuideCategory[] = [
    {
      title: "Getting Started",
      description: "Learn the basics of OGC tokens and how to get started",
      iconType: 'lightning',
      articles: [
        {
          id: "what-is-ogc",
          title: "What is OGC?",
          description: "Learn about OGC tokens and their utility in our gaming ecosystem",
          path: "/learn/what-is-ogc"
        },
        {
          id: "wallet-setup",
          title: "Setting Up Your Wallet",
          description: "How to set up a wallet and receive your first tokens",
          path: "/learn/wallet-setup"
        },
        {
          id: "discord-airdrop",
          title: "Discord Community & Airdrops",
          description: "Join our Discord and claim your welcome airdrop",
          path: "/learn/discord-airdrop"
        }
      ]
    },
    {
      title: "Games",
      description: "Detailed guides for each game in our ecosystem",
      iconType: 'game',
      articles: [
        {
          id: "trivia-jam",
          title: "Trivia Jam",
          description: "Real-time multiplayer trivia with token rewards",
          path: "/learn/games/trivia-jam"
        },
        {
          id: "run-set-jimmy",
          title: "Run Set Jimmy",
          description: "Strategic card game with competitive tournaments",
          path: "/learn/games/run-set-jimmy"
        }
      ]
    },
    {
      title: "Tokenomics",
      description: "Understanding OGC token distribution and economics",
      iconType: 'token',
      articles: [
        {
          id: "token-distribution",
          title: "Token Distribution",
          description: "How OGC tokens are distributed across the ecosystem",
          path: "/learn/tokenomics/distribution"
        },
        {
          id: "vesting-schedule",
          title: "Vesting Schedule",
          description: "Understanding token vesting and unlock periods",
          path: "/learn/tokenomics/vesting"
        }
      ]
    }
  ];

  return json({ categories });
}

export default function Learn() {
  const { categories } = useLoaderData<typeof loader>();

  return (
    <>
      <header className="sticky top-0 z-10 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-12 lg:ml-0">
          Learn
        </h1>
      </header>

      <div className="flex-1 overflow-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
          <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Open Game Collective
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              OGC is a gaming ecosystem where players earn tokens by playing games, participating in tournaments, and contributing to the community. Learn everything you need to know about getting started, playing games, and earning rewards.
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title} className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <CategoryIcon type={category.iconType} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {category.articles.map((article) => (
                    <Link
                      key={article.id}
                      to={article.path}
                      className="block p-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {article.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                to="/wallet"
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Claim Airdrop</h4>
                  <p className="text-sm text-gray-500">Get your welcome bonus</p>
                </div>
              </Link>
              <a
                href="https://discord.gg/your-server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.175 13.175 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Join Discord</h4>
                  <p className="text-sm text-gray-500">Connect with the community</p>
                </div>
              </a>
              <Link
                to="/"
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Play Games</h4>
                  <p className="text-sm text-gray-500">Start earning tokens</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 