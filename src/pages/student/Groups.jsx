import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../modules/professor/layouts/ProfessorLayout";
import RowItem from "../../components/RowItem";
import FieldText from "../../components/FieldText";
import JoinGroupForm from "../../modules/student/components/JoinGroupForm";

const Groups = () => {
  const navigate = useNavigate();
  const [selectedMateria, setSelectedMateria] = useState(
    "Matemáticas Avanzadas"
  );

  const handleJoinGroup = (accessKey) => {
    console.log("Unirse al grupo con clave:", accessKey);
  };

  const handleCancel = () => {
    console.log("Cancelar unirse al grupo");
  };

  // Datos de ejemplo
  const groupsData = [
    ["Grupo A | 2025-2", "Docente: XXXXXXXX", "Inhabilitado"],
    ["Grupo B | 2025-2", "Docente: XXXXXXXX", "Habilitado"],
    ["Grupo C | 2025-2", "Docente: YYYYYYYY", "Habilitado"],
    ["Grupo D | 2025-2", "Docente: ZZZZZZZZ", "Inhabilitado"],
    ["Grupo E | 2025-2", "Docente: AAAAAAAA", "Habilitado"],
    ["Grupo F | 2025-2", "Docente: BBBBBBBB", "Inhabilitado"],
    ["Grupo G | 2025-2", "Docente: CCCCCCCC", "Habilitado"],
    ["Grupo H | 2025-2", "Docente: DDDDDDDD", "Habilitado"],
    ["Grupo I | 2025-2", "Docente: EEEEEEEE", "Inhabilitado"],
    ["Grupo J | 2025-2", "Docente: FFFFFFFF", "Habilitado"],
    ["Grupo K | 2025-2", "Docente: GGGGGGGG", "Inhabilitado"],
    ["Grupo L | 2025-2", "Docente: HHHHHHHH", "Habilitado"],
  ];

  const handleStatusChange = (index, newStatus) => {
    console.log(`Grupo ${index + 1} cambió a: ${newStatus}`);
  };

  return (
    <AdminLayout title="Grupos">
      <div className="flex flex-col h-full">
        {/* Materia seleccionada */}
        <div className="mb-6">
          <label
            htmlFor="materia"
            className="block text-base font-semibold text-gray-800 mb-2"
          >
            Materia
          </label>
          <FieldText
            type="text"
            id="materia"
            name="materia"
            value={selectedMateria}
            disabled={true}
            className="text-lg font-semibold"
          />
        </div>

        {/* Título de grupos */}
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Grupos Existentes
        </h2>

        {/* Área de tarjetas con scroll */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-6">
          {groupsData.map((group, index) => (
            <RowItem
              key={index}
              columns={group.slice(0, 2)}
              status={group[2]}
              onStatusChange={(newStatus) =>
                handleStatusChange(index, newStatus)
              }
              editable={false}
            />
          ))}
        </div>

        {/* Sección de unirme a un grupo */}
        <JoinGroupForm onJoin={handleJoinGroup} onCancel={handleCancel} />
      </div>
    </AdminLayout>
  );
};

export default Groups;
