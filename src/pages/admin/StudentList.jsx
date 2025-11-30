import React from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import StudentList from "../../components/ui/StudentList";
import { obtenerTodosLosEstudiantes } from "../../services/userServices";

const StudentListPage = () => {
  return (
    <AdminLayout title="Estudiantes de ingeniería de sistemas">
      <StudentList basePath="/admin/students" fetchStudents={obtenerTodosLosEstudiantes} showExportButton={true} />
    </AdminLayout>
  );
};

export default StudentListPage;
