import React from "react";
import { Menu } from "../types/Menu";
import { ShareIcon, CalendarDaysIcon, XIcon, ChevronRightIcon, PlusIcon } from "lucide-react";

const MenuTile: React.FC<{
  menu: Menu;
  onSelect: (menu: Menu) => void;
  onDelete: (id: number) => void;
  onShare: (menu: Menu) => void;
  onExtend?: (menu: Menu) => void;
}> = ({ menu, onSelect, onDelete, onShare, onExtend }) => (
  <div
    className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl cursor-pointer group relative overflow-hidden"
    onClick={() => onSelect(menu)}
  >
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/0 via-gray-900/0 to-gray-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">{menu.name}</h3>
        {menu.description && (
          <p className="text-gray-400 text-sm line-clamp-2 mb-3">{menu.description}</p>
        )}
      </div>
      <div className="flex gap-2 z-10">
        <button
          className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-blue-500/10"
          onClick={(e) => {
            e.stopPropagation();
            onShare(menu);
          }}
          title="Share menu"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(menu.id);
          }}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-red-500/10"
          title="Delete menu"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between text-gray-500 z-10 relative">
      <div className="flex items-center">
        <CalendarDaysIcon className="w-5 h-5 mr-2" />
        <span className="text-sm">{menu.days} days</span>
      </div>
      <div className="flex gap-2">
        {onExtend && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExtend(menu);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-blue-500/10"
            title="Add more days"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add days</span>
          </button>
        )}
        <button
          onClick={() => onSelect(menu)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 rounded-lg hover:bg-blue-500/10"
        >
          <span>Open menu</span>
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
  </div>
);

export default MenuTile;