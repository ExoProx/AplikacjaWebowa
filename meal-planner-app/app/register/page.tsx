// app/register/page.tsx
import React from "react";
import Link from "next/link";
import RegisterForm from "./RegisterForm"; // Import the client component

const RegisterPage = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-800"
      style={{
        backgroundImage: 'url("/jedzenie.jpg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="mb-8">
        <h1 className="text-4xl text-white font-bold">Rejestracja</h1>
      </header>
      <main className="bg-gray-700 p-8 rounded-lg shadow-xl">
        {/* The interactive registration form is rendered on the client */}
        <RegisterForm />
      </main>
      <footer className="mt-8">
        <Link href="/" className="text-gray-300 hover:text-white">
         Powrót do strony głównej
        </Link>
      </footer>
    </div>
  );
};

export default RegisterPage;