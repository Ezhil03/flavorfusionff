import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function MealPlanner() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ day: "Monday", breakfast: "", lunch: "", dinner: "" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchData();
  }, []);

  async function fetchData() {
    const [rRes, pRes] = await Promise.all([api.get("/recipes"), api.get("/mealplans")]);
    setRecipes(rRes.data);
    setPlans(pRes.data);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/mealplans", {
        day: form.day,
        breakfast: form.breakfast || undefined,
        lunch: form.lunch || undefined,
        dinner: form.dinner || undefined,
      });
      setForm({ day: "Monday", breakfast: "", lunch: "", dinner: "" });
      fetchData();
    } catch {}
    setLoading(false);
  }

  async function handleDelete(id) {
    await api.delete(`/mealplans/${id}`);
    setPlans((prev) => prev.filter((p) => p._id !== id));
  }

  function generateShoppingList() {
    const allIngredients = [];
    plans.forEach((plan) => {
      ["breakfast", "lunch", "dinner"].forEach((meal) => {
        if (plan[meal]?.ingredients) {
          allIngredients.push(...plan[meal].ingredients);
        }
      });
    });
    // Deduplicate case-insensitively
    const seen = new Set();
    return allIngredients.filter((ing) => {
      const key = ing.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const shoppingList = generateShoppingList();

  const selectClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Meal Planner</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["planner", "plans", "shopping"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-xl font-semibold text-sm transition capitalize ${activeTab === tab ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-orange-50"}`}>
            {tab === "planner" ? "➕ Add Plan" : tab === "plans" ? "📋 My Plans" : "🛒 Shopping List"}
          </button>
        ))}
      </div>

      {/* Add Plan */}
      {activeTab === "planner" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create Meal Plan</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select className={selectClass} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            {["breakfast", "lunch", "dinner"].map((meal) => (
              <div key={meal}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{meal === "breakfast" ? "🌅" : meal === "lunch" ? "☀️" : "🌙"} {meal}</label>
                <select className={selectClass} value={form[meal]} onChange={(e) => setForm({ ...form, [meal]: e.target.value })}>
                  <option value="">-- Select Recipe --</option>
                  {recipes.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60">
              {loading ? "Saving..." : "💾 Save Meal Plan"}
            </button>
          </form>
        </div>
      )}

      {/* My Plans */}
      {activeTab === "plans" && (
        <div>
          {plans.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-6xl mb-4">📅</div>
              <p>No meal plans yet. Create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-white rounded-2xl shadow p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">{plan.day}</h3>
                    <button onClick={() => handleDelete(plan._id)} className="text-red-400 hover:text-red-600 text-sm font-medium">Delete</button>
                  </div>
                  <div className="space-y-2">
                    {[["🌅 Breakfast", plan.breakfast], ["☀️ Lunch", plan.lunch], ["🌙 Dinner", plan.dinner]].map(([label, recipe]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-28 flex-shrink-0">{label}</span>
                        <span className="text-sm text-gray-800 flex-1 truncate">{recipe?.title || <span className="text-gray-300">—</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shopping List */}
      {activeTab === "shopping" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">🛒 Shopping List</h2>
            {shoppingList.length > 0 && (
              <button
                onClick={() => window.print()}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
              >
                🖨️ Print
              </button>
            )}
          </div>
          {shoppingList.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p>No ingredients yet. Add meal plans with recipes to generate a shopping list.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{shoppingList.length} items from {plans.length} meal plan{plans.length !== 1 ? "s" : ""}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shoppingList.map((ing, i) => (
                  <li key={i} className="flex items-center gap-2 bg-orange-50 rounded-xl px-4 py-2.5">
                    <span className="text-orange-400">✓</span>
                    <span className="text-gray-700 text-sm">{ing}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
