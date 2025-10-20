import React from "react";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import UploadUsersHeader from "../../modules/admin/components/uploadProfessor/UploadUsersHeader";
import UploadUsersControls from "../../modules/admin/components/uploadProfessor/UploadUsersControls";
import UploadUsersTable from "../../modules/admin/components/uploadProfessor/UploadUsersTable";
import UploadUsersMobile from "../../modules/admin/components/uploadProfessor/UploadUsersMobile";
import UploadUsersPagination from "../../modules/admin/components/uploadProfessor/UploadUsersPagination";
import UploadUsersActions from "../../modules/admin/components/uploadProfessor/UploadUsersActions";
import { useUploadUsers } from "../../modules/admin/hooks/uploadProfessor/useUploadUsers";

const UploadUsers = () => {
  const {
    users,
    newUser,
    editingIndex,
    editingUser,
    itemsPerPage,
    currentPage,
    isSubmitting,
    paginatedUsers,
    totalPages,
    startIndex,
    endIndex,
    adjustedEditingIndex,
    handleInputChange,
    handleEditInputChange,
    addUser,
    handleFileUpload,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteUser,
    handleSubmit,
    handleCancel,
    setItemsPerPage,
    setCurrentPage,
    goToPage,
  } = useUploadUsers();

  return (
    <AdminLayout title="Cargar Docentes">
      <div className="space-y-6">
        <UploadUsersHeader 
          onFileUpload={handleFileUpload}
          isSubmitting={isSubmitting}
        />

        {users.length > 0 && (
          <UploadUsersControls
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            startIndex={startIndex}
            endIndex={endIndex}
            totalUsers={users.length}
          />
        )}

        <UploadUsersTable
          users={paginatedUsers}
          newUser={newUser}
          editingIndex={adjustedEditingIndex}
          editingUser={editingUser}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddUser={addUser}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteUser={deleteUser}
        />

        <UploadUsersMobile
          users={paginatedUsers}
          newUser={newUser}
          editingIndex={adjustedEditingIndex}
          editingUser={editingUser}
          onInputChange={handleInputChange}
          onEditInputChange={handleEditInputChange}
          onAddUser={addUser}
          onStartEdit={startEdit}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onDeleteUser={deleteUser}
        />

        {totalPages > 1 && (
          <UploadUsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        )}

        <UploadUsersActions
          usersCount={users.length}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </AdminLayout>
  );
};

export default UploadUsers;