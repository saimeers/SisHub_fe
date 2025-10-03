import React, { useState } from "react";
import Avatar, { genConfig } from "react-nice-avatar";
import { formatShortName } from "../utils/nameFormatter";

const UserProfile = () => {
    const userName = localStorage.getItem("userName") || "Usuario";
    const userPhoto = localStorage.getItem("userPhoto");

    const [imgError, setImgError] = useState(false);

    const avatarConfig = genConfig(userName);

    return (
        <div className="flex items-center gap-3">
            {userPhoto && !imgError ? (
                <img
                    src={userPhoto}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <Avatar className="w-12 h-12 rounded-full" {...avatarConfig} />
            )}
            <div className="flex flex-col">
                <p className="text-white text-sm font-normal">{formatShortName(userName)}</p>
                <p className="text-white text-sm font-bold">
                    {localStorage.getItem("rolSeleccionado") || "Administrador"}
                </p>
            </div>
        </div>
    );
};

export default UserProfile;
