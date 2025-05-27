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
import { PlusIcon } from "lucide-react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];
//Komponent tworzący stronę wyboru jadłospisów, oraz samego jadłospisu

interface MenuTileProps {
  menu: Menu;
  description?: string;
}

const MenuComponent: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [editCell, setEditCell] = useState<{ dayIndex: number; mealType: string } | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [currentMenuPage, setCurrentMenuPage] = useState(1);
  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;
  const router = useRouter();
  const { query } = useSearch();
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [menuToExtend, setMenuToExtend] = useState<Menu | null>(null);
  const [daysToAdd, setDaysToAdd] = useState(1);
  
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
          router.push('/login?error=auth');
          return;
        }

        const storedMenus = localStorage.getItem("menus");
        if (storedMenus) {
          setMenus(JSON.parse(storedMenus));
        }

        const res = await axios.get(`${API_BASE_URL}/api/menuList/`, { withCredentials: true });
        setMenus(res.data);
        localStorage.setItem("menus", JSON.stringify(res.data));
        console.log("Menus fetched and set:", res.data);

      } catch (error) {
        console.error("Error during authentication or fetching menus:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login?error=auth');
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
      setIsLoadingContent(true); //
      setErrorMessage(null);
      
      try {
        const response = await axios.get(`${API_BASE_URL}/foodSecret/search?query=${query}`, {
          withCredentials: true,
        });
        setRecipes(response.data.recipes || response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login?error=auth');
        }
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
        if (axios.isAxiosError(recipeErr) && recipeErr.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login?error=auth');
        }
        console.error("Error fetching recipes from FatSecret API:", recipeErr);
      }
    }

    const recipeMap: Record<string, Recipe> = Object.fromEntries(
      fetchedRecipes.map((recipe) => [String(recipe.id), recipe])
    );
    console.log("Constructed recipeMap:", recipeMap);

    type DayPlan = Record<string, Recipe | null>;
    const plan: DayPlan[] = Array(menu.days)
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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login?error=auth');
        }else
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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('/login?error=auth');
        }else
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
    if (axios.isAxiosError(error) && error.response?.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
          router.push('login?error=auth');
        }else
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
      setRecipes(res.data.recipes || res.data);
    } catch (err) {
      console.error("Recipe search failed", err);
    }
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length <= maxLength ? text : text.substring(0, maxLength) + "...";
   if (isLoadingMain) {
  return (
    <div style={{
      position: 'fixed', // Use 'fixed' or 'absolute' depending on desired overlay behavior
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(21, 32, 43, 0.9)', // Your original semi-transparent background
      zIndex: 9999 // Ensure it's on top
    }}>
      <Loading /> {/* Now, reintroduce your Loading component here */}
    </div>
  );
}

  if (errorMessage && !isLoadingMain) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white font-sans items-center justify-center">
        <p className="text-red-500 text-center text-lg">{errorMessage}</p>
        <button
          onClick={() => router.push('/login?error=auth')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Login
        </button>
      </div>
    );
  }
  
  //Renderowanie widoku jadłospisu
  const renderMenuView = () => {
    if (isLoadingMain) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
      );
    }


    if (selectedMenu) {
      return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{selectedMenu.name}</h2>
              <p className="text-gray-400">{selectedMenu.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </button>
              <button
                onClick={() => handleExtendMenu(selectedMenu)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Days
              </button>
              <button
                onClick={() => setSelectedMenu(null)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                Back to Plans
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-6">
              {selectedMenu.plan.map((dayPlan, dayIndex) => (
                <div key={dayIndex} className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Day {dayIndex + 1}</h3>
                  <div className="grid gap-4">
                    {mealTypes.map((mealType) => {
                      const recipe = dayPlan[mealType];
                      return (
                        <div 
                          key={mealType} 
                          onClick={() => recipe ? handleShowDetails(recipe) : handleEditMeal(dayIndex, mealType)}
                          className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all duration-200">
                              {recipe ? (
                                <img
                                  src={recipe.image || "/placeholder.jpg"}
                                  alt={recipe.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <PlusIcon className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-400">{mealType}</div>
                              <div className="text-white group-hover:text-blue-400 transition-colors duration-200">
                                {recipe ? truncateText(recipe.name, 30) : "Click to add meal"}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {recipe && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMeal(dayIndex, mealType);
                                  }}
                                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                                  title="Edit meal"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveRecipe(dayIndex, mealType);
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 transition-colors duration-200"
                                  title="Remove meal"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">My Meal Plans</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Create New Meal Plan
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMenus.map((menu) => (
            <MenuTile
              key={menu.id}
              menu={menu}
              onSelect={handleSelectMenu}
              onDelete={(id) => setDeleteId(id)}
              onShare={() => {
                setSelectedMenu(menu);
                setIsShareModalOpen(true);
              }}
              onExtend={handleExtendMenu}
            />
          ))}
        </div>

        {menus.length > itemsPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentMenuPage}
              totalPages={totalMenuPages}
              onPageChange={(page) => setCurrentMenuPage(page)}
            />
          </div>
        )}
      </div>
    );
  };

  const handleExtendMenu = async (menu: Menu) => {
    setMenuToExtend(menu);
    setIsExtendModalOpen(true);
  };

  const handleConfirmExtend = async () => {
    if (!menuToExtend) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/menuList/extend`,
        {
          menuId: menuToExtend.id,
          additionalDays: daysToAdd
        },
        { withCredentials: true }
      );

      setMenus(menus.map(menu => 
        menu.id === menuToExtend.id 
          ? { ...menu, days: response.data.newDayCount }
          : menu
      ));

      if (selectedMenu?.id === menuToExtend.id) {
        setSelectedMenu({
          ...selectedMenu,
          days: response.data.newDayCount,
          plan: [
            ...selectedMenu.plan,
            ...Array(daysToAdd).fill(null).map(() =>
              mealTypes.reduce((acc, type) => ({ ...acc, [type]: null }), {})
            )
          ]
        });
      }

      setIsExtendModalOpen(false);
      setMenuToExtend(null);
      setDaysToAdd(1);
    } catch (error) {
      console.error('Error extending menu:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onCreateMenu={() => setIsCreateModalOpen(true)}
          onBack={selectedMenu ? () => setSelectedMenu(null) : undefined}
          selectedMenu={selectedMenu}
          onShare={() => selectedMenu && setIsShareModalOpen(true)}
        />
        {renderMenuView()}
      </div>
      {isExtendModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Extend Menu Plan</h2>
            {menuToExtend && (
              <p className="text-gray-400 mb-4">
                Add more days to "{menuToExtend.name}"
              </p>
            )}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of days to add
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDaysToAdd(prev => Math.max(1, prev - 1))}
                  className="p-2 text-gray-400 hover:text-white bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={daysToAdd}
                  onChange={(e) => setDaysToAdd(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 p-2 text-center bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setDaysToAdd(prev => Math.min(31, prev + 1))}
                  className="p-2 text-gray-400 hover:text-white bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsExtendModalOpen(false);
                  setMenuToExtend(null);
                  setDaysToAdd(1);
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtend}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Add Days
              </button>
            </div>
          </div>
        </div>
      )}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setEditCell(null);
        }}
        onSelect={handleSelectRecipe}
        initialRecipes={recipes}
        onSearch={handleRecipeSearch}
      />
      <RecipeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedRecipe(null);
        }}
        recipe={selectedRecipe!}
      />
      <CreateMenuModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateMenuSuccess}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        menuId={selectedMenu?.id || 0}
      />
      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDeleteMenu(deleteId)}
      />
      <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
    </div>
  );
}

export default MenuComponent;