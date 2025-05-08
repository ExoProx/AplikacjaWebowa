"use client";
import React from "react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HeartIcon, HomeIcon, PowerIcon, UserIcon } from "@heroicons/react/24/outline";

interface NavbarProps {
  className?: string; // Add className as an optional prop
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

  return (
    <nav className={`bg-gray-800 py-4 shadow-md ${className || ""}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center px-2">
        <Link href="/mainPage" className="text-white hover:text-gray-300">
          <HomeIcon className="h-6 w-6" />
        </Link>
        <Link href="/recipes" className="text-white hover:text-gray-300">
          Przepisy
        </Link>
        <Link href="/favorites" className="text-white hover:text-gray-300">
          Ulubione przepisy
        </Link>
        <Link href="/menu" className="text-white hover:text-gray-300">
          Jadłospisy
        </Link>
        <Link href="/userData" className="text-white hover:text-gray-300">
          <UserIcon className="h-6 w-6 text-gray-300 hover:text-white" />
        </Link>
        <button onClick={handleLogout} className="text-white hover:text-gray-300">
          <PowerIcon className="h-6 w-6 text-red-500 hover:text-red-700" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;