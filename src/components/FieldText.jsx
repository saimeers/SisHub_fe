import React from "react";

const FieldText = ({ type, id, name, onChange, onWheel, value, placeholder, disabled,  maxLength }) => {
  return (
    <input
      className="p-3 rounded-md bg-gray-100 w-full focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
      type={type}
      id={id}
      name={name} 
      value={value}
      onChange={onChange}
      onWheel={onWheel}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
};

export default FieldText;
