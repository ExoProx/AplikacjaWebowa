"use client";
import React from "react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";

const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-emerald-300 text-gray-600 shadow-md">
      <div className="max-w-screen-xl py-2 mx-auto px-4 flex items-center justify-between">
        {/* Lewa część - przyciski nawigacyjne */}
        <ul className="flex items-center space-x-4 md:space-x-45">
          <li className="ml-45 transform transition-transform hover:scale-110 duration-300">
            <Link href="/recipes">
              <SubmitButton type="submit" className="bg-emerald-300 text-gray-600">
                Przepisy
              </SubmitButton>
            </Link>
          </li>
          <li className="transform transition-transform hover:scale-110 duration-300">
            <Link href="/menu">
              <SubmitButton type="submit" className="bg-emerald-300 text-gray-600">
                Jadłospisy
              </SubmitButton>
            </Link>
          </li>
          <li className="transform transition-transform hover:scale-110 duration-300">
            <Link href="/account">
              <SubmitButton type="submit" className="bg-emerald-300 text-gray-600">
                Konto
              </SubmitButton>
            </Link>
          </li>
          <li className="mr-10 transform transition-transform hover:scale-110 duration-300">
            <Link href="/mainPage">
              <SubmitButton type="submit" className="bg-emerald-300 text-gray-600">
                Strona główna
              </SubmitButton>
            </Link>
          </li>
        </ul>

        {/* Prawa część - wyloguj się */}
        <div className="ml-auto transform transition-transform hover:scale-110 duration-300">
          <Link href="/">
            <SubmitButton type="button" className="bg-emerald-300 text-gray-600">
              Wyloguj się
            </SubmitButton>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
