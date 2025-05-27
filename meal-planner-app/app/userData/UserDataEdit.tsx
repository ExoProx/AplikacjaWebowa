// app/userData/UserDataEdit.tsx
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
  phone_number: string;
}

const UserDataEdit: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    lastname: "",
    phone_number: "",
  });
  const [message, setMessage] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null); // New state for phone number validation error
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/userdata", {
          withCredentials: true,
        });
        setProfileData({
          name: response.data.name || "",
          lastname: response.data.lastname || "",
          phone_number: response.data.phone_number ? String(response.data.phone_number) : "",
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
          console.log('fetchInitialData: Unauthorized, redirecting to login.');
          router.push('/login?error=auth');
        }
        console.error("Error fetching user data:", err);
        setMessage("Failed to load user data.");
      }
    };
    fetchUserData();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear phone error when user starts typing
    if (e.target.name === "phone_number") {
      setPhoneError(null);
    }
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Frontend Validation
    const trimmedPhoneNumber = profileData.phone_number.trim();
    if (trimmedPhoneNumber.length < 9) {
      setPhoneError("Numer telefonu musi zawierać co najmniej 9 cyfr.");
      setMessage(""); // Clear general message
      return; // Stop form submission
    }
    // Optional: Check if it contains only digits
    if (!/^\d+$/.test(trimmedPhoneNumber)) {
        setPhoneError("Numer telefonu może zawierać tylko cyfry.");
        setMessage("");
        return;
    }

    setPhoneError(null); // Clear any previous phone errors
    setMessage("Saving changes...");

    try {
      const dataToSend = {
        name: profileData.name,
        lastname: profileData.lastname,
        phone_number: trimmedPhoneNumber, // Send the trimmed value
      };

      await axios.put("http://localhost:5000/api/users/updateuserdata", dataToSend, {
        withCredentials: true,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err) && err.response) {
        // Display backend validation errors
        setMessage(`Error updating profile: ${err.response.data.message || 'Unknown error'}`);
        if (err.response.status === 401) {
          router.push('/login?error=auth');
        }
      } else {
        setMessage("An unexpected error occurred while updating profile.");
      }
    }
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
              label="Nazwisko"
              type="text"
              field="lastname"
              value={profileData.lastname}
              onChange={handleChange}
              placeholder="Wpisz nowe nazwisko"
              icon={<User className="text-gray-800" size={20} />}
              className="bg-gray-200 rounded-md p-2 w-full text-gray-800"
            />
            <InputField
              label="Numer telefonu"
              type="text"
              field="phone_number"
              value={profileData.phone_number}
              onChange={handleChange}
              placeholder="Wpisz nowy numer telefonu"
              icon={<Mail className="text-gray-800" size={20} />}
              className={`bg-gray-200 rounded-md p-2 w-full text-gray-800 ${phoneError ? 'border-red-500 border-2' : ''}`}
            />
            {phoneError && ( // Display phone number error
              <p className="text-red-400 text-sm mt-1">{phoneError}</p>
            )}
            <div className="transform transition-transform hover:scale-105 duration-300">
              <SubmitButton
                type="submit"
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full"
              >
                Save changes
              </SubmitButton>
            </div>
            <div className="mt-4 transform transition-transform hover:scale-105 duration-300">
              <Link href="/mainPage" passHref>
                <SubmitButton type="button" className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md w-full">
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

export default UserDataEdit;