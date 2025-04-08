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
    <div className="bg-blue-100 p-4 rounded-lg shadow-lg w-full max-w-xs">
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
        <SubmitButton type="submit">Zaloguj się</SubmitButton>
      </form>

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

export default LoginForm;
  
