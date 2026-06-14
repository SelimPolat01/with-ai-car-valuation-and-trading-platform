export const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.3, delayChildren: 0.2 },
  },
};

export const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const formVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.1,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

export const formElementVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scaleY: 0 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scaleY: 0,
    transition: { duration: 0.15 },
  },
};

export const successMessageVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } },
};

export const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 15, delay: 0.2 },
  },
};

export const chartVariants = {
  hidden: { opacity: 0, scale: 0.9, originY: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay: 0.3 },
  },
};

export const frameVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] },
  },
};
