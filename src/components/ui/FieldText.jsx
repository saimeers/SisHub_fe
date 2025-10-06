import React from "react";

const FieldText = ({ type, id, name, onChange, onWheel, onKeyDown, value, placeholder, disabled, maxLength, style, min }) => {
  return (
    <input
      className="p-3 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#C03030]"
      type={type}
      id={id}
      name={name} 
      value={value}
      onChange={onChange}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      min={min}
      style={style}
    />
  );
};

export default FieldText;
