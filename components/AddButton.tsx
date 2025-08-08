"use client";

import { FaPlus } from "react-icons/fa";
import React from "react";

interface AddButtonProps {
  label: string;
  onClick: () => void;
  className?: string; // allow optional extra classes if needed
}

/**
 * Reusable button used across the editor for all "Add" actions to keep a consistent style.
 */
export const AddButton: React.FC<AddButtonProps> = ({ label, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1 rounded transition-colors duration-200 ${className}`}
    >
      <FaPlus className="mr-2" />
      {label}
    </button>
  );
};
