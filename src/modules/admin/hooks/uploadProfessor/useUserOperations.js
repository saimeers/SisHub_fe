import Swal from "sweetalert2";

export const useUserOperations = ({
  users,
  setUsers,
  newUser,
  setNewUser,
  editingUser,
  setEditingUser,
  editingIndex,
  setEditingIndex,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  validateUser,
  checkDuplicates,
  toast
}) => {

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

  return {
    addUser,
    startEdit,
    saveEdit,
    cancelEdit,
    deleteUser
  };
};