import React from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import UploadSubjectsHeader from "../../modules/admin/components/UploadSubjectsHeader";
import UploadSubjectsControls from "../../modules/admin/components/UploadSubjectsControls";
import UploadSubjectsTable from "../../modules/admin/components/UploadSubjectsTable";
import UploadSubjectsMobile from "../../modules/admin/components/UploadSubjectsMobile";
import UploadSubjectsPagination from "../../modules/admin/components/UploadSubjectsPagination";
import UploadSubjectsActions from "../../modules/admin/components/UploadSubjectsActions";
import { useUploadSubjects } from "../../modules/admin/hooks/useUploadSubjects";

const UploadSubjects = () => {
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
  } = useUploadSubjects();

  return (
    <AdminLayout title="Cargar Materias">
      <div className="space-y-6">
        <UploadSubjectsHeader 
          onFileUpload={handleFileUpload}
          isSubmitting={isSubmitting}
        />

        {subjects.length > 0 && (
          <UploadSubjectsControls
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

        <UploadSubjectsTable
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
        />

        <UploadSubjectsMobile
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
        />

        {totalPages > 1 && (
          <UploadSubjectsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        <UploadSubjectsActions
          subjectsCount={subjects.length}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default UploadSubjects;
