import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = 'rect' }) => {
  const baseClass = "bg-neutral-200 animate-pulse";
  const variantClass = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-lg h-4"
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      className={`${baseClass} ${variantClass} ${className}`}
    />
  );
};

export default Skeleton;
