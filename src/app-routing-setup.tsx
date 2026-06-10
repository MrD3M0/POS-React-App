import { Navigate, Route, Routes } from "react-router-dom";
import { LogIn } from "./pages/auth/login";
import { RequireAuth } from "./providers/require-auth";
import { DashboardPage } from "./pages/dashboard/dashboard-page";
import LayoutPage from "./providers/sidebar-layout";
import Register from "./pages/auth/register";
import Categories from "./pages/categories";
import CreateCategory from "./pages/categories/create";
import UpdateCategory from "./pages/categories/edit";
import Products from "./pages/product";
import CreateProduct from "./pages/product/create";
import EditProduct from "./pages/product/edit";
import CategoryList from "./pages/billing/billing";
import BillingPage from "./pages/billing/billing";

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
          <Route path="/category/create" element={<CreateCategory />} />
          <Route path="/category/:id" element={<UpdateCategory />} />
          <Route path="/product" element={<Products />} />
          <Route path="/product/create" element={<CreateProduct />} />
          <Route path="/product/:id" element={<EditProduct />} />
          <Route path="/billing" element={<BillingPage />} />

          <Route path="/options" element={<CategoryList />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};

export default AppRoutingSetup;
