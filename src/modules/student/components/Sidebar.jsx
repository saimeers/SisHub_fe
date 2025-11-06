import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { FaBook, FaFolder, FaSignOutAlt, FaRegBell } from "react-icons/fa";
import { MdGroups2 } from "react-icons/md";
import UserProfile from "../../../components/ui/UserProfile";
import { useAuthForm } from "../../../modules/auth/hooks/useAuth"; 
import { Menu } from "lucide-react";

const Sidebar = () => {
  const { handleSignOut } = useAuthForm();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const menuItems = [
    {
      icon: <GoHomeFill size={20} />,
      label: "Inicio",
      path: "/student/dashboard",
    },
    {
      icon: <FaBook size={20} />,
      label: "Materias",
      path: "/student/subjects",
    },
    {
      icon: <MdGroups2 size={20} />,
      label: "Mis Grupos",
      path: "/student/my-groups",
    },
    { 
      icon: <FaFolder size={20} />, 
      label: "Mis Proyectos",
      path: "/student/my-projects",
    },
    {
      icon: <FaRegBell size={20} />,
      label: "Notificaciones",
      path: "/student/notifications",
    },
  ];

  return (
    <div
      className={`h-full min-h-screen bg-[#B70000] text-white flex flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex flex-col justify-between flex-1">
        <div>
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-end"
            } p-3`}
          >
            <button
              className="text-white hover:text-gray-200 transition-colors"
              onClick={toggleSidebar}
              aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <img
              src={collapsed ? "/icon.webp" : "/img/logo.webp"}
              alt="Logo"
              className={`object-contain transition-all duration-300 ${
                collapsed ? "h-10 w-10" : "h-45 w-45"
              }`}
            />
          </div>

          <nav className="flex flex-col items-center mt-4">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-start"
                } gap-3 px-4 py-2 hover:bg-[#CC4040] cursor-pointer rounded-md w-11/12 transition-colors`}
                title={collapsed ? item.label : ""}
                onClick={() => item.path && navigate(item.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    item.path && navigate(item.path);
                  }
                }}
              >
                {item.icon}
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div
          className={`bg-[#CC4040] rounded-tl-2xl rounded-tr-2xl flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } px-4 py-3`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <UserProfile />
            </div>
          )}

          <button
            onClick={handleSignOut}
            className={`
                            text-white 
                            hover:text-gray-200 
                            hover:scale-110 
                            hover:rotate-12
                            active:scale-95
                            transition-all 
                            duration-300 
                            ease-out
                            ${collapsed ? "" : "ml-auto"}
                        `}
            title="Cerrar sesión"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
