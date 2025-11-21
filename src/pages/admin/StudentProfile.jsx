import React from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";

const StudentProfile = () => {
  const { id } = useParams();

  return (
    <AdminLayout title="Perfil del Estudiante">
      <div className="w-full max-w-5xl mx-auto mt-10 py-6 px-6 bg-white rounded-2xl shadow-sm">
        <p className="text-gray-500">Perfil del estudiante con ID: {id}</p>
      </div>
    </AdminLayout>
  );
};

export default StudentProfile;
