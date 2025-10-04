import React from "react";
import Sidebar from "../components/Sidebar"; 
import { motion } from "framer-motion";

const AdminLayout = ({ children, title }) => {
  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        <header className="bg-[#EBEBEB] px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
          <h1 className="text-base md:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
        </header>

        <motion.main
          className="flex-1 p-3 md:p-6 overflow-y-auto"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;