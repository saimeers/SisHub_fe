import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { FaBook, FaFolder, FaSignOutAlt } from "react-icons/fa";
import { MdGroups2 } from "react-icons/md";
import { Menu } from "lucide-react";

const Sidebar = ({ onSignOut }) => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    const menuItems = [
        { icon: <GoHomeFill size={20} />, label: "Inicio" },
        { icon: <FaBook size={20} />, label: "Materias" },
        { icon: <MdGroups2 size={20} />, label: "Grupos" },
        { icon: <FaFolder size={20} />, label: "Proyectos" }
    ];

    return (
        <div
            className={`h-full min-h-screen bg-[#7DABF7] text-white flex flex-col transition-all duration-300 ${collapsed ? "w-16" : "w-56"
                }`}
        >
            <div className="flex flex-col justify-between flex-1">
                <div>
                    <div
                        className={`flex items-center ${collapsed ? "justify-center" : "justify-end"
                            } p-3`}
                    >
                        <button
                            className="text-white hover:text-gray-200"
                            onClick={toggleSidebar}
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <img
                            src={collapsed ? "/icon.png" : "/img/logo.png"}
                            alt="Logo"
                            className={`object-contain transition-all duration-300 ${collapsed ? "h-10 w-10" : "h-45 w-45"
                                }`}
                        />
                    </div>

                    <nav className="flex flex-col items-center mt-4">
                        {menuItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center ${collapsed ? "justify-center" : "justify-start"
                                    } gap-3 px-4 py-2 hover:bg-[#92bcff] cursor-pointer rounded-md w-11/12`}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                            </div>
                        ))}
                    </nav>
                </div>

                <div
                    className={`bg-[#4285F4] rounded-tl-2xl rounded-tr-2xl flex items-center ${collapsed ? "justify-center" : "justify-between"
                        } px-4 py-3`}
                >
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <img
                                src="https://i.pravatar.cc/40"
                                alt="User"
                                className="w-12 h-12 rounded-full"
                            />
                            <div className="flex flex-col">
                                <p className="text-white text-sm font-normal">Nombre</p>
                                <p className="text-white text-sm font-bold">Estudiante</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onSignOut}
                        className={`text-white hover:text-gray-200 transition-colors ${collapsed ? "" : "ml-auto"
                            }`}
                    >
                        <FaSignOutAlt size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
