import { useState } from "react";
import FieldText from "../../../components/ui/FieldText";
import Button from "../../../components/ui/Button";

const JoinGroupForm = ({ onJoin, onCancel }) => {
  const [accessKey, setAccessKey] = useState("");

  const handleJoinGroup = () => {
    onJoin(accessKey);
    setAccessKey("");
  };

  const handleCancel = () => {
    setAccessKey("");
    onCancel();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-t border-gray-200">
      {/* Input no editable (información) */}
      <div className="mb-3">
        <FieldText
          type="text"
          value="Selecciona el grupo al que deseas unirte"
          disabled={true}
          className="text-gray-600 italic text-sm"
        />
      </div>

      {/* Label e input para clave de acceso */}
      <div className="mb-4">
        <label
          htmlFor="accessKey"
          className="block text-sm font-medium text-black mb-2"
        >
          Ingresar clave de acceso
        </label>
        <FieldText
          type="text"
          id="accessKey"
          name="accessKey"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          placeholder="Ingrese la clave de acceso"
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <Button type="button" text="Unirme" onClick={handleJoinGroup} />
        <Button
          type="button"
          text="Cancelar"
          variant="secondary"
          onClick={handleCancel}
        />
      </div>
    </div>
  );
};

export default JoinGroupForm;
