import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import YogaTrainer from "./YogaTrainer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiClient } from "../config/api.js";

const resolveInitialPose = (poses, startIndex) => {
  const selectedPose = poses[startIndex]?.pose || poses[0]?.pose || "";
  const normalized = selectedPose.trim().toLowerCase();

  if (normalized === "tree pose" || normalized === "tree") {
    return "Tree Pose";
  }

  if (
    normalized === "warrior ii pose" ||
    normalized === "warrior 2" ||
    normalized === "warrior ii"
  ) {
    return "Warrior II Pose";
  }

  return "T Pose";
};

const SessionPage = () => {
  const { day } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [poses, setPoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user?._id) {
        return;
      }

      try {
        const response = await apiClient.get(`/get-plan/${user._id}`);
        const plan = response.data || {};
        setPoses(plan[day] || []);
      } catch (error) {
        console.error("Error fetching plan:", error);
        setPoses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [day, user?._id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your yoga trainer...</p>
        </div>
      </div>
    );
  }

  const requestedStartIndex = Number.parseInt(searchParams.get("start") || "0", 10);
  const safeStartIndex = Number.isNaN(requestedStartIndex) ? 0 : requestedStartIndex;
  const initialPose = resolveInitialPose(poses, safeStartIndex);
  const sessionTitle = day ? day.replace("day", "Day ") : "Session";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Yoga Trainer
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {sessionTitle}
            </h1>
            <p className="text-gray-600 mt-2">
              Start Session now opens the same trainer you use inside a room.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/yoga")}
            className="self-start md:self-auto rounded-2xl bg-white px-5 py-3 text-gray-800 font-semibold shadow-sm border border-green-100 hover:border-green-200"
          >
            Back to Yoga Plan
          </button>
        </div>

        <YogaTrainer initialPose={initialPose} />
      </div>
    </div>
  );
};

export default SessionPage;
