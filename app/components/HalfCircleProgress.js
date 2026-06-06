"use client";
import React from "react";
import { PieChart, Pie, Cell } from "recharts";
import classes from "./HalfCircleProgress.module.css";
import { motion } from "framer-motion";
import { chartVariants } from "@/app/lib/variants";

export default function HalfCircleProgress({
  text,
  subText,
  change,
  description,
  upChange,
  downChange,
  optionsIcon,
  percent = 75,
  targetValue,
  revenueValue,
  netIncome,
}) {
  const COLORS = ["#3b82f6", "#e5e7eb"];
  const data = [
    { name: "Full", value: percent },
    { name: "Boş", value: 100 - percent },
  ];

  return (
    <motion.div
      variants={chartVariants}
      whileHover={{ scale: 1.02 }}
      style={{ cursor: "pointer" }}
      className={classes.div}
    >
      <div className={classes.divContainer}>
        <div className={classes.textContainer}>
          <h2 className={classes.text}>{text}</h2>
          <span className={classes.optionsIcon}>{optionsIcon}</span>
        </div>
        <div className={classes.subTextContainer}>
          <p className={classes.subText}>{subText}</p>
        </div>
        <div className={classes.circleBarContainer}>
          <PieChart width={200} height={100}>
            <Pie
              data={data}
              cx={100}
              cy={100}
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={85}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
              isAnimationActive={true}
              className={classes.circleBar}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </div>
        <div className={classes.infoContainer}>
          <div className={classes.percentContainer}>
            <h1 className={classes.percent}>{percent}%</h1>
          </div>
          <div
            className={`${classes.changeContainer} ${upChange ? classes.greenBg : downChange ? classes.redBg : ""}`}
          >
            <p
              className={`${classes.change} ${upChange ? classes.upChange : downChange ? classes.downChange : ""}`}
            >
              {change}%
            </p>
          </div>
          <div className={classes.descriptionContainer}>
            <p className={classes.description}>{description}</p>
          </div>
        </div>
      </div>
      <div className={classes.subDiv}>
        <div className={classes.textDiv}>
          <div className={classes.infoItem}>
            <span className={classes.textCash}>Hedef</span>
            <div className={classes.cashIconContainer}>
              <h2 className={classes.money}>{targetValue}</h2>
              <span className={classes.changeUpIcon}>{upChange}</span>
            </div>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.textCash}>Hasılat</span>
            <div className={classes.cashIconContainer}>
              <h2 className={classes.money}>{revenueValue}</h2>
              <span className={classes.changeUpIcon}>{upChange}</span>
            </div>
          </div>
          <div className={classes.infoItem}>
            <span className={classes.textCash}>Net</span>
            <div className={classes.cashIconContainer}>
              <h2 className={classes.money}>{netIncome}</h2>
              <span className={classes.changeDownIcon}>{downChange}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
