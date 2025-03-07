import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { PageLayout, Card, Button } from "~/components/Layout";
import { twc } from "react-twc";
import { ComponentProps } from "react";

interface GameResult {
  id: string;
  gameId: string;
  gameName: 'Trivia Jam' | 'Run Set Jimmy';
  timestamp: string;
  rank: number;
  totalPlayers: number;
  score: number;
  reward: string;
  status: 'win' | 'loss';
}

// Mock data generator
function generateResults(count: number): GameResult[] {
  const results: GameResult[] = [];
  const games = ['Trivia Jam', 'Run Set Jimmy'] as const;

  for (let i = 0; i < count; i++) {
    const gameName = games[Math.floor(Math.random() * games.length)];
    const totalPlayers = Math.floor(Math.random() * 98) + 2; // 2-100 players
    const rank = Math.floor(Math.random() * totalPlayers) + 1;
    const score = Math.floor(Math.random() * 1000);
    const daysAgo = Math.floor(Math.random() * 30);
    
    results.push({
      id: `result-${i}`,
      gameId: `game-${Math.random().toString(36).slice(2, 8)}`,
      gameName,
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      rank,
      totalPlayers,
      score,
      reward: rank <= 3 ? `${Math.floor(Math.random() * 1000)} OGC` : '0 OGC',
      status: rank <= 3 ? 'win' : 'loss'
    });
  }

  return results.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const game = url.searchParams.get('game') || 'all';
  const pageSize = 50;

  // Generate 150 mock results
  let allResults = generateResults(150);
  
  // Filter by game if specified
  if (game !== 'all') {
    allResults = allResults.filter(result => 
      result.gameName.toLowerCase().replace(/\s+/g, '-') === game
    );
  }

  // Calculate pagination
  const totalResults = allResults.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const results = allResults.slice((page - 1) * pageSize, page * pageSize);

  return json({
    results,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    activeGame: game
  });
}

const TabButton = ({ active, ...props }: { active?: boolean } & ComponentProps<typeof Button>) => (
  <Button active={active} {...props} />
);

const ResultItem = twc.div`
  flex items-center justify-between p-4 
  hover:bg-gray-50 dark:hover:bg-gray-700/50 
  transition-colors
`;

const ResultIcon = twc.div`
  text-gray-400
`;

const ResultDetails = twc.div`
  flex items-center gap-4
`;

const ResultScore = twc.div`
  text-right
`;

export default function Results() {
  const { results, pagination, activeGame } = useLoaderData<typeof loader>();

  return (
    <PageLayout title="Results">
      {/* Game filter tabs */}
      <div className="mb-6">
        <nav className="flex space-x-2" aria-label="Game filters">
          <TabButton active={activeGame === 'all'} as={Link} to="/results">
            All Games
          </TabButton>
          <TabButton active={activeGame === 'trivia-jam'} as={Link} to="/results?game=trivia-jam">
            Trivia Jam
          </TabButton>
          <TabButton active={activeGame === 'run-set-jimmy'} as={Link} to="/results?game=run-set-jimmy">
            Run Set Jimmy
          </TabButton>
        </nav>
      </div>

      {/* Results list */}
      <Card className="divide-y divide-gray-200 dark:divide-gray-700">
        {results.map((result) => (
          <ResultItem key={result.id}>
            <ResultDetails>
              <ResultIcon>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </ResultIcon>

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {result.gameName}
                  </p>
                  <span className={`text-sm ${
                    result.rank <= 3 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    Rank #{result.rank}/{result.totalPlayers}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
            </ResultDetails>

            <ResultScore>
              <div className="font-medium text-gray-900 dark:text-white">
                {result.score} pts
              </div>
              {result.reward !== '0 OGC' && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  +{result.reward}
                </div>
              )}
            </ResultScore>
          </ResultItem>
        ))}
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Page {pagination.currentPage} of {pagination.totalPages}
        </div>
        <div className="flex gap-2">
          {pagination.hasPreviousPage && (
            <Button as={Link} to={`/results?page=${pagination.currentPage - 1}${activeGame !== 'all' ? `&game=${activeGame}` : ''}`}>
              Previous
            </Button>
          )}
          {pagination.hasNextPage && (
            <Button as={Link} to={`/results?page=${pagination.currentPage + 1}${activeGame !== 'all' ? `&game=${activeGame}` : ''}`}>
              Next
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 