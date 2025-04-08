// components/SubmitButton.tsx
"use client"; // Ponieważ używamy hooka useRouter, musimy mieć "use client"
import React from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  back?: boolean;
  children: React.ReactNode;
  className?: string; // Nowy prop
}

const SubmitButton: React.FC<ButtonProps> = ({ type = "button", onClick, back, children, className }) => {
  const router = useRouter();

  const handleClick = () => {
    if (back) {
      // Jeśli props back jest ustawiony, przechodzimy do poprzedniej strony
      router.back();
    } else if (onClick) {
      // W przeciwnym przypadku wywołujemy przekazaną funkcję onClick
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default SubmitButton;