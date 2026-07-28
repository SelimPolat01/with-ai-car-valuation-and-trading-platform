"use client";

import React from "react";
import classes from "./Input.module.css";

const Input = React.forwardRef(
  ({ identifier, onChange, label, className, ...props }, ref) => {
    return (
      <div className={classes.inputDiv}>
        <label htmlFor={identifier}>{label}</label>
        <input
          ref={ref}
          id={identifier}
          name={identifier}
          onChange={onChange}
          className={className}
          {...props}
        />
      </div>
    );
  },
);

export default Input;
