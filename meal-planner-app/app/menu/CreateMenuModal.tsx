import React, { useState } from "react";
import axios from "axios";
import { Menu } from "../types/Menu";
import { X, Calendar, Type, AlertCircle } from "lucide-react";

const CreateMenuModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (newMenu: Menu) => void;
}> = ({ isOpen, onClose, onCreateSuccess }) => {
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");
    if (!name.trim() || days < 1 || days > 31) {
      setMessage("Please enter a valid name and number of days (1–31).");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/menuList",
        { name, number: days },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const newMenu: Menu = response.data;
      onCreateSuccess(newMenu);
      onClose();
    } catch (err: any) {
      console.error("Error during submission:", err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl w-[28rem] text-white shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Create a Meal Plan</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Plan Name
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter meal plan name"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Number of Days
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={days}
                onChange={(e) =>
                  setDays(Math.min(31, Math.max(1, parseInt(e.target.value || "1"))))
                }
                min={1}
                max={31}
                placeholder="Enter number of days (1-31)"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          {message && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-sm font-medium text-white bg-blue-500/80 hover:bg-blue-600/80 rounded-lg transition-colors"
            >
              Create Plan
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateMenuModal;
