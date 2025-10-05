import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";

// auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import FormRegister from "./pages/auth/FormRegister";
import ResetPassword from "./pages/auth/ResetPassword";

// admin
import AdminDashboard from "./pages/admin/Dashboard";
import GroupsAdmin from "./pages/admin/Groups";
import CreateGroupAdmin from "./pages/admin/FormCreateGroup";

// docente
import GroupsProfessor from "./pages/professor/Groups";
import DashboardProfessor from "./pages/professor/Dashboard";
import CreateGroupProfessor from "./pages/professor/FormCreateGroup";

// estudiante
import DashboardStudent from "./pages/student/Dashboard";
import GroupsStudent from "./pages/student/Groups";

// stand by
import CuentaPendiente from "./pages/standby/CuentaPendiente";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ==================== RUTAS PÚBLICAS ==================== */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/complete-profile"
            element={
              <ProtectedRoute>
                <FormRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* ==================== RUTAS ADMIN ==================== */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="groups" element={<GroupsAdmin />} />
            <Route path="create-group" element={<CreateGroupAdmin />} />
          </Route>

          {/* ==================== RUTAS DOCENTE ==================== */}
          <Route
            path="/professor"
            element={<ProtectedRoute allowedRoles={["DOCENTE"]} />}
          >
            <Route path="dashboard" element={<DashboardProfessor />} />
            <Route path="groups" element={<GroupsProfessor />} />
            <Route path="create-group" element={<CreateGroupProfessor />} />
          </Route>

          {/* ==================== RUTAS ESTUDIANTE ==================== */}
          <Route
            path="/student"
            element={<ProtectedRoute allowedRoles={["ESTUDIANTE"]} />}
          >
            <Route path="dashboard" element={<DashboardStudent />} />
            <Route path="grupos" element={<GroupsStudent />} />
          </Route>

          {/* ==================== RUTAS ESPECIALES ==================== */}
          <Route path="/account-pending" element={<CuentaPendiente />} />

          {/* ==================== REDIRECTS ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
