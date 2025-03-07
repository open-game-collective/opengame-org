import { AccountLinking } from "../components/AccountLinking";

export default function AccountLinkingPage() {
  return (
    <div className="py-10">
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            Account Linking
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <p className="text-gray-600 mb-6">
            Link your OpenGame account with other games in the ecosystem to enable cross-application features.
          </p>
          <AccountLinking />
        </div>
      </main>
    </div>
  );
} 