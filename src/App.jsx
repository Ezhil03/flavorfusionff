import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Recipe from './pages/Recipe';
import AddRecipe from './pages/AddRecipe';
import EditRecipe from './pages/EditRecipe';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import MealPlanner from './pages/MealPlanner';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={logout} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={login} />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register onLogin={login} />
          } />
          <Route path="/recipe/:id" element={<Recipe isAuthenticated={isAuthenticated} />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/add-recipe" element={<AddRecipe />} />
            <Route path="/edit-recipe/:id" element={<EditRecipe />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/meal-planner" element={<MealPlanner />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;