import { Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import PaymentPage from "./pages/PaymentPage";
import FeedbackPage from "./pages/FeedbackPage";
import AdminPage from "./pages/AdminPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminQRPage from "./pages/AdminQRPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/menu" element={<AdminMenuPage />} />
      <Route path="/admin/QR" element={<AdminQRPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard/>} />
    </Routes>
  );
}
