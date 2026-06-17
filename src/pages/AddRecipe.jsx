import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CUISINES = ["Italian", "Indian", "Chinese", "Mexican", "American", "Japanese", "French", "Thai", "Mediterranean", "Other"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert"];
const DIETS = ["None", "Vegan", "Vegetarian", "Gluten-Free", "Keto", "Paleo"];

export default function AddRecipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", ingredients: "", steps: "",
    cookingTime: "", servings: "", cuisine: "", mealType: "",
    dietaryPreference: "", image: "", video: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
        cookingTime: Number(form.cookingTime),
        servings: Number(form.servings),
      };
      await api.post("/recipes", payload);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create recipe");
    }
    setLoading(false);
  }

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🍽️ Create New Recipe</h1>
        {error && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {field("Recipe Title *", "title", "text", "e.g. Pasta Carbonara")}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="Brief description of the recipe..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients * <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <textarea
              rows={4}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder="400g pasta, 200g bacon, 3 eggs, Parmesan cheese"
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Steps * <span className="text-gray-400 font-normal">(one per line)</span></label>
            <textarea
              rows={6}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              placeholder={"Boil pasta until al dente\nFry bacon until crispy\nMix eggs with grated Parmesan\nCombine everything off heat"}
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Cooking Time (minutes)", "cookingTime", "number", "30")}
            {field("Servings", "servings", "number", "4")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })}>
                <option value="">Select</option>
                {CUISINES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.mealType} onChange={(e) => setForm({ ...form, mealType: e.target.value })}>
                <option value="">Select</option>
                {MEAL_TYPES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.dietaryPreference} onChange={(e) => setForm({ ...form, dietaryPreference: e.target.value })}>
                <option value="">Select</option>
                {DIETS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {field("Image URL", "image", "url", "https://...")}
          {field("YouTube URL", "video", "url", "https://youtube.com/watch?v=...")}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60 text-lg"
          >
            {loading ? "Creating..." : "🚀 Create Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
