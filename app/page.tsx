import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to GymFit Pro
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your Complete Gym Membership Management Solution
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-lg transition shadow-lg border-2 border-blue-600"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💪</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Track Your Progress
            </h3>
            <p className="text-gray-600">
              Monitor your gym attendance and membership status in real-time.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Manage Members
            </h3>
            <p className="text-gray-600">
              Comprehensive admin tools to manage all gym members efficiently.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Flexible Plans
            </h3>
            <p className="text-gray-600">
              Choose from Basic, Premium, or VIP membership plans.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Membership Plans
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-gray-200 p-6 rounded-lg hover:border-blue-500 transition">
              <h4 className="text-xl font-bold text-gray-800 mb-2">Basic</h4>
              <p className="text-3xl font-bold text-blue-600 mb-4">$29<span className="text-lg">/mo</span></p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Gym access during off-peak hours</li>
                <li>✓ Basic equipment usage</li>
                <li>✓ Locker facilities</li>
              </ul>
            </div>

            <div className="border-2 border-blue-500 p-6 rounded-lg shadow-lg transform scale-105">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm inline-block mb-2">
                Popular
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">Premium</h4>
              <p className="text-3xl font-bold text-blue-600 mb-4">$59<span className="text-lg">/mo</span></p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ 24/7 gym access</li>
                <li>✓ All equipment & classes</li>
                <li>✓ Personal trainer session/month</li>
                <li>✓ Nutrition consultation</li>
              </ul>
            </div>

            <div className="border-2 border-gray-200 p-6 rounded-lg hover:border-blue-500 transition">
              <h4 className="text-xl font-bold text-gray-800 mb-2">VIP</h4>
              <p className="text-3xl font-bold text-blue-600 mb-4">$99<span className="text-lg">/mo</span></p>
              <ul className="text-gray-600 space-y-2">
                <li>✓ All Premium features</li>
                <li>✓ Unlimited personal training</li>
                <li>✓ Spa & sauna access</li>
                <li>✓ Priority booking</li>
                <li>✓ Guest passes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
