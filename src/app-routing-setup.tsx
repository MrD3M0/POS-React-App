import { Navigate, Route, Routes } from "react-router-dom";
import { LogIn } from "./pages/auth/login";
import { RequireAuth } from "./providers/require-auth";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import LayoutPage from "./providers/sidebar-layout";
import Register from "./pages/auth/register";
import Categories from "./pages/categories";

const AppRoutingSetup = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route element={<LayoutPage />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/category" element={<Categories />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AppRoutingSetup;
