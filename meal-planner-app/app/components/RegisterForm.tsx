// components/RegisterForm.tsx
"use client";

import React, { useState } from "react";
import InputField from "./InputField";
import SubmitButton from "./SubmitButton";
import Link from "next/link";
import { User, MailCheck, Phone, FileLockIcon } from 'lucide-react'

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [message, setMessage] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.password,
          phoneNumber: formData.phoneNumber,
          lastName: formData.lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); 
      } else {
        const data = await response.json();
        setMessage(data.error); 
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setMessage('Something went wrong. Please try again.'); 
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-full max-w-xs bg-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Formularz rejestracji
      </h1>
      <form onSubmit={handleSubmit}>
        <InputField
          label="Imię:"
          type="text"
          field="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Wpisz swoje imię"
          
        />
        <InputField
          label="Nazwisko:"
          type="text"
          field="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Wpisz swoje nazwisko"
        />
        <InputField
          label="Adres E-mail:"
          type="email"
          field="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Wpisz swój e-mail"
        />
        <InputField
          label="Numer telefonu:"
          type="number"
          field="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          /*
          ! * DO POPRAWY - NIE DZIALA MAXLENGHT DO NUMEROW
           */
          maxLength={11}
          placeholder="Wpisz swój numer telefonu"
        />
        <InputField
          label="Hasło:"
          type="password"
          field="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Wpisz hasło"
        />

<div className="transform transition-transform hover:scale-110 duration-300">
          <SubmitButton type="submit" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
            Zarejestruj się
          </SubmitButton>
        </div>
      </form>
      {message && (
        <p className="mt-4 text-center text-green-600 font-semibold">
          {message}
        </p>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm">Masz już konto?</p>
        <Link href="/login">
          <SubmitButton className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md mt-2" type='button'>
            Zaloguj się
          </SubmitButton>
        </Link>
      </div>

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/">
          <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md" back>
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;