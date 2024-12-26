import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { 
  PageLayout, 
  Card, 
  Button, 
  IconWrapper, 
  Text,
} from "~/components/Layout";
import { twc } from "react-twc";

interface Transaction {
  id: string;
  type:
    | "AIRDROP"
    | "VEST"
    | "GAME_WIN"
    | "GAME_ENTRY"
    | "DEPOSIT"
    | "WITHDRAWAL";
  amount: string;
  timestamp: string;
  details: string;
  status: "completed" | "pending" | "failed";
  txHash: string;
  txUrl: string;
}

// Mock data generator
function generateTransactions(count: number): Transaction[] {
  const types = [
    "AIRDROP",
    "VEST",
    "GAME_WIN",
    "GAME_ENTRY",
    "DEPOSIT",
    "WITHDRAWAL",
  ] as const;
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 10000);
    const daysAgo = Math.floor(Math.random() * 30);
    const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random()
      .toString(16)
      .slice(2)}`;

    transactions.push({
      id: `tx-${i}`,
      type,
      amount: `${amount} OGC`,
      timestamp: new Date(
        Date.now() - daysAgo * 24 * 60 * 60 * 1000
      ).toISOString(),
      details: getTransactionDetails(type, amount),
      status: "completed",
      txHash,
      txUrl: `/tx/${txHash}`,
    });
  }

  return transactions.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function getTransactionDetails(
  type: Transaction["type"],
  amount: number
): string {
  switch (type) {
    case "AIRDROP":
      return "Community Beta Airdrop";
    case "VEST":
      return "Team Token Vesting";
    case "GAME_WIN":
      return "Trivia Jam Tournament Win";
    case "GAME_ENTRY":
      return "Trivia Jam Entry Fee";
    case "DEPOSIT":
      return "Wallet Deposit";
    case "WITHDRAWAL":
      return "Wallet Withdrawal";
    default:
      return "Transaction";
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = 50;

  // Generate 150 mock transactions
  const allTransactions = generateTransactions(150);

  // Calculate pagination
  const totalTransactions = allTransactions.length;
  const totalPages = Math.ceil(totalTransactions / pageSize);
  const transactions = allTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return json({
    transactions,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

// Define prop types for our styled components
type TransactionIconProps = {
  $type: Transaction['type'];
  children: React.ReactNode;
};

type TransactionAmountProps = {
  $type: Transaction['type'];
  children: React.ReactNode;
};

const TransactionItem = twc(Link)`
  flex items-center justify-between p-4 
  hover:bg-gray-50 dark:hover:bg-gray-700/50 
  transition-colors
`;

const TransactionIcon = twc(IconWrapper)<TransactionIconProps>`
  ${({ $type }: { $type: Transaction['type'] }) => {
    switch ($type) {
      case 'AIRDROP':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'VEST':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'GAME_WIN':
        return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'GAME_ENTRY':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400';
      case 'DEPOSIT':
        return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
      default:
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    }
  }}
`;

const TransactionAmount = twc.p<TransactionAmountProps>`
  font-medium
  ${({ $type }: { $type: Transaction['type'] }) =>
    $type === 'WITHDRAWAL' || $type === 'GAME_ENTRY'
      ? 'text-red-600 dark:text-red-400'
      : 'text-green-600 dark:text-green-400'
  }
`;

export default function Transactions() {
  const { transactions, pagination } = useLoaderData<typeof loader>();

  return (
    <PageLayout title="Transactions">
      <Card className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((tx) => (
          <TransactionItem key={tx.id} to={tx.txUrl}>
            <div className="flex items-center gap-4">
              <TransactionIcon $type={tx.type}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {tx.type === 'WITHDRAWAL' || tx.type === 'GAME_ENTRY' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  )}
                </svg>
              </TransactionIcon>
              <div>
                <Text.Title>{tx.details}</Text.Title>
                <Text.Subtitle>{new Date(tx.timestamp).toLocaleString()}</Text.Subtitle>
              </div>
            </div>
            <div className="text-right">
              <TransactionAmount $type={tx.type}>
                {tx.type === 'WITHDRAWAL' || tx.type === 'GAME_ENTRY' ? '-' : '+'}
                {tx.amount}
              </TransactionAmount>
              <Text.Subtitle className="font-mono">
                {tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}
              </Text.Subtitle>
            </div>
          </TransactionItem>
        ))}
      </Card>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <Text.Label>
          Page {pagination.currentPage} of {pagination.totalPages}
        </Text.Label>
        <div className="flex gap-2">
          {pagination.hasPreviousPage && (
            <Button as={Link} to={`?page=${pagination.currentPage - 1}`}>
              Previous
            </Button>
          )}
          {pagination.hasNextPage && (
            <Button as={Link} to={`?page=${pagination.currentPage + 1}`}>
              Next
            </Button>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
