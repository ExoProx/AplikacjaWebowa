import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Copy, Check, Link2Off, Share2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const ShareModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  menuId: number;
  onStatusChange?: (menuId: number, isShared: boolean) => void;
}> = ({ isOpen, onClose, menuId, onStatusChange }) => {
  const [link, setLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && menuId) {
      setIsLoading(true);
      setError("");
      checkSharingStatus();
    }
  }, [isOpen, menuId]);

  const checkSharingStatus = async () => {
    try {
      console.log('Checking sharing status in modal for menuId:', menuId);
      const response = await axios.get(`${API_BASE_URL}/api/menuList/check-share/${menuId}`, {
        withCredentials: true
      });
      console.log('Share status response:', response.data);
      
      if (response.data.mealPlan && response.data.mealPlan.token) {
        const shareLink = `${window.location.origin}/shared/${response.data.mealPlan.token}`;
        console.log('Generated share link:', shareLink);
        setLink(shareLink);
        setIsSharing(true);
        onStatusChange?.(menuId, true);
      } else {
        console.log('No sharing token found, initiating sharing process');
        setIsSharing(false);
        onStatusChange?.(menuId, false);
        handleInitialShare();
      }
    } catch (err: Error | unknown) {
      console.error('Error checking share status:', err);
      let errorMessage = "Failed to check sharing status";
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsSharing(false);
      onStatusChange?.(menuId, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialShare = async () => {
    try {
      console.log('Initiating share for menuId:', menuId);
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/menuList/share`,
        { menuId },
        { withCredentials: true }
      );
      console.log('Share response:', response.data);
      
      if (response.data.token) {
        const shareLink = `${window.location.origin}/shared/${response.data.token}`;
        console.log('Generated share link:', shareLink);
        setLink(shareLink);
        setIsSharing(true);
        setError("");
        onStatusChange?.(menuId, true);
      } else {
        throw new Error('No token received from share endpoint');
      }
    } catch (err: Error | unknown) {
      console.error('Error sharing menu:', err);
      let errorMessage = "Failed to share menu";
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      onStatusChange?.(menuId, false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!link) {
      setError("No sharing link available");
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      setError("Failed to copy link to clipboard");
    }
  };

  const handleUnshare = async () => {
    try {
      setIsUnsharing(true);
      setError("");
      console.log('Attempting to unshare menu:', menuId);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/menuList/unshare`,
        { menuId },
        { withCredentials: true }
      );
      console.log('Unshare response:', response.data);

      setLink("");
      setIsSharing(false);
      onStatusChange?.(menuId, false);
    } catch (err: Error | unknown) {
      console.error('Error unsharing menu:', err);
      let errorMessage = "Failed to stop sharing";
      
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      await checkSharingStatus();
    } finally {
      setIsUnsharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Share Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-500 animate-spin" />
            <p>Checking sharing status...</p>
          </div>
        ) : isSharing ? (
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
                  title="Copy to clipboard"
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {copied ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span className="text-sm">Copied!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Copy className="w-5 h-5" />
                      <span className="text-sm">Copy</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={handleUnshare}
              disabled={isUnsharing}
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <Link2Off className="w-5 h-5" />
              {isUnsharing ? "Stopping..." : "Stop Sharing"}
            </button>
          </>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-500" />
            <p>Generating sharing link...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;