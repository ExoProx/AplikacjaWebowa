"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Lock } from "lucide-react";
import InputField from "../components/InputField";
import SubmitButton from "../components/SubmitButton";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  name: string;
  lastname: string;
  phone_number: number;
  password?: string;
}

const ProfileEdit: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    lastname: "",
    phone_number: 0,
    password: ""
  });
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  // Pobierz dane użytkownika przy załadowaniu (przykład)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/userdata", {
          withCredentials: true,
        });
        setProfileData({
          name: response.data.name || "",
          lastname: response.data.lastname || "",
          phone_number: response.data.phone_number || "",
          password: "", // Hasło nie jest pobierane ze względów bezpieczeństwa
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMessage("Nie udało się pobrać danych użytkownika.");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="p-4 rounded-lg shadow-md w-full max-w-md bg-gray-800">
          <h1 className="text-2xl font-bold mb-4 text-center">Edytuj Profil</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Imię"
              type="text"
              field="name"
              value={profileData.name}
              onChange={handleChange}
              placeholder="Wpisz swoje imię"
              icon={<User className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="Nazwisko"
              type="text"
              field="lastname"
              value={profileData.password || ""}
              onChange={handleChange}
              placeholder="Wpisz nowe nazwisko  "
              icon={<Lock className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="Numer telefonu"
              type="number"
              field="phone_number"
              value={profileData.password || ""}
              onChange={handleChange}
              placeholder="Wpisz nowe hasło"
              icon={<Lock className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="Nowe hasło (opcjonalne)"
              type="password"
              field="password"
              value={profileData.password || ""}
              onChange={handleChange}
              placeholder="Wpisz nowe hasło"
              icon={<Lock className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <div className="transform transition-transform hover:scale-105 duration-300">
              <SubmitButton
                type="submit"
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
              >
                Zapisz zmiany
              </SubmitButton>
            </div>
            <div className="mt-4 transform transition-transform hover:scale-105 duration-300">
              <Link href="/mainPage">
                <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
                  Anuluj zmiany
                </SubmitButton>
              </Link>
            </div>
          </form>
          {message && (
            <p className="mt-4 text-center text-green-600 font-semibold">{message}</p>
          )}
        </div>
      </div>
      <Footer className="w-full bg-gray-800 p-4 text-white" />
    </div>
  );
};

export default ProfileEdit;