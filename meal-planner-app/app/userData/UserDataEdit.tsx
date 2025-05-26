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
  email: string;
  password?: string;
}

const ProfileEdit: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  // Fetch user data on mount (example)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user", {
          withCredentials: true,
        });
        setProfileData({
          name: response.data.name || "",
          email: response.data.email || "",
          password: "", // Password is not fetched for security reasons
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setMessage("Failed to load user data.");
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Handle form submission logic here
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="p-4 rounded-lg shadow-md w-full max-w-md bg-gray-800">
          <h1 className="text-2xl font-bold mb-4 text-center">Edit Profile</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Name"
              type="text"
              field="name"
              value={profileData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              icon={<User className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="Email"
              type="email"
              field="email"
              value={profileData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<Mail className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="New Password (optional)"
              type="password"
              field="password"
              value={profileData.password || ""}
              onChange={handleChange}
              placeholder="Enter new password"
              icon={<Lock className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <div className="transform transition-transform hover:scale-105 duration-300">
              <SubmitButton
                type="submit"
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
              >
                Save changes
              </SubmitButton>
            </div>
            <div className="mt-4 transform transition-transform hover:scale-105 duration-300">
              <Link href="/mainPage">
                <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md">
                  Cancel
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
