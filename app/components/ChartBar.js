"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import classes from "./ChartBar.module.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { chartVariants } from "@/app/lib/variants";

export default function ChartBar({ text, optionsIcon, width, height, data }) {
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
  }, [router]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      const months = [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara",
      ];
      return months.map((m) => ({ month: m, count: 0 }));
    }
    return data.map((item) => ({
      month: item.name ? item.name.substring(0, 3) : item.month,
      count: item.ilanSayisi !== undefined ? item.ilanSayisi : item.count || 0,
    }));
  }, [data]);

  return (
    <motion.div
      variants={chartVariants}
      whileHover={{ scale: 1.02 }}
      style={{ cursor: "pointer" }}
      className={classes.div}
    >
      <div className={classes.divContainer}>
        <div className={classes.textOptionsContainer}>
          <h1 className={classes.text}>{text}</h1>
          <span className={classes.optionsIcon}>{optionsIcon}</span>
        </div>
        <div>
          <BarChart
            width={width}
            height={height}
            data={chartData}
            className={classes.chartBar}
          >
            <XAxis dataKey="month" stroke="#a9a3b0" />
            <YAxis stroke="#a9a3b0" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#241442",
                borderColor: "#4b336b",
                color: "#ffffff",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#00f4ff" }}
            />
            <Bar
              dataKey="count"
              fill="#00f4ff"
              barSize={20}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </div>
      </div>
    </motion.div>
  );
}
