import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../hooks/useToast";
import { useUserValidation } from "./useUserValidation";
import { useUserOperations } from "./useUserOperations";
import { useFileUpload } from "./useFileUpload";
import { useUserSubmit } from "./useUserSubmit";

export const useUploadUsers = () => {
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

  const { handleFileUpload } = useFileUpload({
    users,
    setUsers,
    setCurrentPage,
    validateUser,
    checkDuplicates,
    toast
  });

  const { addUser, startEdit, saveEdit, cancelEdit, deleteUser } = useUserOperations({
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
  });

  const { handleSubmit } = useUserSubmit({
    users,
    setUsers,
    setIsSubmitting,
    validateUser,
    toast,
    navigate
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e, field) => {
    setEditingUser(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCancel = async () => {
    if (users.length > 0) {
      const Swal = (await import("sweetalert2")).default;
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
        navigate("/admin/dashboard");
      }
    } else {
      navigate("/admin/dashboard");
    }
  };

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

  return {
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
  };
};