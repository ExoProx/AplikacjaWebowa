import React, { useState } from "react";
import axios from "axios";

const CreateMenuModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name || days < 1 || days > 31) {
      setMessage("Proszę podać poprawną nazwę i liczbę dni (1-31).");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/menuList",
        { name, number: days },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
        onClose();
       } catch (err: any) {
      console.error("Error during submission:", err);
      if (err.response?.data?.error) {
        setMessage(err.response.data.error);
      } else {
        setMessage("Coś poszło nie tak. Spróbuj ponownie.");
      }
    }
  };


  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={onClose} // close on clicking outside modal box
    >
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg w-96 text-white"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2 className="text-xl font-bold mb-4">Utwórz jadłospis</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nazwa jadłospisu"
          className="w-full p-2 mb-4 bg-gray-800 rounded text-white border-none"
        />
        <input
          type="number"
          value={days}
          onChange={(e) =>
            setDays(Math.min(31, Math.max(1, parseInt(e.target.value || "1"))))
          }
          min={1}
          max={31}
          placeholder="Liczba dni (1-31)"
          className="w-full p-2 mb-4 bg-gray-800 rounded text-white border-none"
        />

        {message && (
          <p className="mb-4 text-red-400 text-center">{message}</p>
        )}

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-blue-500 hover:underline"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white border-none"
          >
            Utwórz
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateMenuModal;