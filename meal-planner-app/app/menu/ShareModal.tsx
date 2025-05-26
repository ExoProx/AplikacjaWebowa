import React, {useState} from "react";

const ShareModal: React.FC<{ isOpen: boolean; onClose: () => void; menuId: number }> = ({ isOpen, onClose, menuId }) => {
  const [link, setLink] = useState("");

  const handleGenerateLink = () => {
    setLink(`http://localhost:3000/share/${menuId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <input
          type="text"
          value={link}
          readOnly
          placeholder="Generate link to get an address"
          className="w-full p-2 mb-4 bg-gray-800 rounded text-white border-none"
        />
        <div className="flex justify-between">
          <button onClick={handleGenerateLink} className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white border-none">
            Generate Link
          </button>
          <button onClick={onClose} className="text-blue-500 hover:underline">Return</button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal