import React from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import ProfileView from "../../components/ui/ProfileView";

const StudentProfile = () => {
  return (
    <ProfessorLayout title="Perfil del Estudiante">
      <ProfileView backPath="/professor/students" />
    </ProfessorLayout>
  );
};

export default StudentProfile;
