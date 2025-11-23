import React from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import ProfileView from "../../components/ui/ProfileView";

const StudentProfile = () => {
  return (
    <AdminLayout title="Perfil del Estudiante">
      <ProfileView backPath="/admin/students" />
    </AdminLayout>
  );
};

export default StudentProfile;
