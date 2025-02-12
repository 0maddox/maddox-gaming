import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center shadow-md">
      <div className="text-2xl font-bold text-blue-500">Maddox Gaming</div>
      <div className="space-x-4">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <Link to="/shop" className="hover:text-blue-400">Shop</Link>
        <Link to="/tournaments" className="hover:text-blue-400">Tournaments</Link>
        <Link to="/content" className="hover:text-blue-400">Content</Link>
        <Link to="/about" className="hover:text-blue-400">About</Link>
        <Link to="/contact" className="hover:text-blue-400">Contact</Link>
      </div>
    </nav>
  );
}

export default Navbar;