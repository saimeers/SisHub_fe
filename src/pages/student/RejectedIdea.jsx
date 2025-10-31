import React from 'react';
import StudentLayout from "../../modules/student/layouts/StudentLayout";
import Rejected from "../../modules/student/components/RejectedIdea";

const RejectedIdea = () => {
    return (
        <StudentLayout title="Revisión">
            <Rejected />
        </StudentLayout>
    )
}

export default RejectedIdea;