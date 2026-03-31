import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 15);
    navigate(`/dashboard/room/${roomId}`);
  };

  return (
    <section className="dashboard-grid">
      <div className="dashboard-hero">
        <p className="eyebrow">Dashboard</p>
        <h1>Hello, {user?.name}.</h1>
        <p>
          You are logged in with a protected JWT session and your profile data is coming
          from the backend API.
        </p>
      </div>

      <div className="dashboard-cards">
        <article className="dashboard-card">
          <span>Name</span>
          <strong>{user?.name}</strong>
        </article>
        <article className="dashboard-card">
          <span>Email</span>
          <strong>{user?.email}</strong>
        </article>
        <article className="dashboard-card">
          <span>User ID</span>
          <strong>{user?._id}</strong>
        </article>
        <article className="dashboard-card">
          <span>Actions</span>
          <button onClick={createRoom} className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Video Room
          </button>
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;

