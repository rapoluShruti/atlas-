import { Link } from "react-router-dom";

const LandingPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-16">
        <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6 animate-pulse">
            ✨ Your Yoga Journey Starts Here
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Life Through
              <span className="text-green-600 block">Yoga Journey</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Discover personalized yoga plans tailored to your goals. Whether you're seeking fitness,
            flexibility, stress relief, or weight loss - we create the perfect practice for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link
              className="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              to="/register"
            >
              🚀 Start Your Journey
            </Link>
            <Link
              className="bg-white text-green-600 px-8 py-4 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg text-center"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-green-100">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 text-center">
                <div className="text-3xl mb-3">⏱️</div>
                <h3 className="font-bold text-gray-800 mb-2">Flexible Timing</h3>
                <p className="text-sm text-gray-600">Practice at your own pace, 5-60 minutes daily</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 text-center">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-bold text-gray-800 mb-2">Personalized Plans</h3>
                <p className="text-sm text-gray-600">AI-crafted routines based on your goals</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 text-center">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-gray-800 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Monitor your yoga journey and improvements</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 text-center">
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="font-bold text-gray-800 mb-2">Community</h3>
                <p className="text-sm text-gray-600">Join live sessions and connect with yogis</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-1 bg-orange-100 px-4 py-2 rounded-full">
                <span className="text-green-600 font-semibold">🧘 10,000+</span>
                <span className="text-gray-600 text-sm">Happy Practitioners</span>
              </div>
            </div>
          </div>

          {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-blue-200 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="bg-white border-t border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🧘</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Atlas Yoga</span>
          </div>
          <p className="text-gray-600 mb-4">
            Transform your mind, body, and spirit through the ancient practice of yoga.
          </p>
          <div className="text-sm text-gray-500">
            © 2024 YogaPlanner. Crafted with mindfulness and care.
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;

