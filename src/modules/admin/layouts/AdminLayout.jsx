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
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col bg-gray-50">
        <header className="bg-[#EBEBEB] px-6 py-4">
          <h1 className="text-xl md:text-1xl font-bold text-gray-800">{title}</h1>
        </header>

        <motion.main
          className="flex-1 p-6 overflow-y-auto"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;
