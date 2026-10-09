
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Cards from "./pages/Cards";
import Payment from "./pages/Payment";
import Transactions from "./pages/Transactions";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/cards" element={<Cards />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/transactions" element={<Transactions />} />
    </Routes>
  );
}
