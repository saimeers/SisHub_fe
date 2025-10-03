import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Signup from "./pages/auth/SignUp";
import FormRegister from "./pages/auth/FormRegister";
import ResetPassword from "./pages/auth/ResetPassword";
import GroupsAdmin from "./pages/admin/Groups";
import CreateGroupAdmin from "./pages/admin/FormCreateGroup";
import GroupsProfessor from "./pages/professor/Groups";
import DashboardProfessor from "./pages/professor/Dashboard";
import CreateGroupProfessor from "./pages/professor/FormCreateGroup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Signup />} />
        <Route path="/registro/completar-datos" element={<FormRegister />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/groups" element={<GroupsAdmin />} />
        <Route path="/admin/crear-grupo" element={<CreateGroupAdmin />} />
        <Route path="/docente/dashboard" element={<DashboardProfessor />} />
        <Route path="/docente/grupos" element={<GroupsProfessor />} />
        <Route path="/docente/crear-grupo" element={<CreateGroupProfessor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
