import AdminLayout from "../../modules/admin/layouts/AdminLayout";
import Button from "../../components/Button";
import RowItem from "../../components/RowItem";

const Groups = () => {
  const handleCreateGroup = () => {
    console.log("Crear grupo");
  };

  // Datos de ejemplo
  const groupsData = [
    [
      "Grupo A | 2025-2",
      "20 participantes",
      "Docente: XXXXXXXX",
      "clave de acceso",
      "Inhabilitado",
    ],
    [
      "Grupo B | 2025-2",
      "15 participantes",
      "Docente: XXXXXXXX",
      "clave de acceso",
      "Habilitado",
    ],
  ];

  const handleStatusChange = (index, newStatus) => {
    console.log(`Grupo ${index + 1} cambió a: ${newStatus}`);
  };

  return (
    <AdminLayout title="Grupos">
      <div className="mb-4 flex justify-end">
        <Button onClick={handleCreateGroup} text="Crear Grupo" />
      </div>
      <hr className="border-gray-300 mb-4" />
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Grupos Existentes
      </h2>

      <div className="space-y-2">
        {groupsData.map((group, index) => (
          <RowItem
            key={index}
            columns={group.slice(0, 4)}
            status={group[4]}
            onStatusChange={(newStatus) => handleStatusChange(index, newStatus)}
            editable={true}
          />
        ))}
      </div>
    </AdminLayout>
  );
};

export default Groups;
