// components/LoginForm.tsx
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
  
    <div className=" p-4 rounded-lg shadow-lg w-full max-w-xs bg-emerald-100">
      <h1 className="text-2xl font-bold mb-2 text-center">Logowanie</h1>
      <form onSubmit={handleSubmit}>
        <InputField
          label="E-mail"
          type="email"
          field="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Wpisz swój e-mail"
          icon={<MailCheck className="text-gray-500" size={20} />}
        />
        <InputField
          label="Hasło"
          type="password"
          field="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Wpisz hasło"
          icon={<FileLockIcon className="text-gray-500" size={20} />}
        />
        <div className="transform transition-transform hover:scale-110 duration-300">
          <SubmitButton type="submit" className="text-white">
            Zaloguj się
          </SubmitButton>
        </div>
      </form>

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/">
          <SubmitButton type="button" back className="text-white">
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>
    </div>
  
  );
};

export default LoginForm;
  
