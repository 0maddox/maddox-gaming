import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import TournamentsPage from './pages/TournamentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;