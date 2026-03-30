import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from "../context/AuthContext.jsx";

const YogaDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    // Hardcoded yoga plan data
    const hardcodedPlan = {
      day1: [
        { pose: "Mountain Pose", duration: 5, description: "Builds strength and stability" },
        { pose: "Tree Pose", duration: 10, description: "Improves balance and focus" },
        { pose: "Warrior I", duration: 15, description: "Strengthens legs and core" }
      ],
      day2: [
        { pose: "Downward Dog", duration: 10, description: "Stretches the whole body" },
        { pose: "Cat-Cow", duration: 5, description: "Improves spinal flexibility" },
        { pose: "Child's Pose", duration: 10, description: "Relieves back tension" }
      ],
      day3: [
        { pose: "Seated Forward Bend", duration: 15, description: "Stretches hamstrings" },
        { pose: "Bridge Pose", duration: 10, description: "Strengthens glutes and back" },
        { pose: "Corpse Pose", duration: 5, description: "Deep relaxation" }
      ],
      day4: [
        { pose: "Sun Salutation", duration: 20, description: "Full body warm-up sequence" },
        { pose: "Triangle Pose", duration: 15, description: "Stretches and strengthens" },
        { pose: "Pigeon Pose", duration: 10, description: "Hip opener" }
      ],
      day5: [
        { pose: "Chair Pose", duration: 15, description: "Strengthens thighs and core" },
        { pose: "Eagle Pose", duration: 10, description: "Improves balance" },
        { pose: "Happy Baby", duration: 5, description: "Gentle hip and back stretch" }
      ],
      day6: [
        { pose: "Plank Pose", duration: 20, description: "Core strength builder" },
        { pose: "Cobra Pose", duration: 10, description: "Strengthens back muscles" },
        { pose: "Bow Pose", duration: 15, description: "Deep backbend" }
      ],
      day7: [
        { pose: "Rest Day", duration: 30, description: "Gentle restorative practice" },
        { pose: "Savasana", duration: 15, description: "Complete relaxation" }
      ]
    };
    setPlan(hardcodedPlan);
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dayOfMonth = date.getDate();
    // Map date to day (assuming day 1-7 cycle)
    const dayKey = `day${((dayOfMonth - 1) % 7) + 1}`;
    setSelectedDay(dayKey);
  };

  const startSession = (day) => {
    navigate(`/dashboard/session/${day}`);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your yoga plan...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🧘 Your Yoga Journey</h1>
          <p className="text-gray-600 text-lg">Plan, practice, and progress with personalized yoga sessions</p>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📅 Select Your Practice Day</h2>
          <div className="flex justify-center">
            <div className="calendar-container">
              <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
                tileClassName={tileClassName}
                className="rounded-xl border-2 border-orange-200"
              />
            </div>
          </div>
        </div>

        {/* Daily Schedule Section */}
        {selectedDay && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                📋 {selectedDay.replace('day', 'Day ')} Schedule
              </h2>
              <button
                onClick={() => startSession(selectedDay)}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Start Session
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan[selectedDay].map((pose, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{pose.pose}</h3>
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                      {pose.duration}min
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{pose.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Overview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8 border border-orange-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">📊 Weekly Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-200 text-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-bold text-gray-800">Total Time</h3>
              <p className="text-gray-600">~2 hours/week</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-200 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-bold text-gray-800">Poses Mastered</h3>
              <p className="text-gray-600">15+ poses</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-200 text-center">
              <div className="text-2xl mb-2">🔥</div>
              <h3 className="font-bold text-gray-800">Streak</h3>
              <p className="text-gray-600">Keep it going!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaDashboardPage;