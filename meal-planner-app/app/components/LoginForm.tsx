'use client'

import React, { useState } from 'react';
import { CaseLower, MailCheck, Phone, User, UsersRound, FileLockIcon } from 'lucide-react';
import InputField from './InputField';
import SubmitButton from './SubmitButton';
import Link from "next/link";

interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Logowanie powiodło się!');
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-full max-w-xs bg-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-2 text-center">Logowanie</h1>
      <form onSubmit={handleSubmit}>
        <InputField
          label="E-mail"
          type="email"
          field="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Wpisz swój e-mail"
          icon={<MailCheck className="text-gray-800" size={20} />}
          className="bg-gray-200 border border-gray-300 rounded-md p-2 w-full"
        />
        <InputField
          label="Hasło"
          type="password"
          field="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Wpisz hasło"
          icon={<FileLockIcon className="text-gray-800" size={20} />}
          className="bg-gray-200 border border-gray-300 rounded-md p-2 w-full"
        />
        <div className="transform transition-transform hover:scale-110 duration-300">
          <SubmitButton type="submit" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
            Zaloguj się
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/">
          <SubmitButton type="button" back className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md ">
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>

      {/* rejestracja */}
      <div className="mt-4 text-center">
        <p className="text-sm">Nie masz konta?</p>
        <Link href="/register">
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md mt-2">
            Zarejestruj się
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;