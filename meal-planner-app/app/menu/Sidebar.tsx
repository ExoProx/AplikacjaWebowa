import React from "react";
import { Menu } from "../types/Menu";
import { PlusCircle, Share2, Link2Off, ArrowLeft, Copy } from "lucide-react";

const Sidebar: React.FC<{ 
  onCreateMenu: () => void; 
  onBack?: () => void; 
  selectedMenu?: Menu | null;
  onShare?: (menuId: number) => void;
  onUnshare?: (menuId: number) => void;
  onShowShareModal?: (menuId: number) => void;
  isShared?: boolean;
}> = ({ 
  onCreateMenu, 
  onBack, 
  selectedMenu, 
  onShare,
  onUnshare,
  onShowShareModal,
  isShared
}) => (
  <div className="w-64 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 p-6 flex flex-col gap-6 text-white">
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-semibold text-center">
        {selectedMenu ? selectedMenu.name : "Meal Plans"}
      </h2>
      
      {selectedMenu ? (
        <div className="w-full space-y-4">
          {isShared ? (
            <>
              <button 
                onClick={() => onShowShareModal?.(selectedMenu.id)} 
                className="w-full flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-600/80 px-4 py-2.5 rounded-lg text-sm font-medium text-white border border-blue-400/20 backdrop-blur-sm transition-colors duration-200"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button 
                onClick={() => onUnshare?.(selectedMenu.id)}
                className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 border border-red-400/20 backdrop-blur-sm transition-colors duration-200"
              >
                <Link2Off className="w-4 h-4" />
                Stop Sharing
              </button>
            </>
          ) : (
            <button 
              onClick={() => onShare?.(selectedMenu.id)}
              className="w-full flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-600/80 px-4 py-2.5 rounded-lg text-sm font-medium text-white border border-blue-400/20 backdrop-blur-sm transition-colors duration-200"
            >
              <Share2 className="w-4 h-4" />
              Share Menu
            </button>
          )}
          <button 
            onClick={onBack} 
            className="w-full flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2.5 rounded-lg text-sm font-medium text-white border border-gray-600/20 backdrop-blur-sm transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </button>
        </div>
      ) : (
        <button 
          onClick={onCreateMenu} 
          className="w-full flex items-center justify-center gap-2 bg-blue-500/80 hover:bg-blue-600/80 px-4 py-2.5 rounded-lg text-sm font-medium text-white border border-blue-400/20 backdrop-blur-sm transition-colors duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          Create Menu
        </button>
      )}
    </div>
  </div>
);

export default Sidebar;
