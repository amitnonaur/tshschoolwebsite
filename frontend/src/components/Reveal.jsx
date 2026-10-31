import { motion, useReducedMotion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "", y = 24 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const MaskedLine = ({ children, delay = 0, className = "" }) => {
  const reduce = useReducedMotion();
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={reduce ? false : { y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default Reveal;
