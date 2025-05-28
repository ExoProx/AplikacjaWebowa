"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { MailCheck, FileLockIcon } from 'lucide-react';
import InputField from 'components/InputField';
import SubmitButton from 'components/SubmitButton';
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

interface LoginData {
  email: string;
  password: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const LoginFormContent: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam === 'auth') {
      setAuthRedirectMessage('Your session has expired or you are not authorized. Please log in again.');

      if (searchParams.has('error')) {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete('error');
        router.replace(`?${newSearchParams.toString()}`);
      }
    }
  }, [searchParams, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
    setLoginErrorMessage(null);
    setAuthRedirectMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setLoginErrorMessage(null);

    const data = {
      email: formData.email,
      password: formData.password,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      setMessage('Login successful!');
      setLoginErrorMessage(null);

      if (response.data.role === "user") {
        router.push('/mainPage');
      } else if (response.data.role === "admin") {
        router.push('/admin');
      }

    } catch (err: Error | unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data && err.response.data.error) {
          setLoginErrorMessage(err.response.data.error);
        } else {
          setLoginErrorMessage('An error occurred during login. Please try again.');
        }
      } else {
        setLoginErrorMessage('An unexpected error occurred. Please try again.');
      }
      setMessage('');
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-lg w-full max-w-xs bg-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-2 text-center">Logowanie</h1>

      {authRedirectMessage && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
          {authRedirectMessage}
        </div>
      )}

      {loginErrorMessage && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
          {loginErrorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="text-black">
          <InputField
            label="E-mail"
            type="email"
            field="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Wpisz swój e-mail"
            icon={<MailCheck className="text-gray-800" size={20} />}
          />
          <InputField
            label="Hasło"
            type="password"
            field="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Wpisz hasło"
            icon={<FileLockIcon className="text-gray-800" size={20} />}
          />
          <div className="transform transition-transform hover:scale-110 duration-300">
            <SubmitButton type="submit" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
              Zaloguj się
            </SubmitButton>
          </div>
        </div>
      </form>

      {message && !loginErrorMessage && (
        <p className="mt-4 text-center text-green-600 font-semibold">
          {message}
        </p>
      )}

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/">
          <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
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

const LoginForm: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading login form...</div>}>
      <LoginFormContent />
    </Suspense>
  );
};

export default LoginForm;