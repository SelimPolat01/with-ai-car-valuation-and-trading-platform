"use client";

import React from "react";
import classes from "./Input.module.css";

const Input = React.forwardRef(
  ({ type, identifier, onChange, value, label, className, ...props }, ref) => {
    return (
      <div className={classes.inputDiv}>
        <label htmlFor={identifier}>{label}</label>
        <input
          type={type}
          id={identifier}
          name={identifier}
          onChange={onChange}
          value={value}
          className={className}
          {...props}
          ref={ref}
        />
      </div>
    );
  }
);

export default Input;
