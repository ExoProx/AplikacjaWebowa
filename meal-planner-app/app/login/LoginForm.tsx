"use client";

import React, { useState, useEffect } from 'react';
import { MailCheck, FileLockIcon } from 'lucide-react';
import InputField from 'components/InputField'; // Make sure this component exists and is correctly implemented
import SubmitButton from 'components/SubmitButton'; // Same for this component
import Link from "next/link";
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface LoginData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const router = useRouter();


  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/', {
          withCredentials: true, // Important: Sends cookies
        });
        if (response.status === 200) {

        }
        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log("Token is invalid or expired.");
          router.push('/login');
      }
    }
  }
  checkAuthStatus();
}
);
 
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
      router.push('/mainPage'); // Redirect after successful login
  
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
