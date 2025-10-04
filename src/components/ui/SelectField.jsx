import React from "react";
import Select from "react-select";

const SelectField = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  isClearable = true,
  disabled = false,
}) => {
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      padding: "12px",
      borderRadius: "6px",
      backgroundColor: "#f3f4f6",
      border: "none",
      boxShadow: state.isFocused ? "0 0 0 2px #C03030" : "none",
      "&:hover": {
        border: "none",
      },
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "not-allowed" : "default",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#9ca3af",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#374151",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#6b7280",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#f3f4f6",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#C03030"
        : state.isFocused
        ? "#fceded"
        : "#f3f4f6",
      color: state.isSelected ? "#ffffff" : "#374151",
      "&:hover": {
        backgroundColor: state.isSelected ? "#C03030" : "#fecaca",
        color: state.isSelected ? "#ffffff" : "#374151",
      },
    }),
  };

  return (
    <Select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={disabled}
      styles={customSelectStyles}
    />
  );
};

export default SelectField;
