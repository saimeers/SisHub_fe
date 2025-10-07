import React from "react";
import { FiSettings, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const gradientClasses = [
  "from-purple-500 to-indigo-500",
  "from-teal-400 to-cyan-500",
  "from-pink-500 to-rose-500",
  "from-yellow-400 to-orange-400",
  "from-sky-500 to-blue-600",
];

const SubjectCard = ({ subject, index = 0, onDetails, showSettings = true }) => {
  const gradient = gradientClasses[index % gradientClasses.length];
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/admin/subjects/edit/${subject.id_materia}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden hover:scale-[1.02] transition-all duration-300 ease-in-out">
      <div className={`bg-gradient-to-r ${gradient} px-6 py-6 text-white`}> 
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-extrabold drop-shadow-sm">
            {subject?.nombre}
          </h3>
          {showSettings && (
            <button
              type="button"
              className="w-9 h-9 bg-white/25 hover:bg-white/35 rounded-full grid place-items-center text-white"
              title="Opciones"
            >
              <FiSettings size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-5 text-gray-700">
        <p className="text-sm">
          <span className="text-gray-500">Codigo:</span> <span className="font-semibold">{subject?.codigo}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Creditos:</span> {" "}{subject?.creditos}
        </p>
        {subject?.prerrequisitos && (
          <p className="text-sm">
            <span className="text-gray-500">Prerrequisito:</span> {" "}{subject.prerrequisitos}
          </p>
        )}
        {subject?.tipo && (
          <p className="text-sm">
            <span className="text-gray-500">Tipo:</span> {" "}{subject.tipo}
          </p>
        )}
        {subject?.id_area != null && (
          <p className="text-sm">
            <span className="text-gray-500">Area Conocimiento:</span> {" "}{subject.id_area}
          </p>
        )}

        <div className="pt-4 flex gap-2 justify-center">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md flex items-center gap-1"
            onClick={handleEdit}
          >
            <FiEdit size={14} />
            Editar
          </button>
          <button
            type="button"
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
            onClick={() => onDetails?.(subject)}
          >
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectCard;


