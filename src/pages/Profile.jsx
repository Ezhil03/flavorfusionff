import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Profile({ user, setUser }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", profilePic: "", bio: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { navigate("/login"); return; }
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/profile");
      setProfile(res.data);
      setForm({ name: res.data.name, profilePic: res.data.profilePic, bio: res.data.bio });
      const recRes = await api.get(`/recipes?search=`);
      const mine = recRes.data.filter((r) => r.createdBy?._id === res.data._id);
      setMyRecipes(mine);
    } catch { navigate("/login"); }
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/profile", form);
      setProfile(res.data);
      const updated = { ...user, name: res.data.name };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setEditing(false);
    } catch {}
    setLoading(false);
  }

  if (!profile) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-orange-100 flex-shrink-0">
            {profile.profilePic ? (
              <img src={profile.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-500">
                {profile.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
            <p className="text-gray-500 text-sm mb-2">{profile.email}</p>
            {profile.bio && <p className="text-gray-600 mb-3">{profile.bio}</p>}
            <div className="flex gap-4 justify-center sm:justify-start text-sm text-gray-500">
              <span><strong>{myRecipes.length}</strong> recipes</span>
              <span><strong>{profile.followers?.length || 0}</strong> followers</span>
              <span><strong>{profile.following?.length || 0}</strong> following</span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="bg-orange-500 text-white px-5 py-2 rounded-xl font-semibold hover:bg-orange-600 transition flex-shrink-0">
            {editing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>

        {editing && (
          <form onSubmit={handleSave} className="mt-6 space-y-4 border-t pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="https://..." value={form.profilePic} onChange={(e) => setForm({ ...form, profilePic: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-60">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>

      {/* My Recipes */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Recipes ({myRecipes.length})</h2>
        {myRecipes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p>You haven't shared any recipes yet.</p>
            <Link to="/add" className="text-orange-500 font-medium mt-2 inline-block hover:underline">Add your first recipe →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myRecipes.map((r) => (
              <Link key={r._id} to={`/recipe/${r._id}`} className="flex gap-3 p-3 rounded-xl hover:bg-orange-50 transition">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-orange-100 flex-shrink-0">
                  {r.image ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1">{r.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.cuisine || "No cuisine"} • {r.cookingTime ? `${r.cookingTime} min` : ""}</p>
                  <p className="text-xs text-gray-400">❤️ {r.likes.length} • ⭐ {r.ratings.length} ratings</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
