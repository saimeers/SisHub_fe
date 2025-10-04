function Button({ onClick, text = "Iniciar", variant = "primary", type = "button", disabled = false }) {
  const getButtonStyles = () => {
    const baseStyles = "px-6 py-2.5 rounded-full text-white font-medium shadow-sm hover:brightness-118 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
    
    switch (variant) {
      case "secondary":
        return `${baseStyles}`;
      case "primary":
      default:
        return `${baseStyles}`;
    }
  };

  const getButtonColor = () => {
    if (variant === "secondary") return { backgroundColor: "#93969B" };
    return { backgroundColor: "#EB4438" };
  };

  return (
    <button
        type={type}
        onClick={onClick}
        className={getButtonStyles()}
        style={getButtonColor()}
        disabled={disabled}
    >
      {text}
    </button>
  )
}

export default Button;
