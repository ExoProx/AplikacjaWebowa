// app/register/page.tsx
import React from "react";
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

      <main className="bg-gray-700 p-3 rounded-lg shadow-xl">
        <RegisterForm />
      </main>
    </div>
  );
};

export default RegisterPage;