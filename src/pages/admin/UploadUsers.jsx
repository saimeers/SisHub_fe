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
import { cargarDocentesMasivamente } from "../../services/userServices";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (users.length === 0) {
      toast.warning("No hay docentes para cargar");
      return;
    }

    // Validación final
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

    // Confirmar acción
    const result = await Swal.fire({
      title: "¿Confirmar carga de docentes?",
      html: `
        <div style="text-align: center;">
          <p>Se cargarán <strong>${users.length} docente(s)</strong> al sistema.</p>
          <ul style="margin-top: 10px; font-size: 0.9em; color: #374151;">
            <li>Podrán establecer su contraseña al ingresar</li>
          </ul>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#B70000",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cargar docentes",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      // Preparar datos (sin el id temporal)
      const docentesParaEnviar = users.map(({ id, ...user }) => user);

      // Llamar al servicio
      const response = await cargarDocentesMasivamente(docentesParaEnviar);

      // Mostrar resultados
      if (response.totalErrores === 0) {
        // ✅ Todo exitoso
        await Swal.fire({
          title: "¡Éxito!",
          html: `
            <div style="text-align: left;">
              <p style="color: #059669; font-weight: 600; margin-bottom: 10px;">
                ✅ Se cargaron <strong>${response.totalExitosos} docente(s)</strong> correctamente.
              </p>
              <ul style="font-size: 0.9em; color: #374151; max-height: 200px; overflow-y: auto;">
                ${response.exitosos.slice(0, 8).map(d => 
                  `<li>✓ ${d.nombre} (${d.codigo})</li>`
                ).join('')}
                ${response.exitosos.length > 8 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.exitosos.length - 8} más</li>` : ''}
              </ul>
              <p style="margin-top: 15px; font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #f3f4f6; border-radius: 6px;">
                Los docentes están <strong>HABILITADOS</strong> y pueden acceder al sistema.
              </p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#B70000",
          confirmButtonText: "Ir a lista de usuarios"
        });
        navigate("/admin/usuarios");
        
      } else if (response.totalExitosos === 0) {
        // ❌ Todo falló
        const erroresHTML = response.errores
          .slice(0, 8)
          .map(e => `<li style="margin-bottom: 8px;"><strong>${e.docente.nombre}:</strong> <span style="color: #dc2626;">${e.error}</span></li>`)
          .join('');
        
        await Swal.fire({
          title: "Error en la carga",
          html: `
            <div style="text-align: left;">
              <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
                ❌ No se pudo cargar ningún docente.
              </p>
              <ul style="font-size: 0.85em; max-height: 300px; overflow-y: auto; color: #374151;">
                ${erroresHTML}
                ${response.errores.length > 8 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.errores.length - 8} más</li>` : ''}
              </ul>
            </div>
          `,
          icon: "error",
          confirmButtonColor: "#B70000",
        });
        
      } else {
        // ⚠️ Carga parcial
        const exitososHTML = response.exitosos
          .slice(0, 5)
          .map(e => `<li style="color: #059669;">✅ ${e.nombre} (${e.codigo})</li>`)
          .join('');
        
        const erroresHTML = response.errores
          .slice(0, 5)
          .map(e => `<li style="margin-bottom: 6px;"><strong>${e.docente.nombre}:</strong> <span style="color: #dc2626; font-size: 0.9em;">${e.error}</span></li>`)
          .join('');

        const confirmResult = await Swal.fire({
          title: "Carga parcial completada",
          html: `
            <div style="text-align: left;">
              <p style="color: #059669; font-weight: 600; margin-bottom: 8px;">
                ✅ ${response.totalExitosos} exitoso(s):
              </p>
              <ul style="font-size: 0.85em; max-height: 140px; overflow-y: auto; margin-bottom: 15px;">
                ${exitososHTML}
                ${response.exitosos.length > 5 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.exitosos.length - 5} más</li>` : ''}
              </ul>
              
              <p style="color: #dc2626; font-weight: 600; margin-bottom: 8px;">
                ❌ ${response.totalErrores} error(es):
              </p>
              <ul style="font-size: 0.85em; max-height: 140px; overflow-y: auto;">
                ${erroresHTML}
                ${response.errores.length > 5 ? `<li style="color: #6b7280; font-style: italic;">... y ${response.errores.length - 5} más</li>` : ''}
              </ul>
            </div>
          `,
          icon: "warning",
          confirmButtonColor: "#B70000",
          showCancelButton: true,
          confirmButtonText: "Ver usuarios cargados",
          cancelButtonText: "Quedarme aquí"
        });

        if (confirmResult.isConfirmed) {
          navigate("/admin/usuarios");
        } else {
          // Limpiar solo los exitosos
          const exitososCodigos = new Set(response.exitosos.map(e => e.codigo));
          setUsers(users.filter(u => !exitososCodigos.has(u.codigo)));
          toast.info(`Quedan ${users.length - response.totalExitosos} usuario(s) pendientes`);
        }
      }

    } catch (error) {
      console.error("Error al cargar docentes:", error);
      
      const errorMessage = error.response?.data?.error || error.error || error.message || "Error desconocido";
      const errorDetalle = error.response?.data?.detalle || error.detalle || "";
      
      Swal.fire({
        title: "Error del servidor",
        html: `
          <div style="text-align: left;">
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 10px;">
              ${errorMessage}
            </p>
            ${errorDetalle ? `
              <p style="font-size: 0.85em; color: #6b7280; padding: 10px; background-color: #fef2f2; border-left: 3px solid #dc2626; border-radius: 4px;">
                ${errorDetalle}
              </p>
            ` : ''}
            <p style="font-size: 0.85em; color: #6b7280; margin-top: 15px;">
              Por favor intenta de nuevo o contacta al soporte técnico.
            </p>
          </div>
        `,
        icon: "error",
        confirmButtonColor: "#B70000",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (users.length > 0) {
      const result = await Swal.fire({
        title: "¿Cancelar carga?",
        text: `Se perderán ${users.length} docente(s) agregado(s)`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, continuar",
      });

      if (result.isConfirmed) {
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
                disabled={isSubmitting}
              />
              <div className={`bg-[#B70000] hover:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Importar CSV
              </div>
            </label>
          </div>
          <p className="text-sm text-gray-500">Formato CSV: codigo,nombre,documento,correo,telefono</p>
          <p className="text-xs text-red-700 mt-1">* Los correos deben ser @ufps.edu.co</p>
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
            disabled={isSubmitting}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || users.length === 0}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar ({users.length})
              </>
            )}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UploadUsers;