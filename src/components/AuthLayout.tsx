import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDFDFD] to-[#F8F9FD] flex items-center justify-center p-4 md:p-8">
      <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-[1100px] gap-8">
        
        {/* The Outlet renders the child route (Login or Register) */}
        <Outlet />

        {/* Persistent Image Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:block w-full lg:w-1/2 h-[680px]"
        >
          <img 
            src="https://wearemiiles.com/wp-content/uploads/2026/05/kling_20260522_作品__592_0-scaled.png" 
            alt="Miiles platform" 
            className="w-full h-full object-cover rounded-[32px]"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
