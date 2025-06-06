import React from "react";

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete this meal plan?</p>
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-blue-500 hover:underline">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 p-2 rounded text-white border-none">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
