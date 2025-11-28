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
        <header className="bg-[#EBEBEB] px-4 md:px-6 py-2 md:py-3 flex-shrink-0">
          <h1 className="text-base md:text-xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
        </header>

        {/* Reducimos padding overall */}
        <motion.main
          className="flex-1 px-3 md:px-6 pt-2 pb-3 overflow-y-auto"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <div className="max-w-screen-2xl mx-auto w-full">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
