import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    motive: "",
    minutesPerDay: "",
    daysPerWeek: "",
    sessionType: "one-go",
    instructions: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/create-plan", {
        userId: user.id,
        ...formData,
      });
      navigate("/dashboard/yoga");
    } catch (error) {
      console.error("Error creating plan:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Yoga Journey Starts Here</h1>
            <p className="text-gray-600">Step 1/3 - Tell us about your goals</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Motive
            </label>
            <select
              name="motive"
              value={formData.motive}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
              required
            >
              <option value="">Select your goal</option>
              <option value="Fitness">🏃 Fitness</option>
              <option value="Flexibility">🤸 Flexibility</option>
              <option value="Stress Relief">🧘 Stress Relief</option>
              <option value="Weight Loss">⚖️ Weight Loss</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minutes Available Per Day
            </label>
            <input
              type="number"
              name="minutesPerDay"
              value={formData.minutesPerDay}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
              placeholder="e.g., 30"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Days Per Week
            </label>
            <input
              type="number"
              name="daysPerWeek"
              value={formData.daysPerWeek}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white"
              placeholder="e.g., 3"
              min="1"
              max="7"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Session Type
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 border-2 border-orange-200 rounded-xl cursor-pointer hover:border-orange-300 transition-all duration-200">
                <input
                  type="radio"
                  name="sessionType"
                  value="one-go"
                  checked={formData.sessionType === "one-go"}
                  onChange={handleChange}
                  className="mr-3 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-800">One-go session</span>
                  <p className="text-sm text-gray-600">Complete workout in one sitting</p>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 border-orange-200 rounded-xl cursor-pointer hover:border-orange-300 transition-all duration-200">
                <input
                  type="radio"
                  name="sessionType"
                  value="split"
                  checked={formData.sessionType === "split"}
                  onChange={handleChange}
                  className="mr-3 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-800">Split across day</span>
                  <p className="text-sm text-gray-600">Break into multiple sessions</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Optional Instructions
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white resize-none"
              rows="3"
              placeholder="Any specific preferences or limitations..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-4 px-6 rounded-xl hover:bg-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🚀 Create My Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;