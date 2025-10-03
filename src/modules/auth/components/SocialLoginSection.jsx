import React from "react";
import ButtonGoogle from "../../../components/ButtonGoogle";

function SocialLoginSection({ onGoogleLogin, loading }) {
  return (
    <>
      <div className="flex items-center my-4 w-full max-w-sm">
        <hr className="flex-grow border-gray-300" />
        <span className="px-2 text-sm text-gray-500">o</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <div className="flex justify-center">
        <ButtonGoogle
          onClick={onGoogleLogin}
          text="Continuar con Google"
          disabled={loading}
        />
      </div>
    </>
  );
}

export default SocialLoginSection;