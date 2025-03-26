// components/RegisterForm.tsx
'use client'

import React, { useState } from 'react';
import { CaseLower, MailCheck, Phone, User, UsersRound, FileLockIcon } from 'lucide-react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';
import Link from "next/link";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Rejestracja przebiegła pomyślnie!');
  };

  return (
    <div className="bg-blue-100 p-4 rounded-lg shadow-lg w-full max-w-xs">
      <h1 className="text-2xl font-bold mb-2 text-center">Formularz rejestracji</h1>
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
          label="Login:"
          type="text"
          field="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Wpisz swój login"
        />
        <InputField
          label="Numer telefonu:"
          type="text"
          field="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
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

        {/* Użycie komponentu przycisku */}
        <SubmitButton type="submit">Zarejestruj się</SubmitButton>
      </form>
      {message && (
        <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
      )}

      <div className="mt-6">
        <Link href="/">
          <SubmitButton type="button" back>
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
