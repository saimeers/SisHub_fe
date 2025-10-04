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

// docente
import DocenteDashboard from "./pages/professor/Dashboard";

// estudiante
import EstudianteDashboard from "./pages/student/Dashboard";

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
            path="/registro"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route 
            path="/registro/completar-datos" 
            element={<FormRegister />} 
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
          </Route>

          {/* ==================== RUTAS DOCENTE ==================== */}
          <Route
            path="/docente"
            element={<ProtectedRoute allowedRoles={["DOCENTE"]} />}
          >
            <Route path="dashboard" element={<DocenteDashboard />} />
          </Route>

          {/* ==================== RUTAS ESTUDIANTE ==================== */}
          <Route
            path="/estudiante"
            element={<ProtectedRoute allowedRoles={["ESTUDIANTE"]} />}
          >
            <Route path="dashboard" element={<EstudianteDashboard />} />
          </Route>

          {/* ==================== RUTAS ESPECIALES ==================== */}
          <Route path="/cuenta-pendiente" element={<CuentaPendiente />} />

          {/* ==================== REDIRECTS ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;