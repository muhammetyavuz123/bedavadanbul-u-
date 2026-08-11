import HomePage from "./routes/homePage/homePage";
import AboutUsPage from "./routes/aboutUs/aboutUsPage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./routes/listPage/listPage";
import { Layout, RequireAuth } from "./routes/layout/layout";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import {
  listPageLoader,
  profilePageLoader,
  singlePageLoader,
} from "./lib/loaders";
import ContactPage from "./routes/contact/contactPage";
import ResetPassword from "./routes/resetPassword/resetPassword";
import ForgotPassword from "./routes/forgotPassword/forgotPassword";
import PrivacyPolicy from "./routes/legal/PrivacyPolicy";
import TermsOfUse from "./routes/legal/TermsOfUse";
import KVKKClarification from "./routes/legal/KVKKClarification";
import Loader from "./components/loader/Loader";
import EditPostPage from "./routes/newPostPage/editPostPage";
import MapPage from "./routes/mapPage/mapPage";
function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          loader: listPageLoader,
        },
        {
          path: "/aboutUs",
          element: <AboutUsPage />,
        },
        {
          path: "/contact",
          element: <ContactPage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          // loader: listPageLoader,
        },
        {
          // ⚠️ "/:id" catch-all rotasından ÖNCE tanımlanmasına gerek yok —
          // React Router v6 statik path segmentlerini (ör. "/harita")
          // dinamik segmentlerden (":id") her zaman daha spesifik sayıp
          // önceliklendiriyor, ama okunurluk için yine de /list'in yanına
          // koyduk.
          path: "/harita",
          element: <MapPage />,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },

        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: `/reset-password/:token`,
          element: <ResetPassword />,
        },
        {
          path: "/forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "/legal/privacy-policy",
          element: <PrivacyPolicy />,
        },
        {
          path: "/legal/terms-of-use",
          element: <TermsOfUse />,
        },
        {
          path: "/legal/kvkk",
          element: <KVKKClarification />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          // loader: profilePageLoader,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
        {
          path: "/edit/:id",
          element: <EditPostPage />,
        },
      ],
    },
  ]);

  // ⚠️ RouterProvider'a child geçmek bir işe yaramıyordu (bkz. layout.jsx'teki
  // ScrollToTop taşıma notu) — self-closing kullanıyoruz.
  return (
    <>
      <RouterProvider router={router} fallbackElement={<Loader />} />
    </>
  );
}

export default App;
