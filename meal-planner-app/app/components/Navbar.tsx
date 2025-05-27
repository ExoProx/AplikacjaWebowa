"use client";
import React from "react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HeartIcon, HomeIcon, PowerIcon, UserIcon, ClipboardDocumentListIcon, BookOpenIcon } from "@heroicons/react/24/outline";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/logout",
        {},
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/mainPage", icon: HomeIcon, label: "Home" },
    { href: "/recipes", icon: BookOpenIcon, label: "Recipes" },
    { href: "/favorites", icon: HeartIcon, label: "Favorites" },
    { href: "/menu", icon: ClipboardDocumentListIcon, label: "Meal Plans" },
    { href: "/userData", icon: UserIcon, label: "Profile" },
  ];

  return (
    <nav className={`bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 py-4 ${className || ""}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors duration-200"
          title="Logout"
        >
          <PowerIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;