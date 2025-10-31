import React from "react";
import AdminLayout from "../layouts/AdminLayout";
import UploadSubjectsHeader from "./uploadSubjects/UploadSubjectsHeader";
import UploadSubjectsControlsForm from "./uploadSubjects/UploadSubjectsControlsForm";
import UploadSubjectsTableForm from "./uploadSubjects/UploadSubjectsTableForm";
import UploadSubjectsPaginationForm from "./uploadSubjects/UploadSubjectsPaginationForm";
import UploadSubjectsActionsForm from "./uploadSubjects/UploadSubjectsActionsForm";
import { useSubjectForm } from "../hooks/useSubjectForm";

const FormCreateSubject = () => {
  const {
    subjects,
    newSubject,
    editingIndex,
    editingSubject,
    itemsPerPage,
    currentPage,
    isSubmitting,
    paginatedSubjects,
    totalPages,
    startIndex,
    endIndex,
    adjustedEditingIndex,
    handleInputChange,
    handleEditInputChange,
    addSubject,
    handleFileUpload,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteSubject,
    handleSubmit,
    handleCancel,
    setItemsPerPage,
    setCurrentPage,
    goToPage,
    prerequisiteOptions,
    handlePrerequisitesChange,
    handleEditPrerequisitesChange,
    selectedPrerequisites,
    editingPrerequisites,
  } = useSubjectForm();

  return (
    <AdminLayout title="Crear materias">
      <div className="space-y-6">
        <UploadSubjectsHeader
          onFileUpload={handleFileUpload}
          isSubmitting={isSubmitting}
        />

        {subjects.length > 0 && (
          <UploadSubjectsControlsForm
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
            totalSubjects={subjects.length}
          />
        )}

        <UploadSubjectsTableForm
          subjects={paginatedSubjects}
          newSubject={newSubject}
          editingIndex={adjustedEditingIndex}
          editingSubject={editingSubject}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddSubject={addSubject}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteSubject={deleteSubject}
          prerequisiteOptions={prerequisiteOptions}
          onPrerequisitesChange={handlePrerequisitesChange}
          onEditPrerequisitesChange={handleEditPrerequisitesChange}
          selectedPrerequisites={selectedPrerequisites}
          editingPrerequisites={editingPrerequisites}
        />

        {totalPages > 1 && (
          <UploadSubjectsPaginationForm
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        <UploadSubjectsActionsForm
          subjectsCount={subjects.length}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default FormCreateSubject;
