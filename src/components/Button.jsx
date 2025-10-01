function Button({ onClick, text = "Iniciar" }) {
  return (
    <button
        onClick={onClick}
        className="px-6 py-2.5 rounded-full text-white font-medium shadow-sm hover:brightness-110 active:scale-95 transition-all duration-150"
        style={{ backgroundColor: "#4285F4" }}
    >
      {text}
    </button>
  )
}

export default Button
