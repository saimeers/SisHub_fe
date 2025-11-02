import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";

// auth
import Login from "./pages/auth/Login";
/* import FormRegister from "./pages/auth/FormRegister"; */
import ResetPassword from "./pages/auth/ResetPassword";
import FormPassword from "./pages/auth/FormPassword";

// admin
import AdminDashboard from "./pages/admin/Dashboard";
import GroupsAdmin from "./pages/admin/Groups";
import AllGroupsAdmin from "./pages/admin/AllGroups";
import CreateGroupAdmin from "./modules/admin/components/FormCreateGroup";
import SubjectsAdmin from "./pages/admin/Subjects";
import FormCreateSubject from "./modules/admin/components/FormCreateSubject";
import FormEditSubject from "./modules/admin/components/FormEditSubject";
import GroupDetail from "./pages/admin/GroupDetail";
import UploadUsers from "./pages/admin/UploadUsers";
import UploadGroups from "./modules/admin/components/uploadGroups/UploadGroups";
import UploadSubjects from "./pages/admin/UploadSubjects";
import UploadStudents from "./pages/admin/UploadStudents";
import ProjectsAdmin from "./pages/admin/Projects";

// docente
import GroupsProfessor from "./pages/professor/Groups";
import DashboardProfessor from "./pages/professor/Dashboard";
import SubjectsProfessor from "./pages/professor/Subjects";
import MyGroupsProfessor from "./pages/professor/MyGroups";
import GroupDetailProfessor from "./pages/professor/GroupDetail";
import MyProjectsProfessor from "./pages/professor/MyProjects";

// estudiante
import DashboardStudent from "./pages/student/Dashboard";
import GroupsStudent from "./pages/student/Groups";
import StudentMyGroups from "./pages/student/MyGroups";
import SubjectsStudent from "./pages/student/Subjects";
import GroupDetailStudent from "./pages/student/GroupDetail";
import MyProjectsStudent from "./pages/student/MyProjects";

// stand by
import CuentaPendiente from "./pages/standby/CuentaPendiente";
import JoinGroup from "./modules/student/components/JoinGroup";

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
          {/*           <Route
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
          /> */}
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/establecer-contrasena"
            element={
              <ProtectedRoute>
                <FormPassword />
              </ProtectedRoute>
            }
          />

          {/* ==================== RUTAS ADMIN ==================== */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={["ADMIN"]} />}
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path=":codigo_materia/groups" element={<GroupsAdmin />} />
            <Route
              path=":codigo_materia/create-group"
              element={<CreateGroupAdmin />}
            />
            <Route path="all-groups" element={<AllGroupsAdmin />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="subjects/create" element={<FormCreateSubject />} />
            <Route path="subjects/edit/:codigo" element={<FormEditSubject />} />
            <Route
              path="groups/:codigo_materia/:nombre/:periodo/:anio"
              element={<GroupDetail />}
            />

            <Route path="upload-professors" element={<UploadUsers />} />
            <Route path="upload-students" element={<UploadStudents />} />
            <Route path="upload-groups" element={<UploadGroups />} />
            <Route path="upload-subjects" element={<UploadSubjects />} />
            <Route path="projects" element={<ProjectsAdmin />} />
          </Route>

          {/* ==================== RUTAS DOCENTE ==================== */}
          <Route
            path="/professor"
            element={<ProtectedRoute allowedRoles={["DOCENTE","ADMIN"]} />}
          >
            <Route path="dashboard" element={<DashboardProfessor />} />
            <Route
              path=":codigo_materia/groups"
              element={<GroupsProfessor />}
            />
            <Route path="my-groups" element={<MyGroupsProfessor />} />
            <Route path="subjects" element={<SubjectsProfessor />} />
            <Route
              path="my-group/:codigo_materia/:nombre/:periodo/:anio"
              element={<GroupDetailProfessor />}
            />
            <Route path="my-projects" element={<MyProjectsProfessor />} />
          </Route>

          {/* ==================== RUTAS ESTUDIANTE ==================== */}
          <Route
            path="/student"
            element={<ProtectedRoute allowedRoles={["ESTUDIANTE"]} />}
          >
            <Route path="dashboard" element={<DashboardStudent />} />
            <Route path=":codigo_materia/groups" element={<GroupsStudent />} />
            <Route path="my-groups" element={<StudentMyGroups />} />
            <Route path="subjects" element={<SubjectsStudent />} />
            <Route
              path="my-group/:codigo_materia/:nombre/:periodo/:anio"
              element={<GroupDetailStudent />}
            />
            <Route path="my-projects" element={<MyProjectsStudent />} />
          </Route>

          {/* ==================== RUTAS ESPECIALES ==================== */}
          <Route path="/account-pending" element={<CuentaPendiente />} />
          <Route path="/join-group" element={<JoinGroup />} />

          {/* ==================== REDIRECTS ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
