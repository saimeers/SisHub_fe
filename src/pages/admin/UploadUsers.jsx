import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import UploadUsersTable from "../../modules/admin/components/UploadUsersTable";
import UploadUsersMobile from "../../modules/admin/components/UploadUsersMobile";
import QuantitySelector from "../../modules/admin/components/QuantitySelector";
import { useToast } from "../../hooks/useToast";
import Swal from "sweetalert2";
import { useUserValidation } from "../../modules/admin/hooks/useUserValidation";
import { parseCSV, formatErrorMessage } from "../../modules/admin/utils/csvParser";


const UploadUsers = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { validateUser, checkDuplicates } = useUserValidation();
  
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    codigo: "",
    nombre: "",
    documento: "",
    correo: "",
    telefono: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ==================== HANDLERS ====================

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e, field) => {
    setEditingUser(prev => ({ ...prev, [field]: e.target.value }));
  };

  const addUser = () => {
    if (!newUser.codigo || !newUser.nombre || !newUser.documento || !newUser.correo) {
      toast.warning("Por favor completa todos los campos obligatorios (código, nombre, documento, correo)");
      return;
    }

    const validationErrors = validateUser(newUser);
    if (validationErrors.length > 0) {
      toast.error(`Errores en ${newUser.nombre || 'el usuario'}:\n${validationErrors.join('\n')}`);
      return;
    }

    const duplicates = checkDuplicates(newUser, users);
    if (duplicates.length > 0) {
      toast.error(`El usuario ${newUser.nombre} ya existe con el mismo ${duplicates.join(', ')}`);
      return;
    }

    setUsers(prev => [...prev, { ...newUser, id: Date.now() }]);
    setNewUser({ codigo: "", nombre: "", documento: "", correo: "", telefono: "" });
    setCurrentPage(1);
    toast.success(`Usuario ${newUser.nombre} agregado correctamente`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = parseCSV(
        event.target.result,
        validateUser,
        checkDuplicates,
        users
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { newUsersToAdd, errors, duplicatesFound } = result;

      if (newUsersToAdd.length > 0) {
        setUsers(prev => [...prev, ...newUsersToAdd]);
        setCurrentPage(1);
        toast.success(`✓ ${newUsersToAdd.length} docente(s) importado(s) correctamente`);
      }

      if (duplicatesFound.length > 0) {
        toast.warning(`⚠ ${duplicatesFound.length} usuario(s) duplicado(s) omitido(s):\n${formatErrorMessage(duplicatesFound)}`);
      }

      if (errors.length > 0) {
        toast.error(`✗ ${errors.length} error(es) encontrado(s):\n${formatErrorMessage(errors)}`);
      }

      if (newUsersToAdd.length === 0 && errors.length === 0 && duplicatesFound.length === 0) {
        toast.warning("No se encontraron usuarios válidos para importar");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startEdit = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    setEditingIndex(actualIndex);
    setEditingUser({ ...users[actualIndex] });
  };

  const saveEdit = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;

    const validationErrors = validateUser(editingUser);
    if (validationErrors.length > 0) {
      toast.error(`Errores en ${editingUser.nombre}:\n${validationErrors.join('\n')}`);
      return;
    }

    const duplicates = checkDuplicates(editingUser, users, actualIndex);
    if (duplicates.length > 0) {
      toast.error(`Ya existe otro usuario con el mismo ${duplicates.join(', ')}`);
      return;
    }

    const updatedUsers = [...users];
    updatedUsers[actualIndex] = editingUser;
    setUsers(updatedUsers);
    setEditingIndex(null);
    setEditingUser(null);
    toast.success(`Usuario ${editingUser.nombre} actualizado correctamente`);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingUser(null);
  };

 const deleteUser = async (index) => {
  const actualIndex = (currentPage - 1) * itemsPerPage + index;
  const userName = users[actualIndex].nombre;

  const result = await Swal.fire({
    title: `¿Eliminar a ${userName}?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    setUsers((prev) => prev.filter((_, i) => i !== actualIndex));

    const totalPages = Math.ceil((users.length - 1) / itemsPerPage);
    if (currentPage > totalPages && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }

    toast.warning(`Usuario ${userName} eliminado`);
    Swal.fire({
      title: "Eliminado",
      text: `${userName} ha sido eliminado correctamente.`,
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  }
};


  const handleSubmit = () => {
    if (users.length === 0) {
      toast.warning("No hay docentes para cargar");
      return;
    }

    const invalidUsers = [];
    users.forEach((user) => {
      const errors = validateUser(user);
      if (errors.length > 0) {
        invalidUsers.push(`${user.nombre}: ${errors.join(', ')}`);
      }
    });

    if (invalidUsers.length > 0) {
      toast.error(`No se puede guardar. Hay ${invalidUsers.length} usuario(s) con errores:\n${formatErrorMessage(invalidUsers, 2)}`);
      return;
    }

    // Aquí iría la lógica para enviar los datos al backend
    toast.success(`✓ ${users.length} docente(s) guardado(s) exitosamente`);
    setTimeout(() => navigate("/admin"), 2000);
  };

  const handleCancel = () => {
    if (users.length > 0) {
      if (confirm("¿Cancelar? Se perderán todos los docentes agregados")) {
        navigate("/admin");
      }
    } else {
      navigate("/admin");
    }
  };

  // ==================== PAGINACIÓN ====================

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const adjustedEditingIndex = editingIndex !== null &&
    editingIndex >= startIndex &&
    editingIndex < endIndex
    ? editingIndex - startIndex
    : null;

  const goToPage = (page) => {
    setCurrentPage(page);
    setEditingIndex(null);
  };

  return (
    <AdminLayout title="Cargar Docentes">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div>
              <p className="text-gray-600">Añade docentes manualmente o importa desde un archivo CSV</p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Importar CSV
              </div>
            </label>
          </div>
          <p className="text-sm text-gray-500">Formato CSV: codigo,nombre,documento,correo,telefono</p>
          <p className="text-xs text-purple-600 mt-1">* Los correos deben ser @ufps.edu.co</p>
        </div>

        {/* Cantidad de registros y contador */}
        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <QuantitySelector
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            />
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-right">
              Mostrando {startIndex + 1}-{Math.min(endIndex, users.length)} de {users.length} docentes
            </p>
          </div>
        )}

        {/* Table / Mobile View */}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Guardar ({users.length})
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UploadUsers;