import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import Layout from "./layouts/dashboard";
import DashboardPage from "./pages";
import SignInPage from "./pages/signin";
import AthletesPage from "./pages/athletes";
import { ViewAthletePage } from "./pages/view-athlete";
import { ViewTrainingPage } from "./pages/view-training";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "",
            Component: DashboardPage,
          },
          {
            path: "athletes/:id",
            Component: ViewAthletePage,
          },
          {
            path: "athletes/:id/trainings/:trainingId",
            Component: ViewTrainingPage,
          },
          {
            path: "athletes",
            Component: AthletesPage,
          },
          {
            path: "athletes/new",
            Component: AthletesPage,
          },
          {
            path: "athletes/:athleteId/edit",
            Component: AthletesPage,
          },
        ],
      },
      {
        path: "/sign-in",
        Component: SignInPage,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
