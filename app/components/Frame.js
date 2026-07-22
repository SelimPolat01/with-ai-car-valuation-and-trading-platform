"use client";
import { motion } from "framer-motion";
import classes from "./Frame.module.css";
import { frameVariants } from "@/app/utils/animations";

export default function Frame({
  icon,
  total,
  change,
  text,
  changeIcon,
  upChange,
  downChange,
  className,
}) {
  return (
    <motion.div
      variants={frameVariants}
      whileHover={{ scale: 1.02 }}
      style={{ cursor: "pointer" }}
      className={`${classes.div} ${className ? className : ""}`}
    >
      <div className={classes.divContainer}>
        <div className={classes.iconContainer}>{icon}</div>
        <div className={classes.textContainer}>
          <p className={classes.text}>{text}</p>
        </div>
        <div className={classes.totalChangeContainer}>
          <div className={classes.totalContainer}>
            <h1 className={classes.total}>{total}</h1>
          </div>
          <div
            className={`${classes.changeContainer} ${upChange ? classes.greenBg : downChange ? classes.redBg : ""}`}
          >
            <span
              className={`${classes.changeIcon} ${upChange ? classes.upColor : downChange ? classes.downColor : ""}`}
            >
              {changeIcon}
            </span>
            <p
              className={
                upChange
                  ? classes.upChange
                  : downChange
                    ? classes.downChange
                    : ""
              }
            >
              {change}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
