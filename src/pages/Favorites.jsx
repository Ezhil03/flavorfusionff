import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    try {
      const res = await api.get("/favorites");
      setFavorites(res.data);
    } catch {}
    setLoading(false);
  }

  async function handleRemove(id) {
    await api.delete(`/favorites/${id}`);
    setFavorites((prev) => prev.filter((r) => r._id !== id));
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">⭐ My Favorites</h1>
      {favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-lg">No favorites yet.</p>
          <Link to="/" className="text-orange-500 font-medium mt-2 inline-block hover:underline">Explore recipes →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {favorites.map((recipe) => {
            const avg = recipe.ratings?.length > 0
              ? (recipe.ratings.reduce((s, r) => s + r.rating, 0) / recipe.ratings.length).toFixed(1)
              : null;
            return (
              <div key={recipe._id} className="bg-white rounded-2xl shadow overflow-hidden flex">
                <div className="w-28 flex-shrink-0 bg-orange-50">
                  {recipe.image ? (
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                  )}
                </div>
                <div className="flex-1 p-4">
                  <Link to={`/recipe/${recipe._id}`} className="font-bold text-gray-800 hover:text-orange-500 line-clamp-1 block mb-1">{recipe.title}</Link>
                  <div className="flex flex-wrap gap-1 text-xs text-gray-500 mb-2">
                    {recipe.cuisine && <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{recipe.cuisine}</span>}
                    {recipe.cookingTime && <span>⏱ {recipe.cookingTime} min</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">❤️ {recipe.likes?.length || 0} {avg && `• ⭐ ${avg}`}</span>
                    <button
                      onClick={() => handleRemove(recipe._id)}
                      className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
