import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Open Game Collective" },
    {
      name: "description",
      content:
        "A community-driven platform where players shape, fund, and enjoy evolving mini-games. Join us and help guide the future of play.",
    },
  ];
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  return json({});
}

export default function Index() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Hero Section */}
        <header className="relative flex items-center justify-center h-screen bg-opacity-75 bg-black">
          <div className="absolute inset-0 bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1535905746091-16ca96c827fb?auto=format&fit=crop&w=1440&q=80')] opacity-30" />
          <div className="relative z-10 max-w-3xl px-6 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Open Game Collective
            </h1>
            <p className="mt-4 text-xl text-gray-300">
              A community-driven platform where players shape, fund, and enjoy evolving mini-games.
            </p>
            <a
              href="#get-started"
              className="inline-block mt-8 px-6 py-3 border border-transparent text-lg font-medium rounded-md bg-indigo-600 hover:bg-indigo-700"
            >
              Get Started
            </a>
          </div>
        </header>

        {/* About Section */}
        <section
          id="about"
          className="max-w-5xl mx-auto py-16 px-6 sm:px-8 lg:px-10 text-center"
        >
          <h2 className="text-3xl font-semibold mb-4">What is Open Game Collective?</h2>
          <p className="text-gray-300 leading-relaxed">
            Open Game Collective is a next-generation gaming ecosystem built by and for the community.
            Through governance tokens, players and creators can influence the development roadmap, 
            propose new features, and help fund expansions both online and in real life. As our mini-games
            evolve, our treasury grows—enabling physical expansions like immersive cafés where you can 
            enjoy these games in person.
          </p>
        </section>

        {/* Key Features */}
        <section
          id="features"
          className="max-w-5xl mx-auto py-16 px-6 sm:px-8 lg:px-10"
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Community Governance</h3>
              <p className="text-gray-300">
                Token holders vote on which games to develop, features to launch, and even how to invest 
                in physical spaces.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Open-Source Development</h3>
              <p className="text-gray-300">
                All code is open-source, inviting creators, developers, and artists worldwide to contribute 
                and improve the platform.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Digital-to-Physical Expansion</h3>
              <p className="text-gray-300">
                Grow beyond the screen. Successful games fuel a treasury that invests in real-world cafés, 
                fostering community hangouts and local events.
              </p>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section
          id="get-started"
          className="max-w-5xl mx-auto py-16 px-6 sm:px-8 lg:px-10 text-center"
        >
          <h2 className="text-3xl font-semibold mb-4">Ready to Join the Collective?</h2>
          <p className="text-gray-300 mb-8">
            Be part of the future of gaming. Shape the roadmap, earn tokens for contributions, 
            and watch as your input influences not just the virtual world, but the physical one too.
          </p>
          <a
            href="#"
            className="px-6 py-3 inline-block bg-indigo-600 hover:bg-indigo-700 text-lg font-medium rounded-md"
          >
            Join Our Community
          </a>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Open Game Collective</p>
        </footer>
      </div>
    </>
  );
}
