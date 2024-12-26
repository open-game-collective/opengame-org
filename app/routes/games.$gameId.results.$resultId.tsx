import { useParams } from "@remix-run/react";

export default function GameResult() {
  const { gameId, resultId } = useParams();

  // Mock game result data - replace with real data fetch
  const result = {
    id: resultId,
    gameId: gameId,
    gameName: "Trivia Jam",
    date: "2024-03-08T19:00:00",
    status: "completed",
    position: "1st of 25",
    earnings: "1,000 OGC",
    score: 2500,
    duration: "15m 30s",
    players: [
      { 
        rank: 1, 
        name: "Player One", 
        score: 2500, 
        earnings: "1,000 OGC",
        isYou: true 
      },
      { 
        rank: 2, 
        name: "Player Two", 
        score: 2300, 
        earnings: "500 OGC" 
      },
      { 
        rank: 3, 
        name: "Player Three", 
        score: 2100, 
        earnings: "250 OGC" 
      },
    ],
    gameStats: {
      correctAnswers: 25,
      totalQuestions: 30,
      accuracy: "83%",
      averageTime: "3.2s"
    }
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      {/* Result Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{result.gameName}</h1>
          <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            {result.status}
          </span>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {new Date(result.date).toLocaleString()}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{result.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Earnings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.earnings}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.duration}</p>
            </div>
          </div>
        </div>

        {/* Game Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Game Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {result.gameStats.correctAnswers}/{result.gameStats.totalQuestions}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.gameStats.accuracy}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.gameStats.averageTime}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Final Standings</h2>
          <div className="space-y-4">
            {result.players.map((player) => (
              <div 
                key={player.rank}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  player.isYou 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-lg font-bold ${
                    player.rank === 1 ? 'text-yellow-500' :
                    player.rank === 2 ? 'text-gray-400' :
                    player.rank === 3 ? 'text-amber-600' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    #{player.rank}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {player.name} {player.isYou && '(You)'}
                  </span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-gray-900 dark:text-white">{player.score}</span>
                  <span className="text-green-600 dark:text-green-400">{player.earnings}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 