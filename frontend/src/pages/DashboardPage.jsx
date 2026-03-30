import { useAuth } from "../context/AuthContext.jsx";

const DashboardPage = () => {
  const { user } = useAuth();

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
      </div>
    </section>
  );
};

export default DashboardPage;

