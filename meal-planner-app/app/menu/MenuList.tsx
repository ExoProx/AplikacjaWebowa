"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
import { useRouter } from 'next/navigation';
import Loading from "../components/Loading";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";


const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];
//Komponent tworzący stronę wyboru jadłospisów, oraz samego jadłospisu

const MenuComponent: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu & { plan: Record<string, Recipe | null>[] } | null>(null);
  const [editCell, setEditCell] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true); 
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(1);
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [isLoadingContent, setIsLoadingContent] = useState(false);
  const itemsPerPage = 6;
  const router = useRouter();
  const { query } = useSearch();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingMain(true); // Start main loading
      setErrorMessage(null); // Clear any previous errors

      try {
        // 1. Check Authentication Status
        const authResponse = await axios.get(`${API_BASE_URL}/api/auth/check-auth`, {
          withCredentials: true,
        });

        if (authResponse.status !== 200 || !authResponse.data.isAuthenticated) {
          console.log("Not authenticated, redirecting to login.");
          router.push('/login');
          return; // Stop execution if not authenticated
        }

        // 2. If authenticated, fetch menus
        // Try to load from localStorage first for a quicker initial display
        const storedMenus = localStorage.getItem("menus");
        if (storedMenus) {
          setMenus(JSON.parse(storedMenus));
        }

        // Always attempt to fetch fresh menus from API in background
        const res = await axios.get(`${API_BASE_URL}/api/menuList/`, { withCredentials: true });
        setMenus(res.data);
        localStorage.setItem("menus", JSON.stringify(res.data));
        console.log("Menus fetched and set:", res.data);

      } catch (error) {
        console.error("Error during authentication or fetching menus:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login');
        } else {
          setErrorMessage("Failed to load initial data. Please try again.");
        }
      } finally {
        setIsLoadingMain(false); 
      }
    };

    loadInitialData();
  }, [router]); 



  useEffect(() => {
    if (!query) {
      setRecipes([]);
      return;
    }
    //Obsługa pobierania przepisów w edycji jadłospisu
    const fetchRecipes = async () => {
      setIsLoadingContent(true); 
      setErrorMessage(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/foodSecret/search?query=${query}`, {
          withCredentials: true,
        });
        setRecipes(response.data.recipes || response.data);
      } catch (err) {
        console.error("Global recipe search failed", err);

      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchRecipes();
    }, 300); 

    return () => clearTimeout(debounceFetch);
  }, [query]);

  const currentMenus = menus.slice(
    (currentMenuPage - 1) * itemsPerPage,
    currentMenuPage * itemsPerPage
  );
  const totalMenuPages = Math.ceil(menus.length / itemsPerPage);
const handleCreateMenuSuccess = (newMenu: Menu) => { 

    setMenus((prevMenus) => [...prevMenus, newMenu]); 
    setIsCreateModalOpen(false); 

  };

  //Funkcja wyboru jadłospisu
const handleSelectMenu = async (menu: Menu) => {
  setLoading(true);
  try {
    console.log("Attempting to fetch meals for menuId:", menu.id);
    const mealRes = await axios.get(`${API_BASE_URL}/api/menuList/fetch?menuId=${menu.id}`, {
      withCredentials: true,
    });
    const relatedMeals: Meal[] = mealRes.data;
    console.log("Fetched relatedMeals from backend:", relatedMeals);

    const recipeIds: string[] = [...new Set(relatedMeals.map((m) => m.id).filter(Boolean))];
    console.log("Extracted recipeIds from meals:", recipeIds);

    const batchedRecipeIds = recipeIds.join(',');
    let fetchedRecipes: Recipe[] = [];
    if (recipeIds.length > 0) {
      try {
        console.log("Fetching recipes from FatSecret with IDs:", batchedRecipeIds);
        const recipeFetchRes = await axios.get(`${API_BASE_URL}/foodSecret/search/recipes?ids=${batchedRecipeIds}`, {
          withCredentials: true,
        });
        fetchedRecipes = recipeFetchRes.data;
        console.log("Fetched recipes from FatSecret:", fetchedRecipes);
      } catch (recipeErr) {
        console.error("Error fetching recipes from FatSecret API:", recipeErr);
      }
    }

    const recipeMap: Record<string, Recipe> = Object.fromEntries(
      fetchedRecipes.map((recipe) => [String(recipe.id), recipe])
    );
    console.log("Constructed recipeMap:", recipeMap);

    type DayPlan = Record<string, Recipe | null>;
    const plan: DayPlan[] = Array(menu.days + 1)
      .fill(null)
      .map(() =>
        mealTypes.reduce((acc, type) => ({ ...acc, [type]: null }), {} as DayPlan)
      );
    console.log("Menu days:", menu.days);

    relatedMeals.forEach((meal) => {
      const frontendDayIndex = meal.dayindex;
      const trimmedMealType = meal.mealtype.trim();

      if (plan[frontendDayIndex] && meal.id !== null) {
        const recipeForSlot = recipeMap[String(meal.id)] ?? null;
        plan[frontendDayIndex][trimmedMealType] = recipeForSlot;
        console.log(`Assigned recipe to Day ${frontendDayIndex}, Meal ${trimmedMealType}:`, recipeForSlot ? recipeForSlot.name : "null");
      } else {
        console.warn(`Skipping assignment for Day ${frontendDayIndex}, Meal ${trimmedMealType}. Plan entry exists: ${!!plan[frontendDayIndex]}, Recipe ID not null: ${meal.id !== null}`);
      }
    });

    console.log("Final plan constructed:", plan);
    setSelectedMenu({ ...menu, plan });
  } catch (err) {
    console.error("Error fetching meals or menu details", err);
  } finally {
    setLoading(false);
  }
};
//Edycja posiłku
  const handleEditMeal = (dayIndex: number, mealType: string) => {

  setEditCell({ dayIndex, mealType });
  setIsRecipeModalOpen(true);
};
  //Usuwanie jadłospisu
  const handleDeleteMenu = async (menuIdToDelete: number) => { 
  try {
    await axios.delete(`${API_BASE_URL}/api/menuList/delete?menuId=${menuIdToDelete}`, { withCredentials: true });

    setMenus((prevMenus) => prevMenus.filter(m => m.id !== menuIdToDelete));

    setDeleteId(null);
    if (selectedMenu?.id === menuIdToDelete) {
      setSelectedMenu(null);
    }
  } catch (error) {
    console.error("Failed to delete menu", error);
  }
};

  //Wybór przepisu do ustawienia
const handleSelectRecipe = async (recipe: Recipe) => {
  if (!selectedMenu || !editCell) return;

  const { dayIndex, mealType } = editCell;

  try {
    await axios.put(
      `${API_BASE_URL}/api/menuList/updateMeal`,
      {
        menuId: selectedMenu.id,
        dayIndex: dayIndex, 
        mealType: mealType,
        recipeId: recipe.id,
      },
      { withCredentials: true }
    );

    const updatedPlan = [...selectedMenu.plan];
    updatedPlan[dayIndex][mealType] = recipe;
    setSelectedMenu({ ...selectedMenu, plan: updatedPlan });

    setIsRecipeModalOpen(false);
    setEditCell(null);
  } catch (error) {
    console.error("❌ Failed to save recipe to menu:", error);
  }
};


//Usunięcie przepisu
const handleRemoveRecipe = async (dayIndex: number, mealType: string) => {
  if (!selectedMenu) return;

  try {
    await axios.put(
      `${API_BASE_URL}/api/menuList/updateMeal`,
      {
        menuId: selectedMenu.id,
        dayIndex: dayIndex, 
        mealType: mealType,
        recipeId: null,
      },
      { withCredentials: true }
    );


    const updatedPlan = [...selectedMenu.plan];
    updatedPlan[dayIndex][mealType] = null;
    setSelectedMenu({ ...selectedMenu, plan: updatedPlan });
  } catch (error) {
    console.error("Failed to remove recipe from meal plan", error);
  }
};
  //Pokazanie detali przepisu
  const handleShowDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailsModalOpen(true);
  };
  //Wyszukiwanie przepisu
  const handleRecipeSearch = async (query: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/foodSecret/search?query=${query}`, {
        withCredentials: true,
      });
      setRecipes(res.data.recipes || res.data); // update recipes list, adjust based on your backend response structure
    } catch (err) {
      console.error("Recipe search failed", err);
      // Removed: toast.error("Recipe search failed.");
    }
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
   if (isLoadingMain) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white font-sans items-center justify-center">
        <Loading /> {/* Your Loading component */}
      </div>
    );
  }

  // If we reach here, main loading is complete, user is authenticated (or redirected)
  // If there was an error during main loading (and no redirect), display it
  if (errorMessage && !isLoadingMain) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white font-sans items-center justify-center">
        <p className="text-red-500 text-center text-lg">{errorMessage}</p>
        <button
          onClick={() => router.push('/login')} // Provide an option to retry/login
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  //Renderowanie widoku jadłospisu
  const renderMenuView = () => {
    if (!selectedMenu) return null;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <table className="w-full h-full border-collapse text-white">
            <thead>
              <tr className="bg-gray-800">
                <th className="text-left px-1 text-small min-w-[120px]">Meal</th>
                {Array.from({ length: selectedMenu.days }, (_, i) => (
                  <th key={i} className="text-center text-sm min-w-[150px]">Day {i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>

  {mealTypes.map((meal) => (
    <tr key={meal} className="border-t border-gray-600 h-1/5">
      <td className="p-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
        {meal}
      </td>
      {Array.from({ length: selectedMenu.days }, (_, i) => {
        const displayDayIndex = i + 1;
        const dayPlanEntry = selectedMenu.plan[displayDayIndex];

        return (
          <td key={i} className="p-2 align-top">
            <div
              className="h-full flex items-center justify-center cursor-pointer relative"
              onClick={() => dayPlanEntry && dayPlanEntry[meal] && handleShowDetails(dayPlanEntry[meal]!)}
            >
              {dayPlanEntry && dayPlanEntry[meal] ? ( 
                <div className="flex flex-col items-center p-2 rounded hover:bg-gray-700 transition-transform duration-300 hover:scale-105 overflow-hidden w-full relative">
                  <img
                    src={dayPlanEntry[meal]!.image || "/placeholder.jpg"}
                    alt={dayPlanEntry[meal]!.name}
                    className="w-12 h-12 object-cover mb-2"
                  />
                  <p className="text-center text-sm w-full">
                    {truncateText(dayPlanEntry[meal]!.name, 13)}
                  </p>
                  <button
                    type="button"
                    className="absolute top-0 left-0 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMeal(displayDayIndex, meal); 
                    }}
                    aria-label={`Edit ${meal} for day ${displayDayIndex}`}
                  >
                  </button>
                  <button
                    type="button"
                    className="absolute top-0 right-0 text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRecipe(displayDayIndex, meal); 
                    }}
                    aria-label={`Remove ${meal} for day ${displayDayIndex}`}
                  >
                  </button>
                </div>
              ) : (
                <div
                  className="bg-gray-800 p-2 rounded hover:bg-gray-700 text-center text-sm"
                  onClick={() => handleEditMeal(displayDayIndex, meal)} 
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleEditMeal(displayDayIndex, meal);
                    }
                  }}
                >
                  Edit meal
                </div>
              )}
            </div>
          </td>
        );
      })}
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>
    );
  };
  //Renderowanie strony wyboru jadłospisu
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
                    onDelete={() => {
    console.log("Attempting to set deleteId to:", menu.id);
    setDeleteId(menu.id);
  }}
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
        onCreateSuccess={handleCreateMenuSuccess}
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
        initialRecipes={recipes}
        onSearch={handleRecipeSearch}
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
