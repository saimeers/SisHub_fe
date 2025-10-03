import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";
import Signup from "./pages/auth/SignUp";
import FormRegister from "./pages/auth/FormRegister";
import ResetPassword from "./pages/auth/ResetPassword";
import Groups from "./pages/admin/Groups";
import CreateGroup from "./pages/admin/FormCreateGroup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Signup />} />
        <Route path="/registro/completar-datos" element={<FormRegister />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/groups" element={<Groups />} />
        <Route path="/admin/create-group" element={<CreateGroup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
