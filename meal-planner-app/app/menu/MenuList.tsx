"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useSearch } from "@/src/SearchContext";
import RecipeDetailsModal from "./RecipeDetailsModal";
import Pagination from "../components/Pagination";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MenuTile from "./MenuTile";
import { Menu } from "../types/Menu";
import { Recipe } from "../types/Recipe";
import { Meal } from "../types/Meal";
import Sidebar from "./Sidebar";
import CreateMenuModal from "./CreateMenuModal";
import ShareModal from "./ShareModal";
import RecipeModal from "./RecipeModal";




const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];

const MenuComponent: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu & { plan: Record<string, Recipe | null>[] } | null>(null);
  const [editCell, setEditCell] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(1);
  const itemsPerPage = 6;

  const currentMenus = menus.slice(
  (currentMenuPage - 1) * itemsPerPage,
  currentMenuPage * itemsPerPage
) ;

const totalMenuPages = Math.ceil(menus.length / itemsPerPage);

  useEffect(() => {
    const storedMenus = localStorage.getItem("menus");
    if (storedMenus) {
      setMenus(JSON.parse(storedMenus));
    }

    const fetchMenus = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/menuList/", { withCredentials: true });
        setMenus(res.data);
      console.log("Menus set:", res.data);
        localStorage.setItem("menus", JSON.stringify(res.data));
      } catch (err) {
        console.error("Error fetching menus", err);
      }
    };

    fetchMenus();
  }, []);
  
  const { query } = useSearch();
  //Wyszukiwanie przepisów
  useEffect(() => {
    if (!query) return;

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/foodSecret/search?query=${query}`, {
          withCredentials: true,
        });
        setRecipes(response.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query]);

  const handleSelectMenu = async (menu: Menu) => {
  try {
    const mealRes = await axios.get(`http://localhost:5000/api/menuList/fetch?menuId=${menu.id}`, {
      withCredentials: true,
    });
    const relatedMeals: Meal[] = mealRes.data;

    const recipeIds = [...new Set(relatedMeals.map((m) => m.id))];

    const recipeResponses = await Promise.all(
      recipeIds.map((id) =>
      axios.get(`http://localhost:5000/foodSecret/search/recipes?ids=${id}`, {
      withCredentials: true,
    })
  )
);
    const recipeMap: Record<string, Recipe> = Object.fromEntries(
      recipeResponses.map((res) => [res.data.id, res.data])
    );

    type DayPlan = Record<string, Recipe | null>;

    const plan: DayPlan[] = Array(menu.days).fill(null).map(() =>
      mealTypes.reduce((acc, type) => ({ ...acc, [type]: null }), {} as DayPlan)
    );

    relatedMeals.forEach((meal) => {
      if (plan[meal.dayIndex]) {
        plan[meal.dayIndex][meal.mealType] = recipeMap[meal.id] ?? null;
      }
    });

    // ✅ Always set selectedMenu even if relatedMeals is empty
    setSelectedMenu({ ...menu, plan });
  } catch (err) {
    console.error("Error fetching meals or recipes", err);
  }
};


  const handleEditMeal = (dayIndex: number, mealType: string) => {
    setEditCell({ dayIndex, mealType });
    setIsRecipeModalOpen(true);
  };
  const handleDeleteMenu = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/api/menuList/delete/${id}`, { withCredentials: true });
      setMenus((prevMenus) => prevMenus.filter(menu => menu.id !== id));
      setDeleteId(null);  
      if (selectedMenu?.id === id) setSelectedMenu(null);
    } catch (error) {
      console.error("Failed to delete menu", error);
   }
};

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!selectedMenu || !editCell) return;
    const updatedPlan = [...selectedMenu.plan];
    updatedPlan[editCell.dayIndex][editCell.mealType] = recipe;
    setSelectedMenu({ ...selectedMenu, plan: updatedPlan });
    setIsRecipeModalOpen(false);
    setEditCell(null);
  };

  const handleRemoveRecipe = (dayIndex: number, mealType: string) => {
    if (!selectedMenu) return;
    const updatedPlan = [...selectedMenu.plan];
    updatedPlan[dayIndex][mealType] = null;
    setSelectedMenu({ ...selectedMenu, plan: updatedPlan });
  };

  const handleShowDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailsModalOpen(true);
  };
 const handleRecipeSearch = async (query: string) => {
  try {
    const res = await axios.get(`http://localhost:5000/foodSecret/search?query=${query}`, {
      withCredentials: true,
    });
    setRecipes(res.data.recipes); // update recipes list
    // Remove setRecipePage(1); since it doesn't exist
  } catch (err) {
    console.error("Recipe search failed", err);
  }
};

  const truncateText = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.substring(0, maxLength) + "...";

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
                <th key={i} className="text-center text-sm min-w-[150px]">
                  Dzień {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((meal) => (
              <tr key={meal} className="border-t border-gray-600 h-1/5">
                <td className="p-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {meal}
                </td>
                {selectedMenu.plan.map((day, dayIndex) => (
                  <td key={dayIndex} className="p-2 align-top">
                    <div
                      className="h-full flex items-center justify-center cursor-pointer relative"
                      onClick={() => day[meal] && handleShowDetails(day[meal]!)}
                    >
                      {day[meal] ? (
                        <div className="flex flex-col items-center p-2 rounded hover:bg-gray-700 transition-transform duration-300 hover:scale-105 overflow-hidden w-full relative">
                          <img
                            src={day[meal]!.image || "/placeholder.jpg"}
                            alt={day[meal]!.name}
                            className="w-12 h-12 object-cover mb-2"
                          />
                          <p className="text-center text-sm w-full">
                            {truncateText(day[meal]!.name, 13)}
                          </p>
                          <button
                            type="button"
                            className="absolute top-0 left-0 text-blue-500 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMeal(dayIndex, meal);
                            }}
                            aria-label={`Edit ${meal} for day ${dayIndex + 1}`}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828l-5.657-5.657a2 2 0 112.828-2.828l2.829 2.829"
                              />
                            </svg>
                          </button>
                          <button
                            type="button"
                            className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRecipe(dayIndex, meal);
                            }}
                            aria-label={`Remove ${meal} for day ${dayIndex + 1}`}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div
                          className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-center text-sm"
                          onClick={() => handleEditMeal(dayIndex, meal)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleEditMeal(dayIndex, meal);
                            }
                          }}
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
        onShare={() => setIsShareModalOpen(true)}
      />
      <div className="flex-1 flex flex-col p-1 overflow-hidden">
        {!selectedMenu ? (
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 flex-1">
              {currentMenus.map((menu) => (
                <MenuTile
                  key={menu.id}
                  menu={menu}
                  onSelect={handleSelectMenu}
                  onDelete={() => setDeleteId(menu.id)}
                  onShare={() => setIsShareModalOpen(true)}
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
  initialRecipes={recipes}  // pass the full list here
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
}

export default MenuComponent;