import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { 
  PageLayout, 
  Card, 
  Button, 
  Text,
  RedBadge,
  IconWrapper 
} from "~/components/Layout";
import { twc } from "react-twc";

const GradientCard = twc(Card)`
  bg-gradient-to-r from-green-50 to-blue-50 
  dark:from-green-900/20 dark:to-blue-900/20 
  border border-green-100 dark:border-green-900/30
`;

const TransactionItem = twc.div`
  flex items-center justify-between p-3 
  bg-gray-50 dark:bg-gray-700/50 rounded-lg
`;

export default function Wallet() {
  return (
    <PageLayout title="Wallet">
      <div className="max-w-2xl mx-auto">
        {/* Airdrop Callout */}
        <GradientCard className="mb-6">
          <div className="flex items-start gap-4">
            <IconWrapper className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </IconWrapper>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Text.Title>Community Beta Airdrop</Text.Title>
                <RedBadge>Limited Time</RedBadge>
              </div>
              <Text.Subtitle className="mb-2">
                Be one of the first 10,000 players to join our community beta and receive:
              </Text.Subtitle>
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  5,000 OGC Tokens (~$50 value)
                </div>
                <Text.Subtitle className="mt-1">
                  Use these tokens to enter games, tournaments, and unlock exclusive beta rewards
                </Text.Subtitle>
              </div>
              <Button<'button'> variant="primary" onClick={() => console.log("Connecting wallet...")}>
                Connect Wallet to Claim
              </Button>
              <Text.Subtitle className="mt-2">
                * Limited to the first 10,000 participants. Airdrop ends March 31, 2024
              </Text.Subtitle>
            </div>
          </div>
        </GradientCard>

        {/* Wallet Connection Card */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Text.Title>Connect Wallet</Text.Title>
              <Text.Subtitle>Connect your wallet to start playing games</Text.Subtitle>
            </div>
            <Button<'button'> variant="primary" onClick={() => console.log("Connecting wallet...")}>
              Connect Wallet
            </Button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <Text.Subtitle>
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </Text.Subtitle>
          </div>
        </Card>

        {/* Balance Card */}
        <Card className="mb-6">
          <Text.Title>Balance</Text.Title>
          <div className="flex items-center justify-between">
            <div>
              <Text.Label>Available Balance</Text.Label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">32,500 OGC</p>
            </div>
            <Button<'button'> variant="primary" onClick={() => console.log("Opening deposit modal...")}>
              Deposit
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Text.Title>Recent Transactions</Text.Title>
            <Button<typeof Link> as={Link} to="/transactions">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <TransactionItem>
              <div className="flex items-center gap-3">
                <IconWrapper className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </IconWrapper>
                <div>
                  <Text.Title as="p">Community Discord Role Airdrop</Text.Title>
                  <Text.Subtitle>Mar 10, 2024</Text.Subtitle>
                </div>
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">+5,000 OGC</p>
            </TransactionItem>

            <TransactionItem>
              <div className="flex items-center gap-3">
                <IconWrapper className="bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </IconWrapper>
                <div>
                  <Text.Title as="p">Team Token Vesting</Text.Title>
                  <Text.Subtitle>Mar 9, 2024</Text.Subtitle>
                </div>
              </div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">+25,000 OGC</p>
            </TransactionItem>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
} 