import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function RecipeCard({ recipe }) {
  const avg =
    recipe.ratings.length > 0
      ? (recipe.ratings.reduce((s, r) => s + r.rating, 0) / recipe.ratings.length).toFixed(1)
      : null;

  return (
    <Link to={`/recipe/${recipe._id}`} className="block bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group">
      <div className="h-44 overflow-hidden bg-orange-50">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-2">{recipe.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          {recipe.cuisine && <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{recipe.cuisine}</span>}
          {recipe.mealType && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{recipe.mealType}</span>}
          {recipe.cookingTime && <span>⏱ {recipe.cookingTime} min</span>}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>❤️ {recipe.likes.length}</span>
          {avg && <span>⭐ {avg}</span>}
          <span className="text-xs truncate">by {recipe.createdBy?.name || "Unknown"}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [diet, setDiet] = useState("");
  const [ingredient, setIngredient] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchRecipes() {
    setLoading(true);
    try {
      let data;
      if (ingredient) {
        const res = await api.get(`/search?ingredient=${encodeURIComponent(ingredient)}`);
        data = res.data;
      } else {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (cuisine) params.append("cuisine", cuisine);
        if (mealType) params.append("mealType", mealType);
        if (diet) params.append("dietaryPreference", diet);
        const res = await api.get(`/recipes?${params}`);
        data = res.data;
      }
      setRecipes(data);
    } catch {
      setRecipes([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchRecipes(); }, [search, cuisine, mealType, diet, ingredient]);

  function clearFilters() {
    setSearch(""); setCuisine(""); setMealType(""); setDiet(""); setIngredient("");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Discover Delicious Recipes</h1>
        <p className="text-gray-500">Share, discover, and cook amazing meals from around the world</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow p-5 mb-8">
        <div className="flex gap-3 mb-4">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="🔍 Search recipes by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setIngredient(""); }}
          />
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="🥦 Search by ingredients (e.g. tomato egg)"
            value={ingredient}
            onChange={(e) => { setIngredient(e.target.value); setSearch(""); }}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="">All Cuisines</option>
            {["Italian", "Indian", "Chinese", "Mexican", "American", "Japanese", "French", "Thai", "Mediterranean", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            <option value="">All Meal Types</option>
            {["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" value={diet} onChange={(e) => setDiet(e.target.value)}>
            <option value="">All Diets</option>
            {["Vegan", "Vegetarian", "Gluten-Free", "Keto", "Paleo", "None"].map((d) => <option key={d}>{d}</option>)}
          </select>
          <button onClick={clearFilters} className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading recipes...</div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">🍽️</div>
          <p className="text-lg">No recipes found. Try different filters!</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((r) => <RecipeCard key={r._id} recipe={r} />)}
          </div>
        </>
      )}
    </div>
  );
}
