import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

const SlideArrowButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className="relative flex items-center justify-center px-8 py-4 rounded-full text-sm font-normal bg-black text-white border-2 border-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)] cursor-pointer transition-colors duration-150"
    >
      <span className="tracking-tight">{children}</span>
      <AnimatePresence mode="popLayout">
        {isHovered && (
          <motion.div
            key="arrow"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ type: "spring", stiffness: 600, damping: 25 }}
            className="flex items-center shrink-0 ml-2.5"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default SlideArrowButton;
