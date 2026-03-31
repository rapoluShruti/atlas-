import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext.jsx";
import { apiClient } from "../config/api.js";

const YogaDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await apiClient.get(`/get-plan/${user._id}`);
        setPlan(response.data);
      } catch (error) {
        console.error("Error fetching plan:", error);
        // If no plan exists, redirect to onboarding
        if (error.response?.status === 404) {
          navigate("/dashboard/onboarding");
        }
      }
    };

    if (user?._id) {
      fetchPlan();
    }
  }, [user, navigate]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dayOfMonth = date.getDate();
    // Map date to day (assuming day 1-7 cycle)
    const dayKey = `day${((dayOfMonth - 1) % 7) + 1}`;
    setSelectedDay(dayKey);
  };

  const startSession = (day, startIndex = 0) => {
    navigate(`/dashboard/session/${day}?start=${startIndex}`);
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

      if (isToday) return 'today-highlight';
      if (isSelected) return 'selected-day';
    }
    return null;
  };

  if (!plan) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your yoga plan...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧘 Your Yoga Journey</h1>
          <p className="text-gray-600 text-lg">Plan, practice, and progress with personalized yoga sessions</p>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">📅 Your Weekly Yoga Calendar</h2>
          <div className="flex justify-center">
            <div className="calendar-container">
              <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
                tileClassName={tileClassName}
                className="rounded-2xl border-2 border-green-200 shadow-lg"
              />
            </div>
          </div>

          {/* Day indicators */}
          <div className="mt-6 grid grid-cols-7 gap-2 text-center">
            {Object.keys(plan).map((dayKey, index) => {
              const colors = [
                'from-pink-400 to-rose-400',
                'from-purple-400 to-indigo-400',
                'from-blue-400 to-cyan-400',
                'from-green-400 to-emerald-400',
                'from-yellow-400 to-orange-400',
                'from-red-400 to-pink-400',
                'from-gray-400 to-slate-400'
              ];
              return (
                <div key={dayKey} className={`bg-gradient-to-r ${colors[index]} text-white p-3 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                  {dayKey.replace('day', 'Day ')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Schedule Section */}
        {selectedDay && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                📋 {selectedDay.replace('day', 'Day ')} Schedule
              </h2>
              <button
                onClick={() => startSession(selectedDay)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
              >
                🚀 Start Session
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plan[selectedDay].map((pose, index) => {
                const poseColors = [
                  'from-pink-50 to-rose-50 border-pink-200',
                  'from-purple-50 to-indigo-50 border-purple-200',
                  'from-blue-50 to-cyan-50 border-blue-200',
                  'from-green-50 to-emerald-50 border-green-200',
                  'from-yellow-50 to-orange-50 border-yellow-200',
                  'from-red-50 to-pink-50 border-red-200'
                ];
                return (
                  <div key={index} className={`bg-gradient-to-br ${poseColors[index % poseColors.length]} p-6 rounded-2xl border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight cursor-pointer" onClick={() => startSession(selectedDay, index)}>{pose.pose}</h3>
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        {pose.duration}min
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{pose.description || 'A beneficial yoga pose for your practice'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8 border border-green-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">📊 Weekly Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-3">⏱️</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Total Time</h3>
              <p className="text-gray-600">~2 hours/week</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Poses Mastered</h3>
              <p className="text-gray-600">15+ poses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <div className="text-4xl mb-3">🔥</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Streak</h3>
              <p className="text-gray-600">Keep it going!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaDashboardPage;