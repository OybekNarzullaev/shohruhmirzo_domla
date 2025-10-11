import { AuthLayout } from "@/layouts/AuthLayout";
import ProtectedLayout from "@/layouts/ProtectedLayout";
import HomePage from "@/pages/HomePage";
import ListAthletePage from "@/pages/ListAthletePage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";
import ViewAthletePage from "../../pages/ViewAthletePage";

const router = createBrowserRouter([
  {
    path: "",
    Component: ProtectedLayout,
    children: [
      {
        path: "",
        Component: HomePage,
      },
      {
        path: "athlete",

        children: [
          {
            path: "",
            Component: ListAthletePage,
          },
          {
            path: "view/:id",
            Component: ViewAthletePage,
          },
        ],
      },
    ],
  },
  {
    path: "auth",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: LoginPage,
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
