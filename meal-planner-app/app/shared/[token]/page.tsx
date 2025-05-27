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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/menuList/shared/${params.token}`);
        const { mealPlan: planData, recipes: recipesData } = response.data;
        
        console.log('Received plan data:', planData);
        console.log('Received recipes data:', recipesData);

        const recipeIds = recipesData.map((meal: any) => meal.id).join(',');
        console.log('Recipe IDs to fetch:', recipeIds);
        
        const recipeResponse = await axios.get(`${API_BASE_URL}/foodSecret/search/recipes?ids=${recipeIds}`, {
          withCredentials: true
        });
        const recipeDetails = recipeResponse.data;
        console.log('Fetched recipe details:', recipeDetails);

        let plan: DayPlan[] = [];
        for (let i = 0; i < planData.days; i++) {
          const dayPlan: DayPlan = {};
          mealTypes.forEach(type => {
            dayPlan[type] = null;
          });
          plan.push(dayPlan);
        }
        console.log('Initial empty plan structure:', plan);

        for (const meal of recipesData) {
          console.log('Processing meal:', meal);
          const recipe = recipeDetails.find((r: Recipe) => r.id === Number(meal.id));
          console.log('Found recipe:', recipe);
          
          const dayIndex = meal.dayindex;
          const mealType = meal.mealtype.trim();
          console.log('Day index:', dayIndex, 'Plan length:', plan.length, 'Meal type:', mealType);
          
          if (recipe && dayIndex >= 0 && dayIndex < plan.length && mealTypes.includes(mealType)) {
            console.log('Assigning recipe to day', dayIndex, 'meal type', mealType);
            plan[dayIndex][mealType] = recipe;
            console.log('Plan after assignment:', JSON.parse(JSON.stringify(plan)));
          } else {
            console.log('Failed to assign recipe.', {
              recipeFound: !!recipe,
              dayIndexValid: dayIndex >= 0 && dayIndex < plan.length,
              mealTypeValid: mealTypes.includes(mealType),
              dayIndex,
              mealType,
              planLength: plan.length
            });
          }
        }

        console.log('Final plan structure:', JSON.parse(JSON.stringify(plan)));
        setMealPlan({ ...planData, plan });
        setRecipes(recipeDetails);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
           router.push('/login?error=auth');
          }
        }
        console.error('Error loading shared plan:', err);
        setError(err.response?.data?.error || "Failed to load shared meal plan");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPlan();
  }, [params.token]);

  const handleCopyToMyPlans = async () => {
    try {
      setIsCopying(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/menuList/copy-shared`,
        { token: params.token },
        { withCredentials: true }
      );
      router.push('/menu');
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to copy meal plan");
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
              {error || "Meal plan not found"}
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
                          <img
                            src={recipe.image || "/placeholder.jpg"}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
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