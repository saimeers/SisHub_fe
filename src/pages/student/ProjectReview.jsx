import React from 'react';
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import SuggestionReview from "../../modules/student/components/SuggestionReview";

const ProjectReview = () => {
    return (
        <StudentLayout title="Revisión">
            <SuggestionReview />
        </StudentLayout>
    )
}

export default ProjectReview