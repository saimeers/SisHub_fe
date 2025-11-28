import React from "react";
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import StudentList from "../../components/ui/StudentList";
import { obtenerTodosLosEstudiantes } from "../../services/userServices";

const StudentListProfessor = () => {
    return (
        <ProfessorLayout title="Estudiantes de ingeniería de sistemas">
            <StudentList basePath="/professor/students" fetchStudents={obtenerTodosLosEstudiantes} />
        </ProfessorLayout>
    );
};

export default StudentListProfessor;
