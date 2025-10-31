import React from 'react';
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import Rejected from "../../modules/student/components/RejectedIdea";

const RejectedIdea = () => {
    return (
        <ProfessorLayout title="Revisión">
            <Rejected />
        </ProfessorLayout>
    )
}

export default RejectedIdea;