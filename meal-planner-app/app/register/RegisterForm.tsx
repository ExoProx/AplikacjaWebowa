// app/components/RegisterForm.client.tsx
"use client";

import React, { useState } from "react";
import InputField from "components/InputField";
import SubmitButton from "components/SubmitButton";
import Link from "next/link";
import { MailCheck, FileLockIcon } from "lucide-react";

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
      // For phone numbers, strip non-digits
      [name]: name === "phoneNumber" ? value.replace(/\D/g, "") : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-2 rounded-lg px-6 shadow-lg w-full max-w-xs bg-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Formularz rejestracji
      </h1>
      <form onSubmit={handleSubmit}>
      <div className="text-black">
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
          icon={<MailCheck className="text-gray-800" size={20} />}
        />
        <InputField
          label="Numer telefonu:"
          type="number"
          field="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          maxLength={11} // Note: For inputs of type=number maxLength doesn't work. Consider using type="text"
          placeholder="Wpisz swój numer telefonu"
          icon={<FileLockIcon className="text-gray-800" size={20} />}
        />
        <InputField
          label="Hasło:"
          type="password"
          field="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Wpisz hasło"
        />
        </div>

        <div className="transform transition-transform hover:scale-110 duration-300">
          <SubmitButton type="submit" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
            Zarejestruj się
          </SubmitButton>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
      )}

      <div className="mt-2 text-center">
        <p className="text-xs">Masz już konto?</p>
        <div className="transform transition-transform hover:scale-110 duration-300">
          <Link href="/login">
            <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md mt-1">
              Zaloguj się
            </SubmitButton>
          </Link>
        </div>
      </div>

      <div className="mt-6 transform transition-transform hover:scale-110 duration-300">
        <Link href="/app">
          <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md" back>
            Powrót do strony głównej
          </SubmitButton>
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;
