import React from "react";

const ButtonGoogle = ({ onClick, text = "Continue with Google" }) => {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center justify-center gap-3 px-5 py-2.5 
                 rounded-full border border-gray-300 font-medium 
                 bg-white text-gray-700 shadow-md
                 transition-all duration-300 ease-in-out
                 hover:text-white hover:shadow-lg active:scale-95
                 overflow-hidden"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-[#d4d4d4] via-[#C03030] to-[#d4d4d4] 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

      <span className="relative flex items-center gap-3">
        <div className="w-5 h-5 transition-transform duration-300 group-hover:scale-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-5 h-5"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 
              30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 
              6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 
              2.96-2.26 5.48-4.78 7.18l7.73 
              6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 
              16.46 0 20.12 0 24c0 3.88.92 7.54 
              2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 
              1.45-4.92 2.3-8.16 2.3-6.26 
              0-11.57-4.22-13.47-9.91l-7.98 
              6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
        </div>
        <span>{text}</span>
      </span>
    </button>
  );
};

export default ButtonGoogle;
