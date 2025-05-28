'use client'
import React from "react";
import clsx from "clsx";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={clsx("bg-gray-800 py-4 shadow-md", className)}>
      <p className="text-white text-center">© 2025 mniamPlan</p>
    </footer>
  );
};

export default Footer;