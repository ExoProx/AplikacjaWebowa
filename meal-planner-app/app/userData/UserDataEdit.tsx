// app/userData/UserDataEdit.tsx
"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Save, X } from "lucide-react"; 
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
  email: string;
}

const UserDataEdit: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    lastname: "",
    phone_number: "", 
    email: ""
  });
  const [message, setMessage] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
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
          email: response.data.email || ""
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
    if (e.target.name === "phone_number") {
      setPhoneError(null);
      const value = e.target.value;
      if (value === '' || /^\d+$/.test(value)) {
        setProfileData({ ...profileData, [e.target.name]: value });
      }
    } else {
      setProfileData({ ...profileData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedPhoneNumber = profileData.phone_number.trim();

    if (trimmedPhoneNumber.length === 0) {
      setPhoneError("Numer telefonu nie może być pusty.");
      setMessage("");
      return; 
    }
    if (trimmedPhoneNumber.length < 9) {
      setPhoneError("Numer telefonu musi zawierać co najmniej 9 cyfr.");
      setMessage("");
      return; 
    }
    if (!/^\d+$/.test(trimmedPhoneNumber)) {
        setPhoneError("Numer telefonu może zawierać tylko cyfry.");
        setMessage("");
        return;
    }

    setPhoneError(null);
    setMessage("Saving changes...");

    try {
      const dataToSend = {
        name: profileData.name,
        lastname: profileData.lastname,
        phone_number: trimmedPhoneNumber, 
        email: profileData.email
      };

      await axios.put("http://localhost:5000/api/users/updateuserdata", dataToSend, {
        withCredentials: true,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      if (axios.isAxiosError(err) && err.response) {
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-sans">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl p-8 relative overflow-hidden">
            {/* Decorative gradient elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
            
            <div className="relative">
              <h1 className="text-2xl font-bold mb-2 text-white">Edit Profile</h1>
              <p className="text-gray-400 mb-8">Update your personal information</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Name</label>
                    <div className="relative group">
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200 group-hover:border-gray-500"
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Last Name</label>
                    <div className="relative group">
                      <input
                        type="text"
                        name="lastname"
                        value={profileData.lastname}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200 group-hover:border-gray-500"
                      />
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200 group-hover:border-gray-500"
                    />
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Phone Number</label>
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={`w-full bg-gray-700/50 border ${phoneError ? 'border-red-500' : 'border-gray-600'} rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition-all duration-200 ${!phoneError && 'group-hover:border-gray-500'}`}
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors duration-200 group-hover:text-gray-300" />
                  </div>
                  {phoneError && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-2">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full"></span>
                      {phoneError}
                    </p>
                  )}
                </div>

                {message && (
                  <div className={`p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'} backdrop-blur-sm`}>
                    {message}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20"
                  >
                    <Save className="w-5 h-5" />
                    Save Changes
                  </button>
                  <Link href="/mainPage" className="flex-1">
                    <button
                      type="button"
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-gray-500/10"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
    </div>
  );
};

export default UserDataEdit;