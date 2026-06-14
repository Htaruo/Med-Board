import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import NavBar         from "./components/NavBar";
import Dashboard      from "./pages/Dashboard";
import PatientList    from "./pages/PatientList";
import PatientProfile from "./pages/PatientProfile";
import MedicineLog    from "./pages/MedicineLog";
import Login          from "./pages/Login";

function PrivateLayout() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateLayout />}>
          <Route path="/"              element={<Dashboard />} />
          <Route path="/patients"      element={<PatientList />} />
          <Route path="/patient/:id"   element={<PatientProfile />} />
          <Route path="/medicine-log"  element={<MedicineLog />} />
          <Route path="/profile"       element={<div className="page-wrapper"><h1 className="page-title">My Profile</h1><p className="page-subtitle">Coming soon</p></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}