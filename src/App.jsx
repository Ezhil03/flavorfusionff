import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Recipe from "./pages/Recipe";
import AddRecipe from "./pages/AddRecipe";
import Profile from "./pages/Profile";
import MealPlanner from "./pages/MealPlanner";
import Favorites from "./pages/Favorites";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }

  return (
    <nav className="bg-orange-500 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          🍳 FlavorFusion
        </Link>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="hover:text-orange-100">Home</Link>
          {user && <Link to="/add" className="hover:text-orange-100">Add Recipe</Link>}
          {user && <Link to="/meal-planner" className="hover:text-orange-100">Meal Planner</Link>}
          {user && <Link to="/favorites" className="hover:text-orange-100">Favorites</Link>}
          {user && <Link to="/profile" className="hover:text-orange-100">Profile</Link>}
          {!user && <Link to="/login" className="hover:text-orange-100">Login</Link>}
          {!user && <Link to="/register" className="hover:text-orange-100">Register</Link>}
          {user && (
            <button onClick={logout} className="bg-white text-orange-500 px-3 py-1 rounded-full font-semibold hover:bg-orange-100 transition">
              Logout
            </button>
          )}
        </div>
        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-orange-600 px-4 pb-4 flex flex-col gap-3 text-sm font-medium">
          <Link to="/" onClick={() => setOpen(false)} className="hover:text-orange-100">Home</Link>
          {user && <Link to="/add" onClick={() => setOpen(false)} className="hover:text-orange-100">Add Recipe</Link>}
          {user && <Link to="/meal-planner" onClick={() => setOpen(false)} className="hover:text-orange-100">Meal Planner</Link>}
          {user && <Link to="/favorites" onClick={() => setOpen(false)} className="hover:text-orange-100">Favorites</Link>}
          {user && <Link to="/profile" onClick={() => setOpen(false)} className="hover:text-orange-100">Profile</Link>}
          {!user && <Link to="/login" onClick={() => setOpen(false)} className="hover:text-orange-100">Login</Link>}
          {!user && <Link to="/register" onClick={() => setOpen(false)} className="hover:text-orange-100">Register</Link>}
          {user && <button onClick={logout} className="text-left hover:text-orange-100">Logout</button>}
        </div>
      )}
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/recipe/:id" element={<Recipe user={user} />} />
        <Route path="/add" element={<AddRecipe />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
        <Route path="/meal-planner" element={<MealPlanner />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}
