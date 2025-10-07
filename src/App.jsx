import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";

// auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/SignUp";
import FormRegister from "./pages/auth/FormRegister";
import ResetPassword from "./pages/auth/ResetPassword";

// admin
import AdminDashboard from "./pages/admin/Dashboard";
import GroupsAdmin from "./pages/admin/Groups";
import CreateGroupAdmin from "./pages/admin/FormCreateGroup";
import SubjectsAdmin from "./pages/admin/Subjects";
import FormCreateSubject from "./pages/admin/FormCreateSubject";
import FormEditSubject from "./pages/admin/FormEditSubject";

// docente
import GroupsProfessor from "./pages/professor/Groups";
import DashboardProfessor from "./pages/professor/Dashboard";
import CreateGroupProfessor from "./pages/professor/FormCreateGroup";
import SubjectsProfessor from "./pages/professor/Subjects";

// estudiante
import DashboardStudent from "./pages/student/Dashboard";
import GroupsStudent from "./pages/student/Groups";
import SubjectsStudent from "./pages/student/Subjects";

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
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="subjects/create" element={<FormCreateSubject />} />
            <Route path="subjects/edit/:id" element={<FormEditSubject />} />
          </Route>

          {/* ==================== RUTAS DOCENTE ==================== */}
          <Route
            path="/professor"
            element={<ProtectedRoute allowedRoles={["DOCENTE"]} />}
          >
            <Route path="dashboard" element={<DashboardProfessor />} />
            <Route path="groups" element={<GroupsProfessor />} />
            <Route path="create-group" element={<CreateGroupProfessor />} />
            <Route path="subjects" element={<SubjectsProfessor />} />
          </Route>

          {/* ==================== RUTAS ESTUDIANTE ==================== */}
          <Route
            path="/student"
            element={<ProtectedRoute allowedRoles={["ESTUDIANTE"]} />}
          >
            <Route path="dashboard" element={<DashboardStudent />} />
            <Route path="grupos" element={<GroupsStudent />} />
            <Route path="subjects" element={<SubjectsStudent />} />
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
