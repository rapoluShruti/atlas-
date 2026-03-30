import { Link, NavLink, Outlet } from "react-router-dom";

const PublicLayout = () => (
  <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/">
        Atlas
      </Link>

      <nav className="topnav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/login">Login</NavLink>
        <NavLink to="/register">Register</NavLink>
      </nav>
    </header>

    <main className="page-wrap">
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;

