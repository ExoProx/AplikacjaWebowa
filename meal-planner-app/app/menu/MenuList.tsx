"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Copy, Link2Off, Share2 } from "lucide-react";
import Image from 'next/image'; 


const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];

//Komponent tworzący stronę wyboru jadłospisów, oraz samego jadłospisu
const MenuComponent: React.FC = () => {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [editCell, setEditCell] = useState<{ dayIndex: number; mealType: string } | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [currentMenuPage, setCurrentMenuPage] = useState(1);
    const [isLoadingMain, setIsLoadingMain] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [, setIsLoadingContent] = useState(false);
    const [sharingStatuses, setSharingStatuses] = useState<{[key: number]: boolean}>({});
    const [currentMenuId, setCurrentMenuId] = useState<number | null>(null);
    const itemsPerPage = 12;
    const router = useRouter();
    const { query } = useSearch();
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [menuToExtend, setMenuToExtend] = useState<Menu | null>(null);
    const [daysToAdd, setDaysToAdd] = useState(1);

    const checkSharingStatus = async (menuId: number) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/menuList/check-share/${menuId}`, {
                withCredentials: true
            });

            const isShared = response.data.mealPlan && response.data.mealPlan.token && response.data.mealPlan.token.length > 0;
            return isShared;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingMain(true);
            setErrorMessage(null);

            try {
                let authResponse;
                try {
                    authResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-auth`, {
                        withCredentials: true,
                        timeout: 8000,
                    });
                } catch (authError) { 
                    if (authError instanceof Error) {
                        if (authError.message === 'Network Error') {
                            setErrorMessage("Failed to connect to the server. Please ensure the backend server is running.");
                            setIsLoadingMain(false);
                            return;
                        }
                    }

                    if (axios.isAxiosError(authError)) {
                        if (authError.code === 'ECONNABORTED') {
                            setErrorMessage("Connection timeout. Check your connection and try again.");
                            setIsLoadingMain(false);
                            return;
                        }

                        if (authError.response?.status === 401) {
                            router.push('/login?error=auth');
                            return;
                        }
                    }

                    setErrorMessage("Authentication check failed. Please try again.");
                    setIsLoadingMain(false);
                    return;
                }

                if (!authResponse || authResponse.status !== 200 || !authResponse.data.isAuthenticated) {
                    router.push('/login');
                    return;
                }

                let menuResponse;
                try {
                    menuResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/menuList/`, {
                        withCredentials: true,
                        timeout: 5000,
                    });

                    if (!Array.isArray(menuResponse.data)) {
                        throw new Error('Invalid menu data received');
                    }

                    setMenus(menuResponse.data);

                    
                    const ids = menuResponse.data.map(menu => menu.id);
                    const uniqueIds = new Set(ids);
                    if (ids.length !== uniqueIds.size) {
                        console.error("Duplicate menu IDs found IMMEDIATELY AFTER FETCH:", ids.filter((item, index) => ids.indexOf(item) !== index));
                    } else {
                        console.log("No duplicate menu IDs found immediately after fetch.");
                    }
                    

                    const sharingStatusUpdates: {[key: number]: boolean} = {};
                    for (const menu of menuResponse.data) {
                        try {
                            const isShared = await checkSharingStatus(menu.id);
                            sharingStatusUpdates[menu.id] = isShared;
                        } catch (err) {
                            console.log(err);
                            sharingStatusUpdates[menu.id] = false;
                        }
                    }

                    setSharingStatuses(sharingStatusUpdates);

                } catch (menuError) { 
                    if (menuError instanceof Error) {
                        if (menuError.message === 'Network Error') {
                            setErrorMessage("Failed to fetch meal plans. Check your connection.");
                        } else if (axios.isAxiosError(menuError) && menuError.code === 'ECONNABORTED') {
                            setErrorMessage("Timeout fetching meal plans. Check your connection and try again.");
                        } else if (axios.isAxiosError(menuError)) {
                            setErrorMessage(menuError.response?.data?.error || "Failed to fetch meal plans.");
                        }
                    }
                }

            } catch (error) { 
                if (error instanceof Error) {
                    setErrorMessage("An unexpected error occurred. Please try again later.");
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

        const fetchRecipes = async () => {
            setIsLoadingContent(true);
            setErrorMessage(null);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/foodSecret/search?query=${query}`, {
                    withCredentials: true,
                });
                setRecipes(response.data.recipes || response.data);
            } catch (err) {
                console.log(err);
                
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
    
    useEffect(() => {
        const slicedIds = currentMenus.map(menu => menu.id);
        const uniqueSlicedIds = new Set(slicedIds);
        if (slicedIds.length !== uniqueSlicedIds.size) {
            console.error("Duplicate menu IDs found in currentMenus (after slicing/pagination):", slicedIds.filter((item, index) => slicedIds.indexOf(item) !== index));
        } else {
            console.log("No duplicate menu IDs found in currentMenus after slicing.");
        }
    }, [currentMenus]); 


    const totalMenuPages = Math.ceil(menus.length / itemsPerPage);

    const handleCreateMenuSuccess = (newMenu: Menu) => {
    setMenus((prevMenus) => {
        
        const updatedMenus = [...prevMenus, { ...newMenu, id: Number(newMenu.id) }];

        
        const newIds = updatedMenus.map(m => m.id);
        const uniqueNewIds = new Set(newIds);
        if (newIds.length !== uniqueNewIds.size) {
            console.error("Duplicate menu IDs found after handleCreateMenuSuccess:", newIds.filter((item, index) => newIds.indexOf(item) !== index));
        } else {
            console.log("No duplicate menu IDs found after handleCreateMenuSuccess.");
        }

        return updatedMenus;
    });
    setIsCreateModalOpen(false);
};

    const handleSelectMenu = async (menu: Menu) => {
        setLoading(true);
        try {
            const mealRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/menuList/fetch?menuId=${menu.id}`, {
                withCredentials: true,
            });
            const relatedMeals: Meal[] = mealRes.data;

            try {
                const isShared = await checkSharingStatus(menu.id);
                setSharingStatuses(prev => ({ ...prev, [menu.id]: isShared }));
            } catch (shareErr) {
                console.log(shareErr);
                setSharingStatuses(prev => ({ ...prev, [menu.id]: false }));
            }

            const recipeIds: string[] = [...new Set(relatedMeals.map((m) => m.id).filter(Boolean))];

            const batchedRecipeIds = recipeIds.join(',');
            let fetchedRecipes: Recipe[] = [];
            if (recipeIds.length > 0) {
                try {
                    const recipeFetchRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/foodSecret/search/recipes?ids=${batchedRecipeIds}`, {
                        withCredentials: true,
                    });
                    fetchedRecipes = recipeFetchRes.data;
                } catch (recipeErr) {
                    console.log(recipeErr);
                    
                }
            }

            const recipeMap: Record<string, Recipe> = Object.fromEntries(
                fetchedRecipes.map((recipe) => [String(recipe.id), recipe])
            );

            type DayPlan = Record<string, Recipe | null>;
            const plan: DayPlan[] = Array(menu.days)
                .fill(null)
                .map(() =>
                    mealTypes.reduce((acc, type) => ({ ...acc, [type]: null }), {} as DayPlan)
                );

            relatedMeals.forEach((meal) => {
                const frontendDayIndex = meal.dayindex;
                const trimmedMealType = meal.mealtype.trim();

                if (plan[frontendDayIndex] && meal.id !== null) {
                    const recipeForSlot = recipeMap[String(meal.id)] ?? null;
                    plan[frontendDayIndex][trimmedMealType] = recipeForSlot;
                }
            });

            setSelectedMenu({ ...menu, plan });
        } catch (err) {
            console.log(err);
            setErrorMessage("Failed to load menu details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Edycja posiłku
    const handleEditMeal = useCallback((dayIndex: number, mealType: string) => {
        setEditCell({ dayIndex, mealType });
        setIsRecipeModalOpen(true);
    }, []); 

    // Usuwanie jadłospisu
    const handleDeleteMenu = useCallback(async (menuIdToDelete: number) => {
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/menuList/delete?menuId=${menuIdToDelete}`, { withCredentials: true });

            setMenus((prevMenus) => prevMenus.filter(m => m.id !== menuIdToDelete));

            setDeleteId(null);
            if (selectedMenu?.id === menuIdToDelete) {
                setSelectedMenu(null);
            }
        } catch (error) {
            console.log(error);
            
        }
    }, [selectedMenu]); 

    // Wybór przepisu do ustawienia
    const handleSelectRecipe = useCallback(async (recipe: Recipe) => {
        if (!selectedMenu || !editCell) return;

        const { dayIndex, mealType } = editCell;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/updateMeal`,
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
            console.log(error);
            
        }
    }, [selectedMenu, editCell]);


    // Usunięcie przepisu
    const handleRemoveRecipe = useCallback(async (dayIndex: number, mealType: string) => {
        if (!selectedMenu) return;

        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/updateMeal`,
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
            console.log(error);
            
        }
    }, [selectedMenu]); 

    // Pokazanie detali przepisu
    const handleShowDetails = useCallback((recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setIsDetailsModalOpen(true);
    }, []);

    // Wyszukiwanie przepisu
    const handleRecipeSearch = useCallback(async (query: string) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/foodSecret/search?query=${query}`, {
                withCredentials: true,
            });
            setRecipes(res.data.recipes || res.data);
        } catch (err) {
            console.log(err);
            
        }
    }, []);


    const handleExtendMenu = async (menu: Menu) => {
        setMenuToExtend(menu);
        setDaysToAdd(1); 
        setIsExtendModalOpen(true);
    };

    const handleConfirmExtend = async () => {
        if (!menuToExtend) return;

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/extend`,
                {
                    menuId: menuToExtend.id,
                    additionalDays: daysToAdd
                },
                { withCredentials: true }
            );

            // Update the menus state with the new day count
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
            console.error("Error extending menu:", error); 
            
        }
    };

    const handleShare = async (menuId: number) => {
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/share`,
                { menuId },
                { withCredentials: true }
            );

            if (response.data.token) {
                setSharingStatuses(prev => ({ ...prev, [menuId]: true }));
                setCurrentMenuId(menuId);
                setIsShareModalOpen(true);
            } else {
                throw new Error('No token received from share endpoint');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error || "Failed to share menu");
            } else if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Failed to share menu");
            }
            setSharingStatuses(prev => ({ ...prev, [menuId]: false }));
        }
    };

    const handleUnshare = async (menuId: number) => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/unshare`,
                { menuId },
                { withCredentials: true }
            );

            setSharingStatuses(prev => ({ ...prev, [menuId]: false }));

            const currentStatus = await checkSharingStatus(menuId);
            if (currentStatus) {
                setSharingStatuses(prev => ({ ...prev, [menuId]: true }));
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorMessage(err.response?.data?.error || "Failed to unshare menu");
            } else if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Failed to unshare menu");
            }
            // Re-check status to ensure UI reflects actual state after potential error
            const currentStatus = await checkSharingStatus(menuId);
            setSharingStatuses(prev => ({ ...prev, [menuId]: currentStatus }));
        }
    };

    const handleShowShareModal = (menuId: number) => {
        setCurrentMenuId(menuId);
        setIsShareModalOpen(true);
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
                            {sharingStatuses[selectedMenu.id] ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleShowShareModal(selectedMenu.id)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <Copy className="h-5 w-5" />
                                        Copy Link
                                    </button>
                                    <button
                                        onClick={() => handleUnshare(selectedMenu.id)}
                                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors duration-200 flex items-center gap-2"
                                    >
                                        <Link2Off className="h-5 w-5" />
                                        Stop Sharing
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleShare(selectedMenu.id)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                                >
                                    <Share2 className="h-5 w-5" />
                                    Share
                                </button>
                            )}
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
                                Back
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
                                                    key={mealType} // Key for inner loop, this is fine as mealTypes is static
                                                    onClick={() => recipe ? handleShowDetails(recipe) : handleEditMeal(dayIndex, mealType)}
                                                    className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200 cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 relative flex items-center justify-center bg-gray-600 rounded-lg overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all duration-200">
                                                            {recipe ? (
                                                                <Image
                                                                    src={recipe.image || "/placeholder.jpg"}
                                                                    alt={recipe.name}
                                                                    layout="fill"
                                                                    objectFit="cover"
                                                                    className="rounded-lg" // Class applied to the Image component
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
                        Create New Plan
                    </button>
                </div>

                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-center backdrop-blur-sm">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
                    {currentMenus.map((menu) => (
                        <MenuTile
                            key={menu.id}
                            menu={menu}
                            onSelect={handleSelectMenu}
                            onDelete={(id) => setDeleteId(id)}
                            onShare={(menu: Menu) => handleShare(menu.id)}
                            onUnshare={(menu: Menu) => handleUnshare(menu.id)}
                            onShowShareModal={(menu: Menu) => handleShowShareModal(menu.id)}
                            onExtend={handleExtendMenu}
                            isShared={sharingStatuses[menu.id] || false}
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

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    onCreateMenu={() => setIsCreateModalOpen(true)}
                    onBack={selectedMenu ? () => setSelectedMenu(null) : undefined}
                    selectedMenu={selectedMenu}
                    onShare={handleShare}
                    onUnshare={handleUnshare}
                    onShowShareModal={handleShowShareModal}
                    isShared={selectedMenu ? sharingStatuses[selectedMenu.id] : false}
                />
                {renderMenuView()}
            </div>
            {isExtendModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-4">Extend Menu Plan</h2>
                        {menuToExtend && (
                            <p className="text-gray-400 mb-4">
                                Add more days to &quot;{menuToExtend.name}&quot;
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
            <DeleteConfirmModal
                isOpen={deleteId !== null}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && handleDeleteMenu(deleteId)}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => {
                    setIsShareModalOpen(false);
                    setCurrentMenuId(null);
                }}
                menuId={currentMenuId || 0}
                onStatusChange={(menuId, isShared) => {
                    setSharingStatuses(prev => ({ ...prev, [menuId]: isShared }));
                }}
            />
            <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
        </div>
    );
}

export default MenuComponent;