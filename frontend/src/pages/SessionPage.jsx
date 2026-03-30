import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const SessionPage = () => {
  const { day } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get-plan/${user.id}`);
        setPlan(response.data[day]);
        if (response.data[day] && response.data[day][0]) {
          setTimeLeft(response.data[day][0].duration * 60); // Convert to seconds
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
      }
    };
    fetchPlan();
  }, [user.id, day]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      nextPose();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const nextPose = () => {
    if (currentPoseIndex < plan.length - 1) {
      setCurrentPoseIndex(currentPoseIndex + 1);
      setTimeLeft(plan[currentPoseIndex + 1].duration * 60);
      setIsActive(false);
    } else {
      // Session complete
      alert("Session complete!");
      navigate("/dashboard/yoga");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!plan) return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;

  const currentPose = plan[currentPoseIndex];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Yoga Session</h1>

        <div className="bg-gray-50 p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">{currentPose.pose}</h2>
          <div className="text-6xl font-mono mb-4">{formatTime(timeLeft)}</div>
          <p className="text-lg text-gray-600 mb-6">
            Hold this pose for {currentPose.duration} minutes
          </p>

          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <button
                onClick={startTimer}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200"
              >
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition duration-200"
              >
                Pause
              </button>
            )}

            <button
              onClick={nextPose}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Next Pose
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Pose {currentPoseIndex + 1} of {plan.length}
        </div>

        <button
          onClick={() => navigate("/dashboard/yoga")}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionPage;