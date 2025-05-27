import React from "react";
import { Menu } from "../types/Menu";

const Sidebar: React.FC<{ 
  onCreateMenu: () => void; 
  onBack?: () => void; 
  selectedMenu?: Menu | null; 
  onShare: (menu: Menu) => void;
}> = ({ onCreateMenu, onBack, selectedMenu, onShare }) => (
  <div className="w-64 bg-gray-800 shadow-md p-4 flex flex-col gap-4 text-white">
    <h2 className="text-lg text-center mt-40 font-semibold">
      {selectedMenu ? selectedMenu.name : "Meal Plans"}
    </h2>
    {selectedMenu ? (
      <>
        <button 
          onClick={() => onShare(selectedMenu)} 
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
        >
          Share meal plan
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
          disabled
        >
          Stop sharing
        </button>
        <button 
          onClick={onBack} 
          className="bg-gray-600 hover:bg-gray-700 p-2 rounded text-sm text-white border-none cursor-pointer"
        >
          Back
        </button>
      </>
    ) : (
      <button 
        onClick={onCreateMenu} 
        className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
      >
        Create meal plan
      </button>
    )}
  </div>
);

export default Sidebar;
