import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const ProtectedLayout = () => {
  const { isLoading, token, logout, user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <header className="bg-white shadow-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link className="flex items-center space-x-2" to="/">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🧘</span>
                </div>
                <span className="text-xl font-bold text-gray-800">YogaPlanner</span>
              </Link>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                to="/dashboard/yoga"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                🧘 My Plan
              </Link>
              <Link
                to="/dashboard/communityy"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Community
              </Link>
              <Link
                to="/dashboard/onboarding"
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                🎯 Onboarding
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">
                  {user?.name || "User"}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => navigate(`/dashboard/room/${Math.random().toString(36).substr(2, 9)}`)}
                >
                  📹 Create Room
                </button>
                <button
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-sm"
                  onClick={() => {
                    const roomId = prompt("Enter room ID to join:");
                    if (roomId) navigate(`/dashboard/room/${roomId}`);
                  }}
                >
                  ➕ Join Room
                </button>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={logout}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-orange-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">🧘</span>
              </div>
              <span className="text-lg font-bold text-gray-800">YogaPlanner</span>
            </div>
            <p className="text-gray-600 text-sm">
              Your personal yoga journey companion. Plan, practice, and progress with confidence.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              © 2024 YogaPlanner. Made with ❤️ for mindful living.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProtectedLayout;

