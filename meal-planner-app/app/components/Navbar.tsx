"use client";
import React from "react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HeartIcon, HomeIcon } from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
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
    
      <nav className="bg-gray-800 py-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
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
          <button className="text-white hover:text-gray-300">Wyloguj się</button>
        </div>
      </nav>
    
  );
};

export default Navbar;
