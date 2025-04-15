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
      className={clsx(
        "w-full p-2 rounded hover:bg-emerald-600 transition-colors",
        !className?.includes("bg-") && "bg-emerald-400",
        !className?.includes("text-") && "text-white",
        className
      )}
    >
      {children}
    </button>
  );
};

export default SubmitButton;