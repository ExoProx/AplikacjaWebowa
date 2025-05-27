import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Copy, Check } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const ShareModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  menuId: number;
}> = ({ isOpen, onClose, menuId }) => {
  const [link, setLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLink("");
      setError("");
      setCopied(false);
      checkSharingStatus();
    }
  }, [isOpen, menuId]);

  const checkSharingStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/menuList/shared/${menuId}`, {
        withCredentials: true
      });
      if (response.data.mealPlan.token) {
        setLink(`${window.location.origin}/shared/${response.data.mealPlan.token}`);
        setIsSharing(true);
      }
    } catch (err) {
      setIsSharing(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setError("");
      const response = await axios.post(
        `${API_BASE_URL}/api/menuList/share`,
        { menuId },
        { withCredentials: true }
      );
      setLink(`${window.location.origin}/shared/${response.data.token}`);
      setIsSharing(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate sharing link");
    }
  };

  const handleStopSharing = async () => {
    try {
      setError("");
      await axios.post(
        `${API_BASE_URL}/api/menuList/unshare`,
        { menuId },
        { withCredentials: true }
      );
      setLink("");
      setIsSharing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to stop sharing");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy link to clipboard");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900/80 backdrop-blur-sm">
      <div className="bg-gray-800 p-6 rounded-xl w-[28rem] text-white border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Share Meal Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {isSharing ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sharing Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleStopSharing}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
              >
                Stop Sharing
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-between">
            <button
              onClick={handleGenerateLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Generate Sharing Link
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;