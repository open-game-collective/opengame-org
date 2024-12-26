import { useParams } from "@remix-run/react";

export default function TransactionDetails() {
  const { txHash } = useParams();

  // Mock transaction data - replace with real data fetch
  const transaction = {
    hash: txHash,
    type: 'AIRDROP',
    amount: '5,000 OGC',
    timestamp: '2024-03-10T14:30:00',
    details: 'Community Discord Role Airdrop',
    status: 'completed',
    from: '0x1234...5678',
    to: '0x8765...4321',
    blockNumber: 12345678,
    blockHash: '0xabcd...efgh',
  };

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      {/* Transaction Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Transaction Details</h1>
        <p className="text-gray-500 dark:text-gray-400 break-all font-mono">{txHash}</p>
      </div>

      {/* Transaction Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="space-y-6">
          {/* Status and Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'AIRDROP' 
                  ? 'bg-blue-100 dark:bg-blue-900/20' 
                  : 'bg-purple-100 dark:bg-purple-900/20'
              }`}>
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{transaction.type}</p>
                <p className="text-sm text-gray-500">{transaction.details}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">+{transaction.amount}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">From</h3>
              <p className="font-mono text-gray-900 dark:text-white">{transaction.from}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">To</h3>
              <p className="font-mono text-gray-900 dark:text-white">{transaction.to}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Block Number</h3>
              <p className="font-mono text-gray-900 dark:text-white">{transaction.blockNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Block Hash</h3>
              <p className="font-mono text-gray-900 dark:text-white">{transaction.blockHash}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 