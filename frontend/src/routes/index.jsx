import { createBrowserRouter } from "react-router-dom";

import ProtectedLayout from "../layouts/ProtectedLayout.jsx";
import PublicLayout from "../layouts/PublicLayout.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import RoomPage from "../pages/RoomPage.jsx";
import OnboardingPage from "../pages/OnboardingPage.jsx";
import YogaDashboardPage from "../pages/YogaDashboardPage.jsx";
import YogaMapPage from "../pages/YogaMapPage.jsx";
import SessionPage from "../pages/SessionPage.jsx";
import ModelViewPage from "../pages/ModelViewPage.jsx";
import MumbaiCommunity from "../pages/MumbaiCommunity.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "onboarding",
        element: <OnboardingPage />,
      },
      {
        path: "yoga",
        element: <YogaDashboardPage />,
      },
      {
        path: "map",
        element: <YogaMapPage />,
      },
      {
        path: "communityy",
        element: <MumbaiCommunity />,
      },
      
      {
        path: "model/:poseName/:sessionId/:poseIndex",
        element: <ModelViewPage />,
      },
      {
        path: "session/:day",
        element: <SessionPage />,
      },
      {
        path: "room/:roomId",
        element: <RoomPage />,
      },
    ],
  },
]);

export default router;

