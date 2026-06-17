import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v") || u.pathname.split("/").pop();
    return `https://www.youtube.com/embed/${v}`;
  } catch {
    return null;
  }
}

export default function Recipe({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [msg, setMsg] = useState("");

  async function fetchRecipe() {
    try {
      const res = await api.get(`/recipes/${id}`);
      setRecipe(res.data);
    } catch { navigate("/"); }
    setLoading(false);
  }

  useEffect(() => { fetchRecipe(); }, [id]);

  async function handleLike() {
    if (!user) { navigate("/login"); return; }
    await api.post(`/recipes/${id}/like`);
    fetchRecipe();
  }

  async function handleFavorite() {
    if (!user) { navigate("/login"); return; }
    await api.post(`/favorites/${id}`);
    setMsg("Added to favorites!");
    setTimeout(() => setMsg(""), 2000);
  }

  async function handleRate(r) {
    if (!user) { navigate("/login"); return; }
    setUserRating(r);
    await api.post(`/recipes/${id}/rate`, { rating: r });
    fetchRecipe();
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!commentText.trim()) return;
    await api.post(`/recipes/${id}/comment`, { text: commentText });
    setCommentText("");
    fetchRecipe();
  }

  async function handleDelete() {
    if (!window.confirm("Delete this recipe?")) return;
    await api.delete(`/recipes/${id}`);
    navigate("/");
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!recipe) return null;

  const avg =
    recipe.ratings.length > 0
      ? (recipe.ratings.reduce((s, r) => s + r.rating, 0) / recipe.ratings.length).toFixed(1)
      : null;

  const embedUrl = getEmbedUrl(recipe.video);
  const isOwner = user && recipe.createdBy?._id === user.id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {msg && <div className="bg-green-50 text-green-600 rounded-xl px-4 py-3 mb-4 text-sm text-center">{msg}</div>}

      {/* Image */}
      {recipe.image && (
        <div className="rounded-2xl overflow-hidden mb-6 h-64 sm:h-80">
          <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{recipe.title}</h1>
            <p className="text-gray-500 text-sm mb-3">by {recipe.createdBy?.name || "Unknown"}</p>
            {recipe.description && <p className="text-gray-600 mb-4">{recipe.description}</p>}
            <div className="flex flex-wrap gap-2 text-sm">
              {recipe.cuisine && <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full">{recipe.cuisine}</span>}
              {recipe.mealType && <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full">{recipe.mealType}</span>}
              {recipe.dietaryPreference && <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full">{recipe.dietaryPreference}</span>}
              {recipe.cookingTime && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">⏱ {recipe.cookingTime} min</span>}
              {recipe.servings && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">🍽️ {recipe.servings} servings</span>}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <button onClick={handleLike} className="flex items-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl font-medium transition">
              ❤️ {recipe.likes.length}
            </button>
            <button onClick={handleFavorite} className="flex items-center gap-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-4 py-2 rounded-xl font-medium transition">
              ⭐ Save
            </button>
            {isOwner && (
              <button onClick={handleDelete} className="flex items-center gap-1 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl font-medium transition">
                🗑 Delete
              </button>
            )}
          </div>
        </div>
        {avg && <div className="mt-4 text-lg font-semibold text-orange-500">⭐ {avg} / 5 ({recipe.ratings.length} ratings)</div>}
      </div>

      {/* Ingredients */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🥦 Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></span>
              {ing}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Preparation Steps</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</span>
              <p className="text-gray-700 pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Video */}
      {embedUrl && (
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎬 Video Tutorial</h2>
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Recipe video" />
          </div>
        </div>
      )}

      {/* Rate */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Rate this Recipe</h2>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`text-3xl transition ${(hoverRating || userRating) >= star ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        {userRating > 0 && <p className="text-sm text-gray-500 mt-2">You rated this {userRating}/5</p>}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💬 Comments ({recipe.comments.length})</h2>
        <form onSubmit={handleComment} className="flex gap-3 mb-6">
          <input
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-semibold transition">
            Post
          </button>
        </form>
        {recipe.comments.length === 0 && <p className="text-gray-400 text-center py-4">No comments yet. Be the first!</p>}
        <div className="space-y-4">
          {recipe.comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                {c.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 text-sm">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
