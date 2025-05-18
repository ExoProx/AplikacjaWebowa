"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ShareIcon, StarIcon } from "@heroicons/react/24/outline";

interface Recipe {
  id: number;
  name: string;
  description: string;
  ingredients?: string[];
  instructions?: string;
  image?: string;
}

interface Menu {
  id: number;
  name: string;
  days: number;
  plan: { [meal: string]: Recipe | null }[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-center py-2">
      <button
        className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {"<"}
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded mx-1 ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-white"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      )}
      <button
        className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700 disabled:opacity-50 text-white"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {">"}
      </button>
    </div>
  );
};

const Sidebar: React.FC<{ 
  onCreateMenu: () => void; 
  onBack?: () => void; 
  selectedMenu?: Menu | null; 
  onShare: (menu: Menu) => void;
}> = ({ onCreateMenu, onBack, selectedMenu, onShare }) => (
  <div className="w-64 bg-gray-800 shadow-md p-4 flex flex-col gap-4 text-white">
    <h2 className="text-lg text-center mt-40 font-semibold">
      {selectedMenu ? selectedMenu.name : "Jadłospisy"}
    </h2>
    {selectedMenu ? (
      <>
        <button 
          onClick={() => onShare(selectedMenu)} 
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
        >
          Udostępnij jadłospis
        </button>
        <button 
          className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
          disabled
        >
          Zakończ udostępnianie
        </button>
        <button 
          onClick={onBack} 
          className="bg-gray-600 hover:bg-gray-700 p-2 rounded text-sm text-white border-none cursor-pointer"
        >
          Powrót
        </button>
      </>
    ) : (
      <button 
        onClick={onCreateMenu} 
        className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-sm text-white border-none cursor-pointer"
      >
        Utwórz jadłospis
      </button>
    )}
  </div>
);

const CreateMenuModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (menu: { name: string; days: number }) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (name && days >= 1 && days <= 31) {
      onCreate({ name, days });
      setName("");
      setDays(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
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
          onChange={(e) => setDays(Math.min(31, Math.max(1, parseInt(e.target.value || "1"))))}
          min="1"
          max="31"
          placeholder="Liczba dni (1-31)"
          className="w-full p-2 mb-4 bg-gray-800 rounded text-white border-none"
        />
        <div className="flex justify-between">
          <button onClick={onClose} className="text-blue-500 hover:underline">Anuluj</button>
          <button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white border-none">
            Utwórz
          </button>
        </div>
      </div>
    </div>
  );
};

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
          placeholder="Wygeneruj link, aby uzyskać adres"
          className="w-full p-2 mb-4 bg-gray-800 rounded text-white border-none"
        />
        <div className="flex justify-between">
          <button onClick={handleGenerateLink} className="bg-blue-500 hover:bg-blue-600 p-2 rounded text-white border-none">
            Wygeneruj link
          </button>
          <button onClick={onClose} className="text-blue-500 hover:underline">Powrót</button>
        </div>
      </div>
    </div>
  );
};

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
    <img src="/ikona_jadlospis.svg" alt="Ikona jadłospisu" className="w-16 h-16 mb-2" />
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

const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <h2 className="text-xl font-bold mb-4">Potwierdź usunięcie</h2>
        <p>Czy na pewno chcesz usunąć ten jadłospis?</p>
        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-blue-500 hover:underline">Anuluj</button>
          <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 p-2 rounded text-white border-none">
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

const RecipeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  recipes: Recipe[];
}> = ({ isOpen, onClose, onSelect, recipes }) => {
  const [currentRecipePage, setCurrentRecipePage] = useState(1);
  const recipesPerPage = 12;
  const totalRecipePages = Math.ceil(recipes.length / recipesPerPage);
  const currentRecipes = recipes.slice(
    (currentRecipePage - 1) * recipesPerPage,
    currentRecipePage * recipesPerPage
  );

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-900 p-6 rounded-lg max-w-7xl w-full text-white max-h-[100vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Wybierz przepis</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {currentRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-gray-800 p-4 rounded cursor-pointer hover:bg-gray-700 hover:scale-105 duration-300 flex flex-col items-center "
              onClick={() => onSelect(recipe)}
            >
              <img src={recipe.image || "/placeholder.jpg"} alt={recipe.name} className="w-16 h-16 object-cover mb-2" />
              <p className="text-center">{recipe.name}</p>
            </div>
          ))}
        </div>
        <Pagination
          currentPage={currentRecipePage}
          totalPages={totalRecipePages}
          onPageChange={setCurrentRecipePage}
        />
        <button onClick={onClose} className="text-blue-500 hover:underline">Zamknij</button>
      </div>
    </div>
  );
};

