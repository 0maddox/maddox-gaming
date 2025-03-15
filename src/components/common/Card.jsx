import React from 'react';
import { Link } from 'react-router-dom';

const CustomLink = ({ to, children, className = "text-blue-500 hover:underline" }) => (
  to ? <Link to={to} className={className}>{children}</Link> : <span className={className}>{children}</span>
);

const Card = ({ title, description, image, link }) => (
  <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md">
    {image && <img src={image} alt={title} className="w-full h-48 object-cover rounded-md" />}
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-gray-300 mt-2">{description}</p>
      {link && <CustomLink to={link} className="mt-4 inline-block bg-blue-600 px-6 py-3 rounded-lg text-white hover:bg-blue-700">Learn More</CustomLink>}
    </div>
  </div>
);

export default Card;
