import React from 'react';
import ProfessorLayout from "../../modules/professor/layouts/ProfessorLayout";
import SuggestionReview from "../../modules/professor/components/SuggestionReview";

const ProjectReview = () => {
    return (
        <ProfessorLayout title="Resultado de Revisión">
            <SuggestionReview />
        </ProfessorLayout>
    )
}

export default ProjectReview