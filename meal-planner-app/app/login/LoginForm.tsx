// app/components/LoginForm.client.tsx
"use client";

import React, { useState } from 'react';
import { MailCheck, FileLockIcon } from 'lucide-react';
import InputField from 'components/InputField';
import SubmitButton from 'components/SubmitButton';
import Link from "next/link";
import { useRouter } from 'next/navigation';

interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        localStorage.setItem('token', result.token); // Store JWT token
        setMessage('Login successful!');
        router.push('/mainPage');  // Redirect on successful login
      } else {
        console.error('Login failed:', result.error);
        setMessage(result.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setMessage('Something went wrong. Please try again.');
    }
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

      {message && (
        <p className="mt-4 text-center text-green-600 font-semibold">
          {message}
        </p>
      )}

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/">
          <SubmitButton type="button" back className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>

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
