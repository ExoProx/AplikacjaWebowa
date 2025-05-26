import React from "react";
import { Menu } from "../types/Menu";
import { ShareIcon } from "lucide-react";

const MenuTile: React.FC<{
  menu: Menu;
  onSelect: (menu: Menu) => void;
  onDelete: (id: number) => void;
  onShare: (menu: Menu) => void;
}> = ({ menu, onSelect, onDelete, onShare }) => (
  <div
    className="bg-slate-800 rounded-lg shadow-md p-4 flex flex-col items-center justify-center cursor-pointer relative transition-transform duration-300 hover:bg-gray-700 hover:scale-105"
    onClick={() => onSelect(menu)}
  >
    <button
      className="absolute top-2 left-2 text-blue-500 hover:text-blue-700 border-none cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onShare(menu);
      }}
    >
      <ShareIcon className="w-7 h-7" />
    </button>
    <img src="/ikona_jadlospis.svg" alt="Meal plan icon" className="w-16 h-16 mb-2" />
    <p className="text-white text-center text-sm">{menu.name}</p>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(menu.id);
      }}
      className="absolute top-2 right-2 text-red-500 hover:text-red-700 border-none cursor-pointer"
    >
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export default MenuTile;