// Komponent StarRating do oceniania
interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    onRatingChange(index);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-6 h-6 cursor-pointer ${
            star <= (hoverRating || rating) ? "text-yellow-500 fill-current" : "text-gray-400"
          }`}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

const RecipeDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}> = ({ isOpen, onClose, recipe }) => {
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const storedRatings = localStorage.getItem("recipeRatings");
    if (storedRatings) {
      setRatings(JSON.parse(storedRatings));
    }
  }, []);

  const handleRatingChange = (newRating: number) => {
    const updatedRatings = { ...ratings, [recipe.id]: newRating };
    setRatings(updatedRatings);
    localStorage.setItem("recipeRatings", JSON.stringify(updatedRatings));
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}>
      <div className="bg-gray-800 p-4 rounded-lg max-w-2xl w-full shadow-xl text-white overflow-y-auto max-h-[90vh] relative">
        {ratings[recipe.id] > 0 && (
          <div className="absolute top-2 right-2 flex items-center bg-gray-800 px-2 py-1 rounded">
            <span className="text-yellow-500 text-sm">{ratings[recipe.id]}</span>
            <StarIcon className="w-4 h-4 text-yellow-500 fill-current ml-1" />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
        <p className="mb-2 text-sm">{recipe.description}</p>
        <h3 className="text-lg font-semibold mb-1">Składniki:</h3>
        <div className="grid grid-cols-2 gap-x-4 mb-2 text-sm">
          {recipe.ingredients?.map((ingredient, index) => (
            <div key={index} className="flex">
              <span className="mr-2">•</span>
              <span>{ingredient}</span>
            </div>
          ))}
        </div>
        <h3 className="text-lg font-semibold mb-1">Instrukcje:</h3>
        <p className="mb-2 text-sm">{recipe.instructions}</p>
        <div className="flex justify-between items-center">
          <button className="text-blue-500 hover:underline text-sm" onClick={onClose}>
            Zamknij
          </button>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold mb-1">Oceń przepis</h3>
            <StarRating
              rating={ratings[recipe.id] || 0}
              onRatingChange={handleRatingChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuComponent: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>(() => {
    const stored = localStorage.getItem("menus");
    return stored ? JSON.parse(stored) : [];
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editCell, setEditCell] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [currentMenuPage, setCurrentMenuPage] = useState(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const mealTypes = ["I Śniadanie", "II Śniadanie", "Obiad", "Podwieczorek", "Kolacja"];
  const menusPerPage = 18;
  const totalMenuPages = Math.ceil(menus.length / menusPerPage);
  const currentMenus = menus.slice(
    (currentMenuPage - 1) * menusPerPage,
    currentMenuPage * menusPerPage
  );

  useEffect(() => {
    localStorage.setItem("menus", JSON.stringify(menus));
  }, [menus]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/foodSecret/search?query=a');
        setRecipes(response.data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };
    fetchRecipes();
  }, []);

  const handleCreateMenu = ({ name, days }: { name: string; days: number }) => {
    const newMenu: Menu = {
      id: Date.now(),
      name,
      days,
      plan: Array(days).fill(null).map(() => mealTypes.reduce((acc, meal) => ({ ...acc, [meal]: null }), {})),
    };
    setMenus((prev) => [...prev, newMenu]);
  };

  const handleDeleteMenu = (id: number) => {
    setMenus((prev) => prev.filter((menu) => menu.id !== id));
    setDeleteId(null);
    setSelectedMenu(null);
  };

  const handleEditMeal = (dayIndex: number, mealType: string) => {
    setEditCell({ dayIndex, mealType });
    setIsRecipeModalOpen(true);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (editCell && selectedMenu) {
      const updatedPlan = [...selectedMenu.plan];
      updatedPlan[editCell.dayIndex][editCell.mealType] = recipe;
      setSelectedMenu({ ...selectedMenu, plan: updatedPlan });
      setMenus((prev) => prev.map((m) => (m.id === selectedMenu.id ? { ...m, plan: updatedPlan } : m)));
    }
    setIsRecipeModalOpen(false);
    setEditCell(null);
  };

  const handleRemoveRecipe = (dayIndex: number, mealType: string) => {
    if (selectedMenu) {
      const updatedPlan = [...selectedMenu.plan];
      updatedPlan[dayIndex][mealType] = null;
      setSelectedMenu({ ...selectedMenu, plan: updatedPlan });
      setMenus((prev) => prev.map((m) => (m.id === selectedMenu.id ? { ...m, plan: updatedPlan } : m)));
    }
  };

  const handleShowDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailsModalOpen(true);
  };

  const handleShareMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsShareModalOpen(true);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderMenuView = () => {
    if (!selectedMenu) return null;
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <table className="w-full h-full border-collapse text-white">
            <thead>
              <tr className="bg-gray-800">
                <th className="text-left px-1 text-small min-w-[120px]">Posiłek</th>
                {Array.from({ length: selectedMenu.days }, (_, i) => (
                  <th key={i} className="text-center text-sm min-w-[150px]">Dzień {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map((meal) => (
                <tr key={meal} className="border-t border-gray-600 h-1/5">
                  <td className="p-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{meal}</td>
                  {selectedMenu.plan.map((day, dayIndex) => (
                    <td key={dayIndex} className="p-2 align-top">
                      <div
                        className="h-full flex items-center justify-center cursor-pointer relative"
                        onClick={() => day[meal] && handleShowDetails(day[meal]!)}
                      >
                        {day[meal] ? (
                          <div className="flex flex-col items-center p-2 rounded hover:bg-gray-700 transition-transform duration-300 hover:scale-105 overflow-hidden w-full relative">
                            <img src={day[meal]!.image || "/placeholder.jpg"} alt={day[meal]!.name} className="w-12 h-12 object-cover mb-2" />
                            <p className="text-center text-sm w-full">{truncateText(day[meal]!.name, 13)}</p>
                            <button
                              className="absolute top-0 left-0 text-blue-500 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMeal(dayIndex, meal);
                              }}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657-5.657a2 2 0 112.828-2.828l2.829 2.829" />
                              </svg>
                            </button>
                            <button
                              className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRecipe(dayIndex, meal);
                              }}
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div
                            className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-center text-sm"
                            onClick={() => handleEditMeal(dayIndex, meal)}
                          >
                            Edytuj posiłek
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          onCreateMenu={() => setIsCreateModalOpen(true)} 
          onBack={selectedMenu ? () => setSelectedMenu(null) : undefined} 
          selectedMenu={selectedMenu}
          onShare={handleShareMenu}
        />
        <div className="flex-1 flex flex-col p-1 overflow-hidden">
          {!selectedMenu ? (
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 flex-1">
                {currentMenus.map((menu) => (
                  <MenuTile
                    key={menu.id}
                    menu={menu}
                    onSelect={setSelectedMenu}
                    onDelete={() => setDeleteId(menu.id)}
                    onShare={handleShareMenu}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentMenuPage}
                totalPages={totalMenuPages}
                onPageChange={setCurrentMenuPage}
              />
            </div>
          ) : (
            renderMenuView()
          )}
        </div>
      </div>
      <CreateMenuModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateMenu}
      />
      <DeleteConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDeleteMenu(deleteId!)}
      />
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        onSelect={handleSelectRecipe}
        recipes={recipes}
      />
      <RecipeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        recipe={selectedRecipe!}
      />
      {selectedMenu && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          menuId={selectedMenu.id}
        />
      )}
      <Footer />
    </div>
  );
};

export default MenuComponent;