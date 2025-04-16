import { Navigate, RouteObject } from "react-router-dom";
import Login from "../pages/Login";
import Chat from "../pages/Chat";
import Layout from "../components/Layout";
import Friends from "../pages/Chat/components/Friends";
import Groups from "../pages/Chat/components/Groups";
import Favorites from "../pages/Chat/components/Favorites";
import Notifications from "../pages/Chat/components/Notifications";
import Messages from "../pages/Chat/components/Messages";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/chat/1" />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "chat",
        element: <Chat />,
        children: [
          { path: "1", element: <Friends /> },
          { path: "2", element: <Groups /> },
          { path: "3", element: <Messages /> },
          { path: "4", element: <Favorites /> },
          { path: "5", element: <Notifications /> },
        ],
      },
    ],
  },
];

export default routes;
