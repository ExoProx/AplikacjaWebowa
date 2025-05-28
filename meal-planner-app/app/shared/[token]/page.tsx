// app/shared/[token]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import { Menu } from "../../types/Menu";
import { Recipe } from "../../types/Recipe";
import { PlusIcon } from "lucide-react";
import Image from "next/image"; // Import Image component for better optimization
import { Meal } from "@/app/types/Meal";

const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];

interface DayPlan {
  [key: string]: Recipe | null;
}

const SharedMealPlan = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<Menu | null>(null);
  const [, setRecipes] = useState<Recipe[]>([]);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/menuList/shared/${params.token}`, {

          withCredentials: true 
        });
        const { mealPlan: planData, recipes: recipesData } = response.data;
        const recipeIds = recipesData.map((meal: Meal) => meal.id).join(',');

        let recipeDetails: Recipe[] = [];
        if (recipeIds) {
          const recipeResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/foodSecret/search/recipes?ids=${recipeIds}`, {
            withCredentials: true
          });
          recipeDetails = recipeResponse.data;
        }
        const plan: DayPlan[] = [];
        for (let i = 0; i < planData.days; i++) {
          const dayPlan: DayPlan = {};
          mealTypes.forEach(type => {
            dayPlan[type] = null;
          });
          plan.push(dayPlan);
        }

        for (const meal of recipesData) {
          const recipe = recipeDetails.find((r: Recipe) => r.id === Number(meal.id));
          const dayIndex = meal.dayindex;
          const mealType = meal.mealtype.trim();

          if (recipe && dayIndex >= 0 && dayIndex < plan.length && mealTypes.includes(mealType)) {
            plan[dayIndex][mealType] = recipe;
          }
        }

        setMealPlan({ ...planData, plan });
        setRecipes(recipeDetails);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            router.push('/login?error=auth');
          } else if (err.response?.status === 404) {
            setError("Shared meal plan not found.");
          } else {
            setError(err.response?.data?.error || "Failed to load shared meal plan");
          }
        } else {
          setError("Network error or unexpected issue.");
        }
        console.error('Error loading shared plan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      fetchSharedPlan();
    }
  }, [params.token, router]);

  const handleCopyToMyPlans = async () => {
    try {
      setIsCopying(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/menuList/copy-shared`,
        { token: params.token },
        {

          withCredentials: true
        }
      );
      router.push('/menu');
    } catch (err: unknown) { 
     if (axios.isAxiosError(err)) { 
       if (err.response?.status === 401 || err.response?.status === 403) {
         setError('Unauthorized. Please log in again to copy this plan.');
         router.push('/login?error=auth');
       } else {
         setError(err.response?.data?.error || "Failed to copy meal plan");
       }
     } else if (err instanceof Error) {
       setError(err.message || "An unexpected error occurred.");
     } else {
       setError("An unknown error occurred.");
     }
     console.error('Error copying plan:', err);
   } finally {
     setIsCopying(false);
   }
 };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
        <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
      </div>
    );
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || "Meal plan not found or inaccessible."}
            </h1>
            <button
              onClick={() => router.push('/menu')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Go to My Meal Plans
            </button>
          </div>
        </div>
        <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{mealPlan.name}</h1>
            <p className="text-gray-400">Shared Meal Plan</p>
          </div>
          <button
            onClick={handleCopyToMyPlans}
            disabled={isCopying}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
            {isCopying ? "Copying..." : "Copy to My Plans"}
          </button>
        </div>

        <div className="grid gap-6">
          {mealPlan.plan.map((dayPlan, dayIndex) => (
            <div key={dayIndex} className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Day {dayIndex + 1}</h3>
              <div className="grid gap-4">
                {mealTypes.map((mealType) => {
                  const recipe = dayPlan[mealType];
                  return (
                    <div
                      key={mealType}
                      className="flex items-center p-4 bg-gray-700/50 rounded-lg"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-600 rounded-lg overflow-hidden mr-4">
                        {recipe && (
                          <Image
                            src={recipe.image || "/placeholder.jpg"}
                            alt={recipe.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-400">{mealType}</div>
                        <div className="text-white">
                          {recipe ? recipe.name : "No meal planned"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer className="w-full bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50 p-4 text-white" />
    </div>
  );
};

export default SharedMealPlan;