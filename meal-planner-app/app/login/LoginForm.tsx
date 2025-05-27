"use client";

import React, { useState, useEffect } from 'react';
import { MailCheck, FileLockIcon } from 'lucide-react';
import InputField from 'components/InputField'; // Make sure this component exists and is correctly implemented
import SubmitButton from 'components/SubmitButton'; // Same for this component
import Link from "next/link";
import { useRouter, useSearchParams  } from 'next/navigation';
import axios from 'axios';

interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
   useEffect(() => {
    console.log('LoginPage useEffect triggered.');
    console.log('Current searchParams:', searchParams.toString());

    const errorParam = searchParams.get('error');
    console.log('Value of "error" parameter:', errorParam);

    if (errorParam === 'auth') {
      console.log('Error parameter is "auth". Setting message.');
      setAuthRedirectMessage('Your session has expired or you are not authorized. Please log in again.');

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('error');
      router.replace(`?${newSearchParams.toString()}`);
      console.log('URL updated to remove error parameter.');
    } else {
      console.log('Error parameter is NOT "auth" or not present.');
    }
  }, [searchParams, router]);

  
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password,
    };
  
    try {
      const response = await axios.post('http://localhost:5000/api/login', data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true, // very important to allow cookies!!
      });
  
      setMessage('Login successful!');
      if (response.data.role == "user"){
      router.push('/mainPage'); // Redirect after successful login
      }else if (response.data.role == "admin"){
        router.push('/admin');
      }
  
    } catch (err: any) {
      console.error('Error during login:', err);
      if (err.response && err.response.data && err.response.data.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage('Something went wrong. Please try again.');
      }
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

        {/* Display internal login error message */}
        {errorMessage && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {errorMessage}
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

      {/* Display any message from the backend */}
      {message && (
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

export default LoginForm;
