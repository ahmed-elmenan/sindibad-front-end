export const lessonVariants = (isRTL: boolean) => {
  return {
    initial: {
      opacity: 0,
      x: isRTL ? -20 : 20,
      scale: 0.95,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      x: isRTL ? 20 : -20,
      scale: 0.95,
      filter: "blur(4px)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.02,
      x: isRTL ? -4 : 4,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  };
};

export const chapterVariants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.42, 0, 1, 1] as any,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};
