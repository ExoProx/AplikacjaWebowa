// app/page.tsx


import React from 'react';
import RegisterForm from '../components/RegisterForm';
import Link from "next/link";
import { HomeIcon } from "lucide-react";


const RegisterPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: 'url("/jedzenie.jpg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Link href="/" className="absolute top-4 left-4 z-20">
        <HomeIcon className="text-white" size={32} />
      </Link>

      <div className="absolute animate-slide-right border-7 border-gray-400 rounded-lg" style={{ width: '430px', height: '770px', left: 'calc(50% - 200px)', bottom: 'calc(50% - 350px)' }}></div>
      <div className="bg-gray-700 p-8 rounded-lg shadow-md w-96 z-10">
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;