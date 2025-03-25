// components/SubmitButton.tsx
import React from 'react';

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  children: React.ReactNode;
}

const SubmitButton: React.FC<ButtonProps> = ({ type = "button", onClick, children }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
    >
      {children}
    </button>
  );
};

export default SubmitButton;