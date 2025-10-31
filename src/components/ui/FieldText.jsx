import React, { useId } from "react";

const FieldText = ({ label, type, id, name, onChange, onWheel, onKeyDown, value, placeholder, disabled, maxLength, style, min, pattern, inputMode }) => {
  const reactId = useId();
  const uniqueId = id ? `${id}-${reactId}` : reactId;
  return (

    <div className="flex flex-col">
      {label && <label className="text-sm font-medium mb-1" htmlFor={uniqueId}>{label}</label>}
      <input
        id={uniqueId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        pattern={pattern}
        inputMode={inputMode}
        style={style}
        className="p-3 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#C03030]"
      />
    </div>
  );
};

export default FieldText;
