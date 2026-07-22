import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SelectDropdown({
  fieldKey,
  selectedValue,
  placeholder,
  options = [],
  openDropdown,
  setOpenDropdown,
  onSelect,
  hasError,
  hasShake,
  disabled = false,
  getLabel,
  itemVariants,
  dropdownVariants,
  classes = {},
}) {
  const isOpen = openDropdown === fieldKey;
  const isSelected = selectedValue !== placeholder;

  return (
    <motion.div variants={itemVariants} className="dropdownWrapper">
      <div
        className={`dropdown ${hasError ? "notSelected" : ""} ${
          isSelected ? classes.selected : ""
        } ${hasShake ? "notSelectedAnimation" : ""} ${
          isOpen ? classes.boxShadow : ""
        }`}
        onClick={() => {
          if (disabled) return;
          setOpenDropdown(isOpen ? null : fieldKey);
        }}
      >
        <span>{getLabel ? getLabel(selectedValue, true) : selectedValue}</span>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.ul
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="dropdownList"
          >
            {options.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  onSelect(item);
                  setOpenDropdown(null);
                }}
              >
                {getLabel ? getLabel(item, false) : item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
