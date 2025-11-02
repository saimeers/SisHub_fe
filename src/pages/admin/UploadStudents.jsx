import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Check } from "lucide-react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import UploadStudentsHeader from "../../modules/admin/components/uploadStudents/UploadStudentsHeader";
import UploadStudentsTable from "../../modules/admin/components/uploadStudents/UploadStudentsTable";
import UploadStudentsMobile from "../../modules/admin/components/uploadStudents/UploadStudentsMobile";
import UploadStudentsControls from "../../modules/admin/components/uploadStudents/UploadStudentsControls";
import UploadStudentsPagination from "../../modules/admin/components/uploadStudents/UploadStudentsPagination";
import UploadStudentsActions from "../../modules/admin/components/uploadStudents/UploadStudentsActions";
import ProgressModal from "../../modules/admin/components/ProgressModal";
import { useUploadStudents } from "../../modules/admin/hooks/uploadStudents/useUploadStudents";

const UploadStudents = () => {
  const navigate = useNavigate();
  const {
    students,
    newStudent,
    editingIndex,
    editingStudent,
    itemsPerPage,
    currentPage,
    isSubmitting,
    paginatedStudents,
    totalPages,
    startIndex,
    endIndex,
    adjustedEditingIndex,
    handleInputChange,
    handleEditInputChange,
    addStudent,
    handleFileUpload,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteStudent,
    handleSubmit,
    handleCancel,
    setItemsPerPage,
    setCurrentPage,
    goToPage,
    handleStudentCodeBlur,
    availableGroups,
    loadingStudent,
    showProgressModal,
    progressData,
    handleCloseProgress,
  } = useUploadStudents();

  const goToDashboard = () => navigate("/admin/dashboard");

  return (
    <AdminLayout title="Cargar Estudiantes">
      <div className="space-y-6">
        <UploadStudentsHeader
          onFileUpload={handleFileUpload}
          isSubmitting={isSubmitting}
        />

        {/* Stats */}
        {students.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Grupos Diferentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(students.map(s => `${s.codigo_materia}-${s.nombre_grupo}-${s.periodo}-${s.anio}`)).size}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className="text-lg font-semibold text-green-600">Listo para enviar</p>
                </div>
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        )}

        {students.length > 0 && (
          <UploadStudentsControls
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
            totalStudents={students.length}
          />
        )}

        <UploadStudentsTable
          students={paginatedStudents}
          newStudent={newStudent}
          editingIndex={adjustedEditingIndex}
          editingStudent={editingStudent}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddStudent={addStudent}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteStudent={deleteStudent}
          onStudentCodeBlur={handleStudentCodeBlur}
          availableGroups={availableGroups}
          loadingStudent={loadingStudent}
        />

        <UploadStudentsMobile
          students={paginatedStudents}
          newStudent={newStudent}
          editingIndex={adjustedEditingIndex}
          editingStudent={editingStudent}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddStudent={addStudent}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteStudent={deleteStudent}
          onStudentCodeBlur={handleStudentCodeBlur}
          availableGroups={availableGroups}
          loadingStudent={loadingStudent}
        />

        {totalPages > 1 && (
          <UploadStudentsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        <UploadStudentsActions
          studentsCount={students.length}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>

      {showProgressModal && (
        <ProgressModal
          onGoDashboard={goToDashboard}
          progress={progressData}
          onClose={handleCloseProgress}
        />
      )}
    </AdminLayout>
  );
};

export default UploadStudents;